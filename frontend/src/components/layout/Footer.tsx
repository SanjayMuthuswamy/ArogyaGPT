interface FooterProps {
  onNavigate: (page: 'home' | 'upload' | 'report' | 'signin' | 'signup') => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-bg-deep" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/8">

          {/* Brand */}
          <div>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 mb-4"
              aria-label="ArogyaGPT home"
            >
              <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
                <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z"
                  fill="none" stroke="#7ECFC2" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 26 L16 16" stroke="#7ECFC2" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-display text-xl font-semibold text-text-inverse">
                Arogya<span className="text-accent-gold">GPT</span>
              </span>
            </button>
            <p className="font-body text-sm text-text-muted leading-[1.7] max-w-[240px]">
              Helping every patient understand their health — in their language, at their pace.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-body text-xs uppercase tracking-[0.1em] text-text-muted mb-4">Navigation</p>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {[
                  { label: 'Home', action: () => onNavigate('home') },
                  { label: 'Upload Report', action: () => onNavigate('upload') },
                  { label: 'How It Works', action: () => onNavigate('home') },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="font-body text-sm text-text-muted hover:text-text-inverse
                                 transition-colors duration-fast"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Languages */}
          <div>
            <p className="font-body text-xs uppercase tracking-[0.1em] text-text-muted mb-4">Languages</p>
            <div className="flex flex-wrap gap-2">
              {['Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali'].map((lang) => (
                <span
                  key={lang}
                  className="font-body text-xs px-2.5 py-1 rounded-full
                             border border-white/10 text-text-muted"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm text-text-muted">
            Built with care for every patient in India.
          </p>
          <p className="font-body text-xs text-text-muted/60">
            © 2024 ArogyaGPT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
