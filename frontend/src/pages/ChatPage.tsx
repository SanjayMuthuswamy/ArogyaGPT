import { useState } from 'react'
import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ChatPageProps {
  onNavigate: (page: string) => void
}

const questions = ['What is abnormal?', 'Explain in Tamil', 'What should I eat?', 'Should I consult a doctor?']

export default function ChatPage({ onNavigate }: ChatPageProps) {
  const [message, setMessage] = useState('')

  return (
    <AuthenticatedShell
      title="AI Chat"
      subtitle="Ask clarifying questions about your report in natural language."
      onNavigate={onNavigate}
      currentPage="chat"
      actionLabel="Voice Input"
      onAction={() => onNavigate('chat')}
    >
      <div className="space-y-6">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-[#F7FCF9] p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {questions.map((q) => (
              <button key={q} className="rounded-full border border-[#DCEBE6] bg-white px-3 py-2 text-sm text-[#4A5E59]">
                {q}
              </button>
            ))}
          </div>
          <div className="rounded-[20px] border border-[#E3F1EB] bg-white p-4 text-sm leading-6 text-[#4A5E59]">
            AI: Your blood sugar is above the normal range and may warrant review with a clinician.
          </div>
        </div>

        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-4 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your report..."
            className="min-h-[120px] w-full rounded-[18px] border border-[#DCEBE6] bg-[#FCFDFB] px-4 py-3 text-sm outline-none focus:border-[#1D9E75]"
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-[#8FA49E]">Context-aware responses • voice ready</p>
            <button className="rounded-full bg-gradient-to-r from-[#1D9E75] to-[#059669] px-4 py-2 text-sm font-semibold text-white">Send</button>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
