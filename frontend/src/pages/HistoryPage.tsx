import { useState, useEffect } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'
import { api, ReportItem } from '../services/api'

interface HistoryPageProps {
  onNavigate: (page: string) => void
}

type FilterStatus = 'All' | 'Completed' | 'Processing' | 'Failed'

function getStatus(r: ReportItem): FilterStatus {
  if (r.status === 'completed') return 'Completed'
  if (r.status === 'processing' || r.status === 'pending') return 'Processing'
  if (r.status === 'failed') return 'Failed'
  return 'Completed'
}

const STATUS_CONFIG: Record<FilterStatus, { pill: string; dot: string; label: string }> = {
  All:        { pill: '', dot: '', label: 'All' },
  Completed:  { pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500', label: 'Completed' },
  Processing: { pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',          dot: 'bg-blue-400',   label: 'Processing' },
  Failed:     { pill: 'bg-red-50 text-red-700 ring-1 ring-red-200',             dot: 'bg-red-500',    label: 'Failed'     },
}

const FILTERS: FilterStatus[] = ['Completed', 'Processing', 'Failed']

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<FilterStatus>('All')
  const [sort, setSort]         = useState<'newest' | 'oldest'>('newest')
  const [items, setItems]       = useState<ReportItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError]       = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.listReports({ per_page: 100 })
      .then(res => {
        setItems(res.items ?? [])
        setError('')
      })
      .catch(err => {
        console.warn('Could not load reports:', err)
        setError('Failed to load report history. Please refresh.')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.deleteReport(id)
      setItems(prev => prev.filter(r => r.id !== id))
    } catch {
      alert('Failed to delete report. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = items
    .filter(r => {
      const matchFilter = filter === 'All' || getStatus(r) === filter
      const q = search.toLowerCase()
      const matchSearch = !q || (r.title || '').toLowerCase().includes(q) ||
        (r.report_type || '').toLowerCase().includes(q) ||
        (r.hospital_name || '').toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
    .sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return sort === 'newest' ? diff : -diff
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleRowsPerPageChange = (v: number) => { setRowsPerPage(v); setCurrentPage(1) }

  const totalReports = items.length
  const completed    = items.filter(r => getStatus(r) === 'Completed').length
  const processing   = items.filter(r => getStatus(r) === 'Processing').length
  const lastUpload   = items.length > 0
    ? new Date(items.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b).created_at)
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <AuthenticatedShell
      title="Report History"
      subtitle="All your analyzed medical reports in one place."
      onNavigate={onNavigate}
      currentPage="history"
    >
      <div className="max-w-[1120px] mx-auto space-y-7">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Reports', value: totalReports, note: 'Lifetime total',
              accent: '#1D9E75', bg: '#E8F7F2',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            },
            {
              label: 'Completed', value: completed, note: 'Analysis finished',
              accent: '#059669', bg: '#D1FAE5',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            },
            {
              label: 'Processing', value: processing, note: 'Being analyzed',
              accent: '#2563EB', bg: '#EFF6FF',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            },
            {
              label: 'Last Upload', value: lastUpload, note: 'Most recent upload',
              accent: '#7C3AED', bg: '#EDE9FE',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#F0F0EE] p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[13px] font-medium text-[#6B7280]">{s.label}</p>
                <span className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: s.bg, color: s.accent }}>{s.icon}</span>
              </div>
              <p className="font-display text-[28px] font-semibold text-[#18322D] leading-none mb-1">{s.value}</p>
              <p className="text-[12px] text-[#9CA3AF]">{s.note}</p>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bg-white rounded-2xl border border-[#F0F0EE] p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, hospital, or type…"
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

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#F0F0EE]">
            <svg className="w-10 h-10 text-[#1D9E75] animate-spin mb-4" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-[14px] text-[#6B7280] font-medium">Loading your reports…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-red-100">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#15875f] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : paginated.length > 0 ? (
          <div className="space-y-3">
            {paginated.map(item => {
              const status = getStatus(item)
              const st = STATUS_CONFIG[status]
              const dateStr = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              const isProcessing = status === 'Processing'
              return (
                <div
                  key={item.id}
                  onClick={() => { localStorage.setItem('activeReportId', item.id); onNavigate('report') }}
                  className="group bg-white rounded-2xl border border-[#F0F0EE] hover:border-[#1D9E75]/30 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Status accent strip */}
                    <div className={`lg:w-[6px] h-[6px] lg:h-auto rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none transition-all ${
                      status === 'Completed' ? 'bg-emerald-500' : status === 'Processing' ? 'bg-blue-400' : 'bg-red-500'
                    }`} />

                    {/* Main body */}
                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                        {/* Left: info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="font-display text-[17px] font-semibold text-[#18322D] leading-tight">{item.title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${st.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${isProcessing ? 'animate-pulse' : ''}`} />
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] flex-wrap">
                            {item.hospital_name && <span className="font-medium text-[#6B7280]">{item.hospital_name}</span>}
                            {item.hospital_name && <span>·</span>}
                            {item.report_type && <span>{item.report_type}</span>}
                            {item.report_type && <span>·</span>}
                            <span>{dateStr}</span>
                          </div>

                          {/* Summary snippet if available */}
                          {(() => {
                            const summaryText = 'summary' in item && typeof (item as { summary?: unknown }).summary === 'string'
                              ? (item as { summary: string }).summary
                              : ''
                            return summaryText ? (
                              <p className="mt-2 text-[12.5px] text-[#4B5563] line-clamp-1">{summaryText}</p>
                            ) : null
                          })()}
                        </div>

                        {/* Right: CTA */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Delete */}
                          <button
                            onClick={e => handleDelete(e, item.id)}
                            disabled={deleting === item.id}
                            className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete report"
                          >
                            {deleting === item.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                                <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>

                          {/* View */}
                          <button
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1D9E75] hover:text-[#15875f] transition-colors group-hover:gap-2.5"
                            onClick={e => { e.stopPropagation(); localStorage.setItem('activeReportId', item.id); onNavigate('report') }}
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
        ) : filtered.length > 0 ? (
          /* All items on this filter but current page is empty — reset handled by handlers */
          null
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
              {search || filter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Upload your first medical report to get started.'}
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-[#15875f] transition-colors"
            >
              Upload a Report
            </button>
          </div>
        )}

        {/* ── PAGINATION FOOTER ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-[#F0F0EE] px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={e => handleRowsPerPageChange(Number(e.target.value))}
                className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-1 text-[12px] text-[#18322D] focus:border-[#1D9E75] focus:outline-none"
              >
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                {filtered.length === 0 ? '0' : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filtered.length)}`} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-semibold text-[#18322D] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Prev
              </button>
              <span className="text-[12px] font-semibold text-[#18322D] min-w-[60px] text-center">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-semibold text-[#18322D] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </AuthenticatedShell>
  )
}
