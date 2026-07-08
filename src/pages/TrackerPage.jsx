import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { getJobs, addJob, updateJob, deleteJob } from '../lib/db.js'
import { syncToGoogleSheets, exportToExcel } from '../lib/sheets.js'
import { notifyNewApplication, notifyStatusChange } from '../lib/notifications.js'
import { Btn, Card, Alert, Sel, Spinner } from '../components/UI.jsx'
import { T, STATUS_OPTIONS, STATUS_COLORS } from '../lib/theme.js'

export default function TrackerPage() {
  const { user, profile, saveProfile } = useAuth()
  const [jobs,       setJobs]       = useState([])
  const [ready,      setReady]      = useState(false)
  const [adding,     setAdding]     = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [filter,     setFilter]     = useState('All')
  const [msg,        setMsg]        = useState('')
  const [err,        setErr]        = useState('')
  const [sheetsUrl,  setSheetsUrl]  = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [form, setForm] = useState({
    company:'', role:'', location:'', status:'Saved',
    date: new Date().toISOString().slice(0,10), url:'', notes:'',
  })

  // Load sheets URL from profile
  useEffect(() => {
    if (profile?.google_sheets_url) setSheetsUrl(profile.google_sheets_url)
  }, [profile])

  // Load jobs from Supabase
  const loadJobs = useCallback(async () => {
    try {
      const data = await getJobs(user.id)
      setJobs(data)
    } catch (e) {
      setErr('Could not load jobs: ' + e.message)
    } finally {
      setReady(true)
    }
  }, [user.id])

  useEffect(() => { loadJobs() }, [loadJobs])

  // Auto-sync to Google Sheets 3 seconds after any change
  useEffect(() => {
    if (!ready || !sheetsUrl || jobs.length === 0) return
    const t = setTimeout(() => syncSheet(jobs, false), 3000)
    return () => clearTimeout(t)
  }, [jobs, sheetsUrl, ready])

  const flash = (type, text) => {
    if (type === 'ok')  { setMsg(text); setTimeout(() => setMsg(''), 3000) }
    if (type === 'err') { setErr(text); setTimeout(() => setErr(''), 5000) }
  }

  const syncSheet = async (jobList, showFeedback = true) => {
    if (!sheetsUrl) { if (showFeedback) flash('err', 'Set your Google Sheets URL first.'); return }
    try {
      await syncToGoogleSheets(sheetsUrl, jobList)
      if (showFeedback) flash('ok', '✅ Synced to Google Sheets!')
    } catch (e) {
      if (showFeedback) flash('err', 'Sync failed: ' + e.message)
    }
  }

  const handleAdd = async () => {
    if (!form.company || !form.role) return
    setSaving(true); setErr('')
    try {
      const newJob = await addJob(user.id, form)
      const updated = [newJob, ...jobs]
      setJobs(updated)
      notifyNewApplication(profile, newJob).catch(() => {})
      setForm({ company:'', role:'', location:'', status:'Saved',
        date: new Date().toISOString().slice(0,10), url:'', notes:'' })
      setAdding(false)
      flash('ok', '✅ Application saved!')
    } catch (e) {
      flash('err', 'Could not save: ' + e.message)
    }
    setSaving(false)
  }

  const handleStatusChange = async (job, newStatus) => {
    const old = job.status
    // Optimistic update
    setJobs(j => j.map(x => x.id === job.id ? { ...x, status: newStatus } : x))
    try {
      await updateJob(job.id, { status: newStatus })
      notifyStatusChange(profile, job, old, newStatus).catch(() => {})
    } catch (e) {
      // Revert on failure
      setJobs(j => j.map(x => x.id === job.id ? { ...x, status: old } : x))
      flash('err', 'Could not update status: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    setJobs(j => j.filter(x => x.id !== id)) // optimistic
    try {
      await deleteJob(id)
    } catch (e) {
      loadJobs() // reload on failure
      flash('err', 'Could not delete: ' + e.message)
    }
  }

  const saveSheetUrl = async () => {
    try {
      await saveProfile({ google_sheets_url: sheetsUrl })
      flash('ok', '✅ Google Sheets URL saved!')
    } catch (e) {
      flash('err', 'Could not save URL: ' + e.message)
    }
  }

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter)
  const counts   = STATUS_OPTIONS.reduce((a,s) => ({...a,[s]:jobs.filter(j=>j.status===s).length}), {})

  if (!ready) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Pipeline overview */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
        {STATUS_OPTIONS.map(s => (
          <Card key={s} onClick={() => setFilter(filter===s ? 'All' : s)}
            style={{ textAlign:'center', padding:12, cursor:'pointer', transition:'border-color 0.18s',
              borderColor: filter===s ? STATUS_COLORS[s] : T.border }}>
            <div style={{ fontSize:24, fontWeight:800, color:STATUS_COLORS[s] }}>{counts[s]||0}</div>
            <div style={{ color:T.textMuted, fontSize:10, marginTop:3 }}>{s}</div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ color:T.textMuted, fontSize:13 }}>
          {filter !== 'All'
            ? <>{filter} <span onClick={() => setFilter('All')} style={{ color:T.accent, cursor:'pointer', marginLeft:6 }}>clear ×</span></>
            : `${jobs.length} total applications`}
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Btn small variant="ghost" onClick={() => setShowConfig(c => !c)}>⚙️ Sheets Setup</Btn>
          <Btn small variant="ghost" onClick={() => syncSheet(jobs, true)}>🔄 Sync Now</Btn>
          <Btn small variant="ghost" onClick={() => exportToExcel(jobs)}>📥 Download Excel</Btn>
          <Btn small onClick={() => setAdding(a => !a)}>{adding ? '✕ Cancel' : '+ Add Job'}</Btn>
        </div>
      </div>

      {msg && <Alert type="success">{msg}</Alert>}
      {err && <Alert type="error">⚠ {err}</Alert>}

      {/* Google Sheets config */}
      {showConfig && (
        <Card style={{ borderColor:T.accent+'44' }}>
          <div style={{ color:T.accent, fontWeight:700, fontSize:13, marginBottom:14 }}>
            📊 Google Sheets Live Sync
          </div>
          <div style={{ color:T.textMuted, fontSize:12, lineHeight:2, marginBottom:14 }}>
            <strong style={{color:T.text}}>One-time setup (10 min):</strong><br/>
            1. Open a Google Sheet → Extensions → Apps Script<br/>
            2. Delete existing code → paste the script from <code style={{color:T.accent}}>src/lib/sheets.js</code><br/>
            3. Deploy → New Deployment → Web App → Execute as: Me · Anyone can access<br/>
            4. Copy the Web App URL → paste below → Save URL<br/>
            <span style={{color:T.textFaint}}>✨ After saving, your sheet auto-updates 3 seconds after any tracker change.</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/YOUR_ID/exec"
              style={{ flex:1, background:T.surfaceHigh, border:`1px solid ${T.border}`,
                borderRadius:6, color:T.text, padding:'9px 12px', fontSize:12,
                outline:'none', fontFamily:'monospace' }} />
            <Btn small onClick={saveSheetUrl}>Save URL</Btn>
          </div>
        </Card>
      )}

      {/* Add job form */}
      {adding && (
        <Card style={{ borderColor:T.accent+'44' }}>
          <div style={{ color:T.accent, fontWeight:700, fontSize:13, marginBottom:16 }}>
            NEW APPLICATION
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            {[['Company *','company'],['Role *','role'],['Location','location']].map(([ph,k]) => (
              <input key={k} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                placeholder={ph}
                style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
                  color:T.text, padding:'9px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }} />
            ))}
            <Sel value={form.status} onChange={v => setForm(f => ({...f,status:v}))}
              options={STATUS_OPTIONS} style={{ width:'100%' }} />
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f,date:e.target.value}))}
              style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
                color:T.text, padding:'9px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }} />
            <input value={form.url} onChange={e => setForm(f => ({...f,url:e.target.value}))}
              placeholder="Job URL (optional)"
              style={{ background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
                color:T.text, padding:'9px 12px', fontSize:13, outline:'none', fontFamily:'inherit' }} />
          </div>
          <input value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))}
            placeholder="Notes — tech stack, recruiter name, source, next steps..."
            style={{ width:'100%', background:T.surfaceHigh, border:`1px solid ${T.border}`,
              borderRadius:6, color:T.text, padding:'9px 12px', fontSize:13, outline:'none',
              fontFamily:'inherit', boxSizing:'border-box', marginBottom:12 }} />
          <Btn onClick={handleAdd} disabled={!form.company || !form.role || saving}>
            {saving ? 'Saving...' : 'Save Application'}
          </Btn>
        </Card>
      )}

      {/* Applications table */}
      <Card style={{ padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${T.border}`, background:T.surfaceHigh }}>
              {['Company','Role','Location','Status','Date','Notes',''].map(h => (
                <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                  color:T.textMuted, fontSize:11, fontWeight:600, letterSpacing:0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding:48, textAlign:'center', color:T.textMuted, fontSize:13 }}>
                {jobs.length === 0
                  ? '📭 No applications yet — add your first one above'
                  : 'No applications match this filter'}
              </td></tr>
            )}
            {filtered.map((j,i) => (
              <tr key={j.id} style={{ borderBottom:`1px solid ${T.border}`,
                background: i%2===0 ? 'transparent' : T.surfaceHigh+'44',
                transition:'background 0.15s' }}>
                <td style={{ padding:'11px 14px', fontWeight:600, fontSize:13, color:T.text }}>
                  {j.url
                    ? <a href={j.url} target="_blank" rel="noreferrer"
                        style={{ color:T.accent, textDecoration:'none' }}>{j.company} ↗</a>
                    : j.company}
                </td>
                <td style={{ padding:'11px 14px', color:T.textMuted, fontSize:12 }}>{j.role}</td>
                <td style={{ padding:'11px 14px', color:T.textMuted, fontSize:12 }}>{j.location}</td>
                <td style={{ padding:'11px 14px' }}>
                  <select value={j.status} onChange={e => handleStatusChange(j, e.target.value)}
                    style={{ background:STATUS_COLORS[j.status]+'22', color:STATUS_COLORS[j.status],
                      border:`1px solid ${STATUS_COLORS[j.status]}55`, borderRadius:4,
                      padding:'3px 8px', fontSize:11, fontWeight:600,
                      fontFamily:'inherit', cursor:'pointer', outline:'none' }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding:'11px 14px', color:T.textFaint, fontSize:12 }}>{j.date}</td>
                <td style={{ padding:'11px 14px', color:T.textMuted, fontSize:12,
                  maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {j.notes}
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <Btn small variant="danger" onClick={() => handleDelete(j.id)}>✕</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
