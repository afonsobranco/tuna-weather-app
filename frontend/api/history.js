import { getHistory } from './_lib/history.js'

export default async function handler(req, res) {
  const params = new URL(req.url, 'http://x').searchParams
  const match = /^(\d{2})-(\d{2})$/.exec(params.get('date') || '')
  const month = match && Number(match[1]), day = match && Number(match[2])
  if (!match || month < 1 || month > 12 || day < 1 || day > 31) {
    return res.status(400).json({ error: 'Invalid date, expected MM-DD' })
  }

  const lang = params.get('lang') === 'pt' ? 'pt' : 'en'
  // Relevance matching needs the country in the feed's language, so derive it from the code
  let country = params.get('country') || ''
  const cc = params.get('cc') || ''
  if (/^[A-Za-z]{2}$/.test(cc)) {
    try { country = new Intl.DisplayNames([lang], { type: 'region' }).of(cc.toUpperCase()) || country } catch {}
  }
  const history = await getHistory({ month, day, city: params.get('city') || '', country, lang, timeout: 8000 })
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400')
  res.status(200).json({ history })
}
