import { useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface HistoryPageProps {
  onNavigate: (page: string) => void
}

type Status = 'Completed' | 'Needs Review' | 'Processing' | 'Critical'
type IconType = 'blood' | 'heart' | 'dna' | 'lab' | 'kidney' | 'liver'

interface HistoryItem {
  id: string
  title: string
  hospital: string
  date: string
  fileType: string
  fileSize: string
  iconType: IconType
  status: Status
  healthScore: number
  healthScoreText: string
  findings: string[]
  trend: string
}

const initialHistory: HistoryItem[] = [
  { 
    id: '1', 
    title: 'Complete Blood Count',
    hospital: 'Apollo Diagnostics', 
    date: '24 Jul 2026', 
    fileType: 'PDF',
    fileSize: '2.4 MB',
    iconType: 'blood',
    status: 'Completed', 
    healthScore: 92,
    healthScoreText: 'Excellent',
    findings: [
      'Hemoglobin Normal',
      'RBC Normal',
      'Platelets Normal',
      'No abnormal findings'
    ],
    trend: 'Stable'
  },
  { 
    id: '2', 
    title: 'Lipid Profile',
    hospital: 'Max Healthcare', 
    date: '20 Jul 2026', 
    fileType: 'JPG',
    fileSize: '1.8 MB',
    iconType: 'heart',
    status: 'Needs Review', 
    healthScore: 74,
    healthScoreText: 'Needs Attention',
    findings: [
      'High Cholesterol',
      'Elevated Triglycerides',
      'HDL slightly low',
      'Lifestyle modifications recommended'
    ],
    trend: 'Declined'
  },
  { 
    id: '3', 
    title: 'Fasting Glucose & HbA1c',
    hospital: 'Fortis Diagnostics', 
    date: '15 Jul 2026', 
    fileType: 'PDF',
    fileSize: '950 KB',
    iconType: 'lab',
    status: 'Processing', 
    healthScore: 0,
    healthScoreText: 'Analyzing...',
    findings: [
      'AI analysis in progress...',
      'Extracting parameters...'
    ],
    trend: 'Pending'
  },
  { 
    id: '4', 
    title: 'Renal Function Panel',
    hospital: 'Thyrocare Labs', 
    date: '28 Jun 2026', 
    fileType: 'PDF',
    fileSize: '1.2 MB',
    iconType: 'kidney',
    status: 'Critical', 
    healthScore: 41,
    healthScoreText: 'Critical',
    findings: [
      'Potassium levels dangerously high',
      'eGFR significantly reduced',
      'Creatinine elevated',
      'Consult physician immediately'
    ],
    trend: 'Declined Significantly'
  },
]

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')

  let filteredHistory = history.filter(
    (item) =>
      (statusFilter === 'All' || item.status === statusFilter) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
       item.hospital.toLowerCase().includes(search.toLowerCase()))
  )

  if (sortOrder === 'Oldest') {
    filteredHistory = [...filteredHistory].reverse()
  }

  const getStatusStyle = (status: Status) => {
    switch(status) {
      case 'Completed': return 'bg-[#EAF8F1] text-[#138A52]'
      case 'Needs Review': return 'bg-[#FFF7E8] text-[#C97A00]'
      case 'Processing': return 'bg-[#EEF4FF] text-[#2563EB]'
      case 'Critical': return 'bg-[#FFF1F1] text-[#D14343]'
    }
  }

  const getScoreStyle = (score: number, status: Status) => {
    if (status === 'Processing') return 'bg-gray-50 border-gray-200 text-gray-500'
    if (score >= 85) return 'bg-[#EAF8F1] border-[#A8E5C4] text-[#138A52]'
    if (score >= 60) return 'bg-[#FFF7E8] border-[#FDE0A6] text-[#C97A00]'
    return 'bg-[#FFF1F1] border-[#FCA5A5] text-[#D14343]'
  }

  const getIcon = (type: IconType) => {
    // Standardized emerald green outline icon
    const baseClass = "w-10 h-10 flex items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A] shrink-0"
    
    // Returning standard icons with unified coloring
    switch(type) {
      case 'blood':
      case 'heart':
      case 'kidney':
      case 'dna':
      case 'liver':
      case 'lab':
      default:
        return (
          <div className={baseClass}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )
    }
  }

  const getCheckIcon = (status: Status) => {
    if (status === 'Critical') return <span className="text-red-500 font-bold mr-2 mt-0.5">!</span>
    if (status === 'Needs Review') return <span className="text-amber-500 font-bold mr-2 mt-0.5">⚠</span>
    if (status === 'Processing') return <span className="text-blue-500 font-bold mr-2 mt-0.5">↻</span>
    return <span className="text-[#138A52] font-bold mr-2 mt-0.5">✓</span>
  }

  return (
    <AuthenticatedShell
      title="History"
      subtitle="Browse and manage all your analyzed medical reports."
      onNavigate={onNavigate}
      currentPage="history"
    >
      <div className="max-w-[1280px] mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] min-h-screen font-sans">
        
        {/* 4 Premium Statistics Cards - Compact & Lightweight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reports', value: history.length, subtext: 'Lifetime total', icon: '📄' },
            { label: 'Healthy Reports', value: history.filter(h => h.status === 'Completed').length, subtext: 'In optimal range', icon: '✨' },
            { label: 'Needs Review', value: history.filter(h => h.status === 'Needs Review' || h.status === 'Critical').length, subtext: 'Action recommended', icon: '⚠' },
            { label: 'Last Upload', value: '24 Jul', subtext: 'Apollo Diagnostics', icon: '🕒' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-[16px] border border-[#E5E7EB] p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-medium text-[#6B7280]">{stat.label}</span>
                <span className="text-lg opacity-70">{stat.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-semibold text-[#111827] leading-none tracking-tight">{stat.value}</span>
              </div>
              <p className="text-[13px] text-[#6B7280] mt-1">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Clean Unified Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-8">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search Reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-[14px] font-medium focus:border-gray-400 focus:ring-0 outline-none transition-shadow shadow-sm text-[#111827] placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[14px] border border-[#E5E7EB] bg-white py-2.5 pl-4 pr-10 text-[14px] font-medium focus:border-gray-400 focus:ring-0 outline-none text-[#111827] cursor-pointer hover:bg-gray-50 transition-colors appearance-none shadow-sm"
            >
              <option value="All">Status</option>
              <option value="Completed">Completed</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Critical">Critical</option>
            </select>

            <select 
              className="rounded-[14px] border border-[#E5E7EB] bg-white py-2.5 pl-4 pr-10 text-[14px] font-medium focus:border-gray-400 focus:ring-0 outline-none text-[#111827] cursor-pointer hover:bg-gray-50 transition-colors appearance-none shadow-sm hidden sm:block"
            >
              <option>Hospital</option>
              <option>Apollo Diagnostics</option>
              <option>Max Healthcare</option>
            </select>

            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-[14px] border border-[#E5E7EB] bg-white py-2.5 pl-4 pr-10 text-[14px] font-medium focus:border-gray-400 focus:ring-0 outline-none text-[#111827] cursor-pointer hover:bg-gray-50 transition-colors appearance-none shadow-sm"
            >
              <option value="Newest">Date</option>
              <option value="Oldest">Oldest</option>
            </select>

            <button 
              onClick={() => onNavigate('upload')}
              className="rounded-[14px] bg-[#16A34A] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#15803d] transition-all ml-1"
            >
              + Upload Report
            </button>
          </div>
        </div>

        {/* Medical Report Cards Grid - Compact */}
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="group relative flex flex-col bg-white rounded-[16px] border border-[#E5E7EB] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => onNavigate('dashboard')}
              >
                {/* Top Section */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex gap-3">
                    {getIcon(item.iconType)}
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#111827] leading-tight mb-0.5">{item.title}</h3>
                      <p className="text-[13px] font-medium text-[#6B7280]">
                        {item.hospital} <span className="mx-1">•</span> {item.date} <span className="mx-1">•</span> {item.fileSize}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold tracking-wide border ${getStatusStyle(item.status)} ${item.status === 'Completed' ? 'border-[#A8E5C4]' : item.status === 'Needs Review' ? 'border-[#FDE0A6]' : item.status === 'Critical' ? 'border-[#FCA5A5]' : 'border-blue-200'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Grid Layout for Health Score & Findings to save vertical space */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                  
                  {/* Health Score Section (1 col) */}
                  <div className={`col-span-1 flex flex-col justify-center items-center p-3 rounded-[12px] border ${getScoreStyle(item.healthScore, item.status)}`}>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-1">Health Score</div>
                    <div className="text-[28px] font-bold leading-none mb-1">{item.status === 'Processing' ? '--' : item.healthScore}</div>
                    <div className="text-[13px] font-semibold leading-none">{item.healthScoreText}</div>
                  </div>

                  {/* Key Findings Section (2 cols) */}
                  <div className="col-span-2">
                    <h4 className="text-[14px] font-semibold text-[#111827] mb-2">Key Findings</h4>
                    <ul className="space-y-1.5">
                      {item.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start text-[14px] text-[#4B5563] leading-snug">
                          {getCheckIcon(item.status)}
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer / Trend */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                  {item.status !== 'Processing' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Trend:</span>
                      <span className="text-[13px] font-medium text-[#111827]">{item.trend}</span>
                    </div>
                  ) : <div />}
                  
                  <button className="text-[14px] font-semibold text-[#16A34A] flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    View Report <span className="text-[16px] leading-none pb-[1px]">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[16px] border-2 border-dashed border-[#E5E7EB] bg-white">
            <h2 className="text-[20px] font-bold text-[#111827] mb-2">No reports found</h2>
            <p className="text-[14px] text-[#6B7280] mb-6 max-w-md">
              Your document library is empty. Upload your first medical report to start tracking your health.
            </p>
            <button 
              onClick={() => onNavigate('upload')}
              className="rounded-[14px] bg-[#16A34A] px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors"
            >
              Upload Report
            </button>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  )
}
