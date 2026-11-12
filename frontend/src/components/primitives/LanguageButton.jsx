import Flag from './Flag'

const LANG_CC = { en: 'GB', pt: 'PT' }

// Flag button that switches EN ⇄ PT; shows a spinner while the other language loads
export default function LanguageButton({ language, onChange, tr, busy = false, size = 44 }) {
  const nextLang = language === 'en' ? 'pt' : 'en'
  return (
    <button
      type="button"
      onClick={() => onChange(nextLang)}
      aria-label={tr.languageToggle}
      aria-busy={busy || undefined}
      title={tr.languageToggle}
      style={{
        width: size, height: size, borderRadius: 999, flexShrink: 0, cursor: busy ? 'progress' : 'pointer',
        background: 'var(--chip-bg, rgba(255,255,255,0.10))', border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {busy
        ? <span aria-hidden className="tuna-spinner" style={{ width: 16, height: 16 }} />
        : <Flag cc={LANG_CC[language]} size={size >= 44 ? 18 : 16} />}
    </button>
  )
}
