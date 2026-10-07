import { useState, useEffect } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'
import { api } from '../services/api'

interface HistoryPageProps {
  onNavigate: (page: string) => void
}

type Status = 'Completed' | 'Needs Review' | 'Processing' | 'Critical'

interface HistoryItem {
  id: string
  title: string
  hospital: string
  date: string
  fileSize: string
  status: Status
  healthScore: number
  healthLabel: string
  findings: string[]
  trend: 'up' | 'down' | 'stable' | 'pending'
  trendLabel: string
  category: string
}

const HISTORY: HistoryItem[] = []

const STATUS_CONFIG: Record<Status, { pill: string; dot: string }> = {
  Completed:    { pill: 'bg-emerald-50  text-emerald-700  ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  'Needs Review': { pill: 'bg-amber-50    text-amber-700    ring-1 ring-amber-200',   dot: 'bg-amber-500'   },
  Processing:   { pill: 'bg-blue-50     text-blue-700     ring-1 ring-blue-200',    dot: 'bg-blue-400'    },
  Critical:     { pill: 'bg-red-50      text-red-700      ring-1 ring-red-200',     dot: 'bg-red-500'     },
}

const SCORE_CONFIG = (score: number, status: Status) => {
  if (status === 'Processing') return { bar: 'bg-gray-200', text: 'text-gray-400', label: 'bg-gray-100 text-gray-500' }
  if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'bg-emerald-50 text-emerald-700' }
  if (score >= 60) return { bar: 'bg-amber-400',   text: 'text-amber-600',   label: 'bg-amber-50   text-amber-700'   }
  return              { bar: 'bg-red-500',    text: 'text-red-600',    label: 'bg-red-50     text-red-700'     }
}

const TREND_ICONS = {
  up:      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>,
  down:    <svg className="w-3.5 h-3.5 text-red-500"     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  stable:  <svg className="w-3.5 h-3.5 text-gray-400"    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>,
  pending: <svg className="w-3.5 h-3.5 text-blue-400"    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const FINDING_ICONS: Record<Status, React.ReactNode> = {
  Completed:    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  'Needs Review': <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  Processing:   <svg className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Critical:     <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const FILTERS: Status[] = ['Completed', 'Needs Review', 'Processing', 'Critical']

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<'All' | Status>('All')
  const [sort, setSort]       = useState<'newest' | 'oldest'>('newest')
  const [items, setItems]     = useState<HistoryItem[]>(HISTORY)

  useEffect(() => {
    api.listReports().then((res) => {
      if (res && res.items && res.items.length > 0) {
        const mapped: HistoryItem[] = res.items.map((r) => ({
          id: r.id,
          title: r.title,
          hospital: r.hospital_name || 'Medical Laboratory',
          date: new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          fileSize: '1.2 MB',
          status: (r.risk_level === 'critical' ? 'Critical' : r.risk_level === 'high' ? 'Needs Review' : 'Completed') as Status,
          healthScore: r.risk_level === 'low' ? 92 : r.risk_level === 'medium' ? 78 : 64,
          healthLabel: r.risk_level === 'low' ? 'Excellent' : 'Needs Review',
          findings: ['AI Summary Generated', 'Biochemical markers processed'],
          trend: 'stable' as const,
          trendLabel: 'Analyzed',
          category: r.report_type || 'Diagnostic',
        }))
        setItems(mapped)
      } else {
        setItems([])
      }
    }).catch(err => {
      console.warn('Could not load reports from API:', err)
      setItems([])
    })
  }, [])

  const filtered = items
    .filter(r =>
      (filter === 'All' || r.status === filter) &&
      (r.title.toLowerCase().includes(search.toLowerCase()) ||
       r.hospital.toLowerCase().includes(search.toLowerCase()) ||
       r.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => sort === 'newest' ? 0 : 0)

  const totalReports  = items.length
  const healthy       = items.filter(r => r.status === 'Completed').length
  const needsAction   = items.filter(r => r.status === 'Needs Review' || r.status === 'Critical').length
  const lastUpload    = items[0]

  return (
    <AuthenticatedShell
      title="Report History"
      subtitle="All your analyzed medical reports in one place."
      onNavigate={onNavigate}
      currentPage="history"
    >
      <div className="max-w-[1120px] mx-auto space-y-7">

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Reports',
              value: totalReports,
              note: 'Lifetime total',
              accent: '#1D9E75',
              bg: '#E8F7F2',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              label: 'Healthy',
              value: healthy,
              note: 'In optimal range',
              accent: '#059669',
              bg: '#D1FAE5',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: 'Needs Action',
              value: needsAction,
              note: 'Require attention',
              accent: '#D97706',
              bg: '#FEF3C7',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              ),
            },
            {
              label: 'Last Upload',
              value: lastUpload.date.split(' ').slice(0, 2).join(' '),
              note: lastUpload.hospital,
              accent: '#7C3AED',
              bg: '#EDE9FE',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#F0F0EE] p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[13px] font-medium text-[#6B7280]">{s.label}</p>
                <span className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: s.bg, color: s.accent }}>
                  {s.icon}
                </span>
              </div>
              <p className="font-display text-[28px] font-semibold text-[#18322D] leading-none mb-1">{s.value}</p>
              <p className="text-[12px] text-[#9CA3AF]">{s.note}</p>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#F0F0EE] p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, hospital, or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] py-2.5 pl-10 pr-4 text-[13px] text-[#18322D] placeholder:text-[#C0C0C0] focus:border-[#1D9E75] focus:outline-none transition-colors"
              />
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilter('All')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${filter === 'All' ? 'bg-[#18322D] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}
              >
                All
              </button>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${filter === f ? 'bg-[#18322D] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort & Upload */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
                className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] py-2.5 px-3 text-[13px] text-[#18322D] focus:border-[#1D9E75] focus:outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <button
                onClick={() => onNavigate('upload')}
                className="flex items-center gap-1.5 rounded-xl bg-[#1D9E75] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#15875f] transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* ── REPORT CARDS ─────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(item => {
              const sc = SCORE_CONFIG(item.healthScore, item.status)
              const st = STATUS_CONFIG[item.status]
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    localStorage.setItem('activeReportId', item.id)
                    onNavigate('report')
                  }}
                  className="group bg-white rounded-2xl border border-[#F0F0EE] hover:border-[#1D9E75]/30 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">

                    {/* Score bar — left accent strip */}
                    <div className={`lg:w-[6px] h-[6px] lg:h-auto rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none ${sc.bar} transition-all`} />

                    {/* Main body */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Left: Meta info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="font-display text-[17px] font-semibold text-[#18322D] leading-tight">{item.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${st.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] flex-wrap">
                            <span className="font-medium text-[#6B7280]">{item.hospital}</span>
                            <span>·</span>
                            <span>{item.category}</span>
                            <span>·</span>
                            <span>{item.date}</span>
                            <span>·</span>
                            <span>{item.fileSize}</span>
                          </div>

                          {/* Findings row */}
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                            {item.findings.slice(0, 3).map((f, i) => (
                              <span key={i} className="flex items-center gap-1.5 text-[12.5px] text-[#4B5563]">
                                {FINDING_ICONS[item.status]}
                                {f}
                              </span>
                            ))}
                            {item.findings.length > 3 && (
                              <span className="text-[12px] text-[#9CA3AF]">+{item.findings.length - 3} more</span>
                            )}
                          </div>
                        </div>

                        {/* Right: Score + trend + CTA */}
                        <div className="flex items-center gap-4 sm:gap-6 shrink-0">

                          {/* Health score pill */}
                          {item.status !== 'Processing' ? (
                            <div className="flex flex-col items-center">
                              <div className={`text-[28px] font-bold leading-none font-display ${sc.text}`}>{item.healthScore}</div>
                              <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.label}`}>{item.healthLabel}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg className="w-7 h-7 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              <span className="mt-1 text-[10px] font-semibold text-blue-400">Analyzing</span>
                            </div>
                          )}

                          {/* Divider */}
                          <div className="hidden sm:block w-px h-10 bg-[#F0F0EE]" />

                          {/* Trend */}
                          <div className="hidden sm:flex flex-col items-center gap-0.5 min-w-[56px]">
                            <div className="flex items-center gap-1">
                              {TREND_ICONS[item.trend]}
                              <span className={`text-[12px] font-semibold ${item.trend === 'up' || item.trend === 'stable' ? 'text-emerald-600' : item.trend === 'pending' ? 'text-blue-500' : 'text-red-500'}`}>
                                {item.trendLabel}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#C0C0C0] uppercase tracking-wider">Trend</span>
                          </div>

                          {/* Divider */}
                          <div className="hidden sm:block w-px h-10 bg-[#F0F0EE]" />

                          {/* CTA */}
                          <button
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1D9E75] hover:text-[#15875f] transition-colors group-hover:gap-2.5"
                            onClick={e => {
                              e.stopPropagation()
                              localStorage.setItem('activeReportId', item.id)
                              onNavigate('report')
                            }}
                          >
                            View
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-[#D1D5DB]">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8F7F2] mb-4">
              <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-[#18322D] mb-1">No reports found</h2>
            <p className="text-[13px] text-[#9CA3AF] mb-6 text-center max-w-xs">
              Try adjusting your filters, or upload your first medical report to get started.
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#15875f] transition-colors"
            >
              Upload a Report
            </button>
          </div>
        )}

      </div>
    </AuthenticatedShell>
  )
}
