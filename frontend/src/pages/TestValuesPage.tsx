import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface TestValuesPageProps {
  onNavigate: (page: string) => void
}

const values = [
  { name: 'Hemoglobin', current: '10.8', range: '12.0 - 15.5', status: 'Low', unit: 'g/dL' },
  { name: 'Fasting Glucose', current: '116', range: '70 - 99', status: 'High', unit: 'mg/dL' },
  { name: 'Vitamin D', current: '21', range: '30 - 100', status: 'Low', unit: 'ng/mL' },
  { name: 'TSH', current: '2.4', range: '0.4 - 4.0', status: 'Normal', unit: 'mIU/L' },
]

const statusStyles: Record<string, string> = {
  High: 'bg-[#FFF4E5] text-[#A86A00]',
  Low: 'bg-[#FFF1F1] text-[#C23B3B]',
  Normal: 'bg-[#EAF8F1] text-[#1D9E75]',
}

export default function TestValuesPage({ onNavigate }: TestValuesPageProps) {
  return (
    <AuthenticatedShell
      title="Test values"
      subtitle="Search, filter, and expand results to understand each test in plain language."
      onNavigate={onNavigate}
      currentPage="test-values"
      actionLabel="Open Detail View"
      onAction={() => onNavigate('value-detail')}
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.6fr]">
          <input placeholder="Search test name, symptom, or marker" className="rounded-[18px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 text-sm outline-none" />
          <select className="rounded-[18px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 text-sm outline-none">
            <option>Filter by status</option>
            <option>High</option>
            <option>Low</option>
            <option>Normal</option>
          </select>
          <select className="rounded-[18px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 text-sm outline-none">
            <option>Sort by priority</option>
            <option>Most abnormal</option>
            <option>A to Z</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#E3F1EB] bg-white shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-[#EEF5F2] bg-[#F7FCF9] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7C77]">
            <span>Test Name</span>
            <span>Current Value</span>
            <span>Normal Range</span>
            <span>Status</span>
            <span>Unit</span>
          </div>
          <div className="divide-y divide-[#EEF5F2]">
            {values.map((value) => (
              <button key={value.name} onClick={() => onNavigate('value-detail')} className="grid w-full grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-left transition hover:bg-[#FCFDFB]">
                <div>
                  <p className="text-sm font-semibold text-[#18322D]">{value.name}</p>
                  <p className="mt-1 text-xs text-[#8FA49E]">Tap to view meaning, causes, and advice</p>
                </div>
                <span className="text-sm text-[#18322D]">{value.current}</span>
                <span className="text-sm text-[#4A5E59]">{value.range}</span>
                <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[value.status]}`}>{value.status}</span>
                <span className="text-sm text-[#4A5E59]">{value.unit}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
