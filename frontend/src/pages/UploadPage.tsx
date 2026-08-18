import { useState, useEffect } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface UploadPageProps {
  onNavigate: (page: string) => void
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete'

const mockRecentUploads = [
  { name: 'Blood_Report_July2026.pdf', size: '2.4 MB', date: 'Jul 24', status: 'Analyzed', type: 'PDF' },
  { name: 'Lipid_Panel_Scan.jpg', size: '1.8 MB', date: 'Jul 20', status: 'Analyzed', type: 'IMG' },
  { name: 'Thyroid_Test_Lab.docx', size: '940 KB', date: 'Jul 15', status: 'Analyzed', type: 'DOCX' },
]

export default function UploadPage({ onNavigate }: UploadPageProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUploadSequence(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      startUploadSequence(e.target.files[0])
    }
  }

  const startUploadSequence = (file: File) => {
    setSelectedFile(file)
    setUploadState('uploading')
    setProgress(0)
    setAnalysisStep(0)
  }

  // Effect to handle simulation sequences
  useEffect(() => {
    if (uploadState === 'uploading') {
      const timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer)
            setUploadState('analyzing')
            return 100
          }
          return p + 5
        })
      }, 100)
      return () => clearInterval(timer)
    }

    if (uploadState === 'analyzing') {
      const timers = [
        setTimeout(() => setAnalysisStep(1), 800),
        setTimeout(() => setAnalysisStep(2), 2000),
        setTimeout(() => setAnalysisStep(3), 3500),
        setTimeout(() => setAnalysisStep(4), 5000),
        setTimeout(() => setUploadState('complete'), 6000),
      ]
      return () => timers.forEach(t => clearTimeout(t))
    }
  }, [uploadState])

  return (
    <AuthenticatedShell
      title="Upload Report"
      subtitle="Upload a medical report for AI-powered analysis and summarization."
      onNavigate={onNavigate}
      currentPage="upload"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload Workflow (70%) */}
        <div className="lg:col-span-8 space-y-6">
          
          {uploadState === 'idle' && (
            <div className="animate-fade-in">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-[#1D9E75] bg-[#E1F5EE]/30 scale-[1.02] shadow-sm'
                    : 'border-gray-300 bg-white hover:border-[#1D9E75]/60 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 z-10 opacity-0 cursor-pointer w-full h-full"
                />

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-[#1D9E75] shadow-sm ring-4 ring-gray-50/50 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  Upload your medical report
                </h2>
                <p className="font-body text-sm text-gray-500 mb-6">
                  Drag & drop your PDF or image, or browse from your device.
                </p>

                <div className="flex flex-col gap-3 mb-8 w-full max-w-xs">
                  <div className="flex justify-between items-center text-xs font-medium text-gray-400">
                    <span>Supported formats:</span>
                    <span className="text-gray-700">PDF • JPG • PNG • DOCX</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium text-gray-400">
                    <span>Maximum file size:</span>
                    <span className="text-gray-700">25 MB</span>
                  </div>
                </div>

                <button className="rounded-xl bg-[#1D9E75] px-8 py-3 font-body text-sm font-semibold text-white shadow-sm hover:bg-[#168562] transition-colors relative z-20 pointer-events-none">
                  Choose File
                </button>
                
                <p className="mt-4 text-xs text-[#1D9E75] font-medium hover:underline cursor-pointer relative z-20" onClick={() => onNavigate('history')}>
                  Browse recent reports
                </p>
              </div>

              {/* Upload Tips */}
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="font-display text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  💡 Tips for better results
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Upload clear scans',
                    'Avoid blurry images',
                    'Include all report pages',
                    'PDF preferred'
                  ].map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-[#1D9E75] font-bold">✓</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-fade-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                  📄
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-base font-semibold text-gray-900 truncate">
                    {selectedFile?.name || 'Document.pdf'}
                  </h4>
                  <p className="text-sm text-gray-500">Uploading...</p>
                </div>
                <span className="font-display text-xl font-bold text-[#1D9E75]">{progress}%</span>
              </div>
              
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#1D9E75] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadState === 'analyzing' && (
            <div className="rounded-2xl border border-[#1D9E75] bg-white p-8 shadow-md animate-fade-in">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1F5EE] text-[#1D9E75]">
                  ✅
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900">Upload Complete</h3>
                  <p className="text-sm text-gray-500">AI is analyzing your report...</p>
                </div>
              </div>

              <div className="space-y-5 pl-4">
                {[
                  { step: 1, label: 'OCR Extraction' },
                  { step: 2, label: 'Reading medical terms' },
                  { step: 3, label: 'Detecting abnormal values' },
                  { step: 4, label: 'Generating AI summary' },
                ].map(({ step, label }) => {
                  const isPast = analysisStep >= step
                  const isCurrent = analysisStep === step - 1
                  return (
                    <div key={step} className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                        isPast ? 'bg-[#1D9E75] text-white' : 
                        isCurrent ? 'bg-yellow-100 text-yellow-600 animate-pulse' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isPast ? '✓' : isCurrent ? '⏳' : step}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        isPast ? 'text-gray-900' : isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Analysis Progress</span>
                  <span>~{5 - analysisStep}s remaining</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#1D9E75] transition-all duration-500 ease-out"
                    style={{ width: `${(analysisStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {uploadState === 'complete' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E1F5EE] text-[#1D9E75] font-bold text-lg">
                    {selectedFile?.name.split('.').pop()?.toUpperCase() || 'PNG'}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-gray-900">{selectedFile?.name || 'Report.pdf'}</h4>
                    <p className="font-body text-sm text-[#1D9E75] flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75]"></span>
                      Successfully Analyzed
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="rounded-xl border border-[#DCEBE6] bg-[#F7FCF9] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">✨</div>
                <h4 className="font-display text-base font-semibold text-[#18322D] mb-2 flex items-center gap-2">
                  <span>✨</span> AI Executive Summary
                </h4>
                <p className="leading-relaxed text-[#4A5E59] text-sm">
                  We successfully extracted and analyzed 5 key medical parameters from this report. 
                  All values appear to be within normal baseline ranges except for fasting glucose, which is slightly elevated.
                </p>
              </div>

              {/* Extracted Values Grid */}
              <div className="space-y-3">
                <h4 className="font-display text-base font-semibold text-gray-900">Extracted Biomarkers</h4>
                <div className="grid gap-3">
                  {[
                    { name: 'Fasting Blood Glucose', value: '112 mg/dL', range: '70 - 99 mg/dL', status: 'High', note: 'Slightly elevated (Prediabetic range)' },
                    { name: 'Hemoglobin A1c (HbA1c)', value: '5.6%', range: '4.0 - 5.6%', status: 'Normal', note: 'Optimal' },
                    { name: 'Total Cholesterol', value: '195 mg/dL', range: '< 200 mg/dL', status: 'Normal', note: 'Desirable level' },
                    { name: 'Systolic Blood Pressure', value: '120 mmHg', range: '90 - 120 mmHg', status: 'Normal', note: 'Optimal' },
                    { name: 'Diastolic Blood Pressure', value: '82 mmHg', range: '60 - 80 mmHg', status: 'Borderline', note: 'Slightly high' },
                  ].map((param, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-[#FCFDFB] hover:bg-gray-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-display text-sm font-semibold text-gray-900">{param.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            param.status === 'High' ? 'bg-red-50 text-red-600' :
                            param.status === 'Borderline' ? 'bg-amber-50 text-amber-600' : 'bg-[#E1F5EE] text-[#1D9E75]'
                          }`}>
                            {param.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{param.note}</p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <div className="font-display text-sm font-bold text-gray-900">{param.value}</div>
                        <div className="text-[10px] text-gray-400">Ref: {param.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="rounded-xl border border-gray-150 bg-gray-50 p-5 space-y-3">
                <h4 className="font-display text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span>💡</span> Recommended Next Steps
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 pl-4 list-disc">
                  <li>Monitor your sugar intake and focus on complex carbohydrates.</li>
                  <li>Schedule a follow-up with your doctor to discuss the fasting blood glucose levels.</li>
                  <li>Consult our AI chat below for personalized health tips.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setUploadState('idle')}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Upload Another
                </button>
                <button
                  onClick={() => onNavigate('chat')}
                  className="rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#168562] transition-colors"
                >
                  Open in AI Chat
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Information Sidebar (30%) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Recent Uploads */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-gray-900 mb-4">Recent Uploads</h3>
            <div className="space-y-1">
              {mockRecentUploads.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer">
                  <div className="overflow-hidden">
                    <p className="font-body text-xs font-semibold text-gray-900 truncate pr-2">{file.name}</p>
                    <p className="font-body text-[10px] text-gray-500">{file.date} · {file.size}</p>
                  </div>
                  <span className="font-body text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-[#1D9E75] group-hover:text-white transition-colors shrink-0">
                    View
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Supported Reports */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-gray-900 mb-4">Supported Reports</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Blood Test',
                'CBC',
                'Lipid Profile',
                'Thyroid',
                'Diabetes',
                'Liver Function',
                'Kidney Function',
              ].map(cat => (
                <span key={cat} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  {cat}
                </span>
              ))}
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-xs rounded-md font-medium border-dashed">
                X-Ray (Coming Soon)
              </span>
            </div>
          </div>

          {/* Card 3: Privacy */}
          <div className="rounded-2xl border border-[#E1F5EE] bg-[#F7FCF9] p-5 shadow-sm">
            <h3 className="font-display text-sm font-bold text-[#18322D] mb-3 flex items-center gap-2">
              🔒 Your reports are private
            </h3>
            <ul className="space-y-2 text-xs text-[#4A5E59]">
              <li className="flex items-center gap-2"><span className="text-[#1D9E75]">•</span> HIPAA Compliant</li>
              <li className="flex items-center gap-2"><span className="text-[#1D9E75]">•</span> End-to-end encryption</li>
              <li className="flex items-center gap-2"><span className="text-[#1D9E75]">•</span> Files processed securely</li>
            </ul>
          </div>

        </div>
      </div>
    </AuthenticatedShell>
  )
}
