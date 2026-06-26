import { useEffect, useState } from 'react'

type Page = 'home' | 'upload' | 'report' | 'signin' | 'signup'

interface NavbarProps {
  onNavigate: (page: Page) => void
  currentPage: string
  fontSize: 'normal' | 'large' | 'xl'
  onFontSizeChange: (size: 'normal' | 'large' | 'xl') => void
}

export default function Navbar({ onNavigate, currentPage, fontSize, onFontSizeChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavigate = (page: Page, hash?: string) => {
    onNavigate(page)
    setMobileOpen(false)
    if (hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen ? 'bg-white/80 shadow-[0_12px_36px_rgba(16,50,46,0.12)] backdrop-blur-xl' : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-18 md:px-12">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5 focus-visible:outline-brand-primary"
            aria-label="ArogyaGPT home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE] shadow-[0_8px_24px_rgba(29,158,117,0.16)]">
              <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 26 L16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="22" cy="11" r="2" fill="#E6A817" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-[#18322D]">
              Arogya<span className="text-[#1D9E75]">GPT</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: 'Home', page: 'home' as const },
              { label: 'How It Works', page: 'home' as const, hash: 'how-it-works' },
              { label: 'Languages', page: 'home' as const, hash: 'languages' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.page, item.hash)}
                className="nav-link relative font-body text-sm tracking-wide text-[#4A5E59] transition-colors duration-200 hover:text-[#18322D]"
                aria-current={currentPage === item.page ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-0.5 rounded-full border border-[#DCEBE6] bg-white/80 p-1 md:flex" role="group" aria-label="Text size">
              {(['normal', 'large', 'xl'] as const).map((size, i) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`rounded-full px-2.5 py-1 font-body text-sm transition-all ${fontSize === size ? 'bg-[#1D9E75] text-white' : 'text-[#4A5E59] hover:text-[#18322D]'}`}
                  style={{ fontSize: `${0.7 + i * 0.1}rem` }}
                  aria-label={`${size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra large'} text`}
                  aria-pressed={fontSize === size}
                >
                  A
                </button>
              ))}
            </div>

            {currentPage !== 'home' && currentPage !== 'signin' && currentPage !== 'signup' ? (
              <>
                <button className="hidden rounded-full border border-[#DCEBE6] bg-white/80 p-2 text-[#4A5E59] transition hover:text-[#18322D] md:flex" aria-label="Notifications">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 3.5 A2.5 2.5 0 0 0 7.5 6V8.5L6.2 10.8A1 1 0 0 0 7 13H13A1 1 0 0 0 13.8 10.8L12.5 8.5V6A2.5 2.5 0 0 0 10 3.5Z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M8 13.5C8.2 14.7 9 15.5 10 15.5C11 15.5 11.8 14.7 12 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </button>

                <button
                  onClick={() => handleNavigate('upload')}
                  className="btn-shimmer hidden rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,158,117,0.24)] transition-transform duration-200 hover:scale-[1.01] md:inline-flex md:items-center md:gap-2"
                  aria-label="Upload your medical report"
                >
                  Upload Report
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}

            <button
              onClick={() => handleNavigate('signin')}
              className="hidden rounded-full border border-[#DCEBE6] bg-white/80 px-4 py-2 text-sm font-semibold text-[#18322D] transition hover:border-[#1D9E75]/40 hover:text-[#1D9E75] md:inline-flex"
              aria-label="Sign in"
            >
              {currentPage === 'signin' ? 'Home' : 'Sign in'}
            </button>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCEBE6] bg-white/90 text-[#18322D] shadow-[0_8px_24px_rgba(16,50,46,0.08)] md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {mobileOpen ? (
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <><path d="M4 7H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 12H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[rgba(16,50,46,0.55)] px-6 pt-24 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(16,50,46,0.2)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Home', page: 'home' as const },
                { label: 'How It Works', page: 'home' as const, hash: 'how-it-works' },
                { label: 'Languages', page: 'home' as const, hash: 'languages' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.page, item.hash)}
                  className="rounded-2xl px-4 py-3 text-left font-body text-base font-medium text-[#18322D] transition hover:bg-[#E1F5EE]"
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-3">
                <button onClick={() => handleNavigate('signin')} className="rounded-full border border-[#DCEBE6] bg-white px-4 py-3 font-semibold text-[#18322D]">
                  Sign in
                </button>
                {currentPage !== 'home' && currentPage !== 'signin' && currentPage !== 'signup' ? (
                  <button onClick={() => handleNavigate('upload')} className="rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-3 font-semibold text-white">
                    Upload Your Report
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
