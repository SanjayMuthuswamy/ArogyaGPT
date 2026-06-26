import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface VoiceSummaryPageProps {
  onNavigate: (page: string) => void
}

const languages = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Kannada', 'Telugu', 'Bengali']

export default function VoiceSummaryPage({ onNavigate }: VoiceSummaryPageProps) {
  return (
    <AuthenticatedShell
      title="Voice summary"
      subtitle="Listen to your simplified report in your preferred language and playback style."
      onNavigate={onNavigate}
      currentPage="voice"
      actionLabel="Open Translation"
      onAction={() => onNavigate('translation')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#10322E_0%,_#135B4B_100%)] p-6 text-white shadow-[0_18px_48px_rgba(16,50,46,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#78D3BC]">Narration ready</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Your medical summary, explained gently.</h2>
          <div className="mt-8 flex items-center gap-4">
            {['Play', 'Pause', 'Resume'].map((label) => (
              <button key={label} className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15">
                {label}
              </button>
            ))}
          </div>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#78D3BC] to-[#E6A817]" />
          </div>
          <p className="mt-3 text-sm text-white/75">2:18 of 3:29 • Clear pronunciation for patient-friendly understanding.</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Playback controls</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['0.75x', '1.0x', '1.25x', '1.5x', 'Male Voice', 'Female Voice'].map((item) => (
                <div key={item} className="rounded-[18px] border border-[#E3F1EB] bg-[#F7FCF9] px-4 py-3 text-sm font-medium text-[#18322D]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Language selection</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {languages.map((language, index) => (
                <button key={language} className={`rounded-full px-4 py-2 text-sm font-semibold ${index === 1 ? 'bg-[#1D9E75] text-white' : 'border border-[#DCEBE6] bg-white text-[#18322D]'}`}>
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
