import { useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface UploadReportPageProps {
  onNavigate: (page: string) => void
}

export default function UploadReportPage({ onNavigate }: UploadReportPageProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  return (
    <AuthenticatedShell
      title="Upload Report"
      subtitle="Upload PDFs, images, or scanned documents to start your AI summary."
      onNavigate={onNavigate}
      currentPage="upload"
      actionLabel="Process Report"
      onAction={() => onNavigate('processing')}
    >
      <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#F7FCF9_0%,_#FFFFFF_100%)] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
        <div
          className={`rounded-[24px] border p-8 text-center transition ${dragOver ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-dashed border-[#A8DCCB] bg-white/80'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            setFileName(file?.name || '')
          }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1F5EE] text-[#1D9E75]">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Drop your report here</h3>
          <p className="mt-2 font-body text-sm leading-6 text-[#6B7C77]">PDF, image, or camera scan — upload one or more files and we’ll start instantly.</p>
          <label className="mt-5 inline-flex cursor-pointer rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-2.5 font-body text-sm font-semibold text-white shadow-[0_12px_30px_rgba(29,158,117,0.24)]">
            <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
            Choose Files
          </label>
          {fileName ? <p className="mt-4 font-body text-sm text-[#1D9E75]">Selected: {fileName}</p> : null}
        </div>
      </div>
    </AuthenticatedShell>
  )
}
