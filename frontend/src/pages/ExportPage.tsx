import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ExportPageProps {
  onNavigate: (page: string) => void
}

const exportItems = ['Original PDF', 'Simplified Report', 'Doctor Version', 'Patient Version']
const shareItems = ['WhatsApp', 'Email', 'Print', 'QR Code']

export default function ExportPage({ onNavigate }: ExportPageProps) {
  return (
    <AuthenticatedShell
      title="Export & share"
      subtitle="Choose the right report format for patients, caregivers, or clinicians."
      onNavigate={onNavigate}
      currentPage="export"
      actionLabel="Open History"
      onAction={() => onNavigate('history')}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Download formats</h3>
          <div className="mt-4 grid gap-3">
            {exportItems.map((item) => (
              <button key={item} className="rounded-[18px] border border-[#E3F1EB] bg-[#F7FCF9] px-4 py-3 text-left text-sm font-medium text-[#18322D] transition hover:border-[#1D9E75]/40">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Share options</h3>
          <div className="mt-4 grid gap-3">
            {shareItems.map((item) => (
              <button key={item} className="rounded-[18px] border border-[#E3F1EB] bg-[#F7FCF9] px-4 py-3 text-left text-sm font-medium text-[#18322D] transition hover:border-[#1D9E75]/40">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
