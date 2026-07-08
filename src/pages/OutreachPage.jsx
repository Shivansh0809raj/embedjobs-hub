import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { callAI } from '../lib/groq.js'
import { Btn, Card, Alert } from '../components/UI.jsx'
import { T } from '../lib/theme.js'

const TYPES = [
  {
    id: 'linkedin', label: '💼 LinkedIn Request',
    system: 'You are a career coach for embedded systems engineers. Write highly personalised, non-generic messages.',
    prompt: (name, company, role, bg) =>
      `Write a LinkedIn connection request message (strictly under 300 characters). Warm, specific to the role, mention an embedded/firmware skill that aligns with the company. No placeholders like [Your Name].\n\nRecipient: ${name}\nCompany: ${company}\nRole: ${role}\nMy background: ${bg}`,
  },
  {
    id: 'email', label: '📧 Cold Email',
    system: 'You are a career coach for embedded systems engineers. Write highly personalised, non-generic messages.',
    prompt: (name, company, role, bg) =>
      `Write a cold outreach email. Format: Subject line first, then body. Under 150 words total. Direct, technical, genuine interest. No fluff. No placeholders.\n\nRecipient: ${name}\nCompany: ${company}\nRole: ${role}\nMy background: ${bg}`,
  },
  {
    id: 'referral', label: '🤝 Referral Ask',
    system: 'You are a career coach for embedded systems engineers. Write highly personalised, non-generic messages.',
    prompt: (name, company, role, bg) =>
      `Write a referral request message. Under 120 words. Friendly, specific about the role, respectful of their time. Easy to say yes to. No placeholders.\n\nRecipient: ${name}\nCompany: ${company}\nRole: ${role}\nMy background: ${bg}`,
  },
]

export default function OutreachPage() {
  const { profile, updateUserProfile } = useAuth()
  const [type,    setType]    = useState('linkedin')
  const [name,    setName]    = useState('')
  const [company, setCompany] = useState('')
  const [role,    setRole]    = useState('')
  const [bg,      setBg]      = useState('')
  const [result,  setResult]  = useState('')
  const [loading, setLoading] = useState(false)
  const [bgSaved, setBgSaved] = useState(false)
  const [aiErr,   setAiErr]   = useState('')

  useEffect(() => { if (profile?.background) setBg(profile.background) }, [profile])

  const saveBg = async () => {
    try {
      await updateUserProfile({ background: bg })
      setBgSaved(true)
      setTimeout(() => setBgSaved(false), 2000)
    } catch {}
  }

  const generate = async () => {
    setLoading(true); setResult(''); setAiErr('')
    saveBg()
    const t = TYPES.find(x => x.id === type)
    try {
      const out = await callAI(
        t.system,
        t.prompt(
          name    || 'Hiring Manager',
          company || 'the company',
          role    || 'Embedded Engineer',
          bg      || 'Embedded engineer with firmware, RTOS and automotive systems experience'
        )
      )
      setResult(out)
    } catch (e) { setAiErr(e.message) }
    setLoading(false)
  }

  const inputStyle = {
    background:T.surfaceHigh, border:`1px solid ${T.border}`, borderRadius:6,
    color:T.text, padding:'9px 12px', fontSize:13, outline:'none',
    fontFamily:'inherit', width:'100%', boxSizing:'border-box',
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {TYPES.map(t => (
          <Btn key={t.id} onClick={() => { setType(t.id); setResult(''); setAiErr('') }}
            variant={type===t.id ? 'primary' : 'ghost'} small>{t.label}</Btn>
        ))}
      </div>

      {/* Background — saved to profile */}
      <div style={{ background:T.surface, border:`1px solid ${T.accent}33`, borderRadius:10, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div>
            <div style={{ color:T.text, fontWeight:600, fontSize:13 }}>Your Background</div>
            <div style={{ color:T.textMuted, fontSize:11, marginTop:2 }}>Saved to your profile — used in every message</div>
          </div>
          <Btn small variant="ghost" onClick={saveBg}>{bgSaved ? '✅ Saved!' : '💾 Save'}</Btn>
        </div>
        <input value={bg} onChange={e => setBg(e.target.value)}
          placeholder="e.g. 5 years embedded C, STM32, FreeRTOS, AUTOSAR, CAN/LIN stack, Automotive SPICE"
          style={inputStyle} />
      </div>

      {/* Recipient details */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        {[
          ['RECIPIENT NAME', 'e.g. Priya Sharma',             name,    setName],
          ['COMPANY',        'e.g. Texas Instruments India',  company, setCompany],
          ['TARGET ROLE',    'e.g. Firmware Engineer – CAN',  role,    setRole],
        ].map(([label, ph, val, set]) => (
          <div key={label}>
            <div style={{ color:T.textMuted, fontSize:11, fontWeight:600, marginBottom:6 }}>{label}</div>
            <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
          </div>
        ))}
      </div>

      <Btn onClick={generate} disabled={loading}>
        {loading ? '✍️ Groq AI is writing...' : '⚡ Generate Message'}
      </Btn>

      {aiErr && <Alert type="error">⚠ {aiErr}</Alert>}

      {result && (
        <Card style={{ borderColor:T.accent+'44' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ color:T.accent, fontWeight:700, fontSize:13 }}>
              ✅ Your Message <span style={{ color:T.textFaint, fontWeight:400, fontSize:11 }}>powered by Groq / Llama 3.3 (free)</span>
            </div>
            <Btn small variant="ghost" onClick={() => navigator.clipboard.writeText(result)}>📋 Copy</Btn>
          </div>
          <pre style={{ color:T.text, fontSize:13, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:0, lineHeight:1.7 }}>{result}</pre>
        </Card>
      )}
    </div>
  )
}
