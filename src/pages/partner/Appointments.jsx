import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import PartnerLayout from '../../components/PartnerLayout'

// Icons
const CalendarIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const CheckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

const XIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

export default function Appointments() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled

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
    
    await loadAppointments(currentUser.id)
  }

  const loadAppointments = async (partnerId) => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, duration_minutes, price),
        staff(name),
        customers(name, phone, email)
      `)
      .eq('partner_id', partnerId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
    
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      ))
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Bugün'
    if (date.toDateString() === tomorrow.toDateString()) return 'Yarın'
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })
  }

  const formatTime = (timeStr) => timeStr?.slice(0, 5) || ''

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price || 0)

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter)

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
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
      title="Randevular" 
      subtitle="Tüm randevularınızı yönetin"
    >
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
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
          overflow: 'hidden',
          cursor: 'pointer'
        }} onClick={() => setFilter('all')}>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Toplam Randevu</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: filter === 'pending' ? '2px solid #f59e0b' : '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }} onClick={() => setFilter('pending')}>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Bekleyen</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.pending}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: filter === 'confirmed' ? '2px solid #10b981' : '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }} onClick={() => setFilter('confirmed')}>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Onaylanan</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.confirmed}</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: filter === 'cancelled' ? '2px solid #ef4444' : '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }} onClick={() => setFilter('cancelled')}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            borderRadius: '50%',
            opacity: 0.1
          }}></div>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>İptal Edilen</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{stats.cancelled}</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: filter === f ? '#6366f1' : '#f1f5f9',
              color: filter === f ? 'white' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'confirmed' ? 'Onaylanan' : 'İptal'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        border: '1px solid #f0f0f0', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ color: '#94a3b8', marginBottom: '16px' }}>{CalendarIcon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {filter === 'all' ? 'Henüz randevu yok' : 'Bu filtrede randevu yok'}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Müşterileriniz randevu aldığında burada görünecek
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredAppointments.map((apt, i) => (
              <div 
                key={apt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px 24px',
                  borderBottom: i < filteredAppointments.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.15s'
                }}
              >
                {/* Date Badge */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: apt.status === 'confirmed' 
                    ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                    : apt.status === 'pending'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                    : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1 }}>
                    {new Date(apt.appointment_date).getDate()}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.9 }}>
                    {new Date(apt.appointment_date).toLocaleDateString('tr-TR', { month: 'short' })}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                      {apt.customers?.name || 'Müşteri'}
                    </p>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor: apt.status === 'confirmed' ? '#ecfdf5' : apt.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                      color: apt.status === 'confirmed' ? '#059669' : apt.status === 'pending' ? '#d97706' : '#64748b'
                    }}>
                      {apt.status === 'confirmed' ? 'Onaylı' : apt.status === 'pending' ? 'Bekliyor' : 'İptal'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    {apt.services?.name} • {formatTime(apt.appointment_time)} • {apt.services?.duration_minutes} dk
                  </p>
                  {apt.customers?.phone && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {PhoneIcon} {apt.customers.phone}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', marginRight: '16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                    {formatPrice(apt.services?.price)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    {apt.staff?.name || 'Personel'}
                  </p>
                </div>

                {/* Actions */}
                {apt.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {CheckIcon} Onayla
                    </button>
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {XIcon} İptal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </PartnerLayout>
  )
}
