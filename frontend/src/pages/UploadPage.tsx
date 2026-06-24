import { useCallback, useRef, useState, type DragEvent } from 'react'

const LANGUAGES = [
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
]

const PROCESSING_STEPS = [
  'Reading your PDF...',
  'Identifying medical terms...',
  'Simplifying content...',
  'Translating to selected language...',
]

interface UploadPageProps {
  onNavigate: (page: 'home' | 'upload' | 'report') => void
}

export default function UploadPage({ onNavigate }: UploadPageProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState('ta')
  const [processing, setProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processStep, setProcessStep] = useState(-1)
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
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessStep(i)
      await new Promise((r) => window.setTimeout(r, 1200))
    }
    window.setTimeout(() => onNavigate('report'), 400)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] pt-16">
      <div className="pointer-events-none fixed right-0 top-0 h-96 w-96 overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 400 400" className="h-full w-full opacity-[0.04]">
          <ellipse cx="300" cy="100" rx="200" ry="180" fill="#1D9E75" />
        </svg>
      </div>

      <main className="flex flex-1 flex-col items-center justify-start px-6 pb-20 pt-16">
        <div className="scroll-reveal w-full max-w-[760px]">
          <div className="mb-10 text-center">
            <span className="mb-5 inline-block rounded-full bg-[#E1F5EE] px-3 py-1 font-body text-sm font-medium text-[#1D9E75]">
              Step 1 of 1
            </span>
            <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.02em] text-[#18322D] md:text-3xl">
              Upload Your Medical Report
            </h1>
            <p className="font-body text-[1.02rem] text-[#4A5E59]">
              Supported formats: PDF, JPG, PNG · Max size: 10 MB
            </p>
          </div>

          {!processing ? (
            <>
              <div
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload zone — drag and drop or click to browse"
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                className={`relative flex h-[300px] w-full cursor-pointer select-none flex-col items-center justify-center rounded-[24px] border p-6 transition-all duration-300 ${
                  dragOver
                    ? 'border-[#1D9E75] bg-[#E1F5EE] shadow-[0_20px_50px_rgba(29,158,117,0.12)]'
                    : file
                      ? 'border-[#9AD8C7] bg-white shadow-[0_16px_40px_rgba(24,50,45,0.08)]'
                      : 'border-dashed border-[#A8DCCB] bg-white/80 shadow-[0_14px_34px_rgba(24,50,45,0.06)] hover:border-[#1D9E75] hover:bg-[#F5FCF8]'
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" aria-label="Choose file" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

                {file ? (
                  <div className="flex w-full flex-col items-center gap-4 px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#FFF4D6]">
                      <svg className="h-7 w-7 text-[#E6A817]" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 8 H16 M8 12 H14 M8 16 H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="mb-1 max-w-[320px] truncate font-body text-lg font-semibold text-[#18322D]">{file.name}</p>
                      <p className="font-body text-sm text-[#8FA49E]">{formatBytes(file.size)}</p>
                    </div>
                    <div className="h-2 w-full max-w-[320px] overflow-hidden rounded-full bg-[#E7F5EF]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] transition-all duration-300" style={{ width: `${uploadProgress}%` }} role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0) }} className="font-body text-sm text-[#8FA49E] transition hover:text-[#E84040]" aria-label="Remove selected file">
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-8 text-center">
                    <div className={`upload-pulse-ring rounded-full p-3 transition-transform duration-300 ${dragOver ? '-translate-y-1' : ''}`}>
                      <svg className="h-16 w-16 text-[#1D9E75]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
                        <path d="M32 44 L32 24 M22 32 L32 22 L42 32" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 48 H42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4" />
                      </svg>
                    </div>
                    <p className="font-display text-xl font-medium text-[#18322D]">{dragOver ? 'Release to upload' : 'Drop your report here'}</p>
                    <p className="font-body text-base text-[#4A5E59]">
                      <span className="hidden sm:inline">or click to browse your files</span>
                      <span className="sm:hidden">tap to browse</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {['PDF', 'JPG', 'PNG'].map((t) => (
                        <span key={t} className="rounded-full border border-[#DCEBE6] bg-[#F9FCFA] px-2.5 py-1 font-mono text-[0.7rem] text-[#4A5E59]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <p className="mb-4 font-body text-sm text-[#4A5E59]" id="lang-label">Select explanation language:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap" role="radiogroup" aria-labelledby="lang-label">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      role="radio"
                      aria-checked={language === lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 font-body text-sm transition-all ${language === lang.code ? 'border-transparent bg-[#1D9E75] text-white shadow-[0_10px_24px_rgba(29,158,117,0.18)]' : 'border-[#DCEBE6] bg-white text-[#4A5E59] hover:border-[#1D9E75]/40 hover:text-[#1D9E75]'}`}
                    >
                      {language === lang.code && (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M5 10.5L8.5 14L15 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span>{lang.native} · {lang.english}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-[20px] border border-[#E1F5EE] bg-[#F7FCF9] px-4 py-3 text-center">
                {['HIPAA Compliant', 'Encrypted', 'No Data Stored'].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1 font-body text-sm text-[#4A5E59] shadow-[0_6px_18px_rgba(24,50,45,0.04)]">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="btn-shimmer min-h-[56px] rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-12 py-[16px] font-body text-lg font-semibold text-white shadow-[0_16px_40px_rgba(29,158,117,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(29,158,117,0.28)]"
                  aria-disabled={!file}
                >
                  Simplify My Report →
                </button>
              </div>
            </>
          ) : (
            <div className="animate-fade-in rounded-[24px] border border-[#E3F1EB] bg-white p-10 text-center shadow-[0_16px_40px_rgba(24,50,45,0.06)]">
              <div className="mb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E1F5EE]">
                  <svg className="h-8 w-8 animate-spin text-[#1D9E75]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="mb-2 font-display text-xl font-medium text-[#18322D]">Analysing your report...</h2>
              </div>

              <div className="mx-auto max-w-xs space-y-4 text-left" role="status" aria-live="polite">
                {PROCESSING_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    {i < processStep ? (
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#E1F5EE]">
                        <svg className="h-3 w-3 text-[#1D9E75]" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : i === processStep ? (
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1D9E75] animate-pulse" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 flex-shrink-0 rounded-full border border-[#DCEBE6]" />
                    )}
                    <span className={`font-body text-base transition-colors ${i <= processStep ? 'text-[#18322D]' : 'text-[#8FA49E]'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-8 font-body text-sm text-[#8FA49E]">Usually takes 15–30 seconds</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
