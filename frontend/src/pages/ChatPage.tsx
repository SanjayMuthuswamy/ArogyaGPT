import { useState, useRef, useEffect } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

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

const mockHistory: ChatSession[] = [
  { id: '1', title: 'CBC Analysis Chat', date: 'Jul 24', reportType: 'Blood Test', category: 'Today' },
  { id: '2', title: 'Lipid Profile Discussion', date: 'Jul 23', reportType: 'Lipid Panel', category: 'Yesterday' },
  { id: '3', title: 'Thyroid Results Explanation', date: 'Jul 15', reportType: 'Thyroid', category: 'Older' },
  { id: '4', title: 'General Health Query', date: 'Jul 10', reportType: 'General', category: 'Older' },
]

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
  const [activeSession, setActiveSession] = useState<string | null>('1')
  const [searchQuery, setSearchQuery] = useState('')
  const [showInsightPanel, setShowInsightPanel] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    // Set initial messages if a session is active
    if (activeSession) {
      setMessages([
        {
          id: 'msg1',
          sender: 'ai',
          text: 'Hello Alex! I am your AI Medical Assistant. I have analyzed your recent CBC Report (July 24). How can I help clarify your health parameters today?',
          time: '10:00 AM',
        },
      ])
    } else {
      setMessages([])
    }
  }, [activeSession])

  const filteredHistory = mockHistory.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    session.reportType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedHistory = filteredHistory.reduce((acc, session) => {
    if (!acc[session.category]) acc[session.category] = []
    acc[session.category].push(session)
    return acc
  }, {} as Record<string, ChatSession[]>)

  const handleSend = (textToSend?: string) => {
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

    // Simulate AI response
    setTimeout(() => {
      let aiText = `Based on your uploaded report: Your Fasting Blood Sugar level is **138 mg/dL** (normal baseline is under 100 mg/dL). Your Total Hemoglobin is healthy at **14.2 g/dL**. Would you like suggestions on dietary adjustments or physician follow-up questions?`
      
      if (query.includes('Summarize')) {
        aiText = `**Executive Summary:**\n\nYour recent Complete Blood Count (CBC) indicates overall stable hematology. However, we detected a mild elevation in fasting glucose levels. \n\n- **RBC & Hemoglobin:** Normal (14.2 g/dL)\n- **WBC:** Normal (7,500 /uL)\n- **Fasting Glucose:** High (138 mg/dL)\n\nIt is advised to monitor your sugar intake and discuss these findings with your primary care physician during your next visit.`
      } else if (query.includes('abnormal')) {
        aiText = `I found **1 abnormal value** in this report:\n\n- **Fasting Blood Sugar: 138 mg/dL** (High)\n  *Reference Range: 70 - 99 mg/dL*\n\nThis level typically falls into the prediabetes category. All other 13 tested parameters are completely normal.`
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  // Helper to render simple markdown-like bolding for the chat
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <AuthenticatedShell
      title="AI Health Assistant"
      subtitle="Interactive clinical-grade insights and Q&A on your health documents."
      onNavigate={onNavigate}
      currentPage="chat"
    >
      <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden">
        
        {/* Left Sidebar: Conversation History (30%) */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-[#FCFDFB]">
            <button
              onClick={() => {
                setActiveSession(null)
                setMessages([])
                setInput('')
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1D9E75] hover:bg-[#168562] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(29,158,117,0.18)] active:scale-[0.98] transition-all"
            >
              Start New Analysis Chat
            </button>
            <div className="mt-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search report history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-gray-50 border border-gray-200/60 py-2.5 pl-9 pr-4 text-xs focus:bg-white focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 outline-none transition-all"
              />
            </div>
          </div>
 
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {Object.entries(groupedHistory).map(([category, sessions]) => (
              <div key={category} className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2.5 py-1">
                  {category}
                </h4>
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setActiveSession(session.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        activeSession === session.id
                          ? 'bg-[#E1F5EE] text-[#18322D] shadow-[0_4px_12px_rgba(29,158,117,0.06)]'
                          : 'hover:bg-gray-50/80 text-gray-600'
                      }`}
                    >
                      <h5 className={`font-semibold text-sm truncate mb-1 ${activeSession === session.id ? 'text-[#18322D]' : 'text-gray-800'}`}>
                        {session.title}
                      </h5>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          activeSession === session.id ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {session.reportType}
                        </span>
                        <span className="text-[10px] text-gray-400">{session.date}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Right Section: Main Chat Interface (70%) */}
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative">
          
          {activeSession ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
                <div>
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <h2 className="font-display text-base font-bold text-gray-900 truncate">CBC Report – July 24</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-150">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live AI Agent
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified OCR Extraction
                    </span>
                    <span>•</span>
                    <span className="font-medium text-gray-500">14 Analytes Processed</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowInsightPanel(!showInsightPanel)}
                    className="rounded-xl border border-gray-250 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span>{showInsightPanel ? 'Hide Details' : 'View Parameters'}</span>
                    <svg className={`w-3 h-3 transform transition-transform ${showInsightPanel ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button onClick={() => onNavigate('upload')} className="rounded-xl bg-gray-50 border border-gray-200 px-3.5 py-2 text-xs font-semibold text-[#1D9E75] hover:bg-[#E1F5EE] hover:border-[#1D9E75] transition-all">
                    Re-upload
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                {/* Medical Insight Panel (Collapsible) */}
                {showInsightPanel && (
                  <div className="shrink-0 border-b border-gray-150 bg-[#F9FAF8] px-6 py-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Report Profile</p>
                        <p className="text-xs font-bold text-gray-800 truncate">Complete Blood Count</p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lab / Provider</p>
                        <p className="text-xs font-semibold text-gray-700 truncate">Apollo Diagnostic Center</p>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Attention Required</p>
                        <span className="text-[11px] font-bold text-amber-600 truncate">⚠️ 1 Parameter High</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Analyte Flag Status</p>
                        <span className="text-[11px] font-bold text-red-650 truncate">138 mg/dL Glucose</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#DCEBE6] bg-[#F3FAF7] px-4 py-3 text-xs text-[#2A4941] leading-relaxed shadow-sm">
                      <span className="font-bold text-[#18322D] mr-2">💡 Quick Summary:</span> 
                      All haematological counts (RBC, WBC, Platelets) are within standard physiologic limits. Fasting blood sugar is elevated at 138 mg/dL, prompting further glucose monitoring or HbA1c screening.
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="flex-1 p-6 space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3.5 max-w-[85%] lg:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''} min-w-0`}>
                      <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${
                        msg.sender === 'ai' 
                          ? 'bg-gradient-to-tr from-[#1D9E75] to-[#0EA5E9] text-white' 
                          : 'bg-[#1D9E75]/10 text-[#1D9E75]'
                      }`}>
                        {msg.sender === 'ai' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                        <div
                          className={`rounded-2xl px-5 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] border leading-relaxed break-words min-w-[50px] ${
                            msg.sender === 'user'
                              ? 'bg-[#E1F5EE] border-[#CBEADF] text-[#18322D] rounded-tr-none'
                              : 'bg-[#F9FAF9] border-[#E8ECE9] text-gray-700 rounded-tl-none'
                          }`}
                        >
                          {formatText(msg.text)}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1.5 px-1 font-medium">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#1D9E75] to-[#0EA5E9] text-white text-[10px] font-bold shadow-sm animate-pulse">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white border border-gray-150 px-5 py-4 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="h-16" aria-hidden="true" />
                <div ref={messagesEndRef} />
              </div>
            </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 mb-6 text-3xl text-[#1D9E75]">
                🧠
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2 text-center">
                Deep Health Insights Q&A
              </h2>
              <p className="text-xs text-gray-500 mb-10 text-center max-w-md leading-relaxed">
                Choose a query template below or ask custom clinical Q&A about your lab trends, reference boundaries, or medical conditions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="flex items-center justify-between text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-[#1D9E75] hover:shadow-[0_4px_16px_rgba(29,158,117,0.08)] transition-all group"
                  >
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-[#1D9E75]">{q}</span>
                    <span className="text-gray-300 group-hover:text-[#1D9E75] transition-colors text-sm font-bold">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {/* Input Area */}
          <div className="shrink-0 border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="relative max-w-4xl mx-auto">
              <button 
                className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 hover:text-[#1D9E75] transition-colors"
                title="Attach medical report"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Ask anything about your medical report (e.g. explain HbA1c)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend()
                }}
                className="w-full rounded-2xl border border-gray-250 bg-white py-4 pl-12 pr-24 text-sm focus:border-[#1D9E75] focus:outline-none focus:ring-4 focus:ring-[#1D9E75]/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                <button 
                  className="p-2 text-gray-400 hover:text-[#1D9E75] transition-colors rounded-lg hover:bg-gray-50"
                  title="Voice Input (Coming soon)"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#0ea5e9] text-white shadow-[0_2px_8px_rgba(29,158,117,0.2)] hover:brightness-105 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-semibold tracking-wide">
              🔒 HIPAA Compliant Session • ArogyaGPT AI responses are educational and do not constitute formal clinical advice.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
