import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ReportViewPage from './pages/ReportViewPage'

type Page = 'home' | 'upload' | 'report'
type FontSize = 'normal' | 'large' | 'xl'

const fontSizeMap: Record<FontSize, string> = {
  normal: '16px',
  large:  '18px',
  xl:     '20px',
}

export default function App() {
  const [page, setPage]       = useState<Page>('home')
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFontSize = (size: FontSize) => {
    setFontSize(size)
    document.documentElement.style.setProperty('--font-size-base', fontSizeMap[size])
  }

  return (
    <div
      className={`min-h-screen bg-bg-base fs-${fontSize}`}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <Navbar
        onNavigate={navigate}
        currentPage={page}
        fontSize={fontSize}
        onFontSizeChange={handleFontSize}
      />

      <main>
        {page === 'home'   && <HomePage   onNavigate={navigate} />}
        {page === 'upload' && <UploadPage onNavigate={navigate} />}
        {page === 'report' && <ReportViewPage onNavigate={navigate} />}
      </main>
    </div>
  )
}
