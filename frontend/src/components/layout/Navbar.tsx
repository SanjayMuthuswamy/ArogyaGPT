import { useState, useEffect } from 'react'

interface NavbarProps {
  onNavigate: (page: 'home' | 'upload' | 'report') => void
  currentPage: string
  fontSize: 'normal' | 'large' | 'xl'
  onFontSizeChange: (size: 'normal' | 'large' | 'xl') => void
}

export default function Navbar({ onNavigate, currentPage, fontSize, onFontSizeChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-base ease-smooth ${
        scrolled ? 'nav-glass shadow-elevated' : 'bg-bg-deep'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group focus-visible:outline-brand-primary"
          aria-label="ArogyaGPT home"
        >
          {/* Leaf+pulse icon */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
              <path
                d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z"
                fill="none"
                stroke="#7ECFC2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M6 26 L16 16"
                stroke="#7ECFC2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="22" cy="11" r="2" fill="#C8A96E" className="animate-pulse" />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold text-text-inverse tracking-tight">
            Arogya<span className="text-accent-gold">GPT</span>
          </span>
        </button>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Home', page: 'home' as const },
            { label: 'How It Works', page: 'home' as const, hash: 'how-it-works' },
            { label: 'Languages', page: 'home' as const, hash: 'languages' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`font-body text-sm tracking-wide transition-colors duration-fast ease-smooth
                ${currentPage === item.page
                  ? 'text-brand-glow'
                  : 'text-text-inverse/70 hover:text-text-inverse'
                }`}
              aria-current={currentPage === item.page ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Font size toggle */}
          <div
            className="hidden md:flex items-center gap-0.5 bg-white/8 rounded-md p-1"
            role="group"
            aria-label="Text size"
          >
            {(['normal', 'large', 'xl'] as const).map((size, i) => (
              <button
                key={size}
                onClick={() => onFontSizeChange(size)}
                className={`font-body px-2 py-0.5 rounded text-text-inverse/70 transition-all duration-fast
                  ${fontSize === size ? 'bg-brand-primary text-text-inverse' : 'hover:text-text-inverse'}
                `}
                style={{ fontSize: `${0.7 + i * 0.1}rem` }}
                aria-label={`${size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra large'} text`}
                aria-pressed={fontSize === size}
              >
                A
              </button>
            ))}
          </div>

          {/* Language globe */}
          <button
            className="hidden md:flex items-center gap-1.5 text-text-inverse/70 hover:text-text-inverse
                       transition-colors duration-fast text-sm font-body"
            aria-label="Change language"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10 1.5 C10 1.5 7 5 7 10 C7 15 10 18.5 10 18.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10 1.5 C10 1.5 13 5 13 10 C13 15 10 18.5 10 18.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M1.5 10 H18.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span>EN</span>
          </button>

          {/* Upload CTA */}
          <button
            onClick={() => onNavigate('upload')}
            className="font-body text-sm font-medium px-4 py-2 rounded-md
                       bg-brand-primary text-accent-gold
                       hover:bg-brand-secondary
                       transition-colors duration-base ease-smooth
                       min-h-[40px] min-w-[44px]"
            aria-label="Upload your medical report"
          >
            Upload Your Report
          </button>
        </div>
      </div>
    </nav>
  )
}
