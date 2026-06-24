import { useState, useRef, useEffect } from 'react'
import { useSpeech } from '../../hooks/useSpeech'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

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

  const { speak, pause, resume, isSpeaking, isPaused } = useSpeech()
  const { startListening, stopListening, isListening, transcript, setTranscript } = useSpeechRecognition('English')
  
  const [speakingId, setSpeakingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isSpeaking) setSpeakingId(null)
  }, [isSpeaking])

  const handleListenBubble = (id: number, text: string) => {
    if (speakingId === id && isSpeaking && !isPaused) {
      pause()
    } else if (speakingId === id && isPaused) {
      resume()
    } else {
      speak(text, 'English')
      setSpeakingId(id)
    }
  }

  useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

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
                    onClick={() => handleListenBubble(msg.id, msg.text)}
                    className={`flex items-center gap-1.5 font-body text-[12px] px-2.5 py-1 rounded-lg border transition-colors duration-fast
                      ${speakingId === msg.id && isSpeaking && !isPaused
                        ? 'bg-[rgba(46,125,107,0.14)] border-[rgba(126,207,194,0.30)] text-brand-glow'
                        : 'bg-[rgba(46,125,107,0.06)] border-[rgba(126,207,194,0.10)] text-text-muted hover:border-[rgba(126,207,194,0.3)] hover:bg-[rgba(46,125,107,0.10)]'
                      }`}
                    aria-label={speakingId === msg.id && isSpeaking && !isPaused ? "Pause" : "Listen"}
                  >
                    {speakingId === msg.id && isSpeaking && !isPaused ? (
                      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="10" y1="15" x2="10" y2="9"></line>
                        <line x1="14" y1="15" x2="14" y2="9"></line>
                      </svg>
                    ) : (
                      <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                      </svg>
                    )}
                    {speakingId === msg.id && isSpeaking && !isPaused ? 'Pause' : 'Listen'}
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
      </div>{/* end message area */}

      {/* Screen reader announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isListening ? 'Listening for voice input' : ''}
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
            placeholder={isListening ? "Listening... speak in English" : "Ask anything about your report..."}
            className={`flex-1 bg-transparent font-body text-base resize-none outline-none min-h-[48px] max-h-[120px] py-2.5 px-2 leading-[1.5] ${isListening ? 'text-brand-glow italic' : 'text-text-primary placeholder-text-muted'}`}
            aria-label="Type your question"
            rows={1}
          />
          {/* Mic button */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors duration-fast relative z-10
                           ${isListening 
                             ? 'bg-[rgba(212,102,90,0.12)] border border-[rgba(212,102,90,0.3)] text-[#D4665A]' 
                             : 'bg-transparent border-none text-text-muted hover:text-brand-primary'}`}
              aria-label={isListening ? 'Stop recording' : 'Use voice input'}
              aria-pressed={isListening}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
            {isListening && <div className="absolute inset-0 pulse-ring-wrapper pointer-events-none rounded-full" aria-hidden="true"></div>}
          </div>
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
