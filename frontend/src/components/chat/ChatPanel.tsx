import { useEffect, useRef, useState } from 'react'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
  lang?: string
}

const SUGGESTED_QUESTIONS = [
  'What is abnormal?',
  'Explain in Tamil',
  'What should I eat?',
  'Should I consult a doctor?',
]

const AI_RESPONSES: Record<string, string> = {
  'What is abnormal?':
    'The main abnormal value is fasting blood sugar at 250 mg/dL, which is much higher than the expected range of 70 to 100 mg/dL. Hemoglobin and platelets are only slightly below range and are secondary concerns.',
  'Explain in Tamil':
    'I can explain this in a simpler regional format. The biggest concern is your blood sugar, and the rest of the report is mostly stable with only mild blood count changes.',
  'What should I eat?':
    'Choose high-fiber foods, vegetables, dals, eggs, and balanced protein. Reduce sugary drinks, sweets, and refined carbohydrates. For mild low hemoglobin, add iron-rich foods like spinach, lentils, dates, and beans.',
  'Should I consult a doctor?':
    'Yes. A fasting glucose of 250 mg/dL deserves a clinician review soon. It is not a result to ignore, even if you feel otherwise well today.',
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'ai',
    text: 'I am linked to this report and can explain abnormal values, symptoms, food choices, and next steps in simpler language.',
    lang: 'English',
  },
]

let messageId = INITIAL_MESSAGES.length + 1

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasUserMessages = messages.some((message) => message.role === 'user')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > INITIAL_MESSAGES.length ? 'smooth' : 'auto' })
  }, [messages, typing])

  const resizeTextarea = () => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 112)}px`
  }

  const resetTextarea = () => {
    const element = textareaRef.current
    if (!element) return

    element.style.height = '44px'
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { id: messageId++, role: 'user', text }
    setMessages((previous) => [...previous, userMessage])
    setInput('')
    resetTextarea()
    setTyping(true)

    await new Promise((resolve) => setTimeout(resolve, 900))

    const response =
      AI_RESPONSES[text] ??
      'I can help explain this report. Ask about an abnormal value, symptoms, food choices, translation, or whether a doctor visit is needed.'

    setTyping(false)
    setMessages((previous) => [...previous, { id: messageId++, role: 'ai', text: response, lang: 'English' }])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage(input)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-[rgba(46,125,107,0.1)] px-4 py-3 md:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-text-muted">Context-aware AI</p>
            <h2 className="mt-1 font-display text-[1.15rem] font-medium text-text-primary">Ask Your Report</h2>
            <p className="mt-1 font-body text-[13px] leading-5 text-text-muted">Messages stay visible while the input remains fixed below.</p>
          </div>
          <span className="inline-flex min-h-[32px] items-center rounded-full bg-[#EAF8F1] px-2.5 py-1 text-[11px] font-semibold text-[#1D9E75]">
            Report linked
          </span>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 scrollbar-thin md:px-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        {!hasUserMessages ? (
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendMessage(question)}
                className="min-h-[44px] rounded-[18px] border border-[rgba(46,125,107,0.15)] bg-[#FCFDFC] px-3.5 py-2.5 text-left text-sm text-text-secondary transition-colors duration-200 hover:border-brand-glow/40 hover:text-text-primary"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'user' ? (
                <div className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-brand-primary px-4 py-3 text-[0.95rem] leading-6 text-text-inverse shadow-[0_10px_26px_rgba(29,158,117,0.18)]">
                  {message.text}
                </div>
              ) : (
                <div className="max-w-[92%]">
                  <div className="rounded-[18px] rounded-bl-[6px] border border-[rgba(46,125,107,0.1)] bg-white px-4 py-3 text-[0.94rem] leading-6 text-text-primary shadow-[0_8px_24px_rgba(16,50,46,0.04)]">
                    {message.text}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 pl-1">
                    <button
                      type="button"
                      className="inline-flex min-h-[32px] items-center gap-1 text-[12px] text-text-muted transition-colors duration-200 hover:text-brand-primary"
                      aria-label="Listen to this response"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 5 H5 L8 2 V14 L5 11 H3 C2 11 1 10 1 9 V7 C1 6 2 5 3 5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M11 5 C12.5 6 13 7 13 8 C13 9 12.5 10 11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      Listen
                    </button>
                    {message.lang ? <span className="text-[12px] text-text-muted/75">Answered in {message.lang}</span> : null}
                  </div>
                </div>
              )}
            </div>
          ))}

          {typing ? (
            <div className="flex justify-start">
              <div
                className="rounded-[18px] rounded-bl-[6px] border border-[rgba(46,125,107,0.1)] bg-white px-4 py-3"
                aria-label="AI is typing"
              >
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className="h-2 w-2 rounded-full bg-brand-glow"
                      style={{
                        animation: 'glowPulse 1.4s ease-in-out infinite',
                        animationDelay: `${index * 120}ms`,
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-[rgba(46,125,107,0.1)] bg-white/95 px-3 py-3 backdrop-blur md:px-4">
        <div className="flex items-end gap-2 rounded-[20px] border border-[rgba(46,125,107,0.15)] bg-[#FAFAF8] p-2 transition-colors duration-200 focus-within:border-brand-primary/45">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              resizeTextarea()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about values, symptoms, food, or next steps..."
            className="min-h-[44px] max-h-[112px] flex-1 resize-none bg-transparent px-2 py-2 text-[0.95rem] leading-6 text-text-primary outline-none placeholder:text-text-muted"
            aria-label="Type your question"
            rows={1}
          />

          <button
            type="button"
            onClick={() => setIsMicActive((previous) => !previous)}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
              isMicActive ? 'bg-brand-glow/18 text-brand-primary' : 'text-text-muted hover:bg-white hover:text-brand-primary'
            }`}
            aria-label={isMicActive ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={isMicActive}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="7" y="2" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M4 10 C4 14 16 14 16 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M10 14 V18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim()}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              input.trim() ? 'bg-brand-primary text-text-inverse hover:bg-brand-secondary' : 'bg-text-muted/10 text-text-muted'
            }`}
            aria-label="Send message"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M14 8 L2 3 L5 8 L2 13 Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
