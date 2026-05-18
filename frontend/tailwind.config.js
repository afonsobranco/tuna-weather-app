/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        glass: 'rgba(255,255,255,0.10)',
        'glass-border': 'rgba(255,255,255,0.18)',
        'parchment': '#fff8e7',
        'parchment-accent': '#ffe7b8',
        tone: {
          green: { fg: '#1f7a4f', bg: 'rgba(60,210,135,0.18)', dot: '#3ed28b' },
          orange: { fg: '#a14e15', bg: 'rgba(255,170,80,0.22)', dot: '#ffa850' },
          red: { fg: '#a02525', bg: 'rgba(255,90,90,0.24)', dot: '#ff5a5a' },
        },
      },
      borderRadius: {
        card: '24px',
        cell: '16px',
        tile: '14px',
        pill: '9999px',
      },
      backdropBlur: {
        glass: '22px',
      },
    },
  },
  plugins: [],
}
