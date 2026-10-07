import { useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'
import { api } from '../services/api'

interface VoiceSummaryPageProps {
  onNavigate: (page: string) => void
}

const LANGUAGES = [
  { label: 'English', code: 'en' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Hindi', code: 'hi' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Telugu', code: 'te' },
  { label: 'Bengali', code: 'bn' },
]

const SPEEDS = ['0.75x', '1.0x', '1.25x', '1.5x']

export default function VoiceSummaryPage({ onNavigate }: VoiceSummaryPageProps) {
  const [selectedLang, setSelectedLang] = useState('ta')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const reportId = localStorage.getItem('activeReportId') ?? ''

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const summaryText =
        'Your blood sugar is significantly elevated and requires medical attention. ' +
        'Blood count is largely normal with minor dips in hemoglobin and platelets. ' +
        'An appointment with your physician is strongly advised.'
      const result = await api.generateVoice({
        text: summaryText,
        language_code: selectedLang,
        report_id: reportId || undefined,
      })
      if (result?.audio_file_url) {
        setAudioUrl(result.audio_file_url)
      } else {
        setError('Voice generated but no audio URL returned. Backend may need TTS configured.')
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } }
      setError(apiError.response?.data?.detail ?? 'Voice generation failed. Please try again.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (!audioUrl) { handleGenerate(); return }
    if (audio) {
      audio.play()
      setIsPlaying(true)
    } else {
      const a = new Audio(audioUrl)
      a.onended = () => setIsPlaying(false)
      a.play()
      setAudio(a)
      setIsPlaying(true)
    }
  }

  const handlePause = () => { audio?.pause(); setIsPlaying(false) }
  const handleResume = () => { audio?.play(); setIsPlaying(true) }

  return (
    <AuthenticatedShell
      title="Voice summary"
      subtitle="Listen to your simplified report in your preferred language and playback style."
      onNavigate={onNavigate}
      currentPage="voice"
      actionLabel="Open Translation"
      onAction={() => onNavigate('translation')}
    >
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-[linear-gradient(135deg,_#10322E_0%,_#135B4B_100%)] p-6 text-white shadow-[0_18px_48px_rgba(16,50,46,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#78D3BC]">
            {audioUrl ? 'Narration ready' : 'Generate narration'}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Your medical summary, explained gently.</h2>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            {!audioUrl && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-full bg-[#1D9E75] px-6 py-3 text-sm font-semibold transition hover:bg-[#168562] disabled:opacity-60"
              >
                {isGenerating ? 'Generating...' : 'Generate Voice'}
              </button>
            )}
            {audioUrl && (
              <>
                <button onClick={handlePlay} disabled={isPlaying}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-50">
                  Play
                </button>
                <button onClick={handlePause} disabled={!isPlaying}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-50">
                  Pause
                </button>
                <button onClick={handleResume} disabled={isPlaying}
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:opacity-50">
                  Resume
                </button>
              </>
            )}
          </div>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full bg-gradient-to-r from-[#78D3BC] to-[#E6A817] transition-all duration-300 ${isPlaying ? 'w-2/3' : 'w-0'}`} />
          </div>
          <p className="mt-3 text-sm text-white/75">
            {audioUrl ? (isPlaying ? 'Playing...' : 'Paused') : 'Select language then generate voice narration.'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Playback controls</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SPEEDS.map((item) => (
                <div key={item} className="rounded-[18px] border border-[#E3F1EB] bg-[#F7FCF9] px-4 py-3 text-sm font-medium text-[#18322D] text-center">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">Language selection</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setSelectedLang(lang.code); setAudioUrl(null); setAudio(null); setIsPlaying(false) }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-[#1D9E75] text-white'
                      : 'border border-[#DCEBE6] bg-white text-[#18322D] hover:bg-[#EAF8F1]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
