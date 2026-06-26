import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ReportViewPage from './pages/ReportViewPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import UploadReportPage from './pages/UploadReportPage'
import ProcessingPage from './pages/ProcessingPage'
import ReportSummaryPage from './pages/ReportSummaryPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import TestValuesPage from './pages/TestValuesPage'
import ValueDetailPage from './pages/ValueDetailPage'
import VoiceSummaryPage from './pages/VoiceSummaryPage'
import TranslationPage from './pages/TranslationPage'
import ExportPage from './pages/ExportPage'
import SettingsPage from './pages/SettingsPage'
import ErrorStatesPage from './pages/ErrorStatesPage'

type Page =
  | 'home'
  | 'upload'
  | 'report'
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'dashboard'
  | 'upload-report'
  | 'processing'
  | 'summary'
  | 'test-values'
  | 'value-detail'
  | 'chat'
  | 'voice'
  | 'translation'
  | 'history'
  | 'export'
  | 'profile'
  | 'settings'
  | 'errors'

type FontSize = 'normal' | 'large' | 'xl'

const fontSizeMap: Record<FontSize, string> = {
  normal: '16px',
  large: '18px',
  xl: '20px',
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  const navigate = (p: string) => {
    setPage(p as Page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFontSize = (size: FontSize) => {
    setFontSize(size)
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[size])
  }

  return (
    <div className={`min-h-screen bg-bg-base fs-${fontSize}`} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Navbar onNavigate={navigate} currentPage={page} fontSize={fontSize} onFontSizeChange={handleFontSize} />

      <main>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'upload' && <UploadPage onNavigate={navigate} />}
        {page === 'report' && <ReportViewPage onNavigate={navigate} />}
        {page === 'signin' && <SignInPage onNavigate={navigate} />}
        {page === 'signup' && <SignUpPage onNavigate={navigate} />}
        {page === 'forgot-password' && <ForgotPasswordPage onNavigate={navigate} />}
        {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {page === 'upload-report' && <UploadReportPage onNavigate={navigate} />}
        {page === 'processing' && <ProcessingPage onNavigate={navigate} />}
        {page === 'summary' && <ReportSummaryPage onNavigate={navigate} />}
        {page === 'test-values' && <TestValuesPage onNavigate={navigate} />}
        {page === 'value-detail' && <ValueDetailPage onNavigate={navigate} />}
        {page === 'chat' && <ChatPage onNavigate={navigate} />}
        {page === 'voice' && <VoiceSummaryPage onNavigate={navigate} />}
        {page === 'translation' && <TranslationPage onNavigate={navigate} />}
        {page === 'history' && <HistoryPage onNavigate={navigate} />}
        {page === 'export' && <ExportPage onNavigate={navigate} />}
        {page === 'profile' && <ProfilePage onNavigate={navigate} />}
        {page === 'settings' && <SettingsPage onNavigate={navigate} />}
        {page === 'errors' && <ErrorStatesPage onNavigate={navigate} />}
      </main>
    </div>
  )
}
