const languages = [
  { native: 'வணக்கம்',   name: 'Tamil',     delay: 0 },
  { native: 'नमस्ते',    name: 'Hindi',     delay: 200 },
  { native: 'నమస్కారం', name: 'Telugu',    delay: 400 },
  { native: 'ನಮಸ್ಕಾರ',  name: 'Kannada',   delay: 600 },
  { native: 'നമസ്കാരം', name: 'Malayalam', delay: 800 },
  { native: 'নমস্কার',  name: 'Bengali',   delay: 1000 },
]

export default function LanguageSection() {
  return (
    <section
      id="languages"
      className="bg-bg-base py-24 md:py-32"
      aria-labelledby="languages-heading"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 text-center">

        {/* Label */}
        <p className="font-body text-sm uppercase tracking-[0.12em] text-text-muted mb-4">
          Multilingual Support
        </p>

        {/* Language specimens */}
        <div
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10"
          role="list"
          aria-label="Supported languages"
        >
          {languages.map((lang, i) => (
            <span
              key={lang.name}
              role="listitem"
              aria-label={lang.name}
              className="font-display font-medium text-text-primary
                         animate-breathe cursor-default select-none"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                animationDelay: `${lang.delay}ms`,
                animationDuration: `${3 + i * 0.4}s`,
                letterSpacing: '-0.01em',
              }}
            >
              {lang.native}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          id="languages-heading"
          className="font-display text-xl md:text-2xl font-medium text-text-secondary
                     tracking-[-0.01em] italic"
        >
          ArogyaGPT speaks your mother tongue.
        </p>
      </div>
    </section>
  )
}
