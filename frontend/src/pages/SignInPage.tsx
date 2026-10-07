import AuthPage from './AuthPage'

interface SignInPageProps {
  onNavigate: (page: string) => void
  onSignIn?: () => void
}

export default function SignInPage({ onNavigate, onSignIn }: SignInPageProps) {
  return <AuthPage onNavigate={onNavigate} onLoginSuccess={onSignIn} initialMode="signin" />
}
