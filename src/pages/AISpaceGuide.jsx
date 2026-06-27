import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'What is the closest asteroid to Earth right now?',
  'Explain what makes an asteroid potentially hazardous',
  'When is the next solar eclipse visible from India?',
  'How does the ISS maintain its orbit?',
  'What are the phases of the Moon this month?',
]

export default function AISpaceGuide() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello, I\'m your AI Space Guide. Ask me anything about astronomy, space missions, celestial events, or the data you see in this platform.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text) {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      // Replace with your Grok/OpenAI key and endpoint
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_GROQ_API_KEY`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are an expert astronomy and space science assistant for Project Zenith, a real-time celestial intelligence platform. Be concise, accurate, and engaging. Use data-driven language. Keep responses under 200 words unless asked for detail.' },
            ...messages.filter(m => m.role !== 'system'),
            { role: 'user', content: userMsg }
          ],
          max_tokens: 400,
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Unable to get a response. Check your API key in AISpaceGuide.jsx.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Add your Groq API key in src/pages/AISpaceGuide.jsx.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 28 }}>
      <div className="page-header">
        <h2>AI Space Guide</h2>
        <p>Conversational astronomy assistant powered by Llama 3.3</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {SUGGESTIONS.map(s => (
          <button key={s} className="btn" style={{ fontSize: 10 }} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
            background: m.role === 'user' ? 'rgba(125,249,255,0.1)' : 'rgba(0,12,26,0.85)',
            border: `1px solid ${m.role === 'user' ? 'var(--cyan-border)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.6,
            color: m.role === 'user' ? 'var(--cyan)' : 'var(--text)',
          }}>
            {m.role === 'assistant' && (
              <div style={{ fontSize: 9, color: 'var(--cyan-dim)', letterSpacing: 2, marginBottom: 6 }}>AI SPACE GUIDE</div>
            )}
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--cyan-dim)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, animation: 'pulse 1.5s infinite' }}>
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about space, asteroids, ISS, moon phases..."
          style={{
            flex: 1, background: 'rgba(0,12,26,0.85)', border: '1px solid var(--cyan-border)',
            borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13,
            fontFamily: 'var(--font-sans)', outline: 'none',
          }}
        />
        <button className="btn" onClick={() => send()} disabled={loading} style={{ flexShrink: 0 }}>
          Send
        </button>
      </div>
    </div>
  )
}
