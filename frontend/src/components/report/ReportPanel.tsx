import { useState } from 'react'

type Status = 'normal' | 'warning' | 'critical'

interface Parameter {
  name: string
  value: string
  unit: string
  range: string
  status: Status
  rangeMin: number
  rangeMax: number
  actualValue: number
  plain: string
  translation: string
}

interface Section {
  name: string
  params: Parameter[]
}

const REPORT_DATA: Section[] = [
  {
    name: 'Complete Blood Count',
    params: [
      {
        name: 'Hemoglobin',
        value: '13.2',
        unit: 'g/dL',
        range: '13.5 - 17.5',
        status: 'warning',
        rangeMin: 13.5,
        rangeMax: 17.5,
        actualValue: 13.2,
        plain: 'Your oxygen-carrying blood level is slightly below the expected range.',
        translation: 'Regional explanation is available in Tamil.',
      },
      {
        name: 'RBC Count',
        value: '5.1',
        unit: 'M/uL',
        range: '4.5 - 5.9',
        status: 'normal',
        rangeMin: 4.5,
        rangeMax: 5.9,
        actualValue: 5.1,
        plain: 'Your red blood cell count is within a healthy range.',
        translation: 'Regional explanation is available in Tamil.',
      },
      {
        name: 'Platelets',
        value: '145',
        unit: 'K/uL',
        range: '150 - 400',
        status: 'warning',
        rangeMin: 150,
        rangeMax: 400,
        actualValue: 145,
        plain: 'Your platelets are slightly low, so easy bruising should be monitored.',
        translation: 'Regional explanation is available in Tamil.',
      },
    ],
  },
  {
    name: 'Metabolic Panel',
    params: [
      {
        name: 'Blood Sugar (Fasting)',
        value: '250',
        unit: 'mg/dL',
        range: '70 - 100',
        status: 'critical',
        rangeMin: 70,
        rangeMax: 100,
        actualValue: 250,
        plain: 'Your fasting blood sugar is well above normal and needs urgent follow-up.',
        translation: 'Regional explanation is available in Tamil.',
      },
      {
        name: 'Creatinine',
        value: '1.0',
        unit: 'mg/dL',
        range: '0.6 - 1.2',
        status: 'normal',
        rangeMin: 0.6,
        rangeMax: 1.2,
        actualValue: 1.0,
        plain: 'Kidney filtering looks stable in this report.',
        translation: 'Regional explanation is available in Tamil.',
      },
    ],
  },
]

const INSIGHTS = [
  {
    title: 'Blood sugar is the priority finding',
    badge: 'Critical',
    body: 'A fasting glucose of 250 mg/dL is the most important result in this report and deserves a clinician review soon.',
    sections: [
      {
        q: 'AI explanation',
        a: 'This reading can be associated with diabetes, poor glucose control, stress, or recent dietary triggers. It is high enough that you should not ignore it.',
      },
      {
        q: 'Possible causes',
        a: 'Insulin resistance, missed diabetes medication, illness, stress, or a high refined-carb intake can all contribute.',
      },
      {
        q: 'Symptoms to watch',
        a: 'Common signs include thirst, fatigue, blurry vision, frequent urination, and delayed wound healing.',
      },
      {
        q: 'Recommended actions',
        a: 'Reduce sugary drinks, increase water intake, stay active, and book a doctor review to confirm what this result means for you.',
      },
    ],
  },
  {
    title: 'Blood count changes are mild but relevant',
    badge: 'Borderline',
    body: 'Hemoglobin and platelets are only slightly below range, so they matter, but they are not the main risk driver today.',
    sections: [
      {
        q: 'AI explanation',
        a: 'This pattern can reflect mild nutritional deficiency, recent illness, or a temporary dip that should be rechecked.',
      },
      {
        q: 'Possible causes',
        a: 'Iron deficiency, B12 deficiency, inflammation, minor blood loss, or reduced marrow response may contribute.',
      },
      {
        q: 'Symptoms to watch',
        a: 'Fatigue, dizziness, pale skin, and unusual bruising are the most helpful things to monitor.',
      },
      {
        q: 'Recommended actions',
        a: 'Improve iron-rich meals, ask your clinician whether a repeat CBC is needed, and track any bruising or low-energy symptoms.',
      },
    ],
  },
]

const statusStyles: Record<Status, { label: string; badge: string; text: string; dot: string }> = {
  normal: {
    label: 'Normal',
    badge: 'bg-[#EAF8F1] text-[#1D9E75]',
    text: 'text-[#18322D]',
    dot: '#1D9E75',
  },
  warning: {
    label: 'Borderline',
    badge: 'bg-[#FFF6E7] text-[#A86A00]',
    text: 'text-[#A86A00]',
    dot: '#E6A817',
  },
  critical: {
    label: 'High',
    badge: 'bg-[#FFF1F1] text-[#C23B3B]',
    text: 'text-[#C23B3B]',
    dot: '#E84040',
  },
}

const quickSnapshot = [
  { label: 'Risk level', value: 'Moderate', note: 'Glucose needs follow-up', tone: 'warning' },
  { label: 'Critical values', value: '1', note: 'Blood sugar', tone: 'critical' },
  { label: 'Borderline', value: '2', note: 'Hemoglobin, platelets', tone: 'warning' },
  { label: 'Next step', value: 'Doctor review', note: 'Within 1-2 days', tone: 'normal' },
] as const

const guidanceItems = [
  {
    title: 'AI explanation',
    body: 'The main concern is fasting glucose. Blood count changes are mild and should be monitored, not ignored.',
  },
  {
    title: 'Possible causes',
    body: 'High sugar may reflect insulin resistance; low hemoglobin and platelets can relate to nutrition or recovery after illness.',
  },
  {
    title: 'Symptoms to watch',
    body: 'Thirst, fatigue, blurry vision, dizziness, bruising, and low stamina are the most relevant signs to track.',
  },
  {
    title: 'Recommended actions',
    body: 'Review sugars with a doctor, reduce refined carbs, add iron-rich foods, and repeat labs if symptoms continue.',
  },
]

type ReportTab = 'simplified' | 'values' | 'insights'

export default function ReportPanel() {
  const [activeTab, setActiveTab] = useState<ReportTab>('simplified')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Complete Blood Count': true, 'Metabolic Panel': true })
  const [filter, setFilter] = useState<'all' | Status>('all')

  const toggleSection = (name: string) => setExpanded((previous) => ({ ...previous, [name]: !previous[name] }))

  const allParams = REPORT_DATA.flatMap((section) => section.params)
  const filteredParams = filter === 'all' ? allParams : allParams.filter((item) => item.status === filter)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-[18px] bg-[#F3F8F5] p-1.5" role="tablist" aria-label="Report sections">
        {([
          { key: 'simplified', label: 'Summary' },
          { key: 'values', label: 'Values' },
          { key: 'insights', label: 'Insights' },
        ] as { key: ReportTab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`min-h-[44px] rounded-[14px] px-3 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key ? 'bg-brand-primary text-text-inverse shadow-[0_10px_24px_rgba(29,158,117,0.18)]' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 scrollbar-thin"
        style={{ scrollbarGutter: 'stable' }}
      >
        {activeTab === 'simplified' ? (
          <div id="tabpanel-simplified" role="tabpanel" aria-label="Simplified report" className="space-y-3 pb-2">
            <section className="rounded-[24px] bg-bg-deep p-4 text-text-inverse md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/58">Report summary</p>
                  <h1 className="mt-2 font-display text-[1.45rem] font-medium leading-snug tracking-[-0.02em] md:text-[1.6rem]">
                    Blood sugar needs priority attention, while the rest of the report is mostly stable.
                  </h1>
                  <p className="mt-2 max-w-2xl font-body text-[0.95rem] leading-6 text-white/78">
                    The report shows one clearly abnormal result, two mild borderline findings, and a normal kidney marker. This keeps the focus clear and reduces scrolling when reviewing next steps.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 xl:min-w-[270px]">
                  {quickSnapshot.map((item) => {
                    const tone =
                      item.tone === 'critical'
                        ? 'border-[#F6CCCC] bg-[#FFF5F5] text-[#C23B3B]'
                        : item.tone === 'warning'
                          ? 'border-[#F9E7BF] bg-[#FFF9EC] text-[#8A6500]'
                          : 'border-[#D7EEE3] bg-[#F4FBF7] text-[#1D9E75]'

                    return (
                      <div key={item.label} className={`rounded-[16px] border px-3 py-2.5 ${tone}`}>
                        <p className="font-body text-[11px] uppercase tracking-[0.16em] opacity-80">{item.label}</p>
                        <p className="mt-1 font-display text-[1rem] font-medium text-current">{item.value}</p>
                        <p className="mt-1 font-body text-[12px] leading-5 text-current/80">{item.note}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="grid gap-3 xl:grid-cols-2">
              {guidanceItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[20px] border border-[rgba(46,125,107,0.08)] bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(16,50,46,0.05)]"
                >
                  <h2 className="font-display text-[1.05rem] font-medium text-text-primary">{item.title}</h2>
                  <p className="mt-2 font-body text-[0.93rem] leading-6 text-text-secondary">{item.body}</p>
                </article>
              ))}
            </section>

            <section className="space-y-2">
              {REPORT_DATA.map((section) => {
                const abnormal = section.params.filter((item) => item.status !== 'normal').length
                const isOpen = expanded[section.name] !== false

                return (
                  <article key={section.name} className="rounded-[20px] border border-[rgba(46,125,107,0.08)] bg-bg-surface">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.name)}
                      className="flex min-h-[48px] w-full items-center justify-between gap-3 px-3.5 py-3 text-left md:px-4"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-[1rem] font-medium text-text-primary md:text-[1.08rem]">{section.name}</h2>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              abnormal > 0 ? 'bg-[#FFF6E7] text-[#A86A00]' : 'bg-[#EAF8F1] text-[#1D9E75]'
                            }`}
                          >
                            {section.params.length} values
                          </span>
                        </div>
                        <p className="mt-1 font-body text-[13px] text-text-muted">
                          {abnormal > 0 ? `${abnormal} finding${abnormal > 1 ? 's' : ''} need review.` : 'All values are within range.'}
                        </p>
                      </div>

                      <svg
                        className={`h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>

                    {isOpen ? (
                      <div className="space-y-2 border-t border-[rgba(46,125,107,0.06)] px-3.5 pb-3.5 pt-2.5 md:px-4">
                        {section.params.map((param) => (
                          <ParameterCard key={param.name} param={param} />
                        ))}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </section>
          </div>
        ) : null}

        {activeTab === 'values' ? (
          <div id="tabpanel-values" role="tabpanel" aria-label="Test values table" className="space-y-3 pb-2">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter results">
              {([
                { key: 'all', label: 'All values' },
                { key: 'normal', label: 'Normal' },
                { key: 'warning', label: 'Borderline' },
                { key: 'critical', label: 'Abnormal' },
              ] as { key: 'all' | Status; label: string }[]).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="radio"
                  aria-checked={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  className={`min-h-[40px] rounded-full border px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    filter === item.key
                      ? 'border-transparent bg-brand-primary text-text-inverse'
                      : 'border-[rgba(46,125,107,0.15)] bg-white text-text-secondary hover:border-brand-glow/40 hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-[20px] border border-[rgba(46,125,107,0.08)] bg-white shadow-[0_12px_28px_rgba(16,50,46,0.05)]">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.3fr_0.85fr_0.9fr_0.8fr_0.8fr] gap-3 border-b border-[rgba(46,125,107,0.08)] bg-[#F7FCF9] px-4 py-3">
                  {['Parameter', 'Current', 'Normal range', 'Status', 'Position'].map((heading) => (
                    <span key={heading} className="font-body text-[11px] uppercase tracking-[0.16em] text-text-muted">
                      {heading}
                    </span>
                  ))}
                </div>

                {filteredParams.map((param, index) => {
                  const status = statusStyles[param.status]
                  return (
                    <div
                      key={param.name}
                      className={`grid grid-cols-[1.3fr_0.85fr_0.9fr_0.8fr_0.8fr] items-center gap-3 px-4 py-3 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#FCFDFC]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-body text-[0.95rem] font-medium text-text-primary">{param.name}</p>
                        <p className="mt-1 text-[12px] text-text-muted">{param.plain}</p>
                      </div>
                      <span className={`font-mono text-[0.92rem] font-semibold ${status.text}`}>
                        {param.value} {param.unit}
                      </span>
                      <span className="font-mono text-[12px] text-text-muted">{param.range}</span>
                      <StatusBadge status={param.status} />
                      <RangeBar min={param.rangeMin} max={param.rangeMax} value={param.actualValue} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'insights' ? (
          <div id="tabpanel-insights" role="tabpanel" aria-label="Health insights" className="grid gap-3 pb-2 xl:grid-cols-2">
            {INSIGHTS.map((insight) => (
              <InsightCard key={insight.title} {...insight} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ParameterCard({ param }: { param: Parameter }) {
  const status = statusStyles[param.status]

  return (
    <div
      className={`rounded-[16px] border px-3.5 py-3 ${
        param.status === 'critical' ? 'border-[#F5D3D3] bg-[#FFF7F7]' : 'border-[rgba(46,125,107,0.08)] bg-[#FCFDFC]'
      }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-[0.95rem] font-semibold text-text-primary">{param.name}</span>
            <span className="font-mono text-[12px] text-text-muted">{param.range}</span>
          </div>
          <p className="mt-1 font-body text-[0.92rem] leading-6 text-text-secondary">{param.plain}</p>
          <p className="mt-1 font-body text-[13px] leading-5 text-brand-secondary">{param.translation}</p>
        </div>

        <div className="flex items-center gap-2 md:flex-col md:items-end">
          <span className={`font-mono text-[0.95rem] font-semibold ${status.text}`}>
            {param.value} {param.unit}
          </span>
          <StatusBadge status={param.status} />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const config = statusStyles[status]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.badge}`} role="status">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.dot }} aria-hidden="true" />
      {config.label}
    </span>
  )
}

function RangeBar({ min, max, value }: { min: number; max: number; value: number }) {
  const position = max === min ? 50 : Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const color = value > max ? '#E84040' : value < min ? '#E6A817' : '#1D9E75'

  return (
    <div className="relative h-1.5 w-20 rounded-full bg-[#DCEBE6]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[rgba(29,158,117,0.14)]" />
      <div
        className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white"
        style={{ left: `${position}%`, transform: 'translate(-50%, -50%)', backgroundColor: color }}
      />
    </div>
  )
}

function InsightCard({
  title,
  badge,
  body,
  sections,
}: {
  title: string
  badge: string
  body: string
  sections: { q: string; a: string }[]
}) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <article className="rounded-[20px] border border-[rgba(46,125,107,0.08)] bg-white p-4 shadow-[0_12px_28px_rgba(16,50,46,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-[1.08rem] font-medium text-text-primary">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            badge === 'Critical' ? 'bg-[#FFF1F1] text-[#C23B3B]' : 'bg-[#FFF6E7] text-[#A86A00]'
          }`}
        >
          {badge}
        </span>
      </div>
      <p className="mt-2 font-body text-[0.93rem] leading-6 text-text-secondary">{body}</p>

      <div className="mt-3 space-y-1.5">
        {sections.map((section, index) => (
          <div key={section.q} className="rounded-[16px] border border-[rgba(46,125,107,0.08)] bg-[#FCFDFC] px-3 py-2.5">
            <button
              type="button"
              onClick={() => setOpen(open === index ? null : index)}
              className="flex min-h-[40px] w-full items-center justify-between gap-3 text-left"
              aria-expanded={open === index}
            >
              <span className="font-body text-[0.92rem] font-medium text-text-primary">{section.q}</span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-200 ${open === index ? 'rotate-180' : ''}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            {open === index ? <p className="pb-1 pt-1 font-body text-[0.9rem] leading-6 text-text-secondary">{section.a}</p> : null}
          </div>
        ))}
      </div>
    </article>
  )
}
