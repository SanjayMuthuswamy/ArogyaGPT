import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import ChatPage from './pages/ChatPage'
import MedicalLibraryPage from './pages/MedicalLibraryPage'
import HistoryPage from './pages/HistoryPage'

import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

// Protected page paths
const PROTECTED_PATHS = [
  '/dashboard',
  '/upload',
  '/chat',
  '/library',
  '/history',

  '/profile'
]

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Route Guarding: check route changes and auth state
  useEffect(() => {
    const isProtected = PROTECTED_PATHS.includes(location.pathname)
    if (isProtected && !isLoggedIn) {
      navigate('/signin')
    } else if (isLoggedIn && (location.pathname === '/signin' || location.pathname === '/signup')) {
      navigate('/dashboard')
    }
  }, [location.pathname, isLoggedIn, navigate])

  const handleNavigate = (pageKey: string) => {
    // Map page keys used in legacy callbacks to URL routes
    const pageRouteMap: Record<string, string> = {
      home: '/',
      signin: '/signin',
      signup: '/signup',
      dashboard: '/dashboard',
      upload: '/upload',
      chat: '/chat',
      library: '/library',
      history: '/history',
      settings: '/settings',
      profile: '/profile',
    }

    const route = pageRouteMap[pageKey] || pageKey
    navigate(route)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/')
  }

  const isAppPage = PROTECTED_PATHS.includes(location.pathname)
  const shouldHideNavbar = isAppPage || location.pathname === '/signin' || location.pathname === '/signup'

  // Map route path back to pageKey for legacy navbar active highlighting
  const getPageKey = () => {
    if (location.pathname === '/') return 'home'
    return location.pathname.substring(1)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Global Navbar: only on public pages, excluding auth pages */}
      {!shouldHideNavbar && (
        <Navbar
          onNavigate={handleNavigate}
          currentPage={getPageKey()}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
        <Route
          path="/signin"
          element={
            <AuthPage
              onNavigate={handleNavigate}
              onLoginSuccess={() => setIsLoggedIn(true)}
              initialMode="signin"
            />
          }
        />
        <Route
          path="/signup"
          element={
            <AuthPage
              onNavigate={handleNavigate}
              onLoginSuccess={() => setIsLoggedIn(true)}
              initialMode="signup"
            />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <DashboardPage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/upload"
          element={
            isLoggedIn ? (
              <UploadPage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            isLoggedIn ? (
              <ChatPage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/library"
          element={
            isLoggedIn ? (
              <MedicalLibraryPage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/history"
          element={
            isLoggedIn ? (
              <HistoryPage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <ProfilePage onNavigate={handleNavigate} />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
