const steps = [
  {
    number: '01',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 4 L16 12 M12 8 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 12 L16 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      </svg>
    ),
    title: 'Drop Your Report',
    body: 'PDF or image — we handle both. Simply drag and drop or tap to browse.',
  },
  {
    number: '02',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 20 L27 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="2" fill="currentColor" className="animate-pulse" />
      </svg>
    ),
    title: 'We Read Every Line',
    body: 'Our AI identifies every medical term, test value, and clinical reference in your report.',
  },
  {
    number: '03',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4 10 H12 M4 16 H16 M4 22 H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 10 H28 M20 16 H26 M20 22 H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M17 8 L17 24" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.4" />
      </svg>
    ),
    title: 'Plain Language. Your Language.',
    body: 'Complex terms become simple sentences — in Tamil, Hindi, or any language you choose.',
  },
  {
    number: '04',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6 8 C6 6 8 4 10 4 L22 4 C24 4 26 6 26 8 L26 18 C26 20 24 22 22 22 L18 22 L14 28 L14 22 L10 22 C8 22 6 20 6 18 Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 13 C12 11.5 13.5 10.5 15 11 C16 11.3 16.5 12 16 13 C15.5 14 14 14.5 14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="18.5" r="0.8" fill="currentColor" />
      </svg>
    ),
    title: 'Ask. Explore. Know.',
    body: 'Chat directly with your report. Ask what worries you — in your own words.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#FDFCFA] py-24 md:py-32" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mb-16 text-center md:mb-20">
          <p className="mb-4 font-body text-sm uppercase tracking-[0.16em] text-[#8FA49E]">The Process</p>
          <h2 id="how-it-works-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#18322D] md:text-3xl">
            From Complex to Clear — <span className="text-[#1D9E75]">in 4 Steps</span>
          </h2>
        </div>

        <div className="relative">
          <svg className="pointer-events-none absolute left-[12.5%] top-14 hidden h-[2px] w-[75%] lg:block" viewBox="0 0 1000 2" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 1 C180 1, 320 1, 500 1 S820 1, 1000 1" fill="none" stroke="#88D9C4" strokeWidth="2" strokeLinecap="round" className="connector-path" />
          </svg>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="step-card scroll-reveal relative flex flex-col items-center text-center" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full p-[2px] shadow-[0_16px_34px_rgba(29,158,117,0.16)]" style={{ background: 'conic-gradient(from 180deg, #1D9E75 0deg, #7FD5BF 180deg, #1D9E75 360deg)' }}>
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#E6A817] shadow-inner">
                    {step.icon}
                  </div>
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#18322D] font-mono text-[0.7rem] font-semibold text-white" aria-label={`Step ${step.number}`}>
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-3 font-display text-xl font-medium tracking-[-0.01em] text-[#18322D]">
                  {step.title}
                </h3>
                <p className="max-w-[220px] font-body text-base leading-[1.7] text-[#4A5E59]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
