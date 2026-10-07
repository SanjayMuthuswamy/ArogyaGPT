import { useState } from 'react'

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#E3F1EB] bg-white p-8 shadow-[0_24px_64px_rgba(24,50,45,0.08)]">
        <h3 className="font-display text-2xl font-bold text-[#18322D]">Reset Password</h3>
        <p className="mt-1 font-body text-xs text-[#6B7C77]">
          Enter your registered email address to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl bg-[#E1F5EE] p-4 text-xs text-[#18322D]">
            <p className="font-semibold">Reset link sent!</p>
            <p className="mt-1 text-[#4A5E59]">Check your email for instructions to reset your password.</p>
            <button
              onClick={() => onNavigate('signin')}
              className="mt-4 w-full rounded-full bg-[#1D9E75] py-2.5 font-semibold text-white hover:bg-[#059669]"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 font-body text-xs">
            <div>
              <label className="block font-medium text-[#4A5E59] mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-[#DCEBE6] bg-[#FAFAF8] px-4 py-3 text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#1D9E75] py-3.5 font-semibold text-white shadow-md hover:bg-[#059669]"
            >
              Send Reset Link
            </button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('signin')}
                className="font-semibold text-[#1D9E75] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
