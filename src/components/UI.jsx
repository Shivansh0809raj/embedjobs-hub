import { T } from '../lib/theme.js'

export const Btn = ({ children, onClick, variant='primary', small, disabled, style={}, fullWidth }) => {
  const base = {
    border:'none', borderRadius:6, cursor:disabled?'not-allowed':'pointer',
    fontFamily:'inherit', fontWeight:600, transition:'all 0.18s',
    padding: small ? '6px 14px' : '10px 22px',
    fontSize: small ? 12 : 14, opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto', ...style,
  }
  const v = {
    primary: { background:T.accent, color:'#000' },
    ghost:   { background:'transparent', color:T.accent, border:`1px solid ${T.border}` },
    danger:  { background:T.danger+'22', color:T.danger, border:`1px solid ${T.danger}44` },
    success: { background:T.success+'22', color:T.success, border:`1px solid ${T.success}44` },
  }
  return <button onClick={disabled?undefined:onClick} style={{...base,...v[variant]}}>{children}</button>
}

export const Inp = ({ value, onChange, placeholder, type='text', style={}, onKeyDown, autoComplete }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder} onKeyDown={onKeyDown} autoComplete={autoComplete}
    style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
      color:T.text, padding:'9px 12px', fontSize:13, outline:'none',
      fontFamily:'inherit', width:'100%', boxSizing:'border-box', ...style }} />
)

export const Sel = ({ value, onChange, options, style={} }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
      color:T.text, padding:'8px 10px', fontSize:13, outline:'none',
      fontFamily:'inherit', cursor:'pointer', ...style }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
)

export const Card = ({ children, style={} }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:10, padding:20, ...style }}>{children}</div>
)

export const Alert = ({ type='error', children }) => {
  const c = { error:T.danger, success:T.success, warn:T.warn, info:T.accent }[type] || T.danger
  return (
    <div style={{ color:c, fontSize:13, background:c+'18', borderRadius:8,
      padding:'10px 14px', border:`1px solid ${c}33`, lineHeight:1.6 }}>
      {children}
    </div>
  )
}

export const Spinner = ({ size=20 }) => (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ display:'inline-block', width:size, height:size,
      border:`2px solid ${T.border}`, borderTopColor:T.accent,
      borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
  </>
)

export const Badge = ({ label, color }) => (
  <span style={{ background:color+'22', color, border:`1px solid ${color}44`,
    borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{label}</span>
)

export const Field = ({ label, children }) => (
  <div>
    <div style={{ color:T.textMuted, fontSize:11, fontWeight:600,
      marginBottom:6, letterSpacing:0.5 }}>{label}</div>
    {children}
  </div>
)
