import AuthPage from './AuthPage'

interface SignUpPageProps {
  onNavigate: (page: string) => void
  onSignUp?: () => void
}

export default function SignUpPage({ onNavigate, onSignUp }: SignUpPageProps) {
  return <AuthPage onNavigate={onNavigate} onLoginSuccess={onSignUp} initialMode="signup" />
}
