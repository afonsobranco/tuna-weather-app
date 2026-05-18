export default {
  searchPlaceholder: "Pesquisar cidade…",
  currentLocation: "Localização atual",
  autoDetect: "Detetando localização…",
  wakeUp: "A acordar a estação meteorológica…",
  uvIndex: "Índice UV",
  airQuality: "Qualidade do Ar",
  wind: "Vento",
  humidity: "Humidade",
  sunrise: "Nascer do Sol",
  sunset: "Pôr do Sol",
  daylightRemaining: "Luz restante",
  onThisDay: "Neste dia",
  showMore: (n) => `Mostrar mais ${n} event${n === 1 ? 'o' : 'os'}`,
  showLess: "Mostrar menos",
  howWeCalculate: "Como calculamos",
  hideBreakdown: "Esconder detalhes",
  dailyHealthScore: "Score de Saúde Diário",
  tomorrowAt8: "Amanhã · 8:00",
  forecast7day: "Previsão 5 dias",
  hourlyForecast: "Previsão horária",
  next24h: "próximas 24h",
  lastUpdated: (t) => `Atualizado ${t}`,
  wikipedia: "Wikipédia",
  swipeHint: "deslizar ⟶",
  feels: "Sensação",
  hiLo: (h, l) => `Máx ${h}° · Mín ${l}°`,
  saved: "Guardadas",
  today: "Hoje",
  tomorrow: "Amanhã",
  now: "Agora",
  cityNotFound: "Nada nestas águas.",
  cityNotFoundBody: "Nenhuma cidade corresponde. Tenta outra grafia.",
  locationDenied: "Escondeste a tua localização.",
  locationDeniedBody: "Sem ela, o Tuna não consegue mostrar o teu céu local.",
  offline: "Perdemos a corrente.",
  offlineBody: "O Tuna não consegue ligar à superfície. A mostrar a última leitura em cache.",
  noSavedCities: "O teu cardume está vazio.",
  noSavedCitiesBody: "Guarda até 8 cidades para as acompanhar facilmente.",
  retry: "Tentar novamente",
  enableLocation: "Abrir Definições",
  addCity: "Adicionar cidade",
  madeWith: "feito com correntes frias.",

  // Condições meteorológicas
  conditions: {
    'Clear Sky':           'Céu limpo',
    'Mainly Clear':        'Maioritariamente limpo',
    'Partly Cloudy':       'Parcialmente nublado',
    'Overcast':            'Nublado',
    'Foggy':               'Nevoeiro',
    'Icy Fog':             'Nevoeiro glacial',
    'Light Drizzle':       'Chuvisco fraco',
    'Drizzle':             'Chuvisco',
    'Heavy Drizzle':       'Chuvisco forte',
    'Freezing Drizzle':    'Chuvisco gelado',
    'Light Rain':          'Chuva fraca',
    'Rain':                'Chuva',
    'Heavy Rain':          'Chuva forte',
    'Freezing Rain':       'Chuva gelada',
    'Light Snow':          'Neve fraca',
    'Snow':                'Neve',
    'Heavy Snow':          'Neve forte',
    'Snow Grains':         'Grãos de neve',
    'Rain Showers':        'Aguaceiros',
    'Heavy Showers':       'Aguaceiros fortes',
    'Snow Showers':        'Aguaceiros de neve',
    'Heavy Snow Showers':  'Aguaceiros de neve fortes',
    'Thunderstorm':        'Trovoada',
  },

  // Classificação do índice UV
  uvLabels: {
    'None': 'Nenhum', 'Low': 'Baixo', 'Moderate': 'Moderado',
    'High': 'Alto', 'Very High': 'Muito Alto', 'Extreme': 'Extremo',
  },

  // Classificação da qualidade do ar
  aqiLabels: {
    'Excellent': 'Excelente', 'Good': 'Bom', 'Moderate': 'Moderado',
    'Unhealthy': 'Prejudicial', 'Hazardous': 'Perigoso',
  },

  // Direções do vento (rosa dos ventos em PT)
  windDirs: { N: 'N', NE: 'NE', E: 'E', SE: 'SE', S: 'S', SW: 'SO', W: 'O', NW: 'NO' },

  // Abreviações dos dias da semana
  days: { Mon: 'Seg', Tue: 'Ter', Wed: 'Qua', Thu: 'Qui', Fri: 'Sex', Sat: 'Sáb', Sun: 'Dom' },

  // Condição de amanhã — legendas e dicas
  tomorrowConditions: {
    rain:    { label: 'Chuva prevista',     tip: 'Leva um chapéu de chuva' },
    storm:   { label: 'Tempo tempestuoso',  tip: 'Evita sair cedo' },
    cloud:   { label: 'Nublado',            tip: 'Veste camadas — aquece devagar' },
    moon:    { label: 'Céu limpo',          tip: 'Início fresco' },
    default: { label: 'Fresco e limpo',     tip: 'Ótimo para correr' },
  },

  // Fatores do score de saúde
  healthFactors: ['Índice UV', 'Qualidade do Ar', 'Ponto de Orvalho / Humidade', 'Vento'],

  // Locale para datas em JS
  dateLocale: 'pt',
}
