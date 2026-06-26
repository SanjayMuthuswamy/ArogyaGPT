import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface DashboardPageProps {
  onNavigate: (page: string) => void
}

const recentReports = [
  { name: 'CBC Report', date: '2h ago', status: 'Ready' },
  { name: 'Lipid Profile', date: 'Yesterday', status: 'Translated' },
  { name: 'Thyroid Panel', date: '3 days ago', status: 'Reviewed' },
]

const quickActions = [
  { label: 'Upload Report', page: 'upload' },
  { label: 'View Summary', page: 'summary' },
  { label: 'Open Chat', page: 'chat' },
  { label: 'Medical History', page: 'history' },
]

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <AuthenticatedShell
      title="Welcome back"
      subtitle="Your health workspace is ready. Continue from your latest report or start a new one."
      onNavigate={onNavigate}
      currentPage="dashboard"
      actionLabel="Upload New Report"
      onAction={() => onNavigate('upload')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#F7FCF9_0%,_#FFFFFF_100%)] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#1D9E75]">Today</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#18322D]">Your AI health workspace is ready.</h2>
                <p className="mt-2 max-w-xl font-body text-sm leading-6 text-[#6B7C77]">
                  Review your simplified reports, ask questions, and translate findings into your preferred language.
                </p>
              </div>
              <div className="rounded-[20px] border border-[#DFF5EC] bg-white px-4 py-3 text-sm text-[#4A5E59]">
                <p className="font-semibold text-[#18322D]">Health Score</p>
                <p className="mt-1 font-display text-2xl font-semibold text-[#1D9E75]">84/100</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-[#18322D]">Recent Reports</h3>
              <button onClick={() => onNavigate('history')} className="font-body text-sm font-medium text-[#1D9E75]">View all</button>
            </div>
            <div className="space-y-3">
              {recentReports.map((report) => (
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
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Quick Actions</h3>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.page)}
                  className="rounded-[18px] border border-[#E3F1EB] bg-[#F7FCF9] px-4 py-3 text-left font-body text-sm font-medium text-[#18322D] transition hover:border-[#1D9E75]/40 hover:bg-[#E1F5EE]"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">AI Insights</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4A5E59]">
              <li className="rounded-[16px] bg-[#FFF8F8] p-3">Blood sugar trend indicates a mild upward pattern.</li>
              <li className="rounded-[16px] bg-[#F7FCF9] p-3">Hydration and sleep consistency are improving.</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
