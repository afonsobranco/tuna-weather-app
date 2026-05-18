"""
Tuna Weather App — FastAPI Backend
Middleman between the frontend and free external APIs:
  - Open-Meteo  → weather + hourly + 7-day + UV + AQI
  - Nominatim   → geocoding (city → lat/lon + country/flag)
  - Wikimedia   → "On This Day" historical events

Caching: in-memory TTL (15 min). Structured so swapping to Redis later
is a single-line change (replace InMemoryCache with RedisCache).
"""

from __future__ import annotations

import asyncio
import json
import math
import time
from datetime import datetime, timezone
from typing import Any

import httpx
from decouple import config
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ─── Config ──────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS: list[str] = json.loads(
    config("ALLOWED_ORIGINS", default='["https://afonsobranco.github.io", "http://localhost:5173", "http://localhost:4173"]')
)
CACHE_TTL: int = int(config("CACHE_TTL_SECONDS", default=900))   # 15 minutes
APP_ENV: str   = config("APP_ENV", default="production")

# ─── In-memory cache (abstract so Redis can replace it) ──────────────────────
class InMemoryCache:
    """Simple dict-based TTL cache. Thread-safe enough for asyncio single-process."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: int = CACHE_TTL) -> None:
        self._store[key] = (value, time.time() + ttl)

    def clear(self) -> None:
        self._store.clear()


cache = InMemoryCache()

# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Tuna Weather API",
    description="Aggregates Open-Meteo, Nominatim, and Wikimedia for the Tuna Weather PWA.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─── External API base URLs ───────────────────────────────────────────────────
NOMINATIM_URL   = "https://nominatim.openstreetmap.org/search"
OPEN_METEO_URL  = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
GEOCODE_URL     = "https://geocoding-api.open-meteo.com/v1/search"
WIKIMEDIA_URL   = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}"

HEADERS = {"User-Agent": "TunaWeatherApp/1.0 (github.com/afonsobranco/tuna-weather-app)"}

# ─── WMO weather code mappings ────────────────────────────────────────────────
# Maps WMO code → (condition_label, icon_kind)
WMO_MAP: dict[int, tuple[str, str]] = {
    0:  ("Clear Sky",      "sun"),
    1:  ("Mainly Clear",   "sun"),
    2:  ("Partly Cloudy",  "partly"),
    3:  ("Overcast",       "cloud"),
    45: ("Foggy",          "cloud"),
    48: ("Icy Fog",        "cloud"),
    51: ("Light Drizzle",  "rain"),
    53: ("Drizzle",        "rain"),
    55: ("Heavy Drizzle",  "rain"),
    56: ("Freezing Drizzle","rain"),
    57: ("Freezing Drizzle","rain"),
    61: ("Light Rain",     "rain"),
    63: ("Rain",           "rain"),
    65: ("Heavy Rain",     "rain"),
    66: ("Freezing Rain",  "rain"),
    67: ("Freezing Rain",  "rain"),
    71: ("Light Snow",     "cloud"),
    73: ("Snow",           "cloud"),
    75: ("Heavy Snow",     "cloud"),
    77: ("Snow Grains",    "cloud"),
    80: ("Rain Showers",   "rain"),
    81: ("Rain Showers",   "rain"),
    82: ("Heavy Showers",  "rain"),
    85: ("Snow Showers",   "cloud"),
    86: ("Heavy Snow Showers","cloud"),
    95: ("Thunderstorm",   "storm"),
    96: ("Thunderstorm",   "storm"),
    99: ("Thunderstorm",   "storm"),
}

def wmo_to_condition(code: int) -> tuple[str, str]:
    return WMO_MAP.get(code, ("Partly Cloudy", "partly"))

def wmo_to_weather_state(code: int, is_night: bool) -> str:
    """Return one of: clear-day | clear-night | sunset | rainy for background."""
    if code in (0, 1, 2):
        return "clear-night" if is_night else "clear-day"
    if code == 3 or code in range(45, 50):
        return "clear-night" if is_night else "sunset"
    if code >= 51:
        return "rainy"
    return "clear-day"

def icon_for_forecast(code: int, is_night: bool) -> str:
    _, base = wmo_to_condition(code)
    if base == "sun":
        return "moon" if is_night else "sun"
    if base == "partly":
        return "mooncloud" if is_night else "partly"
    return base

# ─── UV / AQI label helpers ───────────────────────────────────────────────────
def uv_label(val: float) -> tuple[str, str]:
    v = round(val)
    if v <= 0:  return "None",     "green"
    if v <= 2:  return "Low",      "green"
    if v <= 5:  return "Moderate", "orange"
    if v <= 7:  return "High",     "orange"
    if v <= 10: return "Very High","red"
    return "Extreme", "red"

def aqi_label(val: float) -> tuple[str, str]:
    v = round(val)
    if v <= 20:  return "Excellent", "green"
    if v <= 40:  return "Good",      "green"
    if v <= 80:  return "Moderate",  "orange"
    if v <= 120: return "Unhealthy", "red"
    return "Hazardous", "red"

# ─── Health Score calculation ─────────────────────────────────────────────────
def calculate_health_score(
    uv_value: float,
    aqi_value: float,
    humidity: float,
    wind_speed: float,
) -> tuple[int, str]:
    """
    Weighted blend of four signals, each normalized 0–100:
      UV      25% — lower UV = better score
      Air     40% — lower AQI = better score
      Dewpoint 20% — 50–65% humidity is ideal
      Wind    15% — moderate wind is ideal
    Returns (score 0-100, recommendation string).
    """
    uv_score  = max(0.0, 100.0 - uv_value * 9.0)
    aqi_score = max(0.0, 100.0 - aqi_value * 0.6)

    # Humidity: ideal 50-65 %, penalty outside that range
    hum_dev    = abs(humidity - 57.5) / 57.5
    hum_score  = max(0.0, 100.0 - hum_dev * 80.0)

    # Wind: ideal ~15 km/h, penalty for calm (<5) or strong (>40)
    wind_dev   = abs(wind_speed - 15.0) / 40.0
    wind_score = max(0.0, 100.0 - wind_dev * 60.0)

    score = round(
        uv_score  * 0.25
        + aqi_score * 0.40
        + hum_score * 0.20
        + wind_score * 0.15
    )

    # Tip text
    _, aqi_tone = aqi_label(aqi_value)
    _, uv_tone  = uv_label(uv_value)

    if score >= 85:
        tip = "Perfect outdoor conditions. Great day for activities."
    elif score >= 70:
        tip = "Good day outside. Apply sunscreen if UV is elevated."
    elif score >= 55:
        if aqi_tone == "red":
            tip = "Moderate air quality — sensitive groups should limit outdoor time."
        elif uv_tone in ("orange", "red"):
            tip = "High UV — stay in the shade during midday hours."
        else:
            tip = "Acceptable conditions. Stay hydrated."
    elif score >= 40:
        if aqi_tone == "red":
            tip = "Poor air quality. Wear an N95 if outdoors; open windows briefly."
        else:
            tip = "Challenging conditions. Limit strenuous outdoor activity."
    else:
        tip = "Avoid prolonged outdoor exposure today. Check air quality alerts."

    return score, tip

# ─── Country → flag emoji ─────────────────────────────────────────────────────
def country_code_to_flag(code: str) -> str:
    """Convert ISO 3166-1 alpha-2 country code to flag emoji (e.g. PT → 🇵🇹)."""
    try:
        return "".join(chr(0x1F1E0 + ord(c) - ord("A")) for c in code.upper())
    except Exception:
        return "🌍"

# ─── Daylight duration helper ─────────────────────────────────────────────────
def daylight_remaining(sunrise_str: str, sunset_str: str, now: datetime) -> str:
    """Return 'Xh Ym' of daylight left (or total if before sunrise)."""
    try:
        sr = datetime.fromisoformat(sunrise_str)
        ss = datetime.fromisoformat(sunset_str)
        total_mins = int((ss - sr).total_seconds() / 60)
        h, m = divmod(max(total_mins, 0), 60)
        return f"{h}h {m}m"
    except Exception:
        return "—"

def format_time(iso_str: str) -> str:
    try:
        dt = datetime.fromisoformat(iso_str)
        return dt.strftime("%H:%M")
    except Exception:
        return "—"

# ─── Wikimedia relevance filter ───────────────────────────────────────────────
def score_event_relevance(event: dict, city: str, country: str) -> int:
    """Simple keyword relevance score. Higher = more relevant to the city."""
    text = f"{event.get('text', '')} {' '.join(p.get('titles', {}).get('normalized', '') for p in event.get('pages', []))}"
    text_lower = text.lower()
    score = 0
    for word in [city.lower(), country.lower()]:
        if word in text_lower:
            score += 10
    return score

# ─── API fetch helpers ────────────────────────────────────────────────────────
async def geocode_city(client: httpx.AsyncClient, city: str) -> dict:
    """Returns {lat, lon, display_name, country, country_code}."""
    resp = await client.get(
        GEOCODE_URL,
        params={"name": city, "count": 1, "language": "en", "format": "json"},
        timeout=8,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        # Fallback: try Nominatim
        resp2 = await client.get(
            NOMINATIM_URL,
            params={"q": city, "format": "json", "limit": 1, "addressdetails": 1},
            headers=HEADERS,
            timeout=8,
        )
        resp2.raise_for_status()
        nom = resp2.json()
        if not nom:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        r = nom[0]
        addr = r.get("address", {})
        return {
            "lat": float(r["lat"]),
            "lon": float(r["lon"]),
            "display_name": r.get("display_name", city),
            "city": addr.get("city") or addr.get("town") or addr.get("village") or city,
            "country": addr.get("country", ""),
            "country_code": addr.get("country_code", "").upper(),
        }

    r = results[0]
    return {
        "lat": float(r["latitude"]),
        "lon": float(r["longitude"]),
        "display_name": r.get("name", city),
        "city": r.get("name", city),
        "country": r.get("country", ""),
        "country_code": r.get("country_code", "").upper(),
    }


async def fetch_weather(client: httpx.AsyncClient, lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "uv_index",
            "is_day",
        ]),
        "hourly": "temperature_2m,weather_code",
        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "precipitation_probability_max",
            "uv_index_max",
        ]),
        "timezone": "auto",
        "forecast_days": 7,
        "wind_speed_unit": "kmh",
    }
    resp = await client.get(OPEN_METEO_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


async def fetch_air_quality(client: httpx.AsyncClient, lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "european_aqi,us_aqi",
        "timezone": "auto",
    }
    resp = await client.get(AIR_QUALITY_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


async def fetch_history(client: httpx.AsyncClient, month: int, day: int) -> list[dict]:
    url = WIKIMEDIA_URL.format(month=str(month).zfill(2), day=str(day).zfill(2))
    resp = await client.get(url, headers=HEADERS, timeout=8)
    resp.raise_for_status()
    return resp.json().get("events", [])

# ─── Wind direction helper ────────────────────────────────────────────────────
def wind_dir_label(degrees: float) -> str:
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = round(degrees / 45) % 8
    return dirs[idx]

# ─── Day-of-week label ────────────────────────────────────────────────────────
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
def day_label(date_str: str, i: int) -> str:
    if i == 0:
        return "Today"
    if i == 1:
        return "Tomorrow"
    try:
        dt = datetime.fromisoformat(date_str)
        return DAYS[dt.weekday()]
    except Exception:
        return DAYS[i % 7]

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
async def health() -> dict:
    """Render health-check endpoint — also keeps the instance from sleeping."""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/weather")
async def get_weather(city: str = Query(..., min_length=1, max_length=100)) -> JSONResponse:
    """
    Returns a bundled JSON object with current weather, forecast, UV, AQI,
    health score, and On-This-Day history for the given city.
    """
    cache_key = f"weather:{city.lower().strip()}"
    cached = cache.get(cache_key)
    if cached:
        return JSONResponse(content=cached, headers={"X-Cache": "HIT"})

    async with httpx.AsyncClient(follow_redirects=True) as client:
        # 1. Geocode
        try:
            geo = await geocode_city(client, city)
        except HTTPException:
            raise
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            raise HTTPException(status_code=503, detail="Geocoding service unavailable.") from exc

        lat, lon = geo["lat"], geo["lon"]

        # 2. Fetch weather + AQI + history concurrently
        now = datetime.now(tz=timezone.utc)
        month, day = now.month, now.day

        try:
            weather_data, aqi_data, history_events = await asyncio.gather(
                fetch_weather(client, lat, lon),
                fetch_air_quality(client, lat, lon),
                fetch_history(client, month, day),
            )
        except httpx.TimeoutException as exc:
            raise HTTPException(status_code=504, detail="Upstream API timed out. Try again shortly.") from exc
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=502, detail=f"Upstream API error: {exc.response.status_code}") from exc

    # 3. Parse current weather
    curr = weather_data.get("current", {})
    temp_c      = curr.get("temperature_2m", 0.0)
    humidity    = curr.get("relative_humidity_2m", 50.0)
    feels_like  = curr.get("apparent_temperature", temp_c)
    wmo_code    = int(curr.get("weather_code", 0))
    wind_spd    = curr.get("wind_speed_10m", 0.0)
    wind_deg    = curr.get("wind_direction_10m", 0.0)
    uv_curr     = curr.get("uv_index", 0.0)
    is_day      = bool(curr.get("is_day", 1))

    condition_label, _ = wmo_to_condition(wmo_code)

    # 4. Parse daily
    daily  = weather_data.get("daily", {})
    times  = daily.get("time", [])
    hi_arr = daily.get("temperature_2m_max", [])
    lo_arr = daily.get("temperature_2m_min", [])
    sr_arr = daily.get("sunrise", [])
    ss_arr = daily.get("sunset", [])
    pp_arr = daily.get("precipitation_probability_max", [])
    uv_arr = daily.get("uv_index_max", [])
    dc_arr = daily.get("weather_code", [])

    hi_c = hi_arr[0] if hi_arr else temp_c
    lo_c = lo_arr[0] if lo_arr else temp_c

    sunrise_raw = sr_arr[0] if sr_arr else ""
    sunset_raw  = ss_arr[0] if ss_arr else ""
    sunrise_fmt = format_time(sunrise_raw)
    sunset_fmt  = format_time(sunset_raw)
    daylight    = daylight_remaining(sunrise_raw, sunset_raw, now)

    # Determine if it's "golden hour" (sunset bg)
    weather_state = wmo_to_weather_state(wmo_code, not is_day)
    if is_day and weather_state == "clear-day":
        # Check if within 2h of sunset for sunset bg
        try:
            ss_dt = datetime.fromisoformat(sunset_raw)
            diff  = (ss_dt - now.replace(tzinfo=None)).total_seconds()
            if 0 < diff < 7200:
                weather_state = "sunset"
        except Exception:
            pass

    # 5. Build forecast array (7 days capped to 5 as requested)
    forecast = []
    for i in range(min(5, len(times))):
        code  = int(dc_arr[i]) if i < len(dc_arr) else 0
        night = (i > 0)  # only use night icons for future days (rough)
        forecast.append({
            "d": day_label(times[i], i),
            "i": icon_for_forecast(code, night),
            "hi": round(hi_arr[i]) if i < len(hi_arr) else 0,
            "lo": round(lo_arr[i]) if i < len(lo_arr) else 0,
            "p": int(pp_arr[i]) if i < len(pp_arr) else 0,
        })

    # 6. Build hourly array (next 24h in 2h steps = 12 entries)
    hourly_temps = weather_data.get("hourly", {}).get("temperature_2m", [])
    hourly_codes = weather_data.get("hourly", {}).get("weather_code", [])
    hourly_times = weather_data.get("hourly", {}).get("time", [])

    # Find the current hour index
    curr_hour_idx = 0
    try:
        now_str = now.strftime("%Y-%m-%dT%H:00")
        # Find closest match
        for idx, t in enumerate(hourly_times):
            if t >= now_str[:13]:
                curr_hour_idx = idx
                break
    except Exception:
        curr_hour_idx = 0

    hourly = []
    for i in range(12):
        idx = curr_hour_idx + i * 2
        if idx >= len(hourly_temps):
            break
        h_raw = hourly_times[idx] if idx < len(hourly_times) else ""
        h_code = int(hourly_codes[idx]) if idx < len(hourly_codes) else 0
        try:
            h_dt = datetime.fromisoformat(h_raw)
            h_label = "Now" if i == 0 else h_dt.strftime("%-I %p")
        except Exception:
            h_label = "Now" if i == 0 else "—"
        night_h = not (6 <= (datetime.fromisoformat(h_raw).hour if h_raw else 12) < 20)
        hourly.append({
            "time": h_raw,
            "label": h_label,
            "tempC": round(hourly_temps[idx]),
            "icon": icon_for_forecast(h_code, night_h),
            "isNow": i == 0,
        })

    # 7. AQI
    aqi_curr = aqi_data.get("current", {})
    aqi_val  = float(aqi_curr.get("european_aqi") or aqi_curr.get("us_aqi") or 0)
    aqi_lbl, aqi_tone = aqi_label(aqi_val)

    # 8. UV (prefer daily max for "today's forecast", fall back to current)
    uv_day  = float(uv_arr[0]) if uv_arr else float(uv_curr)
    uv_lbl, uv_tone = uv_label(uv_day)

    # 9. Health score
    health_score, health_tip = calculate_health_score(uv_day, aqi_val, humidity, wind_spd)

    # 10. History — filter by relevance to city/country, take top 3
    country_name = geo.get("country", "")
    city_name    = geo.get("city", city)
    scored_events = sorted(
        history_events,
        key=lambda e: score_event_relevance(e, city_name, country_name),
        reverse=True,
    )
    # Fallback: if nothing has relevance, just take the top globally notable events
    top_events = scored_events[:3] if len(scored_events) >= 3 else history_events[:3]

    history_out = []
    for ev in top_events:
        pages   = ev.get("pages", [])
        wiki_url = pages[0].get("content_urls", {}).get("desktop", {}).get("page", "#") if pages else "#"
        history_out.append({
            "year":  str(ev.get("year", "")),
            "title": ev.get("text", "")[:120],
            "body":  (pages[0].get("extract", "")[:200] if pages else ev.get("text", ""))[:200],
            "href":  wiki_url,
        })

    # 11. Assemble response
    response: dict = {
        "city":          city_name,
        "country":       country_name,
        "flag":          country_code_to_flag(geo.get("country_code", "")),
        "lat":           lat,
        "lon":           lon,
        "tempC":         round(temp_c, 1),
        "hiC":           round(hi_c),
        "loC":           round(lo_c),
        "feelsLikeC":    round(feels_like, 1),
        "condition":     condition_label,
        "weatherCode":   wmo_code,
        "weatherState":  weather_state,
        "windSpeed":     round(wind_spd),
        "windDir":       wind_dir_label(wind_deg),
        "humidity":      round(humidity),
        "sunrise":       sunrise_fmt,
        "sunset":        sunset_fmt,
        "daylight":      daylight,
        "uv": {
            "value": round(uv_day, 1),
            "label": uv_lbl,
            "tone":  uv_tone,
        },
        "aqi": {
            "value": round(aqi_val),
            "label": aqi_lbl,
            "tone":  aqi_tone,
        },
        "health": {
            "score": health_score,
            "tip":   health_tip,
        },
        "history":  history_out,
        "forecast": forecast,
        "hourly":   hourly,
        "fetchedAt": now.isoformat(),
    }

    cache.set(cache_key, response)
    return JSONResponse(content=response, headers={"X-Cache": "MISS"})
