import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface ProfilePageProps {
  onNavigate: (page: string) => void
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <AuthenticatedShell
      title="Profile"
      subtitle="Personalize your language, notifications, and privacy preferences."
      onNavigate={onNavigate}
      currentPage="profile"
      actionLabel="Save"
      onAction={() => onNavigate('dashboard')}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Preferences</h3>
          <div className="mt-4 space-y-3 text-sm text-[#4A5E59]">
            <div className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3">Language: Tamil</div>
            <div className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3">Voice speed: Normal</div>
            <div className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3">Theme: Light</div>
          </div>
        </div>
        <div className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Security</h3>
          <div className="mt-4 space-y-3 text-sm text-[#4A5E59]">
            <div className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3">2-step verification: Enabled</div>
            <div className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3">Private AI processing: On</div>
          </div>
        </div>
      </div>
    </AuthenticatedShell>
  )
}
