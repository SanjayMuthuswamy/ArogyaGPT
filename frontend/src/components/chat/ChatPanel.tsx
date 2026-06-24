import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  lang?: string
}

const SUGGESTED = [
  'What does my report indicate?',
  'Which values are abnormal?',
  'What precautions should I take?',
]

const AI_RESPONSES: Record<string, string> = {
  'What does my report indicate?':
    'Your report shows two key concerns: your fasting blood sugar at 250 mg/dL is significantly elevated, suggesting diabetes or pre-diabetes. Your hemoglobin is also slightly below normal at 13.2 g/dL. The rest of your blood counts are within healthy ranges. I would strongly advise consulting your doctor about the blood sugar reading.',
  'Which values are abnormal?':
    'Two values stand out: Blood Sugar (Fasting) at 250 mg/dL (normal: 70–100) — this is critically high. Hemoglobin at 13.2 g/dL (normal: 13.5–17.5) — this is borderline low. Your platelets at 145 K/μL are also slightly below the lower limit of normal.',
  'What precautions should I take?':
    'For your blood sugar: avoid sugary drinks, refined carbohydrates, and white rice. Walk at least 30 minutes daily. For your hemoglobin: eat iron-rich foods like spinach, lentils, and eggs. Most importantly — please visit a physician soon for a proper diagnosis and treatment plan.',
}

let msgId = 1

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [suggested, setSuggested] = useState(SUGGESTED)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: msgId++, role: 'user', text }
    setMessages(p => [...p, userMsg])
    setInput('')
    setSuggested([])
    setTyping(true)

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 1400))
    const response = AI_RESPONSES[text] ||
      'I can help you understand your report. Could you ask about a specific test value or symptom you are concerned about?'

    setTyping(false)
    setMessages(p => [...p, { id: msgId++, role: 'ai', text: response, lang: 'English' }])
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const [isMicActive, setIsMicActive] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-[rgba(46,125,107,0.1)] mb-4">
        <h2 className="font-display text-xl font-medium text-text-primary tracking-[-0.01em]">
          Ask Your Report
        </h2>
        <p className="font-body text-sm text-text-muted mt-0.5">
          Chat in English or your regional language
        </p>
      </div>

      {/* Message area */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Suggested questions */}
        {suggested.length > 0 && messages.length === 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in" aria-label="Suggested questions">
            {suggested.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="font-body text-sm px-3.5 py-2.5 rounded-full
                           bg-bg-surface border border-[rgba(46,125,107,0.15)]
                           text-text-secondary hover:border-brand-glow/40
                           transition-all duration-fast ease-smooth
                           min-h-[44px] text-left"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            {msg.role === 'user' ? (
              <div
                className="max-w-[75%] px-4 py-3 rounded-xl font-body text-base text-text-inverse bg-brand-primary"
                style={{ borderBottomRightRadius: 4 }}
              >
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[85%]">
                <div
                  className="px-4 py-3 rounded-xl font-body text-base text-text-primary
                               bg-bg-surface border border-[rgba(46,125,107,0.1)] leading-[1.7]"
                  style={{ borderBottomLeftRadius: 4 }}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-3 mt-2 pl-1">
                  <button
                    className="flex items-center gap-1.5 font-body text-sm text-text-muted
                                hover:text-brand-primary transition-colors duration-fast"
                    aria-label="Listen to this response"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 5 H5 L8 2 V14 L5 11 H3 C2 11 1 10 1 9 V7 C1 6 2 5 3 5Z"
                            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      <path d="M11 5 C12.5 6 13 7 13 8 C13 9 12.5 10 11 11"
                            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    Listen
                  </button>
                  {msg.lang && (
                    <span className="font-body text-xs text-text-muted/70">
                      Answered in {msg.lang}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start animate-fade-in">
            <div
              className="px-5 py-3.5 rounded-xl bg-bg-surface border border-[rgba(46,125,107,0.1)]"
              style={{ borderBottomLeftRadius: 4 }}
              aria-label="AI is typing"
            >
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-glow animate-bounce-dot"
                    style={{ animationDelay: `${i * 160}ms` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="pt-3 border-t border-[rgba(46,125,107,0.1)]">
        <div className="flex items-end gap-2 bg-bg-base rounded-lg border border-[rgba(46,125,107,0.15)]
                        focus-within:border-brand-primary/50 transition-colors duration-fast p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKey}
            placeholder="Ask anything about your report..."
            className="flex-1 bg-transparent font-body text-base text-text-primary
                       placeholder-text-muted resize-none outline-none
                       min-h-[48px] max-h-[120px] py-2.5 px-2 leading-[1.5]"
            aria-label="Type your question"
            rows={1}
          />
          {/* Mic button */}
          <button
            onClick={() => setIsMicActive(p => !p)}
            className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0
                         transition-colors duration-fast min-h-[44px] min-w-[44px]
                         ${isMicActive ? 'text-brand-primary bg-brand-glow/15' : 'text-text-muted hover:text-brand-primary'}`}
            aria-label={isMicActive ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={isMicActive}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4 10 C4 14 16 14 16 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M10 14 V18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          {/* Send button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0
                         transition-all duration-fast min-h-[44px] min-w-[44px]
                         ${input.trim()
                           ? 'bg-brand-primary text-text-inverse hover:bg-brand-secondary'
                           : 'bg-text-muted/10 text-text-muted cursor-not-allowed'}`}
            aria-label="Send message"
            aria-disabled={!input.trim()}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8 L2 3 L5 8 L2 13 Z" stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
