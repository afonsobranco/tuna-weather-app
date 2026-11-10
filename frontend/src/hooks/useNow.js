import { useEffect, useState } from 'react'

// Re-renders every `interval` ms so time-based text ("5 min ago", countdowns) stays current
export function useNow(interval = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}
