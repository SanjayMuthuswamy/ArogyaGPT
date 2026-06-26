import { useState, type FormEvent } from 'react'
import axios from 'axios'

const trustBadges = [
  { label: 'Secure AI Processing', icon: '🔒' },
  { label: 'Private Medical Reports', icon: '🛡' },
  { label: 'Multi-language Support', icon: '🌍' },
  { label: 'Voice Assistant', icon: '🎙' },
]

interface SignInPageProps {
  onNavigate: (page: 'home' | 'upload' | 'report' | 'signin' | 'signup') => void
}

export default function SignInPage({ onNavigate }: SignInPageProps) {
  const [email, setEmail] = useState('dev@example.com')
  const [password, setPassword] = useState('dev123456')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await axios.post('http://localhost:8000/api/v1/auth/signin', { email, password })
      setMessage('Signed in successfully.')
      onNavigate('upload')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(29,158,117,0.10),_transparent_35%),linear-gradient(135deg,_#FAFAF8_0%,_#F4FBF7_100%)] pt-20 sm:pt-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-12 xl:px-12">
        <div className="flex-1 space-y-6 lg:max-w-[560px]">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 rounded-full border border-[#DCEBE6] bg-white/90 px-3.5 py-2 text-sm font-medium text-[#4A5E59] shadow-[0_10px_24px_rgba(24,50,45,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1D9E75]/40 hover:text-[#1D9E75]"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </button>

          <div className="space-y-4">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#4A5E59]">
              Secure, private sign in
            </p>
            <h1 className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.02em] text-[#18322D] sm:text-4xl lg:text-[2.8rem]">
              Continue your healthcare journey with confidence.
            </h1>
            <p className="max-w-xl font-body text-base leading-7 text-[#4A5E59] sm:text-lg">
              Access AI-powered summaries, multilingual reports, voice narration, and secure health insights in a calm, private experience.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white/90 p-5 shadow-[0_20px_50px_rgba(24,50,45,0.06)] backdrop-blur sm:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E1F5EE] text-[#1D9E75]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="font-body text-sm font-semibold text-[#18322D]">Protected by design</p>
                <p className="font-body text-sm leading-6 text-[#6B7C77]">
                  Your medical uploads stay private and are processed with secure AI workflows built for trust and clarity.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 rounded-2xl border border-[#E3F1EB] bg-white/80 px-3.5 py-3 text-sm text-[#4A5E59] shadow-[0_10px_24px_rgba(24,50,45,0.04)]">
                <span className="text-base" aria-hidden="true">{badge.icon}</span>
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[480px] rounded-[28px] border border-[#E3F1EB] bg-white p-6 shadow-[0_30px_80px_rgba(16,50,46,0.10)] sm:p-8 lg:ml-auto">
          <div className="mb-7">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75]">
              Sign in
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#18322D] sm:text-[1.75rem]">
              Welcome back
            </h2>
            <p className="mt-2 font-body text-sm leading-6 text-[#6B7C77]">
              Use your account to continue simplifying complex medical reports.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block font-body text-sm font-medium text-[#18322D]">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3.5 font-body text-base text-[#18322D] outline-none transition-all duration-200 placeholder:text-[#94A29E] focus:border-[#1D9E75] focus:ring-4 focus:ring-[#DFF5EC]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-body text-sm font-medium text-[#18322D]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3.5 pr-14 font-body text-base text-[#18322D] outline-none transition-all duration-200 placeholder:text-[#94A29E] focus:border-[#1D9E75] focus:ring-4 focus:ring-[#DFF5EC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-[#1D9E75] transition hover:text-[#0F766E]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E1F5EE] bg-[#F7FCF9] p-3.5 text-sm text-[#4A5E59]">
              <p className="font-semibold text-[#18322D]">Development demo login</p>
              <p className="mt-1">Email: dev@example.com</p>
              <p>Password: dev123456</p>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 font-body text-[#4A5E59]">
                <input type="checkbox" className="h-4 w-4 rounded border-[#DCEBE6] text-[#1D9E75] focus:ring-[#1D9E75]" />
                Remember me
              </label>
              <button type="button" className="font-body font-medium text-[#1D9E75] transition hover:text-[#0F766E] hover:underline">
                Forgot password?
              </button>
            </div>

            {message ? (
              <div className={`rounded-2xl border px-3.5 py-3 text-sm ${message.includes('successfully') ? 'border-[#DFF5EC] bg-[#F3FCF7] text-[#1D9E75]' : 'border-[#F7D7D7] bg-[#FFF8F8] text-[#E84040]'}`}>
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-3.5 font-body text-base font-semibold text-white shadow-[0_16px_40px_rgba(29,158,117,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(29,158,117,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                    <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6B7C77]">
            <span>New here?</span>
            <button onClick={() => onNavigate('signup')} className="font-semibold text-[#1D9E75] transition hover:text-[#0F766E] hover:underline">
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
