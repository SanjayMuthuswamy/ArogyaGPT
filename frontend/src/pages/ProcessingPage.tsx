import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ProcessingPageProps {
  onNavigate: (page: string) => void
}

const steps = [
  'Reading report',
  'OCR processing',
  'Extracting values',
  'Detecting abnormalities',
  'Generating summary',
  'Preparing voice',
]

export default function ProcessingPage({ onNavigate }: ProcessingPageProps) {
  return (
    <AuthenticatedShell
      title="Processing your report"
      subtitle="We’re turning your medical document into an easy-to-read, multilingual summary."
      onNavigate={onNavigate}
      currentPage="processing"
      actionLabel="View Report"
      onAction={() => onNavigate('summary')}
    >
      <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-6 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E1F5EE] text-[#1D9E75]">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-[#18322D]">Processing in progress</p>
            <p className="font-body text-sm text-[#6B7C77]">This usually takes 20–40 seconds.</p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] px-4 py-3">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-[#1D9E75] text-white' : 'bg-[#E1F5EE] text-[#1D9E75]'}`}>
                {index + 1}
              </div>
              <span className="font-body text-sm text-[#18322D]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedShell>
  )
}
