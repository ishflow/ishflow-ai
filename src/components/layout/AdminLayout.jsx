import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { auth } from '../../lib/supabase'

// Page title mapping
const pageTitles = {
  '/partner/dashboard': 'Dashboard',
  '/partner/services': 'Servisler',
  '/partner/staff': 'Personel',
  '/partner/appointments': 'Randevular',
  '/partner/customers': 'Müşteriler',
  '/partner/settings': 'Ayarlar',
}

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { user: currentUser, error } = await auth.getUser()
    
    if (error || !currentUser) {
      navigate('/partner/login')
      return
    }
    
    setUser(currentUser)
    setLoading(false)
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-3 border-[#1570EF] border-t-transparent rounded-full"></div>
          <span className="text-sm text-[#667085]">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  // Get page title from prop or route
  const pageTitle = title || pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E4E7EC] sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>

            {/* Page Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-[#101828]">
              {pageTitle}
            </h1>

            {/* Right side - can add notifications, search, etc. */}
            <div className="ml-auto flex items-center gap-3">
              {/* Mobile user avatar */}
              <div className="lg:hidden w-8 h-8 bg-[#1570EF] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {user?.user_metadata?.company_name?.charAt(0)?.toUpperCase() || 'İ'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// Menu Icon
function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
