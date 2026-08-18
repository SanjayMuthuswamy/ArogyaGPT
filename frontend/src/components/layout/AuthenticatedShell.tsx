import { useState, type ReactNode } from 'react'

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
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'upload',
    label: 'Upload Report',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    key: 'chat',
    label: 'AI Chat',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    key: 'library',
    label: 'Medical Library',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

const SIDEBAR_W = 260

export default function AuthenticatedShell({
  title,
  subtitle,
  children,
  onNavigate,
  currentPage,
  actionLabel,
  onAction,
}: AuthenticatedShellProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">

      {/* ── FIXED SIDEBAR ─────────────────────────────────── */}
      <aside
        style={{ width: SIDEBAR_W }}
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-y-auto bg-white border-r border-[#E3F1EB] shadow-[2px_0_16px_rgba(24,50,45,0.06)]"
      >
        {/* Brand — same height as fixed header (h-16 = 64px) */}
        <div className="flex h-16 items-center px-5 border-b border-[#E3F1EB] flex-shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5"
            aria-label="ArogyaGPT home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE] shadow-[0_4px_12px_rgba(29,158,117,0.16)]">
              <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 26 L16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="11" r="2" fill="#E6A817" />
              </svg>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-[#18322D]">
              Arogya<span className="text-[#1D9E75]">GPT</span>
            </span>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Sidebar navigation">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8FA49E]">
            Menu
          </p>
          {navItems.map((item) => {
            const active = currentPage === item.key
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#E1F5EE] text-[#18322D] font-semibold shadow-sm'
                    : 'text-[#4A5E59] hover:bg-[#F7FCF9] hover:text-[#18322D]'
                }`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    active ? 'text-[#1D9E75]' : 'text-[#8FA49E] group-hover:text-[#1D9E75]'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1D9E75]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 pb-5 space-y-2 border-t border-[#E3F1EB] pt-4">
          <div className="rounded-2xl border border-[#E3F1EB] bg-[#F7FCF9] p-3 text-xs text-[#4A5E59]">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D9E75]" />
              </span>
              <p className="font-bold text-[#18322D]">AI Security Active</p>
            </div>
            <p className="leading-relaxed">256-bit encrypted health workspace.</p>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-body text-xs font-semibold text-[#C23B3B] hover:bg-[#FFF5F5] transition-colors duration-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <div style={{ marginLeft: SIDEBAR_W }} className="flex flex-col min-h-screen pt-16">

        {/* Top bar — fixed */}
        <header
          style={{ left: SIDEBAR_W }}
          className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6"
        >
          {/* Left: Page Title & Subtitle */}
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="font-display text-lg font-bold text-[#18322D] leading-tight truncate">{title}</h1>
            {subtitle && (
              <span className="font-body text-xs text-[#4A5E59] hidden md:inline-block truncate leading-tight mt-0.5">
                {subtitle}
              </span>
            )}
          </div>

          {/* Center — empty for clean minimal look */}
          <div className="flex-1" />

          {/* Right: Upload CTA + Profile dropdown */}
          <div className="flex items-center gap-4">
            {/* Primary CTA: Upload Report */}
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-5 py-2 font-body text-xs font-semibold text-white shadow-[0_8px_20px_rgba(29,158,117,0.22)] hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Report
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full border border-[#DCEBE6] bg-white px-2.5 py-1.5 shadow-sm hover:border-[#1D9E75]/40 transition"
                aria-label="Open profile menu"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#059669] flex items-center justify-center text-white text-xs font-bold select-none">
                  A
                </div>
                <span className="hidden sm:block font-body text-xs font-semibold text-[#18322D] pr-0.5">Alex</span>
                <svg className="h-3.5 w-3.5 text-[#8FA49E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#E3F1EB] bg-white p-1.5 shadow-xl z-50 font-body text-xs animate-fade-in">
                  {[
                    { label: '👤 My Profile', page: 'profile' },

                  ].map((m) => (
                    <button
                      key={m.page}
                      onClick={() => { onNavigate(m.page); setShowProfileMenu(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7FCF9] font-medium text-[#18322D] transition"
                    >
                      {m.label}
                    </button>
                  ))}
                  <div className="border-t border-[#E3F1EB] my-1" />
                  <button
                    onClick={() => { onNavigate('home'); setShowProfileMenu(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFF5F5] font-semibold text-[#C23B3B] transition"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
