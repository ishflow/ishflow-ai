import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'

// SVG Icons
const Icons = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  customers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"/>
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function PartnerLayout({ children, partner, user, title, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/partner/login')
  }

  const menuItems = [
    { icon: Icons.home, label: 'Ana Sayfa', path: '/partner/dashboard' },
    { icon: Icons.calendar, label: 'Randevular', path: '/partner/appointments' },
    { icon: Icons.services, label: 'Hizmetler', path: '/partner/services' },
    { icon: Icons.users, label: 'Personel', path: '/partner/staff' },
    { icon: Icons.customers, label: 'Müşteriler', path: '/partner/customers' },
  ]

  const sidebarWidth = sidebarCollapsed ? '72px' : '256px'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc' }}>
      {/* Mobile Header */}
      <header className="mobile-header" style={{ 
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', padding: '0 16px', height: '60px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            {Icons.menu}
          </button>
          <img src="/logo.svg" alt="ishflow" style={{ height: '24px' }} />
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>
            {partner?.company_name?.charAt(0) || 'İ'}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="sidebar-overlay" style={{ 
          display: 'none', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 45 
        }}></div>
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{ 
        width: sidebarWidth,
        backgroundColor: 'white',
        borderRight: '1px solid #f0f0f0',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined
      }}>
        {/* Logo Area */}
        <div style={{ 
          padding: sidebarCollapsed ? '20px 12px' : '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          {!sidebarCollapsed && (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo.svg" alt="ishflow" style={{ height: '26px' }} />
            </Link>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="collapse-btn"
            style={{ 
              padding: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'none'
            }}
          >
            {Icons.chevronLeft}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="close-sidebar" style={{ 
            display: 'none', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
          }}>
            {Icons.x}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '8px', padding: '0 12px' }}>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Menü
              </span>
            )}
          </div>
          {menuItems.map((item, i) => {
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={i} 
                to={item.path} 
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: sidebarCollapsed ? '12px' : '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                  color: isActive ? '#6366f1' : '#64748b',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </Link>
            )
          })}

          <div style={{ marginTop: '24px', marginBottom: '8px', padding: '0 12px' }}>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ayarlar
              </span>
            )}
          </div>
          <Link 
            to="/partner/settings" 
            title={sidebarCollapsed ? 'Ayarlar' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: sidebarCollapsed ? '12px' : '12px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: location.pathname === '/partner/settings' ? '#6366f1' : '#64748b',
              backgroundColor: location.pathname === '/partner/settings' ? '#f0f4ff' : 'transparent',
              fontWeight: location.pathname === '/partner/settings' ? '600' : '500',
              fontSize: '14px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{Icons.settings}</span>
            {!sidebarCollapsed && 'Ayarlar'}
          </Link>
        </nav>

        {/* User Section */}
        <div style={{ 
          padding: sidebarCollapsed ? '16px 12px' : '16px 20px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafbfc'
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {partner?.company_name?.charAt(0) || 'İ'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {partner?.company_name || 'İşletme'}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                title="Çıkış Yap"
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {Icons.logout}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              title="Çıkış Yap"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {Icons.logout}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ 
        marginLeft: sidebarWidth, 
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <header style={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 32px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              {title || 'Dashboard'}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search */}
            <div className="search-box" style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              width: '240px'
            }}>
              <span style={{ color: '#94a3b8' }}>{Icons.search}</span>
              <input 
                placeholder="Ara..." 
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  outline: 'none', 
                  fontSize: '14px',
                  color: '#1e293b',
                  width: '100%'
                }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>⌘K</span>
            </div>
            {/* Notifications */}
            <button style={{ 
              padding: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
              position: 'relative'
            }}>
              {Icons.bell}
              <span style={{ 
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }}></span>
            </button>
            {/* User Avatar */}
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              {partner?.company_name?.charAt(0) || 'İ'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .search-box { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar { transform: translateX(-100%); width: 280px !important; }
          .sidebar-overlay { display: block !important; }
          .close-sidebar { display: block !important; }
          .collapse-btn { display: none !important; }
          .main-content { margin-left: 0 !important; padding-top: 60px; }
          .main-content > header { display: none !important; }
          .main-content > div { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}
