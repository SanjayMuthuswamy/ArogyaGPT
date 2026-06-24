import { useState } from 'react'
import ReportPanel from '../components/report/ReportPanel'
import ChatPanel from '../components/chat/ChatPanel'

interface ReportViewPageProps {
  onNavigate: (page: 'home' | 'upload' | 'report') => void
}

export default function ReportViewPage({ onNavigate }: ReportViewPageProps) {
  const [mobileTab, setMobileTab] = useState<'report' | 'chat'>('report')
  const [language, setLanguage] = useState('தமிழ்')

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      {/* Top bar */}
      <div
        className="sticky top-0 z-40 bg-bg-surface border-b border-[rgba(46,125,107,0.1)]"
        style={{ paddingTop: '64px' }} /* account for nav height */
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Back + filename */}
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary
                       transition-colors duration-fast min-h-[44px] flex-shrink-0"
            aria-label="Go back to upload"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M13 4 L7 10 L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-display text-lg font-medium text-text-primary hidden sm:inline">
              Mr. Rajan's Report
            </span>
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language selector */}
            <button
              className="hidden md:flex items-center gap-1.5 font-body text-sm text-text-secondary
                         px-3 py-1.5 rounded-md border border-[rgba(46,125,107,0.15)]
                         hover:border-brand-glow/40 transition-colors duration-fast
                         min-h-[40px]"
              aria-label="Change language"
            >
              {language}
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

            {/* Voice */}
            <button
              className="w-10 h-10 rounded-md flex items-center justify-center
                         text-accent-gold hover:bg-accent-gold/8
                         transition-colors duration-fast min-h-[44px] min-w-[44px]"
              aria-label="Read report aloud"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 7 H6 L9 4 V16 L6 13 H4 C3 13 2 12 2 11 V9 C2 8 3 7 4 7Z"
                      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M12 6 C14 7.5 15 8.7 15 10 C15 11.3 14 12.5 12 14"
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M14 4 C17 5.8 18 7.8 18 10 C18 12.2 17 14.2 14 16"
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

            {/* Download */}
            <button
              className="w-10 h-10 rounded-md flex items-center justify-center
                         text-text-muted hover:text-brand-primary
                         transition-colors duration-fast min-h-[44px] min-w-[44px]"
              aria-label="Download report"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 3 V13 M6 9 L10 13 L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 16 H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">

        {/* Left panel — Report (58%) — hidden on mobile when chat tab active */}
        <div
          className={`flex-[58] min-w-0 border-r border-[rgba(46,125,107,0.1)]
                       overflow-hidden flex flex-col
                       ${mobileTab === 'chat' ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 lg:p-8">
            <ReportPanel />
          </div>
        </div>

        {/* Right panel — Chat (42%) — hidden on mobile when report tab active */}
        <div
          className={`flex-[42] min-w-0 overflow-hidden flex flex-col bg-bg-base
                       ${mobileTab === 'report' ? 'hidden md:flex' : 'flex'}`}
        >
          <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6">
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-deep border-t border-white/8"
        role="tablist"
        aria-label="Switch between report and chat"
      >
        <div className="flex">
          {([
            { key: 'report', label: 'Report', icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 7 H14 M6 11 H12 M6 15 H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )},
            { key: 'chat', label: 'Chat', icon: (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 5 C4 3.5 5.5 2 7 2 H13 C14.5 2 16 3.5 16 5 V11 C16 12.5 14.5 14 13 14 H11 L8 18 V14 H7 C5.5 14 4 12.5 4 11 Z"
                      stroke="currentColor" strokeWidth="1.4" />
              </svg>
            )},
          ] as { key: 'report' | 'chat'; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={mobileTab === tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 font-body text-xs
                           transition-colors duration-fast min-h-[56px]
                           ${mobileTab === tab.key
                             ? 'text-accent-gold'
                             : 'text-text-muted/60'}`}
            >
              {tab.icon}
              {tab.label}
              {mobileTab === tab.key && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-accent-gold rounded-full" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
