import { useEffect, useRef } from 'react'

interface HeroProps {
  onNavigate: (page: 'home' | 'upload' | 'report') => void
}

const languageChips = [
  { native: 'தமிழ்', english: 'Tamil' },
  { native: 'हिन्दी', english: 'Hindi' },
  { native: 'తెలుగు', english: 'Telugu' },
  { native: 'ಕನ್ನಡ', english: 'Kannada' },
  { native: 'മലയാളം', english: 'Malayalam' },
  { native: 'বাংলা', english: 'Bengali' },
]

export default function Hero({ onNavigate }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    el.classList.add('animate-slide-up')
  }, [])

  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-bg-base"
      aria-label="Hero section"
    >
      {/* Organic blob background */}
      <div className="absolute top-0 right-0 w-2/3 h-full pointer-events-none overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 600 600" className="absolute -top-32 -right-32 w-[700px] h-[700px] animate-blob opacity-[0.06]">
          <defs>
            <radialGradient id="blob-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7ECFC2" />
              <stop offset="100%" stopColor="#2E7D6B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M 300 100 C 420 80 520 160 530 280 C 540 400 460 500 340 520 C 220 540 100 460 90 340 C 80 220 180 120 300 100 Z"
            fill="url(#blob-grad)"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

          {/* Left — 60% */}
          <div ref={heroRef} className="lg:col-span-3 animate-slide-up">
            {/* Eyebrow */}
            <p className="font-body text-sm uppercase tracking-[0.12em] text-text-secondary mb-6">
              Your Health. Your Language. Your Understanding.
            </p>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-4xl lg:text-4xl font-semibold text-text-primary
                           tracking-[-0.02em] leading-[1.15] mb-6 text-balance"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}
            >
              Understand Your<br />
              Medical Report,<br />
              <em className="not-italic text-brand-primary">Finally.</em>
            </h1>

            {/* Sub-headline */}
            <p className="font-body text-md text-text-secondary max-w-[480px] leading-[1.75] mb-12">
              Upload any medical report — we simplify every term, highlight what matters,
              and explain it in the language you grew up speaking.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => onNavigate('upload')}
                className="font-body font-medium text-base px-9 py-[18px] rounded-full
                           bg-brand-primary text-text-inverse
                           shadow-card hover:shadow-elevated
                           hover:-translate-y-0.5
                           transition-all duration-base ease-smooth
                           min-h-[56px]"
                aria-label="Upload your medical report now"
              >
                Upload Your Report Now
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-body font-medium text-base px-8 py-[17px] rounded-full
                           text-brand-primary border border-brand-primary/20
                           hover:border-brand-primary/40 hover:bg-brand-primary/5
                           transition-all duration-base ease-smooth
                           min-h-[56px]"
                aria-label="See how ArogyaGPT works"
              >
                See How It Works
              </button>
            </div>

            {/* Language trust strip */}
            <div className="flex flex-wrap gap-2" aria-label="Supported languages">
              {languageChips.map((lang) => (
                <span
                  key={lang.english}
                  className="font-body text-sm px-3 py-1.5 rounded-full
                             bg-bg-surface border border-brand-glow/30
                             text-text-secondary"
                >
                  {lang.native} · {lang.english}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 40% — floating report card mockup */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end" aria-hidden="true">
            <div className="animate-float">
              <div className="bg-bg-surface rounded-xl shadow-elevated p-7 w-full max-w-[360px]
                              border border-[rgba(46,125,107,0.08)]">

                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-body text-xs text-text-muted uppercase tracking-[0.1em] mb-1">
                      Blood Report · June 2024
                    </p>
                    <p className="font-display text-lg font-medium text-text-primary">
                      Mr. Rajan, 58
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-primary" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3 L10 17 M5 8 Q10 3 15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Critical value */}
                <div className="row-critical rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-status-critical text-base">!</span>
                      <span className="font-body text-sm font-medium text-text-primary">Blood Sugar</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-status-critical">250 mg/dL</span>
                  </div>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full badge-critical font-body mb-2">
                    High
                  </span>
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Your blood sugar is above the healthy range. This needs attention.
                  </p>
                  <p className="font-body text-sm text-brand-secondary mt-2">
                    உங்கள் இரத்த சர்க்கரை அளவு அதிகமாக உள்ளது.
                  </p>
                </div>

                {/* Normal value */}
                <div className="rounded-lg p-4 border border-[rgba(46,125,107,0.08)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-sm font-medium text-text-primary">Hemoglobin</span>
                    <span className="font-mono text-sm font-semibold text-text-primary">13.2 g/dL</span>
                  </div>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full badge-normal font-body">
                    Normal
                  </span>
                  <p className="font-body text-sm text-text-secondary mt-2 leading-relaxed">
                    Your blood's oxygen carrier is healthy.
                  </p>
                </div>

                {/* Bottom strip */}
                <div className="mt-4 pt-4 border-t border-[rgba(46,125,107,0.08)] flex items-center justify-between">
                  <span className="font-body text-xs text-text-muted">2 of 12 values shown</span>
                  <span className="font-body text-xs text-brand-primary font-medium cursor-pointer hover:underline">
                    View full report →
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FDFCFA" />
        </svg>
      </div>
    </section>
  )
}
