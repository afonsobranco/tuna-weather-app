import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import en from '../i18n/en'
import pt from '../i18n/pt'

const LANGS = { en, pt }

export const useAppStore = create(
  persist(
    (set, get) => ({
      unit: 'C',
      language: 'en',
      savedCities: ['Lisbon', 'London', 'Reykjavík', 'Tokyo'],
      lastCity: null,      // persisted last viewed city
      cityTemps: {},       // { cityName: tempC } — last known temp per city

      toggleUnit: () => set((s) => ({ unit: s.unit === 'C' ? 'F' : 'C' })),
      setLanguage: (lang) => set({ language: lang }),
      setLastCity: (city) => set({ lastCity: city }),
      setCityTemp: (city, tempC) => set((s) => ({
        cityTemps: { ...s.cityTemps, [city]: tempC },
      })),
      addSavedCity: (city) => set((s) => ({
        savedCities: s.savedCities.includes(city)
          ? s.savedCities
          : [...s.savedCities, city].slice(-8),
      })),
      removeSavedCity: (city) => set((s) => ({
        savedCities: s.savedCities.filter((c) => c !== city),
      })),
      t: () => LANGS[get().language] || LANGS.en,
    }),
    {
      name: 'tuna-app-store',
      partialize: (state) => ({
        unit: state.unit,
        language: state.language,
        savedCities: state.savedCities,
        lastCity: state.lastCity,
        cityTemps: state.cityTemps,
      }),
    }
  )
)
