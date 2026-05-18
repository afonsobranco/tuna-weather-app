export default function Glass({ children, style = {}, antique = false, accent, className = '' }) {
  const border = accent || (antique ? 'rgba(220,190,140,0.4)' : 'rgba(255,255,255,0.18)')
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        background: antique
          ? 'linear-gradient(155deg, rgba(240,225,190,0.22) 0%, rgba(200,170,120,0.16) 100%)'
          : 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        border: `1px solid ${border}`,
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.18), 0 18px 40px -16px rgba(0,0,0,0.45)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
