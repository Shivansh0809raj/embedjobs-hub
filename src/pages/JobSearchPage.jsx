import { useState } from 'react'
import { Card, Inp, Sel } from '../components/UI.jsx'
import { T, ROLES, SITES, COMPANY_CAREERS } from '../lib/theme.js'

export default function JobSearchPage() {
  const [role,       setRole]       = useState(ROLES[0])
  const [customRole, setCustomRole] = useState('')
  const [location,   setLocation]   = useState('India')
  const [experience, setExperience] = useState('3-6 years')

  const q = encodeURIComponent((customRole || role) + ' ' + location)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      <Card>
        <div style={{ color:T.accent, fontWeight:700, fontSize:12, marginBottom:16, letterSpacing:1 }}>
          ⚡ CONFIGURE YOUR SEARCH
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
          <div>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:5 }}>TARGET ROLE</div>
            <Sel value={role} onChange={setRole} options={ROLES} style={{ width:'100%' }} />
          </div>
          <div>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:5 }}>LOCATION</div>
            <Inp value={location} onChange={setLocation} placeholder="e.g. Bengaluru, Remote" />
          </div>
          <div>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:5 }}>EXPERIENCE</div>
            <Sel value={experience} onChange={setExperience}
              options={['0-2 years','2-5 years','3-6 years','5-8 years','8+ years']}
              style={{ width:'100%' }} />
          </div>
        </div>
        <div>
          <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:5 }}>
            CUSTOM ROLE — overrides the dropdown above
          </div>
          <Inp value={customRole} onChange={setCustomRole}
            placeholder="e.g. CAN bus firmware developer automotive AUTOSAR" />
        </div>
        <div style={{ marginTop:12, color:T.textFaint, fontSize:11 }}>
          💡 Cards with ✅ filter apply automatically. Cards marked "type role on their site" open the job board directly — your role is pre-copied to clipboard.
        </div>
      </Card>

      {/* Job boards */}
      <div>
        <div style={{ color:T.text, fontWeight:700, fontSize:15, marginBottom:12 }}>🌐 Job Boards</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          {SITES.map(s => (
            <a key={s.name} href={s.noQuery ? s.url : s.url + q} target="_blank" rel="noreferrer"
              style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
                padding:'16px 10px', textAlign:'center', textDecoration:'none', transition:'all 0.18s',
                display:'block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=s.color; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.transform='none' }}>
              <div style={{ fontSize:20, marginBottom:8 }}>🔗</div>
              <div style={{ color:s.color, fontWeight:700, fontSize:13 }}>{s.name}</div>
              <div style={{ color:T.textMuted, fontSize:10, marginTop:4 }}>
                {s.noQuery ? 'Browse roles →' : 'Open search →'}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Company career pages */}
      <div>
        <div style={{ color:T.text, fontWeight:700, fontSize:15, marginBottom:6 }}>
          🏢 Company Career Pages
        </div>
        <div style={{ color:T.textMuted, fontSize:12, marginBottom:14 }}>
          Direct links — your role & location filter above is pre-applied to every search.
        </div>

        {/* Group by category */}
        {[
          { label:'⚡ Semiconductor & Chip', slice:[0,12] },
          { label:'🚗 Automotive & ADAS',    slice:[12,16] },
          { label:'🇮🇳 India Engineering Services', slice:[16,21] },
        ].map(({ label, slice }) => (
          <div key={label} style={{ marginBottom:20 }}>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:700,
              letterSpacing:1, marginBottom:8 }}>{label}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {COMPANY_CAREERS.slice(...slice).map(c => (
                <a key={c.name} href={c.supportsQuery ? c.url + q : c.url} target="_blank" rel="noreferrer"
                  title={c.supportsQuery ? `Search: ${decodeURIComponent(q)}` : `Opens ${c.name} job search — type your role there`}
                  style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8,
                    padding:'11px 16px', display:'flex', justifyContent:'space-between',
                    alignItems:'center', textDecoration:'none', transition:'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.background=T.accent+'0A' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.surface }}>
                  <div>
                    <span style={{ color:T.text, fontSize:13, fontWeight:500 }}>{c.name}</span>
                    {!c.supportsQuery && <span style={{ color:T.textFaint, fontSize:10, display:'block' }}>type role on their site</span>}
                  </div>
                  <span style={{ color:T.accent, fontSize:13 }}>→</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
