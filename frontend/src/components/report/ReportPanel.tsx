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
        value: '13.2', unit: 'g/dL', range: '13.5–17.5', status: 'warning',
        rangeMin: 13.5, rangeMax: 17.5, actualValue: 13.2,
        plain: "Your blood's oxygen carrier is slightly below the healthy range.",
        translation: 'உங்கள் இரத்தத்தின் ஆக்சிஜன் தாங்கி சற்று குறைவாக உள்ளது.',
      },
      {
        name: 'RBC Count',
        value: '5.1', unit: 'M/μL', range: '4.5–5.9', status: 'normal',
        rangeMin: 4.5, rangeMax: 5.9, actualValue: 5.1,
        plain: 'Your red blood cells are within the healthy range.',
        translation: 'உங்கள் சிவப்பு இரத்த அணுக்கள் சாதாரண அளவில் உள்ளன.',
      },
      {
        name: 'Platelets',
        value: '145', unit: 'K/μL', range: '150–400', status: 'warning',
        rangeMin: 150, rangeMax: 400, actualValue: 145,
        plain: 'Your platelets are slightly below normal. Monitor for easy bruising.',
        translation: 'உங்கள் தட்டணுக்கள் சற்று குறைவாக உள்ளன.',
      },
    ],
  },
  {
    name: 'Metabolic Panel',
    params: [
      {
        name: 'Blood Sugar (Fasting)',
        value: '250', unit: 'mg/dL', range: '70–100', status: 'critical',
        rangeMin: 70, rangeMax: 100, actualValue: 250,
        plain: 'Your fasting blood sugar is significantly above normal. This indicates possible diabetes.',
        translation: 'உங்கள் இரத்த சர்க்கரை அளவு மிகவும் அதிகமாக உள்ளது.',
      },
      {
        name: 'Creatinine',
        value: '1.0', unit: 'mg/dL', range: '0.6–1.2', status: 'normal',
        rangeMin: 0.6, rangeMax: 1.2, actualValue: 1.0,
        plain: 'Your kidneys are filtering blood effectively.',
        translation: 'உங்கள் சிறுநீரகம் சரியாக செயல்படுகிறது.',
      },
    ],
  },
]

const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<Status, { label: string; cls: string; icon: string }> = {
    normal:   { label: 'Normal',   cls: 'badge-normal',   icon: '✓' },
    warning:  { label: 'Borderline', cls: 'badge-warning',  icon: '~' },
    critical: { label: 'High',     cls: 'badge-critical',  icon: '!' },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-body font-medium ${cls}`}
          role="status" aria-label={`Value status: ${label}`}>
      <span aria-hidden="true">{icon}</span>{label}
    </span>
  )
}

const RangeBar = ({ min, max, value }: { min: number; max: number; value: number }) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const color = value > max ? '#C0574A' : value < min ? '#D4924A' : '#3A9E6E'
  return (
    <div className="relative w-20 h-1.5 bg-text-muted/15 rounded-full overflow-visible" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: '100%', background: 'rgba(58,158,110,0.15)' }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-bg-surface"
        style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)', background: color }}
      />
    </div>
  )
}

type ReportTab = 'simplified' | 'values' | 'insights'

export default function ReportPanel() {
  const [activeTab, setActiveTab] = useState<ReportTab>('simplified')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Complete Blood Count': true })
  const [filter, setFilter] = useState<'all' | Status>('all')

  const toggleSection = (name: string) =>
    setExpanded(p => ({ ...p, [name]: !p[name] }))

  const allParams = REPORT_DATA.flatMap(s => s.params)
  const filtered = filter === 'all' ? allParams : allParams.filter(p => p.status === filter)

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-bg-base rounded-lg mb-4" role="tablist" aria-label="Report sections">
        {([
          { key: 'simplified', label: 'Simplified Report' },
          { key: 'values',     label: 'Test Values' },
          { key: 'insights',   label: 'Health Insights' },
        ] as { key: ReportTab; label: string }[]).map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 font-body text-sm py-2 px-3 rounded-md transition-all duration-fast ease-smooth
              ${activeTab === tab.key
                ? 'bg-brand-primary text-text-inverse shadow-card'
                : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">

        {/* TAB 1: Simplified Report */}
        {activeTab === 'simplified' && (
          <div id="tabpanel-simplified" role="tabpanel" aria-label="Simplified report">
            {/* Summary card */}
            <div className="bg-bg-deep rounded-lg p-6 mb-6">
              <p className="font-body text-xs uppercase tracking-[0.1em] text-text-muted mb-3">Report Summary</p>
              <p className="font-display text-lg italic text-text-inverse leading-[1.7] font-light">
                "Your blood sugar is significantly elevated and requires medical attention.
                 Blood count is largely normal with minor dips in hemoglobin and platelets.
                 An appointment with your physician is strongly advised."
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/8">
                <span className="font-body text-xs text-text-muted">Blood Report · June 2024</span>
                <span className="font-body text-xs px-2 py-0.5 rounded-full bg-white/8 text-text-muted">
                  CBC + Metabolic
                </span>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {REPORT_DATA.map(section => {
                const abnormal = section.params.filter(p => p.status !== 'normal').length
                const isOpen = expanded[section.name] !== false
                return (
                  <div key={section.name} className="bg-bg-surface rounded-lg border border-[rgba(46,125,107,0.08)]">
                    <button
                      onClick={() => toggleSection(section.name)}
                      className="w-full flex items-center justify-between p-4 text-left min-h-[56px]"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-body text-lg font-semibold text-text-primary">{section.name}</span>
                        <span className={`font-body text-xs px-2.5 py-1 rounded-full
                          ${abnormal > 0 ? 'bg-status-warning/10 text-status-warning' : 'bg-status-normal/10 text-status-normal'}`}>
                          {section.params.length} values · {abnormal > 0 ? `${abnormal} abnormal` : 'all normal'}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-text-muted transition-transform duration-base ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M5 8 L10 13 L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3 border-t border-[rgba(46,125,107,0.06)]">
                        {section.params.map(param => (
                          <div
                            key={param.name}
                            className={`rounded-lg p-4 ${param.status === 'critical' ? 'row-critical' : 'bg-bg-base/60'}`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {param.status === 'critical' && (
                                  <span className="text-status-critical font-bold text-base" aria-label="Critical value">!</span>
                                )}
                                <span className="font-body text-base font-medium text-text-primary">{param.name}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`font-mono text-base font-semibold
                                  ${param.status === 'critical' ? 'text-status-critical'
                                    : param.status === 'warning' ? 'text-status-warning'
                                    : 'text-text-primary'}`}>
                                  {param.value} {param.unit}
                                </span>
                                <StatusBadge status={param.status} />
                              </div>
                            </div>
                            <p className="font-body text-sm italic text-text-secondary leading-[1.6] mb-1">{param.plain}</p>
                            <p className="font-body text-sm text-brand-secondary">{param.translation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Test Values */}
        {activeTab === 'values' && (
          <div id="tabpanel-values" role="tabpanel" aria-label="Test values table">
            {/* Filter chips */}
            <div className="flex gap-2 mb-5 flex-wrap" role="radiogroup" aria-label="Filter results">
              {([
                { key: 'all', label: 'All' },
                { key: 'normal', label: '✓ Normal' },
                { key: 'warning', label: '~ Borderline' },
                { key: 'critical', label: '! Abnormal' },
              ] as { key: 'all' | Status; label: string }[]).map(f => (
                <button
                  key={f.key}
                  role="radio"
                  aria-checked={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`lang-chip font-body text-sm px-4 py-2 rounded-full border min-h-[40px]
                    ${filter === f.key
                      ? 'bg-brand-primary text-text-inverse border-transparent'
                      : 'bg-bg-surface text-text-secondary border-[rgba(46,125,107,0.15)] hover:border-brand-glow/40'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2">
                {['Parameter', 'Your Value', 'Normal Range', 'Status', 'Position'].map(h => (
                  <span key={h} className="font-body text-xs uppercase tracking-[0.08em] text-text-muted">{h}</span>
                ))}
              </div>
              {filtered.map((param, i) => (
                <div
                  key={param.name}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center
                               px-4 py-3 rounded-lg
                               ${i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-base/50'}`}
                >
                  <span className="font-body text-base text-text-primary truncate">{param.name}</span>
                  <span className={`font-mono text-sm font-semibold
                    ${param.status === 'critical' ? 'text-status-critical'
                      : param.status === 'warning' ? 'text-status-warning'
                      : 'text-text-primary'}`}>
                    {param.value} {param.unit}
                  </span>
                  <span className="font-mono text-xs text-text-muted">{param.range}</span>
                  <StatusBadge status={param.status} />
                  <RangeBar min={param.rangeMin} max={param.rangeMax} value={param.actualValue} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Health Insights */}
        {activeTab === 'insights' && (
          <div id="tabpanel-insights" role="tabpanel" aria-label="Health insights" className="space-y-4">
            {[
              {
                icon: '🩸',
                title: 'Your Blood Sugar is High',
                body: 'Your fasting blood sugar of 250 mg/dL is well above the normal range of 70–100 mg/dL. This level is typically associated with diabetes or pre-diabetes. It does not mean a crisis — but it needs attention.',
                sections: [
                  { q: 'What causes this?', a: 'High blood sugar can result from insufficient insulin production, insulin resistance, stress, poor diet, or a sedentary lifestyle. Family history also plays a role.' },
                  { q: 'What are the symptoms?', a: 'Frequent urination, increased thirst, fatigue, blurred vision, and slow-healing wounds are common symptoms of elevated blood sugar.' },
                  { q: 'What should you do?', a: 'Consult a physician immediately. Avoid sugary foods and refined carbs. Regular physical activity and monitoring will help manage your levels.' },
                ],
              },
              {
                icon: '🫀',
                title: 'Hemoglobin is Slightly Low',
                body: 'Your hemoglobin at 13.2 g/dL is marginally below the normal male range (13.5–17.5 g/dL). This is mild and may indicate slight anemia or iron deficiency.',
                sections: [
                  { q: 'What causes this?', a: 'Low hemoglobin can stem from iron deficiency, vitamin B12 deficiency, blood loss, or chronic disease.' },
                  { q: 'What are the symptoms?', a: 'Fatigue, breathlessness during activity, pale skin, and dizziness are common signs.' },
                  { q: 'What should you do?', a: 'Include iron-rich foods (spinach, lentils, red meat) in your diet. A follow-up blood test in 6–8 weeks is recommended.' },
                ],
              },
            ].map(insight => (
              <InsightCard key={insight.title} {...insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({ icon, title, body, sections }: {
  icon: string; title: string; body: string
  sections: { q: string; a: string }[]
}) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="bg-bg-surface rounded-lg shadow-card border border-[rgba(46,125,107,0.08)] p-6 card-hover">
      <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
      <h3 className="font-display text-xl font-medium text-text-primary mb-3 tracking-[-0.01em]">{title}</h3>
      <p className="font-body text-md text-text-secondary leading-[1.7] mb-5">{body}</p>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={s.q} className="border-t border-[rgba(46,125,107,0.08)] pt-3">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between text-left min-h-[44px]"
              aria-expanded={open === i}
            >
              <span className="font-body text-base font-medium text-text-primary">{s.q}</span>
              <svg
                className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-fast ${open === i ? 'rotate-180' : ''}`}
                viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 6 L8 10 L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            {open === i && (
              <p className="font-body text-base text-text-secondary leading-[1.7] mt-2 pb-1 animate-fade-in">{s.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
