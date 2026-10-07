import { useCallback, useRef, useState, type DragEvent } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'
import { api } from '../services/api'

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', flag: '🌐' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', flag: '🇮🇳' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam', flag: '🇮🇳' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳' },
]

const PROCESSING_STEPS = [
  'Reading medical document structural layout & OCR...',
  'Extracting analyte values & biochemical anomalies...',
  'AI clinical verification & risk stratification...',
  'Generating multi-lingual plain language explanations...',
]

interface UploadPageProps {
  onNavigate: (page: string) => void
}

export default function UploadPage({ onNavigate }: UploadPageProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('en')
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processStep, setProcessStep] = useState(-1)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f) return
    setFile(f)
    setUploadProgress(0)
    let p = 0
    const t = window.setInterval(() => {
      p += Math.random() * 25
      if (p >= 100) {
        p = 100
        window.clearInterval(t)
      }
      setUploadProgress(Math.min(p, 100))
    }, 120)
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleSubmit = async () => {
    if (!file) return
    setProcessing(true)
    setUploadError('')
    setProcessStep(0)
    try {
      const report = await api.uploadReport(file, {
        title: file.name.replace(/\.[^/.]+$/, ''),
        report_type: 'Lab Report',
        preferred_language: language,
      })
      localStorage.setItem('activeReportId', report.id)

      // Animate progress steps while polling status
      setProcessStep(1)

      let finished = false
      let attempts = 0
      while (!finished && attempts < 60) {
        attempts++
        await new Promise((r) => window.setTimeout(r, 1000))
        if (attempts === 2) setProcessStep(2)
        if (attempts === 5) setProcessStep(3)

        try {
          const statusCheck = await api.getReport(report.id)
          if (statusCheck.status === 'completed') {
            finished = true
            break
          } else if (statusCheck.status === 'failed') {
            throw new Error('AI analysis failed to extract readable laboratory data from this file.')
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.message.includes('AI analysis failed')) {
            throw error
          }
          // Report may still be processing, keep polling
        }
      }

      if (!finished) {
        throw new Error('Analysis is taking longer than usual. Please check the History tab in a few moments.')
      }

      setProcessStep(PROCESSING_STEPS.length - 1)
      window.setTimeout(() => onNavigate('report'), 500)
    } catch (error: unknown) {
      console.error('Upload failed:', error)
      const apiError = error as {
        response?: {
          data?: {
            message?: string
            detail?: string
          }
        }
        message?: string
      }
      setProcessing(false)
      setUploadError(
        apiError.response?.data?.message ||
          apiError.response?.data?.detail ||
          apiError.message ||
          'Failed to upload and process report.'
      )
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <AuthenticatedShell
      title="Upload Health Report"
      subtitle="Analyze blood work, scans, or pathology sheets with secure medical intelligence."
      onNavigate={onNavigate}
      currentPage="upload"
    >
      <div className="max-w-7xl mx-auto px-1">
        {!processing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Upload Zone & Settings */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Card Container */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
                
                {/* Header inside Upload */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#18322D]">Medical Report Importer</h3>
                    <p className="text-xs text-gray-500 font-body mt-0.5">Upload a single lab report to begin processing</p>
                  </div>
                  <span className="rounded-full bg-[#E1F5EE] px-3 py-1 font-body text-xs font-semibold text-[#1D9E75]">
                    Step 1 of 2
                  </span>
                </div>

                {uploadError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onClick={() => !file && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload zone — drag and drop or click to browse"
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  className={`relative flex h-[320px] w-full cursor-pointer select-none flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all duration-300 ${
                    dragOver
                      ? 'border-[#1D9E75] bg-[#E8F7F2] shadow-[0_16px_40px_rgba(29,158,117,0.12)] scale-[0.99]'
                      : file
                        ? 'border-[#9AD8C7] bg-white shadow-sm'
                        : 'border-dashed border-[#A8DCCB] bg-white hover:border-[#1D9E75] hover:bg-[#F5FCF8]/40 hover:shadow-[0_8px_30px_rgba(24,50,45,0.02)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    aria-label="Choose file"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />

                  {file ? (
                    <div className="flex w-full flex-col items-center gap-5 px-4 text-center">
                      <div className="relative">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8E6] shadow-inner">
                          <svg className="h-8 w-8 text-[#E6A817]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-md">✓</span>
                      </div>
                      
                      <div className="max-w-md">
                        <p className="mb-1 truncate font-body text-base font-bold text-[#18322D]">{file.name}</p>
                        <p className="font-mono text-xs text-[#8FA49E] tracking-wider uppercase">{formatBytes(file.size)}</p>
                      </div>

                      <div className="w-full max-w-[340px] space-y-2">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E7F5EF] p-[2px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] transition-all duration-300 shadow-sm"
                            style={{ width: `${uploadProgress}%` }}
                            role="progressbar"
                            aria-valuenow={uploadProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold">{Math.round(uploadProgress)}% uploaded</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0) }}
                        className="font-body text-xs font-bold text-[#4A5E59] hover:text-[#E84040] transition-colors border border-gray-200 hover:border-red-200 bg-white hover:bg-red-50/50 px-4 py-1.5 rounded-full shadow-sm"
                        aria-label="Remove selected file"
                      >
                        Remove and select another
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 px-8 text-center">
                      <div className="rounded-full bg-[#E8F7F2] p-4 text-[#1D9E75] shadow-inner transition-transform duration-300 hover:scale-105">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-display text-lg font-bold text-[#18322D]">Drag & drop your health report here</p>
                        <p className="font-body text-sm text-[#5C6E69] mt-1">or click to browse local files on your device</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {['PDF', 'JPG', 'PNG'].map((t) => (
                          <span key={t} className="rounded-md border border-[#DCEBE6] bg-[#F9FCFA] px-2.5 py-1 font-mono text-[10px] font-bold text-[#4A5E59] shadow-sm">
                            {t}
                          </span>
                        ))}
                        <span className="text-[11px] text-gray-400 font-medium ml-1">Limit 10MB per file</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Language selector card */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="mb-4 border-b border-gray-100 pb-3">
                  <h3 className="font-display text-base font-bold text-[#18322D]">Explanation Language Target</h3>
                  <p className="text-xs text-gray-500 font-body mt-0.5">Select your preferred vernacular dialect for the AI translation output</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-labelledby="lang-label">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      role="radio"
                      aria-checked={language === lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        language === lang.code
                          ? 'border-transparent bg-[#1D9E75] text-white shadow-md shadow-[#1D9E75]/15 scale-[1.02]'
                          : 'border-[#E2ECE7] bg-white text-[#3E4F4A] hover:border-[#1D9E75]/30 hover:bg-[#F9FCFB]'
                      }`}
                    >
                      <span className="text-xl shrink-0" role="img" aria-label={lang.english}>{lang.flag}</span>
                      <div className="min-w-0">
                        <p className={`font-body text-xs font-bold truncate ${language === lang.code ? 'text-white' : 'text-gray-900'}`}>{lang.native}</p>
                        <p className={`font-body text-[10px] truncate ${language === lang.code ? 'text-white/80' : 'text-gray-500'}`}>{lang.english}</p>
                      </div>
                      {language === lang.code && (
                        <div className="ml-auto shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                          <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!file || uploadProgress < 100}
                  className="w-full sm:w-auto btn-shimmer flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#1D9E75] to-[#059669] px-10 py-4 font-body text-base font-bold text-white shadow-[0_12px_32px_rgba(29,158,117,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(29,158,117,0.28)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Analyze & Simplify Report
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

            </div>

            {/* Right Side: Sidebar Info & Guides */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* HIPAA / Security Info Card */}
              <div className="rounded-2xl border border-emerald-100 bg-[#F4FBF9] p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-150 p-2 text-emerald-800 shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#18322D]">100% Secure & Compliant</h4>
                    <p className="font-body text-xs text-emerald-950/80 leading-relaxed mt-1">
                      Your document is processed via enterprise-grade HIPAA compliant architecture. We use end-to-end encryption, and none of your files are stored permanently or shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              {/* How it works card */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h4 className="font-display text-sm font-bold text-[#18322D] border-b border-gray-100 pb-2.5 mb-3">
                  Processing Overview
                </h4>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">1</span>
                    <div>
                      <h5 className="font-body text-xs font-bold text-gray-900">OCR Layout Analysis</h5>
                      <p className="font-body text-[11px] text-gray-500 mt-0.5">The engine reads the document structure, extracting metrics, reference ranges, and diagnostic labels.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">2</span>
                    <div>
                      <h5 className="font-body text-xs font-bold text-gray-900">Medical Text Simplification</h5>
                      <p className="font-body text-[11px] text-gray-500 mt-0.5">Complex clinical terminology is converted to clear, easy-to-understand terms tailored for you.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">3</span>
                    <div>
                      <h5 className="font-body text-xs font-bold text-gray-900">Diagnostic Synthesis</h5>
                      <p className="font-body text-[11px] text-gray-500 mt-0.5">We synthesize critical findings, highlight alerts, and prepare recommendations for follow-up Q&A.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported reports list */}
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h4 className="font-display text-sm font-bold text-[#18322D] border-b border-gray-100 pb-2.5 mb-3">
                  Optimized Documents
                </h4>
                <ul className="space-y-2">
                  {[
                    'Complete Blood Counts (CBC)',
                    'Lipid Panels (Cholesterol profiles)',
                    'Metabolic Panels (Kidney & Liver)',
                    'Thyroid Function (TSH, Free T4)',
                    'General Biochemistry Reports',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-gray-600 font-medium font-body">
                      <span className="text-emerald-500 shrink-0">✔</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        ) : (
          /* Processing state card */
          <div className="max-w-[640px] mx-auto rounded-2xl border border-[#E3F1EB] bg-white p-10 text-center shadow-md">
            <div className="mb-8">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F7F2] shadow-inner">
                <svg className="h-8 w-8 animate-spin text-[#1D9E75]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                  <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-[#18322D]">Synthesizing Your Report...</h2>
              <p className="mt-1 font-body text-xs text-[#8FA49E] font-medium">This typically takes 15–20 seconds</p>
            </div>

            <div className="mx-auto max-w-sm space-y-3.5 text-left border border-gray-100 bg-[#FAFBF9] p-6 rounded-xl shadow-inner" role="status" aria-live="polite">
              {PROCESSING_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3.5">
                  {i < processStep ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE]">
                      <svg className="h-3 w-3 text-[#1D9E75]" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : i === processStep ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-[#1D9E75] animate-pulse" />
                    </span>
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border border-[#DCEBE6] bg-white" />
                  )}
                  <span className={`font-body text-xs transition-colors ${i <= processStep ? 'text-[#18322D] font-bold' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-[11px] text-gray-400 font-semibold">
              ⚠️ Please do not close this window or refresh the page.
            </p>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  )
}
