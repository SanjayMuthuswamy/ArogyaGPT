import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface HistoryPageProps {
  onNavigate: (page: string) => void
}

const reports = [
  { name: 'CBC Report', date: '2026-06-22', status: 'Completed' },
  { name: 'Thyroid Panel', date: '2026-06-18', status: 'Pinned' },
  { name: 'Lipid Profile', date: '2026-06-10', status: 'Translated' },
]

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  return (
    <AuthenticatedShell
      title="Medical History"
      subtitle="Search, filter, and revisit your past reports in one place."
      onNavigate={onNavigate}
      currentPage="history"
      actionLabel="Upload New"
      onAction={() => onNavigate('upload')}
    >
      <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input className="w-full rounded-[16px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 text-sm outline-none focus:border-[#1D9E75] sm:max-w-xs" placeholder="Search reports" />
          <button className="rounded-full border border-[#DCEBE6] bg-white px-4 py-2 text-sm font-medium text-[#4A5E59]">Filter</button>
        </div>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.name} className="flex items-center justify-between rounded-[18px] border border-[#EEF5F2] bg-[#FCFDFB] px-4 py-3">
              <div>
                <p className="font-body text-sm font-semibold text-[#18322D]">{report.name}</p>
                <p className="mt-1 font-body text-xs text-[#8FA49E]">{report.date}</p>
              </div>
              <span className="rounded-full bg-[#E1F5EE] px-3 py-1 text-xs font-semibold text-[#1D9E75]">{report.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedShell>
  )
}
