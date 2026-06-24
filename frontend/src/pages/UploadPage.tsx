import { useState, useCallback, useRef } from 'react'

const LANGUAGES = [
  { code: 'ta', native: 'தமிழ்',   english: 'Tamil' },
  { code: 'hi', native: 'हिन्दी',  english: 'Hindi' },
  { code: 'te', native: 'తెలుగు',  english: 'Telugu' },
  { code: 'kn', native: 'ಕನ್ನಡ',   english: 'Kannada' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'bn', native: 'বাংলা',   english: 'Bengali' },
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
  const [dragOver, setDragOver]         = useState(false)
  const [file, setFile]                 = useState<File | null>(null)
  const [language, setLanguage]         = useState('ta')
  const [processing, setProcessing]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processStep, setProcessStep]   = useState(-1)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f) return
    setFile(f)
    let p = 0
    const t = setInterval(() => {
      p += Math.random() * 25
      if (p >= 100) { p = 100; clearInterval(t) }
      setUploadProgress(Math.min(p, 100))
    }, 120)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
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
      await new Promise(r => setTimeout(r, 1200))
    }
    // Simulate done — navigate to report view
    setTimeout(() => onNavigate('report'), 400)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-bg-base pt-16 flex flex-col">
      {/* Subtle blob */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 400 400" className="w-full h-full opacity-[0.03]">
          <ellipse cx="300" cy="100" rx="200" ry="180" fill="#7ECFC2" />
        </svg>
      </div>

      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-20">
        <div className="w-full max-w-[720px] animate-slide-up">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-block font-body text-sm px-3 py-1 rounded-full
                              bg-brand-glow/15 text-brand-primary mb-5">
              Step 1 of 1
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-text-primary
                           tracking-[-0.02em] mb-3">
              Upload Your Medical Report
            </h1>
            <p className="font-body text-md text-text-secondary">
              Supported formats: PDF, JPG, PNG · Max size: 10 MB
            </p>
          </div>

          {/* Upload Zone */}
          {!processing ? (
            <>
              <div
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload zone — drag and drop or click to browse"
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                className={`relative w-full h-[280px] rounded-xl flex flex-col items-center justify-center
                            transition-all duration-base ease-smooth cursor-pointer select-none
                            ${dragOver
                              ? 'border-2 border-solid border-brand-primary bg-brand-glow/4 upload-glow'
                              : file
                                ? 'border-2 border-solid border-brand-glow/40 bg-bg-surface'
                                : 'border-2 border-dashed border-brand-primary/20 bg-bg-surface hover:border-brand-primary/40 hover:bg-brand-glow/3'
                            }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  aria-label="Choose file"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {file ? (
                  /* File selected state */
                  <div className="flex flex-col items-center gap-4 px-8 w-full">
                    <div className="w-14 h-14 rounded-xl bg-accent-gold/12 flex items-center justify-center">
                      <svg className="w-7 h-7 text-accent-gold" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 8 H16 M8 12 H14 M8 16 H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M17 14 L24 21 M24 14 L17 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="hidden" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="font-body text-lg font-medium text-text-primary mb-1 truncate max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="font-body text-sm text-text-muted">{formatBytes(file.size)}</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full max-w-[320px] h-1 bg-brand-glow/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-slow ease-smooth"
                        style={{ width: `${uploadProgress}%` }}
                        role="progressbar"
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Upload progress"
                      />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); setUploadProgress(0) }}
                      className="font-body text-sm text-text-muted hover:text-status-critical
                                 transition-colors duration-fast"
                      aria-label="Remove selected file"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  /* Default state */
                  <div className="flex flex-col items-center gap-3 px-8">
                    <div className={`transition-transform duration-base ease-spring ${dragOver ? '-translate-y-1' : ''}`}>
                      <svg
                        className="w-16 h-16 text-brand-primary"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
                        <path d="M32 44 L32 24 M22 32 L32 22 L42 32"
                              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 48 H42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4" />
                      </svg>
                    </div>
                    <p className="font-display text-xl font-medium text-text-primary">
                      {dragOver ? 'Release to upload' : 'Drop your report here'}
                    </p>
                    <p className="font-body text-base text-text-muted">
                      or click to browse your files
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {['PDF', 'JPG', 'PNG'].map(t => (
                        <span
                          key={t}
                          className="font-mono text-xs px-2.5 py-1 rounded-sm bg-bg-base
                                     text-text-muted border border-[rgba(46,125,107,0.1)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language selector */}
              <div className="mt-8">
                <p className="font-body text-sm text-text-secondary mb-4" id="lang-label">
                  Select explanation language:
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-labelledby="lang-label"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      role="radio"
                      aria-checked={language === lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`lang-chip font-body text-sm px-4 py-2.5 rounded-full
                                   min-h-[44px] border
                                   ${language === lang.code
                                     ? 'bg-brand-primary text-text-inverse border-transparent'
                                     : 'bg-bg-surface text-text-secondary border-[rgba(46,125,107,0.15)] hover:border-brand-glow/40'
                                   }`}
                    >
                      {lang.native} · {lang.english}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={!file}
                  className={`font-body font-medium text-lg px-12 py-[18px] rounded-md
                               transition-all duration-base ease-smooth min-h-[56px]
                               ${file
                                 ? 'bg-brand-primary text-text-inverse hover:bg-brand-secondary hover:shadow-elevated'
                                 : 'bg-text-muted/20 text-text-muted cursor-not-allowed'
                               }`}
                  aria-disabled={!file}
                >
                  Simplify My Report →
                </button>
              </div>
            </>
          ) : (
            /* Processing State */
            <div className="bg-bg-surface rounded-xl border border-[rgba(46,125,107,0.1)] p-10 text-center animate-fade-in">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-brand-primary animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-display text-xl font-medium text-text-primary mb-2">
                  Analysing your report...
                </h2>
              </div>

              <div className="space-y-4 text-left max-w-xs mx-auto" role="status" aria-live="polite">
                {PROCESSING_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    {i < processStep ? (
                      <div className="w-5 h-5 rounded-full bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-brand-primary" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M2 6 L5 9 L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : i === processStep ? (
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-glow animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-text-muted/30 flex-shrink-0" />
                    )}
                    <span
                      className={`font-body text-base transition-colors duration-base
                        ${i <= processStep ? 'text-text-primary' : 'text-text-muted'}`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <p className="font-body text-sm text-text-muted mt-8">
                Usually takes 15–30 seconds
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
