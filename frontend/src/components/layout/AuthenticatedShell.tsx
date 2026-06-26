import type { ReactNode } from 'react'

interface AuthenticatedShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  onNavigate: (page: string) => void
  currentPage: string
  actionLabel?: string
  onAction?: () => void
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '?' },
  { key: 'upload-report', label: 'Upload', icon: '?' },
  { key: 'summary', label: 'Summary', icon: '?' },
  { key: 'chat', label: 'AI Chat', icon: '?' },
  { key: 'history', label: 'History', icon: '?' },
  { key: 'translation', label: 'Translation', icon: '?' },
  { key: 'voice', label: 'Voice', icon: '?' },
  { key: 'export', label: 'Export', icon: '?' },
  { key: 'profile', label: 'Profile', icon: '?' },
  { key: 'settings', label: 'Settings', icon: '?' },
]

export default function AuthenticatedShell({
  title,
  subtitle,
  children,
  onNavigate,
  currentPage,
  actionLabel,
  onAction,
}: AuthenticatedShellProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-6">
        <aside className="w-full rounded-[24px] border border-[#E3F1EB] bg-white/90 p-4 shadow-[0_18px_48px_rgba(24,50,45,0.06)] backdrop-blur lg:w-72 lg:p-5">
          <button onClick={() => onNavigate('home')} className="mb-6 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE]">
              <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 26 L16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="11" r="2" fill="#E6A817" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold text-[#18322D]">Arogya<span className="text-[#1D9E75]">GPT</span></span>
          </button>

          <div className="space-y-2">
            {navItems.map((item) => {
              const active = currentPage === item.key || (item.key === 'summary' && currentPage === 'report-summary')
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${active ? 'bg-[#E1F5EE] text-[#18322D]' : 'text-[#4A5E59] hover:bg-[#F7FCF9] hover:text-[#18322D]'}`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="mt-6 rounded-[20px] border border-[#E3F1EB] bg-[#F7FCF9] p-3 text-sm text-[#4A5E59]">
            <p className="font-semibold text-[#18322D]">Secure workspace</p>
            <p className="mt-1 leading-6">Your medical summaries, translations, voice notes, and chats stay protected.</p>
          </div>
        </aside>

        <main className="flex-1 rounded-[24px] border border-[#E3F1EB] bg-white/90 p-4 shadow-[0_18px_48px_rgba(24,50,45,0.06)] backdrop-blur sm:p-6 lg:p-7">
          <div className="mb-6 flex flex-col gap-3 border-b border-[#E9F3EE] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75]">ArogyaGPT Workspace</p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-[#18322D]">{title}</h1>
              {subtitle ? <p className="mt-2 font-body text-sm leading-6 text-[#6B7C77]">{subtitle}</p> : null}
            </div>
            {actionLabel ? (
              <button
                onClick={onAction}
                className="rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-2.5 font-body text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,158,117,0.24)] transition hover:-translate-y-0.5"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
