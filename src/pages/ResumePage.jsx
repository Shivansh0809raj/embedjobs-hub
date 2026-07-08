import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { callAI } from '../lib/groq.js'
import { Btn, Card, Alert } from '../components/UI.jsx'
import { T } from '../lib/theme.js'

const MODES = [
  {
    id: 'bullets', label: '✏️ Rewrite Bullets',
    system: 'You are an expert technical resume coach specialising in embedded systems, firmware, IoT, and automotive engineering.',
    prompt: (r, jd) => `Rewrite the candidate experience bullets to strongly match this JD. Keep dates and company names. Make bullets specific, technical, and ATS-friendly.\n\nRESUME:\n${r}\n\nJOB DESCRIPTION:\n${jd}`,
  },
  {
    id: 'summary', label: '📝 Pro Summary',
    system: 'You are an expert technical resume coach specialising in embedded systems, firmware, IoT, and automotive engineering.',
    prompt: (r, jd) => `Write a tailored professional summary (4-5 sentences) for this candidate. Emphasize embedded/firmware/automotive alignment. Punchy and ATS-friendly.\n\nRESUME:\n${r}\n\nJOB DESCRIPTION:\n${jd}`,
  },
  {
    id: 'keywords', label: '🔑 Keyword Gap',
    system: 'You are a technical ATS and resume keyword analyst for embedded systems engineering roles.',
    prompt: (r, jd) => `Extract all technical keywords from the JD. Group by: MCU/SoC, RTOS, Protocols, Tools, Automotive Standards, Languages, Soft Skills.\n\nFor each mark: ✅ Present in resume | ❌ Missing\n\nGive a final match score out of 100.\n\nRESUME:\n${r}\n\nJOB DESCRIPTION:\n${jd}`,
  },
]

export default function ResumePage() {
  const { profile, updateUserProfile } = useAuth()
  const [resume,  setResume]  = useState('')
  const [jd,      setJd]      = useState('')
  const [result,  setResult]  = useState('')
  const [loading, setLoading] = useState(false)
  const [mode,    setMode]    = useState('bullets')
  const [saved,   setSaved]   = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [aiErr,   setAiErr]   = useState('')

  useEffect(() => { if (profile?.resume) setResume(profile.resume) }, [profile])

  const saveResume = async () => {
    setSaveErr('')
    try {
      await updateUserProfile({ resume })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) { setSaveErr('Could not save: ' + e.message) }
  }

  const tailor = async () => {
    if (!resume.trim() || !jd.trim()) return
    setLoading(true); setResult(''); setAiErr('')
    const m = MODES.find(x => x.id === mode)
    try {
      const out = await callAI(m.system, m.prompt(resume, jd))
      setResult(out)
    } catch (e) { setAiErr(e.message) }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {MODES.map(m => (
          <Btn key={m.id} onClick={() => { setMode(m.id); setResult(''); setAiErr('') }}
            variant={mode===m.id ? 'primary' : 'ghost'} small>{m.label}</Btn>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:600 }}>YOUR RESUME <span style={{ color:T.textFaint, fontWeight:400 }}>(saved to profile)</span></div>
            <Btn small variant="ghost" onClick={saveResume}>{saved ? '✅ Saved!' : '💾 Save'}</Btn>
          </div>
          {saveErr && <div style={{ marginBottom:8 }}><Alert type="error">{saveErr}</Alert></div>}
          <textarea value={resume} onChange={e => setResume(e.target.value)}
            placeholder="Paste your resume here — saved to your profile so you never retype it."
            style={{ width:'100%', height:340, background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:14, fontSize:12, fontFamily:'monospace', resize:'vertical', outline:'none', boxSizing:'border-box', lineHeight:1.6 }} />
        </div>
        <div>
          <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:8 }}>JOB DESCRIPTION</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)}
            placeholder="Paste the job description here..."
            style={{ width:'100%', height:340, background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, padding:14, fontSize:12, fontFamily:'monospace', resize:'vertical', outline:'none', boxSizing:'border-box', lineHeight:1.6 }} />
        </div>
      </div>
      <Btn onClick={tailor} disabled={loading || !resume.trim() || !jd.trim()}>
        {loading ? '⚙️ Groq AI is analysing...' : '⚡ Generate Tailored Content'}
      </Btn>
      {aiErr && <Alert type="error">⚠ {aiErr}</Alert>}
      {result && (
        <Card style={{ borderColor:T.accent+'44' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ color:T.accent, fontWeight:700, fontSize:13 }}>✅ AI Output <span style={{ color:T.textFaint, fontWeight:400, fontSize:11 }}>powered by Groq / Llama 3.3 (free)</span></div>
            <Btn small variant="ghost" onClick={() => navigator.clipboard.writeText(result)}>📋 Copy</Btn>
          </div>
          <pre style={{ color:T.text, fontSize:13, whiteSpace:'pre-wrap', fontFamily:'monospace', margin:0, lineHeight:1.7 }}>{result}</pre>
        </Card>
      )}
    </div>
  )
}
