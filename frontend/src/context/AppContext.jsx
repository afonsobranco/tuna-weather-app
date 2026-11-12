import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import en from '../i18n/en'
import pt from '../i18n/pt'
import { SEED_PLACES, placeKey, samePlace, toPlace } from '../utils/place'

const LANGS = { en, pt }

export const useAppStore = create(
  persist(
    (set, get) => ({
      unit: 'C',
      language: 'en',
      savedCities: Object.values(SEED_PLACES), // places, see utils/place.js
      lastCity: null,                           // last place viewed
      cityTemps: {},                            // { placeKey: tempC }

      toggleUnit: () => set((s) => ({ unit: s.unit === 'C' ? 'F' : 'C' })),
      setLanguage: (lang) => set({ language: lang }),
      setLastCity: (place) => set({ lastCity: place }),
      setCityTemp: (place, tempC) => set((s) => ({
        cityTemps: { ...s.cityTemps, [placeKey(place)]: tempC },
      })),
      addSavedCity: (place) => set((s) => ({
        savedCities: s.savedCities.some((p) => samePlace(p, place))
          ? s.savedCities
          : [...s.savedCities, place].slice(-8),
      })),
      removeSavedCity: (place) => set((s) => ({
        savedCities: s.savedCities.filter((p) => !samePlace(p, place)),
      })),
      // Swap a name-only saved entry for the exact place the API resolved it to
      upgradeSavedCity: (from, to) => set((s) => ({
        savedCities: s.savedCities.map((p) => (p === from || samePlace(p, from) ? to : p)),
      })),
      t: () => LANGS[get().language] || LANGS.en,
    }),
    {
      name: 'tuna-app-store',
      version: 2,
      migrate: (state, version) => {
        if (version < 1) {
          state.savedCities = (state.savedCities || []).map(toPlace).filter(Boolean)
          state.lastCity = toPlace(state.lastCity)
          state.cityTemps = {}
          delete state.cityLocations
        }
        if (version < 2) {
          // Default cities gain their Portuguese names
          const seeds = Object.values(SEED_PLACES)
          state.savedCities = (state.savedCities || []).map((p) => {
            const seed = seeds.find((s) => samePlace(s, p))
            return seed ? { ...p, names: { ...seed.names, ...p.names } } : p
          })
        }
        return state
      },
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
