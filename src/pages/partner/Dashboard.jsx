import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [stats, setStats] = useState({ services: 0, staff: 0, appointments: 0, customers: 0 })
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
    await loadData(currentUser.id)
  }

  const loadData = async (partnerId) => {
    try {
      const { data: partnerData } = await supabase.from('partners').select('*').eq('id', partnerId).single()
      setPartner(partnerData)

      const [servicesRes, staffRes, appointmentsRes, customersRes] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact' }).eq('partner_id', partnerId),
        supabase.from('staff').select('id', { count: 'exact' }).eq('partner_id', partnerId),
        supabase.from('appointments').select('id', { count: 'exact' }).eq('partner_id', partnerId),
        supabase.from('customers').select('id', { count: 'exact' }).eq('partner_id', partnerId),
      ])

      setStats({
        services: servicesRes.count || 0,
        staff: staffRes.count || 0,
        appointments: appointmentsRes.count || 0,
        customers: customersRes.count || 0
      })
    } catch (err) {
      console.error('Error loading data:', err)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await auth.signOut()
    navigate('/partner/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/partner/dashboard', active: true },
    { icon: '🛎️', label: 'Hizmetler', path: '/partner/services' },
    { icon: '👥', label: 'Personel', path: '/partner/staff' },
    { icon: '📅', label: 'Randevular', path: '/partner/appointments' },
    { icon: '👤', label: 'Müşteriler', path: '/partner/customers' },
  ]

  const statCards = [
    { icon: '🛎️', label: 'Hizmetler', value: stats.services, color: '#2563eb', bg: '#eff6ff' },
    { icon: '👥', label: 'Personel', value: stats.staff, color: '#059669', bg: '#ecfdf5' },
    { icon: '📅', label: 'Randevular', value: stats.appointments, color: '#d97706', bg: '#fffbeb' },
    { icon: '👤', label: 'Müşteriler', value: stats.customers, color: '#7c3aed', bg: '#f5f3ff' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Mobile Header */}
      <header className="mobile-header" style={{ 
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 16px', height: '56px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.svg" alt="ishflow" style={{ height: '24px' }} />
          <div style={{ width: '40px' }}></div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ 
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 45 
        }}></div>
      )}

      {/* Sidebar */}
      <aside className="sidebar" style={{ 
        width: '260px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb',
        padding: '24px 16px', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingLeft: '12px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
          </Link>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)} style={{ 
            display: 'none', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' 
          }}>
            <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M6 6l8 8M6 14l8-8" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item, i) => (
            <Link key={i} to={item.path} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', marginBottom: '4px', textDecoration: 'none',
              backgroundColor: item.active ? '#eff6ff' : 'transparent', color: item.active ? '#2563eb' : '#4b5563', fontWeight: item.active ? '600' : '500', fontSize: '14px'
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
            {partner?.company_name || 'İşletme'}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', wordBreak: 'break-all' }}>
            {user?.email}
          </p>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px 12px', fontSize: '13px', fontWeight: '500', color: '#6b7280',
            backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer'
          }}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: '260px', padding: '32px', paddingTop: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Merhaba 👋
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280' }}>
            İşletmenizin genel durumu
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white', borderRadius: '16px', padding: '20px',
              border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width: '44px', height: '44px', backgroundColor: stat.bg, borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px'
              }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '2px' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'white', borderRadius: '16px', padding: '20px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Hızlı İşlemler
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/partner/services/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
              backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>
              ➕ Hizmet Ekle
            </Link>
            <Link to="/partner/staff/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
              backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db',
              borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
            }}>
              👤 Personel Ekle
            </Link>
          </div>
        </div>
      </main>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .close-sidebar { display: block !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; padding-top: 72px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 769px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
