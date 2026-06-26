import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ReportSummaryPageProps {
  onNavigate: (page: string) => void
}

const findings = [
  { title: 'Blood Sugar', value: '250 mg/dL', status: 'High', note: 'Needs follow-up' },
  { title: 'Hemoglobin', value: '13.2 g/dL', status: 'Normal', note: 'Within healthy range' },
]

export default function ReportSummaryPage({ onNavigate }: ReportSummaryPageProps) {
  return (
    <AuthenticatedShell
      title="Report Summary"
      subtitle="A simplified, patient-friendly view of your medical report."
      onNavigate={onNavigate}
      currentPage="report-summary"
      actionLabel="Open Chat"
      onAction={() => onNavigate('chat')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#F7FCF9_0%,_#FFFFFF_100%)] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75]">Overview</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[#18322D]">Your report has been simplified for clarity.</h2>
            <p className="mt-3 font-body text-sm leading-6 text-[#6B7C77]">The summary highlights the most important findings and offers next steps in plain language.</p>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Key Findings</h3>
            <div className="mt-4 space-y-3">
              {findings.map((item) => (
                <div key={item.title} className="rounded-[18px] border border-[#EEF5F2] bg-[#FCFDFB] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-body text-sm font-semibold text-[#18322D]">{item.title}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'High' ? 'bg-[#FFF8F8] text-[#E84040]' : 'bg-[#E1F5EE] text-[#1D9E75]'}`}>{item.status}</span>
                  </div>
                  <p className="mt-2 font-body text-sm text-[#4A5E59]">{item.value}</p>
                  <p className="mt-1 font-body text-xs text-[#8FA49E]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Risk Level</h3>
            <div className="mt-4 rounded-[18px] bg-[#FFF8F8] p-4 text-sm text-[#E84040]">Moderate risk — follow up with your clinician.</div>
          </div>
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Next Steps</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4A5E59]">
              <li>Review diet and hydration.</li>
              <li>Discuss your glucose trend with a doctor.</li>
              <li>Use the AI chat for personalized guidance.</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
