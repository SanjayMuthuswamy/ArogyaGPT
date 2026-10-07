import Hero from '../components/dashboard/Hero'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorks from '../components/dashboard/HowItWorks'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import FAQSection from '../components/landing/FAQSection'

interface HomePageProps {
  onNavigate: (page: string) => void
  isLoggedIn?: boolean
}

export default function HomePage({ onNavigate, isLoggedIn }: HomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      <Hero onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <FeaturesSection onNavigate={onNavigate} />
      <HowItWorks />
      <TestimonialsSection />
      <FAQSection />
    </div>
  )
}
