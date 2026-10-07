import { useEffect, useState } from 'react'

interface NavbarProps {
  onNavigate: (page: string) => void
  currentPage: string
  fontSize?: 'normal' | 'large' | 'xl'
  onFontSizeChange?: (size: 'normal' | 'large' | 'xl') => void
  isLoggedIn?: boolean
  onLogout?: () => void
}

const NAV_LINKS = [
  { label: 'Home',            page: 'home' },
  { label: 'Features',        page: 'home', hash: 'features' },
  { label: 'How It Works',    page: 'home', hash: 'how-it-works' },
  { label: 'Testimonials',    page: 'home', hash: 'testimonials' },
  { label: 'FAQ',             page: 'home', hash: 'faq' },
]

const MOBILE_LINKS = [
  { label: 'Home',            page: 'home' },
  { label: 'Dashboard',       page: 'dashboard' },
  { label: 'Upload Report',   page: 'upload' },
  { label: 'AI Chat',         page: 'chat' },
  { label: 'Report History',  page: 'history' },
]

export default function Navbar({ onNavigate, currentPage, isLoggedIn, onLogout }: NavbarProps) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)

      if (currentPage !== 'home') {
        setActiveHash('')
        return
      }

      const sections = ['features', 'how-it-works', 'testimonials', 'faq']
      let currentActive = ''
      const scrollPosition = window.scrollY + 120 // offset for navbar height

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const top = element.offsetTop
          const height = element.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = sectionId
            break
          }
        }
      }

      if (window.scrollY < 200) {
        currentActive = ''
      }

      setActiveHash(currentActive)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  const handleNavigate = (page: string, hash?: string) => {
    onNavigate(page)
    setMobileOpen(false)
    if (hash) {
      setActiveHash(hash)
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else {
      setActiveHash('')
    }
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-white/90 shadow-[0_8px_32px_rgba(16,50,46,0.08)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">

          {/* Brand */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2.5"
            aria-label="ArogyaGPT home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE] shadow-[0_4px_16px_rgba(29,158,117,0.2)]">
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

          {/* Desktop links */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((item) => {
              const isActive =
                currentPage === item.page &&
                ((!item.hash && !activeHash) || (item.hash === activeHash))
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.page, item.hash)}
                  className={`nav-link relative font-body text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-[#1D9E75] font-semibold'
                      : 'text-[#4A5E59] hover:text-[#18322D]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Right — CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigate('upload')}
              className="btn-shimmer hidden rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(29,158,117,0.24)] hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 md:inline-flex md:items-center md:gap-2"
            >
              Upload Report →
            </button>

            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="hidden rounded-full border border-[#DCEBE6] bg-white px-5 py-2 text-sm font-semibold text-[#18322D] hover:bg-[#FAFAF8] transition duration-200 md:inline-flex"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => handleNavigate(currentPage === 'signin' ? 'signup' : 'signin')}
                className="hidden rounded-full border border-[#DCEBE6] bg-white px-5 py-2 text-sm font-semibold text-[#18322D] hover:bg-[#FAFAF8] transition duration-200 md:inline-flex"
              >
                {currentPage === 'signin' ? 'Create Account' : 'Sign In'}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEBE6] bg-white/90 text-[#18322D] shadow-sm transition hover:border-[#1D9E75]/40 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(16,50,46,0.5)] px-5 pt-20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="rounded-3xl border border-white/60 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {MOBILE_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.page)}
                  className="rounded-2xl px-4 py-3 text-left font-body text-sm font-medium text-[#18322D] transition hover:bg-[#E1F5EE] hover:text-[#1D9E75]"
                >
                  {item.label}
                </button>
              ))}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    if (onLogout) onLogout()
                  }}
                  className="rounded-2xl px-4 py-3 text-left font-body text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate(currentPage === 'signin' ? 'signup' : 'signin')}
                  className="rounded-2xl px-4 py-3 text-left font-body text-sm font-medium text-[#1D9E75] transition hover:bg-[#E1F5EE]"
                >
                  {currentPage === 'signin' ? 'Create Account' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
