# 🐟 Tuna Weather App

> Weather + the stories of every place.

A fully free-to-host Progressive Web App (PWA) combining real-time weather data with "On This Day" historical events for any city in the world.

**Live demo:** https://afonsobranco.github.io/tuna-weather-app/

---

## Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | GitHub Pages (free) |
| Backend | FastAPI (Python) | Render (free tier) |
| Weather | Open-Meteo API | keyless / free |
| Geocoding | Open-Meteo Geocoding + Nominatim | keyless / free |
| History | Wikimedia "On This Day" API | keyless / free |

---

## Project Structure

```
tuna-weather-app/
├── backend/
│   ├── main.py            ← FastAPI app (all logic in one file)
│   ├── requirements.txt
│   ├── .env.example
│   └── Procfile           ← Render start command
└── frontend/
    ├── public/
    │   ├── manifest.json  ← PWA manifest
    │   └── sw.js          ← Service worker
    ├── src/
    │   ├── App.jsx        ← Root component
    │   ├── main.jsx       ← Entry point + SW registration
    │   ├── index.css      ← Global styles + animations
    │   ├── i18n/          ← EN + PT translations
    │   ├── context/       ← Zustand store (unit, language, cities)
    │   ├── hooks/         ← useWeather, useGeolocation
    │   ├── utils/         ← weather helpers, unit conversion
    │   └── components/
    │       ├── primitives/   ← Glass, Tone, AppMark
    │       ├── icons/        ← WeatherIcons, UIGlyphs
    │       ├── mascot/       ← TunaFish (5 poses)
    │       ├── backgrounds/  ← 4 weather backgrounds
    │       ├── mobile/       ← 7 mobile section components
    │       ├── desktop/      ← Rail, Hero, HourlyStrip, Aside
    │       ├── states/       ← Splash, Skeleton, EmptyStates
    │       └── layout/       ← MobileLayout, DesktopLayout
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local → set VITE_API_URL=http://localhost:8000
npm run dev
# App at http://localhost:5173/tuna-weather-app/
```

---

## Deployment

### 1. Deploy Backend to Render

1. Go to https://render.com → **New Web Service**
2. Connect your GitHub repo, select the **`backend/`** folder as root directory
3. Set these fields:
   - **Runtime:** Python 3.11
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   ```
   ALLOWED_ORIGINS=["https://afonsobranco.github.io"]
   CACHE_TTL_SECONDS=900
   APP_ENV=production
   ```
5. Click **Deploy**. Copy the service URL (e.g. `https://tuna-weather.onrender.com`)

> **Free tier note:** Render free services sleep after 15 minutes of inactivity. The frontend shows a "Waking up the weather station…" skeleton loader to handle this gracefully. First request after sleep takes ~30s.

---

### 2. Deploy Frontend to GitHub Pages

#### Option A — Manual (recommended for first deploy)

```bash
cd frontend
# Set your backend URL
echo "VITE_API_URL=https://tuna-weather.onrender.com" > .env.local
npm run build
npm run deploy   # runs gh-pages -d dist
```

Then in GitHub repo settings → **Pages** → Source: `gh-pages` branch.

#### Option B — GitHub Actions (automatic on push)

Create `.github/workflows/deploy.yml` in the repo root:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: frontend/dist
```

Add `VITE_API_URL` as a **Repository Secret** in GitHub Settings → Secrets → Actions.

---

## PWA — Add to Home Screen

On iOS Safari: Share → **Add to Home Screen**
On Android Chrome: Menu → **Add to Home Screen** / Install app

The app icon renders the SVG tuna mark programmatically — no external image files needed.

---

## Features

- 🌤 **Real-time weather** — current temp, feels like, H/L, condition
- 🌅 **5-day forecast** — horizontal scroll with rain probability
- ⏱ **Hourly forecast** — sparkline chart with 12-hour outlook
- 🌞 **Astronomy** — sunrise, sunset, sun arc, daylight remaining
- 🍃 **Health Score** — UV + AQI + humidity + wind → 0-100 score
- 📰 **On This Day** — 3 historical events from Wikimedia, date-selectable
- 🗺 **Auto-detect location** — browser geolocation → Nominatim reverse geocode
- 🌡 **°C / °F toggle** — animated pill switch, persists across sessions
- 🇵🇹/🇬🇧 **Language** — English + Portuguese, one-tap flag switch
- 📱 **PWA** — Add to Home Screen, offline support (stale-while-revalidate)
- 🌙 **4 dynamic backgrounds** — clear-day, sunset, rainy, clear-night
- 🐟 **Tuna mascot** — 5 animated poses for all empty/error states

---

## Architecture Notes

### Caching (Two-Layer)

```
Browser localStorage (15 min TTL)
  → FastAPI in-memory cache (15 min TTL)  ← can swap to Redis (one-line change)
    → Open-Meteo / Wikimedia APIs
```

### Health Score Formula

```python
score = UV_score * 0.25 + AQI_score * 0.40 + Humidity_score * 0.20 + Wind_score * 0.15

UV_score       = max(0, 100 - uv_index * 9)
AQI_score      = max(0, 100 - european_aqi * 0.6)
Humidity_score = max(0, 100 - abs(humidity - 57.5) / 57.5 * 80)
Wind_score     = max(0, 100 - abs(wind_kmh - 15) / 40 * 60)
```

### Upgrading the Cache to Redis

In `backend/main.py`, replace `cache = InMemoryCache()` with:
```python
import redis
r = redis.from_url(os.environ["REDIS_URL"])
cache = RedisCache(r)   # implement get/set wrapping r.get / r.setex
```
Render offers a free Redis add-on — add it to your service and it provides `REDIS_URL` automatically.

---

*made with cold currents.*
