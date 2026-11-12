export default function HistoryDateInput({ value, onChange, tr, compact = false }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={tr.pickDate}
      className="date-input"
      style={{
        background: 'rgba(220,190,140,0.15)',
        border: '1px solid rgba(220,190,140,0.3)',
        borderRadius: 8,
        padding: compact ? '6px 8px' : '8px 10px',
        minHeight: compact ? 36 : 44,
        color: 'rgba(255,240,200,0.92)',
        fontFamily: '"Geist", system-ui, sans-serif',
        fontSize: 11,
        cursor: 'pointer',
        colorScheme: 'dark',
      }}
    />
  )
}

export function HistoryLoader({ loading, empty, tr }) {
  if (!loading && !empty) return null
  return (
    <div style={{ fontFamily: '"Geist", system-ui, sans-serif', fontSize: 13, color: 'rgba(255,240,200,0.85)', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      {loading && <span aria-hidden className="tuna-spinner" />}
      {loading ? tr.historyLoading : tr.historyEmpty}
    </div>
  )
}
