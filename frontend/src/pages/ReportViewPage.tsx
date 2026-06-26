import { useEffect, useState } from 'react'
import ReportPanel from '../components/report/ReportPanel'
import ChatPanel from '../components/chat/ChatPanel'

interface ReportViewPageProps {
  onNavigate: (page: string) => void
}

const iconButtonClass =
  'flex h-11 w-11 items-center justify-center rounded-xl text-text-muted transition-colors duration-200 hover:bg-[#F3F8F5] hover:text-brand-primary min-h-[44px] min-w-[44px]'

export default function ReportViewPage({ onNavigate }: ReportViewPageProps) {
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [language] = useState('Tamil')

  useEffect(() => {
    if (!mobileChatOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileChatOpen])

  return (
    <div className="min-h-screen bg-bg-base pt-16">
      <div className="sticky top-16 z-40 border-b border-[rgba(46,125,107,0.1)] bg-[rgba(250,250,248,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 md:h-[60px] md:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('upload')}
            className="flex min-h-[44px] items-center gap-2 rounded-xl px-1 text-text-secondary transition-colors duration-200 hover:text-text-primary"
            aria-label="Go back to upload"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M13 4 L7 10 L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="text-left">
              <p className="hidden font-body text-[11px] uppercase tracking-[0.18em] text-text-muted sm:block">Medical report</p>
              <span className="font-display text-base font-medium text-text-primary sm:text-lg">Mr. Rajan&apos;s Report</span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="hidden min-h-[44px] items-center gap-1.5 rounded-xl border border-[rgba(46,125,107,0.15)] bg-white/80 px-3 text-sm text-text-secondary transition-colors duration-200 hover:border-brand-glow/40 hover:text-text-primary md:flex"
              aria-label="Change language"
            >
              {language}
              <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

            <button className={iconButtonClass} aria-label="Read report aloud">
              <svg className="h-5 w-5 text-accent-gold" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 7 H6 L9 4 V16 L6 13 H4 C3 13 2 12 2 11 V9 C2 8 3 7 4 7Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path d="M12 6 C14 7.5 15 8.7 15 10 C15 11.3 14 12.5 12 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M14 4 C17 5.8 18 7.8 18 10 C18 12.2 17 14.2 14 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

            <button className={iconButtonClass} aria-label="Download report">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 3 V13 M6 9 L10 13 L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 16 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-4 md:px-6 md:pb-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <section className="min-w-0 md:basis-[62%] lg:basis-[63%]">
            <div className="rounded-[24px] border border-[rgba(46,125,107,0.1)] bg-white/92 shadow-[0_18px_44px_rgba(16,50,46,0.08)] md:h-[calc(100vh-9rem)] md:overflow-hidden lg:h-[calc(100vh-9.5rem)]">
              <div className="h-full p-3 md:p-4 lg:p-5">
                <ReportPanel />
              </div>
            </div>
          </section>

          <aside className="hidden min-w-0 md:sticky md:top-[8.75rem] md:block md:basis-[38%] lg:basis-[37%]">
            <div className="rounded-[24px] border border-[rgba(46,125,107,0.1)] bg-white/92 shadow-[0_18px_44px_rgba(16,50,46,0.08)] md:h-[calc(100vh-10rem)] md:overflow-hidden lg:h-[calc(100vh-10.5rem)]">
              <ChatPanel />
            </div>
          </aside>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileChatOpen(true)}
        className="fixed bottom-5 right-4 z-40 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-3 font-body text-sm font-semibold text-white shadow-[0_14px_32px_rgba(29,158,117,0.28)] transition-transform duration-200 hover:scale-[1.01] md:hidden"
        aria-haspopup="dialog"
        aria-expanded={mobileChatOpen}
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 5 C4 3.5 5.5 2 7 2 H13 C14.5 2 16 3.5 16 5 V11 C16 12.5 14.5 14 13 14 H11 L8 18 V14 H7 C5.5 14 4 12.5 4 11 Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        Ask AI
      </button>

      {mobileChatOpen ? (
        <div className="fixed inset-0 z-[60] bg-[rgba(16,50,46,0.45)] md:hidden" role="dialog" aria-modal="true" aria-label="AI chat panel">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close chat panel" onClick={() => setMobileChatOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 top-24 rounded-t-[28px] border border-white/70 bg-[#FAFAF8] shadow-[0_-18px_48px_rgba(16,50,46,0.22)]">
            <div className="flex h-full flex-col p-3 pb-5">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-text-muted">ArogyaGPT assistant</p>
                  <h2 className="font-display text-lg font-medium text-text-primary">Ask about this report</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(46,125,107,0.15)] bg-white text-text-primary"
                  aria-label="Close chat"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 5 L15 15 M15 5 L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-[24px] border border-[rgba(46,125,107,0.1)] bg-white shadow-[0_14px_32px_rgba(16,50,46,0.08)]">
                <ChatPanel />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
