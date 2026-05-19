"""
Tuna Weather App — Vercel Serverless Function
Replaces the Render backend. Runs on Vercel's Python runtime (no cold-start sleep).
"""
from __future__ import annotations

import asyncio
import json
import math
import time
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import httpx

# ─── External API URLs ───────────────────────────────────────────────────────
NOMINATIM_URL   = "https://nominatim.openstreetmap.org/search"
OPEN_METEO_URL  = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
GEOCODE_URL     = "https://geocoding-api.open-meteo.com/v1/search"
WIKIMEDIA_URL   = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}"

HEADERS = {"User-Agent": "TunaWeatherApp/1.0 (github.com/afonsobranco/tuna-weather-app)"}

# ─── WMO weather code mappings ───────────────────────────────────────────────
WMO_MAP: dict[int, tuple[str, str]] = {
    0:  ("Clear Sky",          "sun"),
    1:  ("Mainly Clear",       "sun"),
    2:  ("Partly Cloudy",      "partly"),
    3:  ("Overcast",           "cloud"),
    45: ("Foggy",              "cloud"),
    48: ("Icy Fog",            "cloud"),
    51: ("Light Drizzle",      "rain"),
    53: ("Drizzle",            "rain"),
    55: ("Heavy Drizzle",      "rain"),
    56: ("Freezing Drizzle",   "rain"),
    57: ("Freezing Drizzle",   "rain"),
    61: ("Light Rain",         "rain"),
    63: ("Rain",               "rain"),
    65: ("Heavy Rain",         "rain"),
    66: ("Freezing Rain",      "rain"),
    67: ("Freezing Rain",      "rain"),
    71: ("Light Snow",         "cloud"),
    73: ("Snow",               "cloud"),
    75: ("Heavy Snow",         "cloud"),
    77: ("Snow Grains",        "cloud"),
    80: ("Rain Showers",       "rain"),
    81: ("Rain Showers",       "rain"),
    82: ("Heavy Showers",      "rain"),
    85: ("Snow Showers",       "cloud"),
    86: ("Heavy Snow Showers", "cloud"),
    95: ("Thunderstorm",       "storm"),
    96: ("Thunderstorm",       "storm"),
    99: ("Thunderstorm",       "storm"),
}

def wmo_to_condition(code: int) -> tuple[str, str]:
    return WMO_MAP.get(code, ("Partly Cloudy", "partly"))

def wmo_to_weather_state(code: int, is_night: bool) -> str:
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

# ─── UV / AQI helpers ────────────────────────────────────────────────────────
def uv_label(val: float) -> tuple[str, str]:
    v = round(val)
    if v <= 0:  return "None",      "green"
    if v <= 2:  return "Low",       "green"
    if v <= 5:  return "Moderate",  "orange"
    if v <= 7:  return "High",      "orange"
    if v <= 10: return "Very High", "red"
    return "Extreme", "red"

def aqi_label(val: float) -> tuple[str, str]:
    v = round(val)
    if v <= 20:  return "Excellent", "green"
    if v <= 40:  return "Good",      "green"
    if v <= 80:  return "Moderate",  "orange"
    if v <= 120: return "Unhealthy", "red"
    return "Hazardous", "red"

# ─── Health Score ─────────────────────────────────────────────────────────────
def calculate_health_score(uv_value, aqi_value, humidity, wind_speed):
    uv_score  = max(0.0, 100.0 - uv_value * 9.0)
    aqi_score = max(0.0, 100.0 - aqi_value * 0.6)
    hum_dev   = abs(humidity - 57.5) / 57.5
    hum_score = max(0.0, 100.0 - hum_dev * 80.0)
    wind_dev  = abs(wind_speed - 15.0) / 40.0
    wind_score = max(0.0, 100.0 - wind_dev * 60.0)
    score = round(uv_score * 0.25 + aqi_score * 0.40 + hum_score * 0.20 + wind_score * 0.15)

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

# ─── Misc helpers ─────────────────────────────────────────────────────────────
def country_code_to_flag(code: str) -> str:
    try:
        return "".join(chr(0x1F1E0 + ord(c) - ord("A")) for c in code.upper())
    except Exception:
        return "🌍"

def daylight_remaining(sunrise_str: str, sunset_str: str) -> str:
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
        return datetime.fromisoformat(iso_str).strftime("%H:%M")
    except Exception:
        return "—"

def wind_dir_label(degrees: float) -> str:
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return dirs[round(degrees / 45) % 8]

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
def day_label(date_str: str, i: int) -> str:
    if i == 0: return "Today"
    if i == 1: return "Tomorrow"
    try:
        return DAYS[datetime.fromisoformat(date_str).weekday()]
    except Exception:
        return DAYS[i % 7]

def score_event_relevance(event: dict, city: str, country: str) -> int:
    text = f"{event.get('text', '')} {' '.join(p.get('titles', {}).get('normalized', '') for p in event.get('pages', []))}"
    text_lower = text.lower()
    score = 0
    for word in [city.lower(), country.lower()]:
        if word in text_lower:
            score += 10
    return score

# ─── Async fetch functions ────────────────────────────────────────────────────
async def geocode_city(client, city):
    resp = await client.get(GEOCODE_URL, params={"name": city, "count": 1, "language": "en", "format": "json"}, timeout=8)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        resp2 = await client.get(NOMINATIM_URL, params={"q": city, "format": "json", "limit": 1, "addressdetails": 1}, headers=HEADERS, timeout=8)
        resp2.raise_for_status()
        nom = resp2.json()
        if not nom:
            raise ValueError(f"City '{city}' not found.")
        r = nom[0]
        addr = r.get("address", {})
        return {"lat": float(r["lat"]), "lon": float(r["lon"]), "city": addr.get("city") or addr.get("town") or addr.get("village") or city, "country": addr.get("country", ""), "country_code": addr.get("country_code", "").upper()}
    r = results[0]
    return {"lat": float(r["latitude"]), "lon": float(r["longitude"]), "city": r.get("name", city), "country": r.get("country", ""), "country_code": r.get("country_code", "").upper()}

async def fetch_weather(client, lat, lon):
    params = {
        "latitude": lat, "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day",
        "hourly": "temperature_2m,weather_code",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max",
        "timezone": "auto", "forecast_days": 7, "wind_speed_unit": "kmh",
    }
    resp = await client.get(OPEN_METEO_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()

async def fetch_air_quality(client, lat, lon):
    resp = await client.get(AIR_QUALITY_URL, params={"latitude": lat, "longitude": lon, "current": "european_aqi,us_aqi", "timezone": "auto"}, timeout=10)
    resp.raise_for_status()
    return resp.json()

async def fetch_history(client, month, day):
    url = WIKIMEDIA_URL.format(month=str(month).zfill(2), day=str(day).zfill(2))
    resp = await client.get(url, headers=HEADERS, timeout=8)
    resp.raise_for_status()
    return resp.json().get("events", [])

# ─── Main data assembly ───────────────────────────────────────────────────────
async def build_response(city: str) -> dict:
    async with httpx.AsyncClient(follow_redirects=True) as client:
        geo = await geocode_city(client, city)
        lat, lon = geo["lat"], geo["lon"]
        now = datetime.now(tz=timezone.utc)
        weather_data, aqi_data, history_events = await asyncio.gather(
            fetch_weather(client, lat, lon),
            fetch_air_quality(client, lat, lon),
            fetch_history(client, now.month, now.day),
        )

    curr     = weather_data.get("current", {})
    temp_c   = curr.get("temperature_2m", 0.0)
    humidity = curr.get("relative_humidity_2m", 50.0)
    feels    = curr.get("apparent_temperature", temp_c)
    wmo_code = int(curr.get("weather_code", 0))
    wind_spd = curr.get("wind_speed_10m", 0.0)
    wind_deg = curr.get("wind_direction_10m", 0.0)
    uv_curr  = curr.get("uv_index", 0.0)
    is_day   = bool(curr.get("is_day", 1))

    condition_label, _ = wmo_to_condition(wmo_code)

    daily  = weather_data.get("daily", {})
    times  = daily.get("time", [])
    hi_arr = daily.get("temperature_2m_max", [])
    lo_arr = daily.get("temperature_2m_min", [])
    sr_arr = daily.get("sunrise", [])
    ss_arr = daily.get("sunset", [])
    pp_arr = daily.get("precipitation_probability_max", [])
    uv_arr = daily.get("uv_index_max", [])
    dc_arr = daily.get("weather_code", [])

    hi_c       = hi_arr[0] if hi_arr else temp_c
    lo_c       = lo_arr[0] if lo_arr else temp_c
    sunrise_raw = sr_arr[0] if sr_arr else ""
    sunset_raw  = ss_arr[0] if ss_arr else ""

    weather_state = wmo_to_weather_state(wmo_code, not is_day)
    if is_day and weather_state == "clear-day":
        try:
            ss_dt = datetime.fromisoformat(sunset_raw)
            diff  = (ss_dt - now.replace(tzinfo=None)).total_seconds()
            if 0 < diff < 7200:
                weather_state = "sunset"
        except Exception:
            pass

    # Forecast (5 days)
    forecast = []
    for i in range(min(5, len(times))):
        code = int(dc_arr[i]) if i < len(dc_arr) else 0
        forecast.append({
            "d": day_label(times[i], i),
            "i": icon_for_forecast(code, i > 0),
            "hi": round(hi_arr[i]) if i < len(hi_arr) else 0,
            "lo": round(lo_arr[i]) if i < len(lo_arr) else 0,
            "p": int(pp_arr[i]) if i < len(pp_arr) else 0,
        })

    # Per-day hourly data
    hourly_temps = weather_data.get("hourly", {}).get("temperature_2m", [])
    hourly_codes = weather_data.get("hourly", {}).get("weather_code", [])
    hourly_times = weather_data.get("hourly", {}).get("time", [])
    for day_idx in range(len(forecast)):
        day_prefix = (now + timedelta(days=day_idx)).strftime("%Y-%m-%d")
        day_entries = []
        for idx, t in enumerate(hourly_times):
            if not t.startswith(day_prefix) or idx >= len(hourly_temps):
                continue
            h_code = int(hourly_codes[idx]) if idx < len(hourly_codes) else 0
            try:
                dt_h   = datetime.fromisoformat(t)
                night_h = not (6 <= dt_h.hour < 20)
                is_now  = (day_idx == 0 and t.startswith(now.strftime("%Y-%m-%dT%H")))
            except Exception:
                night_h, is_now = False, False
            day_entries.append({"time": t, "tempC": round(hourly_temps[idx]), "icon": icon_for_forecast(h_code, night_h), "isNow": is_now})
        forecast[day_idx]["hourly"] = day_entries[::2][:12]

    # Today's hourly strip (next 24h)
    curr_hour_idx = 0
    now_str = now.strftime("%Y-%m-%dT%H:00")
    for idx, t in enumerate(hourly_times):
        if t >= now_str[:13]:
            curr_hour_idx = idx
            break
    hourly = []
    for i in range(12):
        idx = curr_hour_idx + i * 2
        if idx >= len(hourly_temps):
            break
        h_raw  = hourly_times[idx] if idx < len(hourly_times) else ""
        h_code = int(hourly_codes[idx]) if idx < len(hourly_codes) else 0
        try:
            h_hour = datetime.fromisoformat(h_raw).hour if h_raw else 12
        except Exception:
            h_hour = 12
        night_h = not (6 <= h_hour < 20)
        hourly.append({"time": h_raw, "tempC": round(hourly_temps[idx]), "icon": icon_for_forecast(h_code, night_h), "isNow": i == 0})

    # AQI + UV
    aqi_curr = aqi_data.get("current", {})
    aqi_val  = float(aqi_curr.get("european_aqi") or aqi_curr.get("us_aqi") or 0)
    aqi_lbl, aqi_tone = aqi_label(aqi_val)
    uv_day = float(uv_arr[0]) if uv_arr else float(uv_curr)
    uv_lbl, uv_tone = uv_label(uv_day)

    # Health score
    health_score, health_tip = calculate_health_score(uv_day, aqi_val, humidity, wind_spd)

    # History
    city_name    = geo.get("city", city)
    country_name = geo.get("country", "")
    scored = sorted(history_events, key=lambda e: score_event_relevance(e, city_name, country_name), reverse=True)
    top = scored[:3] if len(scored) >= 3 else history_events[:3]
    history_out = []
    for ev in top:
        pages    = ev.get("pages", [])
        wiki_url = pages[0].get("content_urls", {}).get("desktop", {}).get("page", "#") if pages else "#"
        history_out.append({"year": str(ev.get("year", "")), "title": ev.get("text", "")[:120], "body": (pages[0].get("extract", "")[:200] if pages else ev.get("text", ""))[:200], "href": wiki_url})

    return {
        "city":         city_name,
        "country":      country_name,
        "flag":         country_code_to_flag(geo.get("country_code", "")),
        "lat":          lat,
        "lon":          lon,
        "tempC":        round(temp_c, 1),
        "hiC":          round(hi_c),
        "loC":          round(lo_c),
        "feelsLikeC":   round(feels, 1),
        "condition":    condition_label,
        "weatherCode":  wmo_code,
        "weatherState": weather_state,
        "windSpeed":    round(wind_spd),
        "windDir":      wind_dir_label(wind_deg),
        "humidity":     round(humidity),
        "sunrise":      format_time(sunrise_raw),
        "sunset":       format_time(sunset_raw),
        "daylight":     daylight_remaining(sunrise_raw, sunset_raw),
        "uv":    {"value": round(uv_day, 1), "label": uv_lbl, "tone": uv_tone},
        "aqi":   {"value": round(aqi_val),   "label": aqi_lbl, "tone": aqi_tone},
        "health":{"score": health_score, "tip": health_tip},
        "history":  history_out,
        "forecast": forecast,
        "hourly":   hourly,
        "fetchedAt": now.isoformat(),
    }

# ─── Vercel handler ───────────────────────────────────────────────────────────
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        city   = params.get("city", [None])[0]

        if not city or not city.strip():
            self._respond(400, {"error": "Missing required query parameter: city"})
            return

        try:
            data = asyncio.run(build_response(city.strip()))
            self._respond(200, data)
        except ValueError as e:
            self._respond(404, {"error": str(e)})
        except Exception as e:
            self._respond(500, {"error": "Weather service unavailable. Please try again."})

    def _respond(self, status: int, body: dict):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass  # suppress default access logs
