import { useEffect, useRef } from 'react'

interface HeroProps {
  onNavigate: (page: string) => void
}

export default function Hero({ onNavigate }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    el.classList.add('scroll-reveal')
  }, [])

  return (
    <section className="relative flex min-h-[min(100vh,880px)] items-center overflow-hidden bg-[#FAFAF8] pt-20 sm:min-h-[92vh]" aria-label="Hero section">
      {/* Background Gradient & Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.96), rgba(240,249,246,0.92) 48%, rgba(224,242,236,0.8) 100%)',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.96), rgba(240,249,246,0.92) 48%, rgba(224,242,236,0.8) 100%), radial-gradient(rgba(29, 158, 117, 0.08) 1px, transparent 1px)',
          backgroundSize: 'auto, 24px 24px',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-12 lg:px-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading & CTAs */}
          <div ref={heroRef} className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCEBE6] bg-white/80 px-4 py-1.5 font-body text-xs font-semibold tracking-wide text-[#1D9E75] shadow-[0_4px_16px_rgba(29,158,117,0.08)] mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#1D9E75] animate-ping" />
              ArogyaGPT · AI Healthcare Assistant
            </div>

            <h1
              className="mb-6 font-display font-light leading-[1.08] tracking-[-0.02em] text-[#18322D] text-balance"
              style={{ fontSize: 'clamp(2.3rem, 4.5vw, 3.8rem)' }}
            >
              Understand Your<br />Medical Report,{' '}
              <span className="bg-gradient-to-r from-[#1D9E75] to-[#0F766E] bg-clip-text font-medium text-transparent">
                Finally.
              </span>
            </h1>

            <p className="mb-8 max-w-[620px] font-body text-base leading-relaxed text-[#4A5E59] sm:text-lg">
              Upload your medical reports, simplify complex medical terminology, chat with your reports using AI, and understand your health with confidence.
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn-shimmer min-h-[52px] rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-8 py-[14px] font-body text-base font-semibold text-white shadow-[0_16px_40px_rgba(29,158,117,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(29,158,117,0.32)]"
              >
                Get Started →
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="min-h-[52px] rounded-full border border-[#CFE9E0] bg-white/80 px-8 py-[14px] font-body text-base font-semibold text-[#18322D] shadow-[0_6px_20px_rgba(24,50,45,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1D9E75]/40 hover:bg-[#F3FCF8]"
              >
                Learn More
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 text-xs font-body text-[#4A5E59]">
              <div className="flex items-center gap-1.5 rounded-full border border-[#DCEBE6] bg-white/70 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#1D9E75]">✓</span> HIPAA Aligned
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#DCEBE6] bg-white/70 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#1D9E75]">✓</span> Vision OCR Extraction
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#DCEBE6] bg-white/70 px-3.5 py-1.5 shadow-sm">
                <span className="text-[#1D9E75]">✓</span> Language Translation
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic Card */}
          <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
            <div className="relative w-full max-w-[440px] animate-[float_6s_ease-in-out_infinite]">
              {/* Outer Glow */}
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-[#1D9E75]/20 to-[#059669]/20 blur-2xl opacity-60 pointer-events-none" />

              {/* Glassmorphism Main Card */}
              <div className="relative rounded-[28px] border border-white/90 bg-white/95 p-6 sm:p-8 shadow-[0_24px_64px_rgba(24,50,45,0.12)] backdrop-blur-xl">
                
                {/* Step 1: Upload Report */}
                <div className="flex items-center justify-between rounded-[20px] border border-[#E3F1EB] bg-[#F7FCF9] p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* PDF Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-inner">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-[#18322D]">Medical_Report.pdf</p>
                      <p className="font-body text-xs text-[#8FA49E]">Step 1 · Upload Report</p>
                    </div>
                  </div>
                  {/* Green checkmark */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D9E75] text-white">
                    ✓
                  </div>
                </div>

                {/* Animated Dotted Arrow 1 */}
                <div className="flex justify-center my-3">
                  <svg className="h-8 w-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 32">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" d="M12 2v28M6 24l6 6 6-6" className="animate-[pulse_1.5s_infinite]" />
                  </svg>
                </div>

                {/* Step 2: AI Processing */}
                <div className="flex items-center justify-between rounded-[20px] border border-[#E3F1EB] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* Glowing Circular Brain Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE] shadow-[0_0_15px_rgba(29,158,117,0.3)]">
                      🧠
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold text-[#18322D]">AI Processing</p>
                      <p className="font-body text-xs text-[#1D9E75]">Analyzing medical terminology...</p>
                    </div>
                  </div>
                  {/* Progress Indicator */}
                  <div className="relative flex items-center justify-center">
                    <svg className="h-10 w-10 transform -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="#E3F1EB" strokeWidth="3" fill="transparent" />
                      <circle cx="20" cy="20" r="16" stroke="#1D9E75" strokeWidth="3" fill="transparent" strokeDasharray={100} strokeDashoffset={4} className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute font-mono text-[10px] font-bold text-[#18322D]">96%</span>
                  </div>
                </div>

                {/* Animated Dotted Arrow 2 */}
                <div className="flex justify-center my-3">
                  <svg className="h-8 w-6 text-[#1D9E75]" fill="none" viewBox="0 0 24 32">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" d="M12 2v28M6 24l6 6 6-6" className="animate-[pulse_1.5s_infinite]" />
                  </svg>
                </div>

                {/* Step 3: Smart Summary */}
                <div className="rounded-[20px] border border-[#E3F1EB] bg-[#F7FCF9] p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between border-b border-[#EEF5F2] pb-2">
                    <div>
                      <p className="font-display text-sm font-semibold text-[#18322D]">Smart Summary</p>
                      <p className="font-body text-xs text-[#8FA49E]">Step 3 · Structured Insights</p>
                    </div>
                    <span className="rounded-full bg-[#E1F5EE] px-2.5 py-1 text-[10px] font-semibold text-[#1D9E75]">AI Extracted</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-body text-[#4A5E59]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1D9E75] font-bold">✓</span> Diseases Detected
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1D9E75] font-bold">✓</span> Abnormal Values
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1D9E75] font-bold">✓</span> Medicines
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#1D9E75] font-bold">✓</span> Recommendations
                    </div>
                  </div>
                </div>

                {/* Bottom Complete Badge */}
                <div className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#1D9E75] py-2 text-xs font-semibold text-white shadow-md">
                  <span>✓</span> Analysis Complete
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
