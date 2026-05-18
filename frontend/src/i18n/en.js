export default {
  searchPlaceholder: "Search a city…",
  currentLocation: "Current location",
  autoDetect: "Detecting location…",
  wakeUp: "Waking up the weather station…",
  uvIndex: "UV Index",
  airQuality: "Air Quality",
  wind: "Wind",
  humidity: "Humidity",
  sunrise: "Sunrise",
  sunset: "Sunset",
  daylightRemaining: "Daylight remaining",
  onThisDay: "On this day",
  showMore: (n) => `Show ${n} more event${n === 1 ? '' : 's'}`,
  showLess: "Show less",
  howWeCalculate: "How we calculate this",
  hideBreakdown: "Hide breakdown",
  dailyHealthScore: "Daily Health Score",
  tomorrowAt8: "Tomorrow · 8:00 AM",
  forecast7day: "5-day forecast",
  hourlyForecast: "Hourly forecast",
  next24h: "next 24h",
  lastUpdated: (t) => `Last updated ${t}`,
  wikipedia: "Wikipedia",
  swipeHint: "swipe ⟶",
  feels: "Feels like",
  hiLo: (h, l) => `H ${h}° · L ${l}°`,
  saved: "Saved",
  today: "Today",
  tomorrow: "Tomorrow",
  now: "Now",
  cityNotFound: "Nothing in these waters.",
  cityNotFoundBody: "No city matched that name. Try a different spelling.",
  locationDenied: "You've hidden your location.",
  locationDeniedBody: "Without it, Tuna can't show your local sky. Allow location access in Settings.",
  offline: "We lost the current.",
  offlineBody: "Tuna can't reach the surface. Showing your last cached reading.",
  noSavedCities: "Your shoal is empty.",
  noSavedCitiesBody: "Save up to 8 cities to follow them at a glance.",
  retry: "Retry now",
  enableLocation: "Open Settings",
  addCity: "Add a city",
  madeWith: "made with cold currents.",

  // Weather condition labels (keyed by the English string from the API)
  conditions: {
    'Clear Sky':           'Clear Sky',
    'Mainly Clear':        'Mainly Clear',
    'Partly Cloudy':       'Partly Cloudy',
    'Overcast':            'Overcast',
    'Foggy':               'Foggy',
    'Icy Fog':             'Icy Fog',
    'Light Drizzle':       'Light Drizzle',
    'Drizzle':             'Drizzle',
    'Heavy Drizzle':       'Heavy Drizzle',
    'Freezing Drizzle':    'Freezing Drizzle',
    'Light Rain':          'Light Rain',
    'Rain':                'Rain',
    'Heavy Rain':          'Heavy Rain',
    'Freezing Rain':       'Freezing Rain',
    'Light Snow':          'Light Snow',
    'Snow':                'Snow',
    'Heavy Snow':          'Heavy Snow',
    'Snow Grains':         'Snow Grains',
    'Rain Showers':        'Rain Showers',
    'Heavy Showers':       'Heavy Showers',
    'Snow Showers':        'Snow Showers',
    'Heavy Snow Showers':  'Heavy Snow Showers',
    'Thunderstorm':        'Thunderstorm',
  },

  // UV index classification labels
  uvLabels: {
    'None': 'None', 'Low': 'Low', 'Moderate': 'Moderate',
    'High': 'High', 'Very High': 'Very High', 'Extreme': 'Extreme',
  },

  // Air quality classification labels
  aqiLabels: {
    'Excellent': 'Excellent', 'Good': 'Good', 'Moderate': 'Moderate',
    'Unhealthy': 'Unhealthy', 'Hazardous': 'Hazardous',
  },

  // Compass wind directions
  windDirs: { N: 'N', NE: 'NE', E: 'E', SE: 'SE', S: 'S', SW: 'SW', W: 'W', NW: 'NW' },

  // Short day names for forecast strip
  days: { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' },

  // Tomorrow tile condition labels + tips
  tomorrowConditions: {
    rain:    { label: 'Rain expected',  tip: 'Pack an umbrella' },
    storm:   { label: 'Stormy',         tip: 'Avoid early commute' },
    cloud:   { label: 'Overcast',       tip: 'Layer up — slow warmth' },
    moon:    { label: 'Clear',          tip: 'Crisp start' },
    default: { label: 'Clear & cool',   tip: 'Great for a run' },
  },

  // Health score breakdown factor labels
  healthFactors: ['UV Index', 'Air Quality', 'Dewpoint / Humidity', 'Wind'],

  // Date locale for JS toLocaleDateString
  dateLocale: 'en',

  // Relative time strings
  timeJustNow: 'just now',
  timeMinAgo: (n) => `${n} min ago`,
  timeHrAgo:  (n) => `${n}h ago`,
}
