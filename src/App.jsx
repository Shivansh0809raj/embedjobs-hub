import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import AuthPage      from './pages/AuthPage.jsx'
import JobSearchPage from './pages/JobSearchPage.jsx'
import ResumePage    from './pages/ResumePage.jsx'
import OutreachPage  from './pages/OutreachPage.jsx'
import TrackerPage   from './pages/TrackerPage.jsx'
import AdminPage     from './admin/AdminPage.jsx'
import { Spinner }   from './components/UI.jsx'
import { T }         from './lib/theme.js'

const TABS = [
  { id:'search',   label:'🔍 Job Search'    },
  { id:'resume',   label:'📄 Resume Tailor' },
  { id:'outreach', label:'✉️ Outreach'      },
  { id:'tracker',  label:'📊 Tracker'       },
]

function Shell() {
  const { user, profile, loading, logout, isAdmin } = useAuth()
  const [tab, setTab] = useState('search')

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex',
      alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={40} />
      <div style={{ color:T.textMuted, fontSize:13 }}>Connecting to Supabase...</div>
    </div>
  )

  if (!user) return <AuthPage />

  const tabs = isAdmin ? [...TABS, { id:'admin', label:'🛡️ Admin' }] : TABS

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text,
      fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${T.border}`, padding:'13px 28px',
        display:'flex', alignItems:'center', gap:14, background:T.surface,
        position:'sticky', top:0, zIndex:100 }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:34, height:34, background:T.accent, borderRadius:9,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⚙️</div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:T.text, letterSpacing:-0.3 }}>EmbedJobs Hub</div>
            <div style={{ fontSize:9, color:T.textMuted, letterSpacing:1 }}>EMBEDDED · FIRMWARE · AUTOMOTIVE · IoT</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display:'flex', gap:4, marginLeft:16 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab===t.id ? T.accent+'18' : 'transparent',
                border: `1px solid ${tab===t.id ? T.accent+'66' : 'transparent'}`,
                borderRadius:7, padding:'6px 14px', cursor:'pointer',
                color: tab===t.id ? T.accent : T.textMuted,
                fontFamily:'inherit', fontWeight:600, fontSize:13, transition:'all 0.18s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          {isAdmin && (
            <span style={{ background:T.warn+'22', color:T.warn, border:`1px solid ${T.warn}44`,
              borderRadius:4, padding:'2px 8px', fontSize:10, fontWeight:700 }}>ADMIN</span>
          )}
          <div style={{ textAlign:'right' }}>
            <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>
              {profile?.display_name || user.email?.split('@')[0]}
            </div>
            <div style={{ color:T.textFaint, fontSize:10 }}>{user.email}</div>
          </div>
          <div style={{ width:36, height:36, background:T.accent+'22',
            border:`2px solid ${T.accent}44`, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:T.accent, fontWeight:800, fontSize:16 }}>
            {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
          </div>
          <button onClick={logout}
            style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:6,
              color:T.textMuted, padding:'6px 12px', fontSize:12, cursor:'pointer',
              fontFamily:'inherit', fontWeight:600, transition:'color 0.18s' }}
            onMouseEnter={e => e.target.style.color=T.danger}
            onMouseLeave={e => e.target.style.color=T.textMuted}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding:'28px 28px 48px', maxWidth:1280, margin:'0 auto' }}>
        {tab==='search'   && <JobSearchPage />}
        {tab==='resume'   && <ResumePage />}
        {tab==='outreach' && <OutreachPage />}
        {tab==='tracker'  && <TrackerPage />}
        {tab==='admin'    && <AdminPage />}
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${T.border}`, padding:'14px 28px',
        textAlign:'center', color:T.textFaint, fontSize:12 }}>
        Made in India 🇮🇳 by{' '}
        <span style={{ color:T.accent, fontWeight:600 }}>Shivansh Raj</span>
        <span style={{ marginLeft:16 }}>· Powered by Supabase · Data synced across all your devices</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
