import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Btn, Inp, Card, Alert, Field } from '../components/UI.jsx'
import { T } from '../lib/theme.js'

const ERRORS = {
  'Invalid login credentials':          'Incorrect email or password.',
  'invalid_credentials':                'Incorrect email or password.',
  'Email not confirmed':                'Please verify your email first. Check your inbox.',
  'email_not_confirmed':                'Please verify your email first. Check your inbox.',
  'User already registered':            'An account with this email already exists. Sign in instead.',
  'user_already_exists':                'An account with this email already exists. Sign in instead.',
  'Password should be at least 6':      'Password must be at least 6 characters.',
  'Unable to validate email address':   'Please enter a valid email address.',
  'For security purposes':              'Too many attempts. Please wait a few minutes.',
  'over_email_send_rate_limit':         'Too many emails sent. Please wait a few minutes.',
  'signup_disabled':                    'Sign-ups are currently disabled.',
}

function friendlyError(err) {
  // Log everything so we can always debug
  console.error('Auth error raw:', err)

  // Handle null/undefined
  if (!err) return 'Something went wrong. Check Console (F12) for details.'

  // Extract message and code from whatever shape Supabase sends
  let msg  = ''
  let code = ''
  if (typeof err === 'string') {
    msg = err
  } else if (err instanceof Error) {
    msg = err.message || ''
  } else if (typeof err === 'object') {
    msg  = err.message  || err.msg    || err.error_description || ''
    code = err.code     || err.status || err.error             || ''
    // Sometimes Supabase nests it under err.error
    if (!msg && err.error_description) msg = err.error_description
  }

  console.error('Auth error parsed:', { msg, code })

  for (const [key, friendly] of Object.entries(ERRORS)) {
    if (msg.toLowerCase().includes(key.toLowerCase()) ||
        code.toLowerCase().includes(key.toLowerCase())) return friendly
  }

  if (msg && msg.trim()) return msg
  if (code && code.trim()) return `Error (${code}). Check Console (F12).`
  return 'Something went wrong. Open Console (F12 → Console tab) to see the exact error.'
}

export default function AuthPage() {
  const { signup, login, resetPassword } = useAuth()
  const [mode,        setMode]     = useState('login') // login | signup | reset
  const [email,       setEmail]    = useState('')
  const [password,    setPassword] = useState('')
  const [confirm,     setConfirm]  = useState('')
  const [name,        setName]     = useState('')
  const [error,       setError]    = useState('')
  const [info,        setInfo]     = useState('')
  const [loading,     setLoading]  = useState(false)

  const clear = () => { setError(''); setInfo('') }
  const switchMode = (m) => { setMode(m); clear(); }

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill in all fields.')
    setLoading(true); clear()
    try {
      await login(email.trim(), password)
      // Auth context handles redirect automatically
    } catch (e) {
      setError(friendlyError(e))
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!name || !email || !password) return setError('Please fill in all fields.')
    if (password !== confirm)         return setError("Passwords don't match.")
    if (password.length < 6)          return setError('Password must be at least 6 characters.')
    setLoading(true); clear()
    try {
      await signup(email.trim(), password, name.trim())
      setInfo('Account created! Check your email for a confirmation link, then sign in.')
      setMode('login')
    } catch (e) {
      setError(friendlyError(e))
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) return setError('Enter your email address.')
    setLoading(true); clear()
    try {
      await resetPassword(email.trim())
      setInfo('Password reset email sent! Check your inbox.')
    } catch (e) {
      setError(friendlyError(e))
    }
    setLoading(false)
  }

  const onKey = (fn) => (e) => { if (e.key === 'Enter') fn() }

  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', fontFamily:"'Inter','Segoe UI',sans-serif", padding:20 }}>

      {/* Logo */}
      <div style={{ marginBottom:36, textAlign:'center' }}>
        <div style={{ width:64, height:64, background:T.accent, borderRadius:18,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:30, margin:'0 auto 16px', boxShadow:`0 0 40px ${T.accent}44` }}>⚙️</div>
        <div style={{ fontWeight:800, fontSize:26, color:T.text, letterSpacing:-0.5 }}>EmbedJobs Hub</div>
        <div style={{ fontSize:11, color:T.textMuted, letterSpacing:2, marginTop:6 }}>
          EMBEDDED · FIRMWARE · AUTOMOTIVE · IoT
        </div>
      </div>

      <Card style={{ width:'100%', maxWidth:420, boxShadow:'0 24px 80px #00000077' }}>

        {/* Tab toggle */}
        {mode !== 'reset' && (
          <div style={{ display:'flex', background:T.surfaceHigh, borderRadius:8, padding:3, marginBottom:24 }}>
            {[['login','Sign In'],['signup','Create Account']].map(([k,l]) => (
              <button key={k} onClick={() => switchMode(k)}
                style={{ flex:1, padding:'8px 0', borderRadius:6, border:'none',
                  fontFamily:'inherit', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.18s',
                  background: mode===k ? T.accent : 'transparent',
                  color:      mode===k ? '#000'   : T.textMuted }}>
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Alerts */}
        {error && <div style={{ marginBottom:16 }}><Alert type="error">⚠ {error}</Alert></div>}
        {info  && <div style={{ marginBottom:16 }}><Alert type="success">✅ {info}</Alert></div>}

        {/* ── Login ── */}
        {mode === 'login' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="EMAIL">
              <Inp value={email} onChange={setEmail} placeholder="you@example.com"
                type="email" autoComplete="email" />
            </Field>
            <Field label="PASSWORD">
              <Inp value={password} onChange={setPassword} placeholder="••••••••"
                type="password" autoComplete="current-password" onKeyDown={onKey(handleLogin)} />
            </Field>
            <Btn onClick={handleLogin} disabled={loading} fullWidth style={{ marginTop:4 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Btn>
            <div style={{ textAlign:'center' }}>
              <span onClick={() => switchMode('reset')}
                style={{ color:T.accent, fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
                Forgot password?
              </span>
            </div>
          </div>
        )}

        {/* ── Signup ── */}
        {mode === 'signup' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="FULL NAME">
              <Inp value={name} onChange={setName} placeholder="Ravi Kumar" autoComplete="name" />
            </Field>
            <Field label="EMAIL">
              <Inp value={email} onChange={setEmail} placeholder="you@example.com"
                type="email" autoComplete="email" />
            </Field>
            <Field label="PASSWORD (min 6 characters)">
              <Inp value={password} onChange={setPassword} placeholder="••••••••"
                type="password" autoComplete="new-password" />
            </Field>
            <Field label="CONFIRM PASSWORD">
              <Inp value={confirm} onChange={setConfirm} placeholder="••••••••"
                type="password" autoComplete="new-password" onKeyDown={onKey(handleSignup)} />
            </Field>
            <Btn onClick={handleSignup} disabled={loading} fullWidth style={{ marginTop:4 }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </Btn>
          </div>
        )}

        {/* ── Reset ── */}
        {mode === 'reset' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ color:T.text, fontWeight:700, fontSize:18, marginBottom:4 }}>Reset Password</div>
            <div style={{ color:T.textMuted, fontSize:13, marginBottom:8 }}>
              Enter your email and we'll send you a reset link.
            </div>
            <Field label="EMAIL">
              <Inp value={email} onChange={setEmail} placeholder="you@example.com"
                type="email" onKeyDown={onKey(handleReset)} />
            </Field>
            <Btn onClick={handleReset} disabled={loading} fullWidth>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Btn>
            <div style={{ textAlign:'center' }}>
              <span onClick={() => switchMode('login')}
                style={{ color:T.accent, fontSize:12, cursor:'pointer', textDecoration:'underline' }}>
                ← Back to sign in
              </span>
            </div>
          </div>
        )}

        <div style={{ marginTop:22, paddingTop:16, borderTop:`1px solid ${T.border}`,
          color:T.textFaint, fontSize:11, textAlign:'center', lineHeight:1.8 }}>
          🔒 Powered by Supabase · Your data is encrypted & private<br/>
          Cross-device sync enabled — login from any browser
        </div>
      </Card>

      <div style={{ marginTop:24, color:T.textFaint, fontSize:12 }}>
        Made in 🇮🇳 with ❤️ by{' '}
        <span style={{ color:T.accent, fontWeight:600 }}>Shivansh Raj</span>
      </div>
    </div>
  )
}
