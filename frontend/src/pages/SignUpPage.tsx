import { useState, type FormEvent } from 'react'
import axios from 'axios'

interface SignUpPageProps {
  onNavigate: (page: 'home' | 'upload' | 'report' | 'signin' | 'signup') => void
}

export default function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await axios.post('http://localhost:8000/api/v1/auth/signup', { email, password })
      setMessage('Account created successfully.')
      onNavigate('upload')
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center lg:px-12 lg:py-16">
        <div className="flex-1 space-y-6">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 rounded-full border border-[#DCEBE6] bg-white/90 px-4 py-2 text-sm font-medium text-[#4A5E59] transition hover:border-[#1D9E75]/40 hover:text-[#1D9E75]"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </button>

          <div className="max-w-xl space-y-4">
            <p className="font-body text-sm uppercase tracking-[0.16em] text-[#4A5E59]">
              Join ArogyaGPT
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-[#18322D] md:text-5xl">
              Create your account and simplify your health reports.
            </h1>
            <p className="font-body text-lg leading-8 text-[#4A5E59]">
              Get personalized explanations in your preferred language and keep your health insights close at hand.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-6 shadow-[0_16px_40px_rgba(24,50,45,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE] text-[#1D9E75]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-2 11c0-2.76 2.69-5 6-5h2c3.31 0 6 2.24 6 5v1H3v-1Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-[#18322D]">Fast onboarding</p>
                <p className="font-body text-sm text-[#8FA49E]">Start uploading reports in minutes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xl rounded-[28px] border border-[#E3F1EB] bg-white p-8 shadow-[0_24px_70px_rgba(16,50,46,0.08)]">
          <div className="mb-8">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#1D9E75]">
              Sign up
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#18322D]">
              Create your account
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-2 block font-body text-sm font-medium text-[#18322D]">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 font-body text-base text-[#18322D] outline-none transition focus:border-[#1D9E75]"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block font-body text-sm font-medium text-[#18322D]">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 font-body text-base text-[#18322D] outline-none transition focus:border-[#1D9E75]"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block font-body text-sm font-medium text-[#18322D]">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full rounded-2xl border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 font-body text-base text-[#18322D] outline-none transition focus:border-[#1D9E75]"
              />
            </div>

            {message ? (
              <p className={`font-body text-sm ${message.includes('successfully') || message.includes('confirm') ? 'text-[#1D9E75]' : 'text-[#E84040]'}`}>
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-3 font-body text-base font-semibold text-white shadow-[0_16px_40px_rgba(29,158,117,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-[#4A5E59]">
            Already have an account?{' '}
            <button onClick={() => onNavigate('signin')} className="font-semibold text-[#1D9E75] hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
