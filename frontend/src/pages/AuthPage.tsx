import { useState } from 'react'

interface AuthPageProps {
  onNavigate: (page: string) => void
  onLoginSuccess?: () => void
  initialMode?: 'signin' | 'signup'
}

export default function AuthPage({ onNavigate, onLoginSuccess, initialMode = 'signin' }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('alex@arogyagpt.com')
  const [password, setPassword] = useState('arogyagpt123')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      onNavigate('dashboard')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6 md:p-10 pt-20">
      <div className="w-full max-w-5xl rounded-[32px] border border-[#E3F1EB] bg-white shadow-[0_24px_64px_rgba(24,50,45,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: Medical AI Illustration & Branding Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#18322D] via-[#0F766E] to-[#1D9E75] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Outer Glow */}
          <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#1D9E75]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 mb-8 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1F5EE]">
                <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M6 26 C6 26 8 14 16 10 C24 6 28 10 28 10 C28 10 24 22 16 24 C12 25 8 24 6 26Z" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6 26 L16 16" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="22" cy="11" r="2" fill="#E6A817" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Arogya<span className="text-[#7ECFC2]">GPT</span>
              </span>
            </button>

            <h2 className="font-display text-3xl font-light leading-tight sm:text-4xl">
              AI-Powered Health Clarity for Every Patient.
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed text-[#DCEBE6] max-w-md">
              Upload medical reports, simplify clinical jargon, and chat with your diagnostic results using secure vision AI.
            </p>
          </div>

          {/* Features Illustration card */}
          <div className="relative z-10 mt-8 rounded-[24px] border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <h4 className="font-display text-sm font-semibold mb-4 text-[#E1F5EE]">Platform Features</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-body text-[#DCEBE6]">
              <div className="flex items-center gap-2">
                <span>📄</span> OCR Extraction
              </div>
              <div className="flex items-center gap-2">
                <span>🧠</span> AI Summary
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span> Health Insights
              </div>
              <div className="flex items-center gap-2">
                <span>🌍</span> Multi-Language
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold text-[#18322D]">
                {isSignUp ? 'Create your Account' : 'Welcome Back'}
              </h3>
              <p className="mt-1 font-body text-xs text-[#6B7C77]">
                {isSignUp ? 'Enter details to start simplifying medical reports.' : 'Sign in to access your secure ArogyaGPT workspace.'}
              </p>
            </div>

            {submitted && (
              <div className="mb-4 rounded-2xl bg-[#1D9E75] p-3 text-xs font-semibold text-white shadow-md animate-pulse">
                ✓ Authenticating... Redirecting to Dashboard...
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-body text-xs">
              {isSignUp && (
                <div>
                  <label className="block font-medium text-[#4A5E59] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Sundaram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-full border border-[#DCEBE6] bg-[#FAFAF8] px-4 py-3 text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-[#4A5E59] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex.sundaram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-[#DCEBE6] bg-[#FAFAF8] px-4 py-3 text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#4A5E59] mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-[#DCEBE6] bg-[#FAFAF8] px-4 py-3 text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block font-medium text-[#4A5E59] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-full border border-[#DCEBE6] bg-[#FAFAF8] px-4 py-3 text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 accent-[#1D9E75]"
                    />
                    <span className="text-[#4A5E59]">Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to email.')}
                    className="font-semibold text-[#1D9E75] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] py-3.5 font-semibold text-white shadow-md hover:scale-[1.01] transition"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              {/* Bottom Toggle */}
              <div className="pt-4 text-center">
                <p className="text-[#6B7C77]">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-bold text-[#1D9E75] hover:underline"
                  >
                    {isSignUp ? 'Sign In' : 'Create Account'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
