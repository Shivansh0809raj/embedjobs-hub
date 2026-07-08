import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getAllProfiles, getAllJobsForUser, setUserRole } from '../lib/db.js'
import { notifyWeeklySummary } from '../lib/notifications.js'
import { Btn, Card, Alert, Badge, Spinner } from '../components/UI.jsx'
import { T, STATUS_OPTIONS, STATUS_COLORS } from '../lib/theme.js'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const [users,    setUsers]    = useState([])
  const [selected, setSelected] = useState(null)
  const [userJobs, setUserJobs] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [jobsLoad, setJobsLoad] = useState(false)
  const [msg,      setMsg]      = useState('')
  const [tab,      setTab]      = useState('users')

  useEffect(() => {
    if (!isAdmin) return
    getAllProfiles().then(u => { setUsers(u); setLoading(false) })
  }, [isAdmin])

  if (!isAdmin) return (
    <div style={{ padding:60, textAlign:'center' }}>
      <div style={{ fontSize:40, marginBottom:16 }}>🚫</div>
      <div style={{ color:T.danger, fontWeight:700, fontSize:18 }}>Admin access only</div>
      <div style={{ color:T.textMuted, fontSize:13, marginTop:8 }}>
        Ask an existing admin to promote your account in the Supabase dashboard.
      </div>
    </div>
  )

  const viewJobs = async (u) => {
    setSelected(u); setJobsLoad(true)
    const jobs = await getAllJobsForUser(u.id)
    setUserJobs(jobs); setJobsLoad(false)
  }

  const promote = async (id) => {
    await setUserRole(id, 'admin')
    setUsers(u => u.map(x => x.id===id ? {...x,role:'admin'} : x))
    setMsg('User promoted to admin ✅')
  }

  const demote = async (id) => {
    await setUserRole(id, 'user')
    setUsers(u => u.map(x => x.id===id ? {...x,role:'user'} : x))
    setMsg('User demoted to user ✅')
  }

  const sendWeeklyAll = async () => {
    setMsg('Sending summaries...')
    for (const u of users) {
      const jobs = await getAllJobsForUser(u.id)
      await notifyWeeklySummary(u, jobs).catch(() => {})
    }
    setMsg(`✅ Weekly summary sent to ${users.length} users`)
  }

  const totalApps  = users.reduce((a) => a, 0)
  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ color:T.text, fontWeight:800, fontSize:20 }}>🛡️ Admin Dashboard</div>
          <div style={{ color:T.textMuted, fontSize:12, marginTop:3 }}>EmbedJobs Hub · Control Panel</div>
        </div>
        <Btn small variant="ghost" onClick={sendWeeklyAll}>📧 Send Weekly Summary to All</Btn>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          ['Total Users',  users.length, T.accent],
          ['Admin Users',  adminCount,   T.warn],
          ['Total Jobs',   userJobs.length, T.success],
        ].map(([label, val, color]) => (
          <Card key={label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, fontWeight:800, color }}>{val}</div>
            <div style={{ color:T.textMuted, fontSize:12, marginTop:4 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8 }}>
        {[['users','👥 All Users'],['analytics','📊 Analytics']].map(([k,l]) => (
          <Btn key={k} small onClick={() => setTab(k)} variant={tab===k?'primary':'ghost'}>{l}</Btn>
        ))}
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:20 }}>

          <Card style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`,
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ color:T.accent, fontWeight:700, fontSize:12 }}>
                ALL USERS ({users.length})
              </div>
              <div style={{ color:T.textFaint, fontSize:11 }}>Click a row to view their jobs</div>
            </div>

            {loading ? (
              <div style={{ padding:40, display:'flex', justifyContent:'center' }}><Spinner /></div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                    {['Name','Email','Role','Joined','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                        color:T.textMuted, fontSize:11, fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} onClick={() => viewJobs(u)}
                      style={{ borderBottom:`1px solid ${T.border}`, cursor:'pointer', transition:'background 0.15s',
                        background: selected?.id===u.id ? T.accent+'11' : i%2===0?'transparent':T.surfaceHigh+'44' }}>
                      <td style={{ padding:'10px 14px', color:T.text, fontWeight:500, fontSize:13 }}>
                        {u.display_name || '—'}
                      </td>
                      <td style={{ padding:'10px 14px', color:T.textMuted, fontSize:12 }}>{u.email}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <Badge label={u.role||'user'} color={u.role==='admin'?T.warn:T.accent} />
                      </td>
                      <td style={{ padding:'10px 14px', color:T.textFaint, fontSize:11 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding:'10px 14px' }} onClick={e => e.stopPropagation()}>
                        {u.role !== 'admin'
                          ? <Btn small variant="ghost" onClick={() => promote(u.id)}>↑ Make Admin</Btn>
                          : <Btn small variant="danger" onClick={() => demote(u.id)}>↓ Remove Admin</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* User jobs detail */}
          {selected && (
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div>
                  <div style={{ color:T.text, fontWeight:700, fontSize:15 }}>
                    {selected.display_name}'s Applications
                  </div>
                  <div style={{ color:T.textMuted, fontSize:12, marginTop:2 }}>{selected.email}</div>
                </div>
                <Btn small variant="ghost" onClick={() => setSelected(null)}>✕</Btn>
              </div>

              {jobsLoad ? (
                <div style={{ display:'flex', justifyContent:'center', padding:30 }}><Spinner /></div>
              ) : userJobs.length === 0 ? (
                <div style={{ color:T.textMuted, textAlign:'center', padding:30, fontSize:13 }}>
                  No applications yet
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                    {STATUS_OPTIONS.map(s => {
                      const c = userJobs.filter(j => j.status===s).length
                      return c > 0 ? <Badge key={s} label={`${s}: ${c}`} color={STATUS_COLORS[s]} /> : null
                    })}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:400, overflowY:'auto' }}>
                    {userJobs.map(j => (
                      <div key={j.id} style={{ background:T.surfaceHigh, borderRadius:8,
                        padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>{j.company}</div>
                          <div style={{ color:T.textMuted, fontSize:11, marginTop:2 }}>{j.role}</div>
                        </div>
                        <Badge label={j.status} color={STATUS_COLORS[j.status]} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && (
        <Card>
          <div style={{ color:T.text, fontWeight:700, fontSize:15, marginBottom:16 }}>
            Users by Registration Date
          </div>
          {users.map(u => (
            <div key={u.id} style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', borderBottom:`1px solid ${T.border}`, padding:'10px 0', fontSize:13 }}>
              <span style={{ color:T.text, fontWeight:500 }}>{u.display_name || '—'}</span>
              <span style={{ color:T.textMuted }}>{u.email}</span>
              <Badge label={u.role||'user'} color={u.role==='admin'?T.warn:T.accent} />
              <span style={{ color:T.textFaint, fontSize:11 }}>
                {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
