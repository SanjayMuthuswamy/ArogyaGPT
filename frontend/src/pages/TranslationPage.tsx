import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface TranslationPageProps {
  onNavigate: (page: string) => void
}

const translations = [
  { language: 'English', status: 'Ready', tone: 'Patient friendly' },
  { language: 'Tamil', status: 'Ready', tone: 'Voice + text' },
  { language: 'Hindi', status: 'Generating', tone: 'Text only' },
  { language: 'Malayalam', status: 'Ready', tone: 'Text only' },
  { language: 'Kannada', status: 'Ready', tone: 'Voice + text' },
  { language: 'Telugu', status: 'Ready', tone: 'Text only' },
  { language: 'Bengali', status: 'Queued', tone: 'Text only' },
]

export default function TranslationPage({ onNavigate }: TranslationPageProps) {
  return (
    <AuthenticatedShell
      title="Translation center"
      subtitle="Translate the report into regional languages with voice support and downloadable copies."
      onNavigate={onNavigate}
      currentPage="translation"
      actionLabel="Open Voice Summary"
      onAction={() => onNavigate('voice')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Available translations</h3>
          <div className="mt-5 space-y-3">
            {translations.map((item) => (
              <div key={item.language} className="flex flex-col gap-3 rounded-[20px] border border-[#EEF5F2] bg-[#FCFDFB] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#18322D]">{item.language}</p>
                  <p className="mt-1 text-xs text-[#8FA49E]">{item.tone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#EAF8F1] px-3 py-1 text-xs font-semibold text-[#1D9E75]">{item.status}</span>
                  <button className="rounded-full border border-[#DCEBE6] px-4 py-2 text-sm font-semibold text-[#18322D]">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#F7FCF9_0%,_#FFFFFF_100%)] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Voice translation</h3>
            <p className="mt-3 text-sm leading-6 text-[#4A5E59]">Generate spoken narration in the same language so patients can listen instead of read.</p>
            <button onClick={() => onNavigate('voice')} className="mt-5 rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-2.5 text-sm font-semibold text-white">
              Start voice translation
            </button>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Delivery options</h3>
            <div className="mt-4 space-y-3 text-sm text-[#4A5E59]">
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Download translated report as PDF.</div>
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Share directly to WhatsApp or email.</div>
              <div className="rounded-[16px] bg-[#F7FCF9] p-3">Print the patient-friendly regional language version.</div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
