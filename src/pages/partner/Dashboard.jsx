import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import PartnerLayout from '../../components/PartnerLayout'

// Icons
const PlusIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const UsersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const TrendingUpIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
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

export default function PartnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [stats, setStats] = useState({ services: 0, staff: 0, appointments: 0, customers: 0 })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loading, setLoading] = useState(true)

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

      // Load recent appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          services(name),
          staff(name),
          customers(name, phone)
        `)
        .eq('partner_id', partnerId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(5)
      
      setRecentAppointments(appointments || [])
    } catch (err) {
      console.error('Error loading data:', err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const statCards = [
    { label: 'Toplam Randevu', value: stats.appointments, change: '+12%', color: '#6366f1', bgGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
    { label: 'Aktif Hizmet', value: stats.services, change: '+3', color: '#10b981', bgGradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { label: 'Personel', value: stats.staff, change: '0', color: '#f59e0b', bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    { label: 'Müşteri', value: stats.customers, change: '+8', color: '#ec4899', bgGradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
  ]

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatTime = (timeStr) => {
    return timeStr?.slice(0, 5) || ''
  }

  return (
    <PartnerLayout 
      partner={partner} 
      user={user} 
      title="Hoş geldin! 👋" 
      subtitle="İşletmenizin genel durumu"
    >
      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '24px', 
        marginBottom: '32px' 
      }} className="stats-grid">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: stat.bgGradient,
              borderRadius: '50%',
              opacity: 0.1
            }}></div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {stat.value}
              </p>
              <span style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#10b981',
                backgroundColor: '#ecfdf5',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {TrendingUpIcon}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="two-col">
        {/* Recent Appointments */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Yaklaşan Randevular
            </h2>
            <Link to="/partner/appointments" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
              Tümünü Gör →
            </Link>
          </div>
          
          {recentAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ marginBottom: '12px' }}>{CalendarIcon}</div>
              <p style={{ margin: 0 }}>Henüz randevu yok</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentAppointments.map((apt, i) => (
                <div 
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#fafbfc',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1 }}>{formatDate(apt.appointment_date).split(' ')[0]}</span>
                    <span style={{ fontSize: '10px', opacity: 0.9 }}>{formatDate(apt.appointment_date).split(' ')[1]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                      {apt.customers?.name || 'Müşteri'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                      {apt.services?.name} • {formatTime(apt.appointment_time)}
                    </p>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: apt.status === 'confirmed' ? '#ecfdf5' : apt.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                    color: apt.status === 'confirmed' ? '#059669' : apt.status === 'pending' ? '#d97706' : '#64748b'
                  }}>
                    {apt.status === 'confirmed' ? 'Onaylı' : apt.status === 'pending' ? 'Bekliyor' : apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
            Hızlı İşlemler
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link 
              to="/partner/services/new" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {PlusIcon}
              Hizmet Ekle
            </Link>
            <Link 
              to="/partner/staff/new" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#fafbfc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              {UsersIcon}
              Personel Ekle
            </Link>
            <Link 
              to="/partner/appointments" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#fafbfc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              {CalendarIcon}
              Randevuları Gör
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </PartnerLayout>
  )
}
