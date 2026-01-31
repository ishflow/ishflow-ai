import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { customerLogout } from '../lib/customerAuth'

// Icons
const HomeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const CalendarIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const HeartIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const UserIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const SearchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const LogoutIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const BellIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)

export default function CustomerLayout({ children, user, title, subtitle }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await customerLogout()
    navigate('/')
  }

  const navItems = [
    { path: '/customer/dashboard', icon: HomeIcon, label: 'Ana Sayfa' },
    { path: '/customer/appointments', icon: CalendarIcon, label: 'Randevularım' },
    { path: '/customer/favorites', icon: HeartIcon, label: 'Favorilerim' },
    { path: '/customer/profile', icon: UserIcon, label: 'Profilim' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
        </Link>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {user?.user_metadata?.name?.charAt(0) || '?'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.user_metadata?.name || 'Kullanıcı'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>

        {/* Quick Search Button */}
        <Link to="/customer/search" style={styles.searchButton}>
          {SearchIcon}
          <span>İşletme Ara</span>
        </Link>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navSection}>MENÜ</div>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {})
              }}
            >
              <span style={{ color: isActive(item.path) ? '#6366f1' : '#64748b' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={styles.sidebarBottom}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            {LogoutIcon}
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>{title}</h1>
            {subtitle && <p style={styles.pageSubtitle}>{subtitle}</p>}
          </div>
          <div style={styles.headerRight}>
            <button style={styles.notificationBtn}>
              {BellIcon}
              <span style={styles.notificationBadge}>2</span>
            </button>
            <Link to="/customer/search" style={styles.newBookingBtn}>
              + Yeni Randevu
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#fff',
    borderRight: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    display: 'block',
    marginBottom: '24px',
    paddingLeft: '8px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#f0f4ff',
    border: '1px solid #e0e7ff',
    borderRadius: '10px',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    marginBottom: '24px',
    transition: 'all 0.2s',
  },
  nav: {
    flex: 1,
  },
  navSection: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    padding: '0 12px',
    marginBottom: '12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    marginBottom: '4px',
    transition: 'all 0.2s',
  },
  navItemActive: {
    backgroundColor: '#f0f4ff',
    color: '#6366f1',
  },
  sidebarBottom: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '16px',
    marginTop: '16px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f0f0f0',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  notificationBtn: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBookingBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
  },
  content: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
  },
}
