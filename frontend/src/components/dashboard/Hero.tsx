import { useEffect, useRef } from 'react'

interface HeroProps {
  onNavigate: (page: 'home' | 'upload' | 'report' | 'signin' | 'signup') => void
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
    el.classList.add('scroll-reveal')
  }, [])

  return (
    <section className="relative flex min-h-[min(100vh,860px)] items-center overflow-hidden bg-[#FAFAF8] pt-16 sm:min-h-[92vh]" aria-label="Hero section">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.96), rgba(240,249,246,0.92) 48%, rgba(224,242,236,0.8) 100%)',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.96), rgba(240,249,246,0.92) 48%, rgba(224,242,236,0.8) 100%), radial-gradient(rgba(29, 158, 117, 0.08) 1px, transparent 1px)',
          backgroundSize: 'auto, 24px 24px',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-12 lg:px-16 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-5 lg:gap-16">
          <div ref={heroRef} className="lg:col-span-3">
            <p className="mb-4 font-body text-sm uppercase tracking-[0.16em] text-[#4A5E59] sm:mb-6">
              Your Health. Your Language. Your Understanding.
            </p>

            <h1 className="mb-4 max-w-[700px] font-display text-3xl font-light leading-[1.08] tracking-[-0.02em] text-[#18322D] text-balance sm:mb-6 sm:text-4xl" style={{ fontSize: 'clamp(2.1rem, 4.5vw, 3.7rem)' }}>
              Understand Your<br />
              Medical Report,<br />
              <span className="bg-gradient-to-r from-[#1D9E75] to-[#0F766E] bg-clip-text font-medium text-transparent">
                Finally.
              </span>
            </h1>

            <p className="mb-6 max-w-[500px] font-body text-[0.96rem] leading-[1.7] text-[#4A5E59] sm:mb-8 sm:text-[1.02rem]">
              Upload any medical report — we simplify every term, highlight what matters, and explain it in the language you grew up speaking.
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8 sm:gap-4">
              <button
                onClick={() => onNavigate('upload')}
                className="btn-shimmer min-h-[50px] rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-6 py-[13px] font-body text-sm font-semibold text-white shadow-[0_16px_40px_rgba(29,158,117,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(29,158,117,0.28)] sm:min-h-[56px] sm:px-8 sm:py-[16px] sm:text-base"
                aria-label="Upload your medical report now"
              >
                Upload Your Report Now
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="min-h-[50px] rounded-full border border-[#CFE9E0] bg-white/70 px-6 py-[13px] font-body text-sm font-medium text-[#1D9E75] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1D9E75]/40 hover:bg-[#F3FCF8] sm:min-h-[56px] sm:px-8 sm:py-[16px] sm:text-base"
                aria-label="Create an account"
              >
                Create Account
              </button>
            </div>

            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 md:flex-wrap" aria-label="Supported languages">
              {languageChips.map((lang) => (
                <span key={lang.english} className="whitespace-nowrap rounded-full border border-[#DCEBE6] bg-white/80 px-3 py-1.5 font-body text-sm text-[#4A5E59] shadow-[0_6px_20px_rgba(24,50,45,0.04)]">
                  {lang.native} · {lang.english}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-2 lg:justify-end" aria-hidden="true">
            <div className="scroll-reveal">
              <div className="report-card w-full max-w-[360px] rounded-[24px] border border-white/80 bg-white/95 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="mb-1 font-body text-[0.7rem] uppercase tracking-[0.16em] text-[#8FA49E]">
                      Blood Report · June 2024
                    </p>
                    <p className="font-display text-lg font-medium text-[#18322D]">Mr. Rajan, 58</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE]">
                    <svg className="h-5 w-5 text-[#1D9E75]" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3 L10 17 M5 8 Q10 3 15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="metric-high mb-4 rounded-[16px] border border-[#F8D7D7] bg-[#FFF8F8] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-[#E84040]">!</span>
                      <span className="font-body text-sm font-semibold text-[#18322D]">Blood Sugar</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#E84040]">250 mg/dL</span>
                  </div>
                  <span className="mb-2 inline-block rounded-full bg-[#FFE3E3] px-2.5 py-1 text-[0.72rem] font-body font-medium text-[#E84040]">
                    High
                  </span>
                  <p className="font-body text-sm leading-relaxed text-[#4A5E59]">
                    Your blood sugar is above the healthy range. This needs attention.
                  </p>
                  <p className="mt-2 font-body text-sm text-[#1D9E75]">
                    உங்கள் இரத்த சர்க்கரை அளவு அதிகமாக உள்ளது.
                  </p>
                </div>

                <div className="metric-normal rounded-[16px] border border-[#DCEBE6] bg-[#F8FDFB] p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-body text-sm font-semibold text-[#18322D]">Hemoglobin</span>
                    <span className="font-mono text-sm font-semibold text-[#18322D]">13.2 g/dL</span>
                  </div>
                  <span className="inline-block rounded-full bg-[#E1F5EE] px-2.5 py-1 text-[0.72rem] font-body font-medium text-[#1D9E75]">
                    Normal
                  </span>
                  <p className="mt-2 font-body text-sm leading-relaxed text-[#4A5E59]">
                    Your blood&apos;s oxygen carrier is healthy.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEF5F2] pt-4">
                  <span className="font-body text-xs text-[#8FA49E]">2 of 12 values shown</span>
                  <span className="cursor-pointer font-body text-xs font-semibold text-[#1D9E75] hover:underline">
                    View full report →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-16 w-full md:h-20">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FDFCFA" />
        </svg>
      </div>
    </section>
  )
}
