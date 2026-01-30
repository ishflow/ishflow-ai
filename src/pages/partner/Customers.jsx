import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import PartnerLayout from '../../components/PartnerLayout'

// Icons
const UsersIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

const MailIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const CalendarIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const SearchIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Customers() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
    
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', currentUser.id).single()
    setPartner(partnerData)
    
    await loadCustomers(currentUser.id)
  }

  const loadCustomers = async (partnerId) => {
    // Get customers with their appointment counts
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
    
    // Get appointment counts for each customer
    if (customerData) {
      const customersWithStats = await Promise.all(
        customerData.map(async (customer) => {
          const { count: appointmentCount } = await supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', customer.id)
          
          const { data: lastAppointment } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('customer_id', customer.id)
            .order('appointment_date', { ascending: false })
            .limit(1)
            .single()
          
          return {
            ...customer,
            appointmentCount: appointmentCount || 0,
            lastAppointment: lastAppointment?.appointment_date
          }
        })
      )
      setCustomers(customersWithStats)
    }
    
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Henüz randevu yok'
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.appointmentCount > 0).length,
    new: customers.filter(c => {
      const created = new Date(c.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return created > weekAgo
    }).length
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <PartnerLayout 
      partner={partner} 
      user={user} 
      title="Müşteriler" 
      subtitle="Müşteri veritabanınız"
    >
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '32px' 
      }} className="stats-grid">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Toplam Müşteri</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Aktif Müşteri</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.active}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Bu Hafta Yeni</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.new}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          maxWidth: '400px'
        }}>
          <span style={{ color: '#94a3b8' }}>{SearchIcon}</span>
          <input 
            placeholder="Müşteri ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              border: 'none', 
              background: 'none', 
              outline: 'none', 
              fontSize: '14px',
              color: '#1e293b',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        border: '1px solid #f0f0f0', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ color: '#94a3b8', marginBottom: '16px' }}>{UsersIcon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {searchTerm ? 'Sonuç bulunamadı' : 'Henüz müşteri yok'}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              {searchTerm ? 'Farklı bir arama deneyin' : 'Müşteriler randevu aldığında otomatik eklenecek'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredCustomers.map((customer, i) => (
              <div 
                key={customer.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: i < filteredCustomers.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.15s'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {customer.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0, marginBottom: '4px' }}>
                    {customer.name}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {customer.phone && (
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {PhoneIcon} {customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {MailIcon} {customer.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                    {customer.appointmentCount} randevu
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    {CalendarIcon} {formatDate(customer.lastAppointment)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </PartnerLayout>
  )
}
