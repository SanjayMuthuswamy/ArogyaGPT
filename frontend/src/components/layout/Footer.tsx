interface FooterProps {
  onNavigate: (page: string) => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#10221E] text-white py-16" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 mb-4 text-left"
              aria-label="ArogyaGPT home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE]">
                <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6 26 L16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="22" cy="11" r="2" fill="#E6A817" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Arogya<span className="text-[#1D9E75]">GPT</span>
              </span>
            </button>
            <p className="font-body text-sm text-[#8FA49E] leading-relaxed max-w-sm">
              Empowering patients and caregivers with instant AI simplification of complex medical lab reports and clinical jargon.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.15em] font-semibold text-[#8FA49E] mb-4">
              Navigation
            </h4>
            <ul className="space-y-3 font-body text-sm text-[#DCEBE6]">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#1D9E75] transition">Home</button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-[#1D9E75] transition">Dashboard</button>
              </li>
              <li>
                <button onClick={() => onNavigate('upload')} className="hover:text-[#1D9E75] transition">Upload Report</button>
              </li>
              <li>
                <button onClick={() => onNavigate('chat')} className="hover:text-[#1D9E75] transition">AI Chat</button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-[#1D9E75] transition">Medical Library</button>
              </li>
            </ul>
          </div>

          {/* Account / Legal */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.15em] font-semibold text-[#8FA49E] mb-4">
              Account & Portal
            </h4>
            <ul className="space-y-3 font-body text-sm text-[#DCEBE6]">
              <li>
                <button onClick={() => onNavigate('signin')} className="hover:text-[#1D9E75] transition">Sign In</button>
              </li>
              <li>
                <button onClick={() => onNavigate('signup')} className="hover:text-[#1D9E75] transition">Sign Up</button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-[#1D9E75] transition">Report History</button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-[#1D9E75] transition">User Profile</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body text-[#8FA49E]">
          <p>© 2026 ArogyaGPT. All rights reserved. Built for patient health empowerment.</p>
          <p className="italic max-w-md text-right">
            Disclaimer: ArogyaGPT is for informational purposes and does not provide medical diagnosis or treatment.
          </p>
        </div>
      </div>
    </footer>
  )
}
