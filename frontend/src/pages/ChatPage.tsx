import { useEffect, useRef, useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'
import { api, ReportDetail } from '../services/api'

interface ChatPageProps {
  onNavigate: (page: string) => void
}

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  time: string
}

interface ChatSession {
  id: string
  title: string
  date: string
  reportType: string
  category: 'Today' | 'Yesterday' | 'Older'
}


const suggestedQuestions = [
  'Summarize this report',
  'Explain abnormal values',
  'What should I discuss with my doctor?',
  'Are there any risks?',
  'Explain in simple language',
  'Recommended lifestyle changes',
]

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(() => localStorage.getItem('activeReportId'))
  const [searchQuery, setSearchQuery] = useState('')
  const [showInsightPanel, setShowInsightPanel] = useState(true)
  const [chatLanguage, setChatLanguage] = useState<'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa'>('en')
  
  const [reportData, setReportData] = useState<ReportDetail | null>(null)
  const [history, setHistory] = useState<ChatSession[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch report list
  useEffect(() => {
    let active = true
    api.listReports({ per_page: 50 }).then(data => {
      if (!active) return
      const sessions = data.items.map(r => {
        const dateObj = new Date(r.created_at)
        const today = new Date()
        let cat: 'Today' | 'Yesterday' | 'Older' = 'Older'
        if (dateObj.toDateString() === today.toDateString()) cat = 'Today'
        else {
          const yest = new Date()
          yest.setDate(yest.getDate() - 1)
          if (dateObj.toDateString() === yest.toDateString()) cat = 'Yesterday'
        }
        return {
          id: r.id,
          title: r.title || 'Medical Report',
          date: dateObj.toLocaleDateString(),
          reportType: r.report_type || 'Diagnostic Report',
          category: cat
        }
      })
      setHistory(sessions)
      if (!activeSession && sessions.length > 0) {
        setActiveSession(sessions[0].id)
      }
    }).catch(err => console.warn('Failed to fetch history:', err))
    return () => { active = false }
  }, [activeSession])

  // Fetch active report details
  useEffect(() => {
    if (!activeSession) return
    let active = true
    const fetchReport = async () => {
      try {
        const data = await api.getReport(activeSession)
        if (active) {
          setReportData(data)
          localStorage.setItem('activeReportId', activeSession)
        }
      } catch (err) {
        console.warn('Could not load report details in ChatPage:', err)
      }
    }
    fetchReport()
    return () => { active = false }
  }, [activeSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (activeSession) {
      setMessages([])
    } else {
      setMessages([])
    }
  }, [activeSession])

  const filteredHistory = history.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.reportType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedHistory = filteredHistory.reduce((acc, session) => {
    if (!acc[session.category]) acc[session.category] = []
    acc[session.category].push(session)
    return acc
  }, {} as Record<string, ChatSession[]>)

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    if (!activeSession) {
      setActiveSession(Date.now().toString())
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    try {
      const activeReportId = localStorage.getItem('activeReportId') || undefined
      const data = await api.askQuestion({
        question: query,
        report_id: activeReportId,
        language_code: chatLanguage,
      })
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.warn('Backend askQuestion fallback:', err)
      const aiText = chatLanguage === 'ta'
        ? "மன்னிக்கவும், AI பதிலை உருவாக்க முடியவில்லை. தயவுசெய்து உங்கள் இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
        : "I'm having trouble analyzing your report right now. Please check your internet connection or verify your report has finished processing."

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-950">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <AuthenticatedShell
      title="AI Health Assistant"
      subtitle="Clinical insights and Q&A on your health documents."
      onNavigate={onNavigate}
      currentPage="chat"
    >
      <div className="mx-auto flex h-[calc(100vh-8rem)] min-h-[620px] max-w-screen-2xl gap-4 overflow-hidden 2xl:gap-6">
        <aside className="hidden w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:flex 2xl:w-80">
          <div className="border-b border-gray-100 bg-[#FCFDFB] p-3.5">
            <button
              onClick={() => {
                setActiveSession(null)
                setMessages([])
                setInput('')
              }}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#168562] active:scale-[0.98]"
            >
              Start New Chat
            </button>

            <div className="relative mt-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-3">
            {Object.entries(groupedHistory).map(([category, sessions]) => (
              <div key={category} className="space-y-1.5">
                <h4 className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {category}
                </h4>
                <div className="space-y-1">
                  {sessions.map((session) => {
                    const selected = activeSession === session.id
                    return (
                      <button
                        key={session.id}
                        onClick={() => setActiveSession(session.id)}
                        className={`w-full rounded-xl p-3 text-left transition ${
                          selected ? 'bg-[#E1F5EE] shadow-sm' : 'hover:bg-gray-50'
                        }`}
                      >
                        <h5 className="mb-1 truncate text-sm font-semibold text-gray-900">{session.title}</h5>
                        <div className="mt-1.5 flex items-center justify-between gap-3">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                            selected ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {session.reportType}
                          </span>
                          <span className="shrink-0 text-[10px] text-gray-400">{session.date}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {activeSession ? (
            <>
              <header className="z-10 flex shrink-0 flex-col justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0">
                  <div className="mb-1 flex min-w-0 items-center gap-2">
                    <h2 className="truncate font-display text-base font-bold text-gray-950">{reportData?.title || 'Medical Report'}</h2>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live AI Agent
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified Extraction
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium">{reportData?.lab_results?.length || 0} Parameters Processed</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setShowInsightPanel(!showInsightPanel)}
                    className="flex min-h-9 items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <span>{showInsightPanel ? 'Hide Details' : 'View Parameters'}</span>
                    <svg className={`h-3 w-3 transition-transform ${showInsightPanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onNavigate('upload')}
                    className="min-h-9 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-[#1D9E75] transition hover:border-[#1D9E75] hover:bg-[#E1F5EE]"
                  >
                    Re-upload
                  </button>
                </div>
              </header>

              <div className="flex flex-1 flex-col overflow-y-auto bg-[#FBFCFC]">
                {showInsightPanel && (
                  <div className="shrink-0 space-y-3 border-b border-gray-100 bg-[#F8FBFA] px-4 py-3 sm:px-5">
                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Report Profile</p>
                        <p className="truncate text-sm font-bold text-gray-900">{reportData?.report_type || 'Diagnostic Report'}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">Date</p>
                        <p className="truncate text-sm font-semibold text-gray-800">{reportData?.report_date || 'N/A'}</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Attention</p>
                        <p className="truncate text-sm font-bold text-amber-700">
                          {reportData?.abnormalities?.length ? `${reportData.abnormalities.length} Abnormalities` : 'Normal'}
                        </p>
                      </div>
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-700">Highest Risk</p>
                        <p className="truncate text-sm font-bold text-red-600">
                          {reportData?.abnormalities && reportData.abnormalities.length > 0
                            ? reportData.abnormalities[0].parameter_name
                            : 'None Detected'}
                        </p>
                      </div>
                    </div>
                    {reportData?.summary && (
                      <div className="rounded-xl border border-[#DCEBE6] bg-white px-4 py-3 text-sm leading-relaxed text-[#2A4941] shadow-sm">
                        <span className="mr-2 font-bold text-[#18322D]">Quick Summary:</span>
                        {reportData.summary}
                      </div>
                    )}
                  </div>
                )}

                <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col space-y-5 px-4 py-5 sm:px-6">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[92%] min-w-0 gap-3 sm:max-w-[82%] lg:max-w-[74%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
                          msg.sender === 'ai'
                            ? 'bg-gradient-to-tr from-[#1D9E75] to-[#0EA5E9] text-white'
                            : 'bg-[#1D9E75]/10 text-[#1D9E75]'
                        }`}>
                          {msg.sender === 'ai' ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>

                        <div className={`flex min-w-0 flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`min-w-[50px] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm break-words ${
                            msg.sender === 'user'
                              ? 'rounded-tr-none border-[#CBEADF] bg-[#E1F5EE] text-[#18322D]'
                              : 'rounded-tl-none border-gray-200 bg-white text-gray-700'
                          }`}>
                            {formatText(msg.text)}
                          </div>
                          <span className="mt-1.5 px-1 text-[9px] font-medium text-gray-400">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[85%] gap-3">
                        <div className="flex h-8 w-8 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-to-tr from-[#1D9E75] to-[#0EA5E9] text-[10px] font-bold text-white shadow-sm">
                          AI
                        </div>
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-gray-200 bg-white px-5 py-4 shadow-sm">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D9E75]" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D9E75]" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D9E75]" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto h-2" aria-hidden="true" />
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-[#FBFCFC] p-6 sm:p-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-[#1D9E75] shadow-sm">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="mb-2 text-center font-display text-2xl font-bold text-gray-900">Deep Health Insights Q&A</h2>
              <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-gray-500">
                Choose a template below or ask a custom clinical question about your lab trends, reference ranges, or medical conditions.
              </p>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1D9E75] hover:shadow-[0_4px_16px_rgba(29,158,117,0.08)]"
                  >
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-[#1D9E75]">{q}</span>
                    <svg className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
            {/* Language selector row */}
            <div className="mx-auto max-w-4xl mb-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Reply in:</span>
              <select
                value={chatLanguage}
                onChange={e => setChatLanguage(e.target.value as typeof chatLanguage)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[12px] font-medium text-gray-700 focus:border-[#1D9E75] focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
            <div className="relative mx-auto max-w-4xl">
              <button
                className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition hover:text-[#1D9E75]"
                title="Attach medical report"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Ask about your medical report..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-24 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/10"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-[#1D9E75]" title="Voice Input">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#0ea5e9] text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-gray-400">
              HIPAA Compliant Session | ArogyaGPT AI responses are educational and do not constitute formal clinical advice.
            </p>
          </div>
        </section>
      </div>
    </AuthenticatedShell>
  )
}
