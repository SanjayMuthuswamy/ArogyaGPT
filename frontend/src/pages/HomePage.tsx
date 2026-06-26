import Hero from '../components/dashboard/Hero'
import HowItWorks from '../components/dashboard/HowItWorks'
import LanguageSection from '../components/dashboard/LanguageSection'
import Footer from '../components/layout/Footer'

interface HomePageProps {
  onNavigate: (page: 'home' | 'upload' | 'report' | 'signin' | 'signup') => void
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col">
      <Hero onNavigate={onNavigate} />
      <HowItWorks />
      <LanguageSection />
      <Footer onNavigate={onNavigate} />
    </div>
  )
}

export { HomePage }
export default HomePage
