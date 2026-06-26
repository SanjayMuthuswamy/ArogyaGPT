import AuthenticatedShell from '../components/layout/AuthenticatedShell'

interface SettingsPageProps {
  onNavigate: (page: string) => void
}

const settingGroups = {
  Accessibility: ['Text Size', 'Reduced motion', 'High contrast labels'],
  Voice: ['Voice speed', 'Preferred narrator', 'Auto-play summaries'],
  Theme: ['Light mode', 'Dark mode preview', 'System theme sync'],
  Backup: ['Auto backup to secure vault', 'Export all records'],
  Security: ['Biometric lock', '2-step verification', 'Session timeout'],
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <AuthenticatedShell
      title="Settings"
      subtitle="Manage accessibility, security, backups, and experience preferences."
      onNavigate={onNavigate}
      currentPage="settings"
      actionLabel="View Error States"
      onAction={() => onNavigate('errors')}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(settingGroups).map(([title, items]) => (
          <section key={title} className="rounded-[24px] border border-[#E3F1EB] bg-white p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)]">
            <h3 className="font-display text-xl font-semibold text-[#18322D]">{title}</h3>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={item} className="rounded-[16px] border border-[#EEF5F2] bg-[#FCFDFB] p-3 text-sm text-[#4A5E59]">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="rounded-[24px] border border-[#F8D7D7] bg-[#FFF8F8] p-5 shadow-[0_16px_40px_rgba(24,50,45,0.05)] md:col-span-2">
          <h3 className="font-display text-xl font-semibold text-[#18322D]">Delete account</h3>
          <p className="mt-3 text-sm leading-6 text-[#6B7C77]">Permanently remove stored history, chats, and preferences after confirmation.</p>
          <button className="mt-5 rounded-full border border-[#E84040]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#C23B3B]">Delete account</button>
        </section>
      </div>
    </AuthenticatedShell>
  )
}
