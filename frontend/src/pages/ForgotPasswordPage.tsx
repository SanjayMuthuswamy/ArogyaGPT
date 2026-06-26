interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-[#E3F1EB] bg-white/90 p-6 shadow-[0_24px_60px_rgba(24,50,45,0.08)] backdrop-blur md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] bg-[linear-gradient(135deg,_#10322E_0%,_#135B4B_100%)] p-6 text-white md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#78D3BC]">Account recovery</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">Get back to your health workspace securely.</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/78">
              We’ll send a password reset link and keep your medical report history, preferences, and AI conversations protected.
            </p>
            <div className="mt-8 space-y-3">
              {['Encrypted medical records', 'Session recovery in under 2 minutes', 'Support in your preferred language'].map((item) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#E6F2ED] bg-[#FCFDFC] p-6 md:p-8">
            <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-6 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
              <h2 className="font-display text-2xl font-semibold text-[#18322D]">Forgot password</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7C77]">Enter your email to receive a secure reset link.</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-[#18322D]">
                  Email address
                  <input type="email" placeholder="name@example.com" className="mt-2 w-full rounded-[18px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 outline-none transition focus:border-[#1D9E75]" />
                </label>
                <button onClick={() => onNavigate('signin')} className="w-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,158,117,0.24)]">
                  Send reset link
                </button>
                <button onClick={() => onNavigate('signin')} className="w-full rounded-full border border-[#DCEBE6] bg-white px-5 py-3 text-sm font-semibold text-[#18322D]">
                  Back to sign in
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
