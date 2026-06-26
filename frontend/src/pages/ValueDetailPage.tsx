import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ValueDetailPageProps {
  onNavigate: (page: string) => void
}

const infoCards = [
  ['Meaning', 'Hemoglobin carries oxygen through your blood and supports energy levels.'],
  ['Normal Range', '12.0 - 15.5 g/dL for most adult women.'],
  ['Why High', 'Dehydration, smoking, or some lung conditions may raise values.'],
  ['Why Low', 'Iron deficiency, blood loss, or low vitamin B12 can lower it.'],
  ['Possible Causes', 'Heavy menstrual loss, low iron intake, or recovery after illness.'],
  ['Symptoms', 'Tiredness, shortness of breath, dizziness, and paleness.'],
  ['Diet Advice', 'Pair iron-rich foods with vitamin C for better absorption.'],
  ['Foods to Eat', 'Spinach, lentils, dates, eggs, lean meat, citrus fruits.'],
  ['Foods to Avoid', 'Tea or coffee immediately after iron-rich meals.'],
  ['Lifestyle Tips', 'Sleep well, stay hydrated, and repeat testing if advised.'],
  ['Medical References', 'WHO anemia guidance and standard adult hematology ranges.'],
  ['AI Explanation', 'This result suggests mild anemia and may need clinical correlation.'],
]

export default function ValueDetailPage({ onNavigate }: ValueDetailPageProps) {
  return (
    <AuthenticatedShell
      title="Hemoglobin detail"
      subtitle="Understand the value, possible causes, and practical next steps in simple language."
      onNavigate={onNavigate}
      currentPage="test-values"
      actionLabel="Back to Values"
      onAction={() => onNavigate('test-values')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#FFF7F7_0%,_#FFFFFF_100%)] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C23B3B]">Low value detected</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-[#18322D]">10.8 g/dL</h2>
              </div>
              <div className="rounded-[18px] border border-[#F7D6D6] bg-white px-4 py-3 text-sm text-[#6B7C77]">
                Risk trend: Mild concern • Repeat in 6 weeks
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {infoCards.map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-[#E3F1EB] bg-white p-5 shadow-[0_14px_30px_rgba(24,50,45,0.04)]">
                <h3 className="font-display text-lg font-semibold text-[#18322D]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#4A5E59]">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Trend chart</h3>
            <div className="mt-6 flex h-56 items-end justify-between gap-3 rounded-[20px] bg-[#F7FCF9] p-4">
              {[9.8, 10.1, 10.6, 10.8, 11.2, 10.8].map((item, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="w-full rounded-t-full bg-gradient-to-t from-[#1D9E75] to-[#78D3BC]" style={{ height: `${item * 14}px` }} />
                  <span className="text-xs text-[#8FA49E]">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Recommended actions</h3>
            <div className="mt-4 space-y-3 text-sm text-[#4A5E59]">
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Increase iron-rich meals for the next 4 weeks.</div>
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Ask AI Chat whether this pattern needs a doctor visit.</div>
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Share the doctor version with your clinician if symptoms worsen.</div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
