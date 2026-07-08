const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function callAI(systemPrompt, userMessage) {
  if (!GROQ_API_KEY) throw new Error('Missing VITE_GROQ_API_KEY in .env file')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `HTTP ${res.status}`
    if (res.status === 401) throw new Error('Invalid Groq API key. Check VITE_GROQ_API_KEY in .env')
    if (res.status === 429) throw new Error('Daily limit reached. Resets at midnight. Try again tomorrow.')
    if (res.status === 400) throw new Error('Bad request: ' + msg)
    throw new Error('AI error: ' + msg)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
