import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ErrorStatesPageProps {
  onNavigate: (page: string) => void
}

const errors = [
  ['Upload Failed', 'The file upload was interrupted. Retry or switch to camera scan.'],
  ['Network Error', 'Connection dropped while fetching AI insights. Your draft is saved locally.'],
  ['Unsupported Report', 'This file format is not supported. Upload PDF, JPG, PNG, or scan again.'],
  ['OCR Failed', 'The text could not be extracted clearly. Try a brighter image or a sharper scan.'],
  ['Session Expired', 'Please sign in again to continue processing securely.'],
]

export default function ErrorStatesPage({ onNavigate }: ErrorStatesPageProps) {
  return (
    <AuthenticatedShell
      title="Error states"
      subtitle="Helpful recovery paths keep users informed, calm, and moving forward."
      onNavigate={onNavigate}
      currentPage="errors"
      actionLabel="Contact Support"
      onAction={() => onNavigate('profile')}
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {errors.map(([title, body]) => (
          <article key={title} className="rounded-[24px] border border-[#F4DEDE] bg-[#FFF9F9] p-5 shadow-[0_14px_30px_rgba(24,50,45,0.04)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C23B3B]">Recovery ready</p>
            <h3 className="mt-3 font-display text-xl font-semibold text-[#18322D]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#4A5E59]">{body}</p>
            <div className="mt-5 flex gap-3">
              <button className="rounded-full bg-[#18322D] px-4 py-2 text-sm font-semibold text-white">Retry</button>
              <button className="rounded-full border border-[#DCEBE6] bg-white px-4 py-2 text-sm font-semibold text-[#18322D]">Support</button>
            </div>
          </article>
        ))}
      </div>
    </AuthenticatedShell>
  )
}
