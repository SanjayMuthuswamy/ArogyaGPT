import { useState } from 'react'
import { api } from '../../services/api'

type Status = 'normal' | 'warning' | 'critical'

export interface Parameter {
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

export interface Section {
  name: string
  params: Parameter[]
}

export interface Insight {
  icon: string
  title: string
  body: string
}

const REPORT_DATA: Section[] = []

interface ReportPanelProps {
  sections?: Section[]
  summary?: string
  detailedText?: string
  insights?: Insight[]
  reportId?: string
  language?: string
}

const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<Status, { label: string; cls: string; icon: string }> = {
    normal:   { label: 'Normal',     cls: 'badge-normal',   icon: '✓' },
    warning:  { label: 'Borderline', cls: 'badge-warning',  icon: '~' },
    critical: { label: 'High',       cls: 'badge-critical', icon: '!' },
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

export default function ReportPanel({
  sections: propSections,
  summary: propSummary,
  detailedText,
  insights: propInsights = [],
  reportId,
  language = 'English',
}: ReportPanelProps = {}) {
  const activeData = propSections && propSections.length > 0 ? propSections : REPORT_DATA
  const activeSummary = propSummary || 'Your medical report has been processed by ArogyaGPT. Please review your laboratory findings and clinical parameters.'

  const [activeTab, setActiveTab] = useState<ReportTab>('simplified')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Complete Blood Count': true, 'Diagnostic Report': true, 'Laboratory Findings': true })
  const [filter, setFilter] = useState<'all' | Status>('all')

  const toggleSection = (name: string) =>
    setExpanded(p => ({ ...p, [name]: !p[name] }))

  const allParams = activeData.flatMap(s => s.params)
  const filtered = filter === 'all' ? allParams : allParams.filter(p => p.status === filter)

  // Compute lab-based insights from abnormal params
  const labInsights: Insight[] = allParams
    .filter(p => p.status !== 'normal')
    .map(p => ({
      icon: p.status === 'critical' ? '🚨' : '⚠️',
      title: `${p.name} is ${p.status === 'critical' ? 'Outside Standard Range' : 'Borderline'}`,
      body: `Recorded value: ${p.value} ${p.unit} (Reference: ${p.range}). ${p.plain}`,
    }))

  // Merge: backend abnormalities (propInsights) take priority; if lab insights also exist, combine
  const allInsights: Insight[] = propInsights.length > 0 ? propInsights : labInsights

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
              <div
                className="font-display text-lg italic text-text-inverse leading-[1.7] font-light"
                dangerouslySetInnerHTML={{
                  __html: activeSummary
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {activeData.map(section => {
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
                          {section.params.length === 0
                            ? 'Diagnostic Report'
                            : `${section.params.length} values · ${abnormal > 0 ? `${abnormal} abnormal` : 'all normal'}`}
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
                        {section.params.length === 0 && detailedText ? (
                          <div
                            className="space-y-1 p-4 bg-bg-base/60 rounded-lg font-body text-base text-text-primary leading-[1.7]"
                          >
                            {detailedText.split('\n').map((line, index) => {
                              const term = line
                                .replace(/<[^>]*>/g, '')
                                .replace(/[*_#`>-]/g, '')
                                .trim()
                              if (!line.trim()) {
                                return <div key={`line-${index}`} className="h-2" />
                              }
                              return (
                                <div key={`line-${index}`} className="flex items-start gap-2">
                                  <span
                                    className="min-w-0 flex-1"
                                    dangerouslySetInnerHTML={{
                                      __html: line
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                                    }}
                                  />
                                  {reportId && term.length > 0 && term.length <= 300 && (
                                    <TermInfoButton
                                      reportId={reportId}
                                      term={term}
                                      language={language}
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          section.params.map(param => (
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
                                  {reportId && (
                                    <TermInfoButton reportId={reportId} term={param.name} language={language} />
                                  )}
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
                          ))
                        )}
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

            {allParams.length === 0 ? (
              <div className="bg-bg-surface rounded-lg border border-[rgba(46,125,107,0.1)] p-6 text-center mt-4">
                <h3 className="font-display font-medium text-text-primary text-base mb-1">No Structured Values Found</h3>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  This report does not contain tabular laboratory values. It may be an imaging report (like an X-Ray or MRI) or a clinical note.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* TAB 3: Health Insights */}
        {activeTab === 'insights' && (
          <div id="tabpanel-insights" role="tabpanel" aria-label="Health insights" className="space-y-4">
            {allInsights.length === 0 ? (
              <div className="bg-bg-surface rounded-lg border border-[rgba(46,125,107,0.1)] p-6 text-center mt-4">
                <p className="text-2xl mb-2">✅</p>
                <h3 className="font-display font-medium text-text-primary text-base mb-1">No Abnormal Findings</h3>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  No critical or abnormal findings were flagged in this report. Consult your doctor for a complete clinical interpretation.
                </p>
              </div>
            ) : (
              allInsights.map((insight, i) => (
                <InsightCard
                  key={`${insight.title}-${i}`}
                  icon={insight.icon}
                  title={insight.title}
                  body={insight.body}
                  reportId={reportId}
                  language={language}
                  sections={[
                    { q: 'Clinical Significance', a: insight.body },
                    { q: 'Recommended Action', a: 'Discuss this finding with your physician for clinical evaluation and treatment guidance.' },
                  ]}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({ icon, title, body, sections, reportId, language }: {
  icon: string; title: string; body: string
  sections: { q: string; a: string }[]
  reportId?: string
  language: string
}) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="bg-bg-surface rounded-lg shadow-card border border-[rgba(46,125,107,0.08)] p-6 card-hover">
      <div className="text-4xl mb-4" aria-hidden="true">{icon}</div>
      <div className="flex items-start gap-2 mb-3">
        <h3 className="font-display text-xl font-medium text-text-primary tracking-[-0.01em]">{title}</h3>
        {reportId && <TermInfoButton reportId={reportId} term={title} language={language} />}
      </div>
      <p
        className="font-body text-md text-text-secondary leading-[1.7] mb-5"
        dangerouslySetInnerHTML={{
          __html: body
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>')
        }}
      />
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

const LANGUAGE_CODES: Record<string, string> = {
  tamil: 'ta',
  english: 'en',
  hindi: 'hi',
  telugu: 'te',
  kannada: 'kn',
  malayalam: 'ml',
  bengali: 'bn',
  marathi: 'mr',
  gujarati: 'gu',
}

function TermInfoButton({
  reportId,
  term,
  language,
}: {
  reportId: string
  term: string
  language: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')

  const handleClick = async () => {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    if (explanation || loading) return

    setLoading(true)
    setError('')
    try {
      const response = await api.explainReportTerm(
        reportId,
        term,
        LANGUAGE_CODES[language.toLowerCase()] || 'en'
      )
      setExplanation(response)
    } catch {
      setError('Could not load the explanation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="relative inline-flex flex-shrink-0">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Explain ${term} in ${language}`}
        aria-expanded={open}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-primary/30 text-xs font-semibold text-brand-secondary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        title={`Explain in ${language}`}
      >
        i
      </button>
      {open && (
        <span
          role="status"
          className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-brand-primary/15 bg-bg-surface p-3 text-left font-body text-sm leading-6 text-text-secondary shadow-elevated"
        >
          {loading ? 'Generating explanation…' : error || explanation}
          {explanation && (
            <span className="mt-2 block text-xs text-text-muted">
              For general understanding only. Please discuss the report with your clinician.
            </span>
          )}
        </span>
      )}
    </span>
  )
}
