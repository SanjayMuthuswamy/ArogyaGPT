const steps = [
  {
    number: '01',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M6 8 C6 6 8 4 10 4 L22 4 C24 4 26 6 26 8 L26 18 C26 20 24 22 22 22 L18 22 L14 28 L14 22 L10 22 C8 22 6 20 6 18 Z"
              stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 13 C12 11.5 13.5 10.5 15 11 C16 11.3 16.5 12 16 13 C15.5 14 14 14.5 14 16"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="18.5" r="0.8" fill="currentColor" />
      </svg>
    ),
    title: 'Ask. Explore. Know.',
    body: 'Chat directly with your report. Ask what worries you — in your own words.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-surface py-24 md:py-32" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">

        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <p className="font-body text-sm uppercase tracking-[0.12em] text-text-muted mb-4">
            The Process
          </p>
          <h2
            id="how-it-works-heading"
            className="font-display text-2xl md:text-3xl font-semibold text-text-primary tracking-[-0.02em]"
          >
            From Complex to Clear —{' '}
            <em className="not-italic text-brand-primary">in 4 Steps</em>
          </h2>
        </div>

        {/* Steps — connected flow */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px"
            aria-hidden="true"
            style={{
              background: 'repeating-linear-gradient(90deg, #7ECFC2 0, #7ECFC2 6px, transparent 6px, transparent 16px)',
              opacity: 0.35,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center group"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Icon bubble */}
                <div
                  className="w-24 h-24 rounded-full bg-bg-surface border border-[rgba(46,125,107,0.12)]
                               flex items-center justify-center mb-6 relative z-10
                               text-accent-gold group-hover:text-brand-primary
                               group-hover:border-brand-glow/40 group-hover:shadow-card
                               transition-all duration-base ease-smooth"
                >
                  {step.icon}
                  {/* Step number badge */}
                  <span
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-bg-deep
                                 font-mono text-xs text-accent-gold flex items-center justify-center"
                    aria-label={`Step ${step.number}`}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display text-xl font-medium text-text-primary mb-3 tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="font-body text-base text-text-secondary leading-[1.7] max-w-[220px]">
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
