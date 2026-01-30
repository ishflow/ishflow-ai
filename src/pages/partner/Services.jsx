import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import { getServices, deleteService, toggleServiceStatus } from '../../lib/services'
import PartnerLayout from '../../components/PartnerLayout'

// Icons
const PlusIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const EmptyIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

export default function Services() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [services, setServices] = useState([])
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
    
    // Load partner data
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', currentUser.id).single()
    setPartner(partnerData)
    
    await loadServices(currentUser.id)
  }

  const loadServices = async (partnerId) => {
    const { data } = await getServices(partnerId)
    setServices(data || [])
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" hizmetini silmek istediğinizden emin misiniz?`)) return
    await deleteService(id)
    setServices(services.filter(s => s.id !== id))
  }

  const handleToggle = async (id, currentStatus) => {
    const { data } = await toggleServiceStatus(id, !currentStatus)
    if (data) setServices(services.map(s => s.id === id ? data : s))
  }

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
  const formatDuration = (min) => min < 60 ? `${min} dk` : `${Math.floor(min/60)} sa ${min%60 > 0 ? min%60 + ' dk' : ''}`

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
      title="Hizmetler" 
      subtitle="Sunduğunuz hizmetleri yönetin"
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Toplam Hizmet</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{services.length}</p>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Aktif Hizmet</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{services.filter(s => s.is_active).length}</p>
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
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>Pasif Hizmet</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{services.filter(s => !s.is_active).length}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div></div>
        <Link to="/partner/services/new" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
          {PlusIcon}
          Yeni Hizmet
        </Link>
      </div>

      {/* Content */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        border: '1px solid #f0f0f0', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ color: '#94a3b8', marginBottom: '16px' }}>{EmptyIcon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Henüz hizmet yok</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>İlk hizmetinizi ekleyerek başlayın</p>
            <Link to="/partner/services/new" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              {PlusIcon}
              Hizmet Ekle
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hizmet</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Süre</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fiyat</th>
                <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Durum</th>
                <th style={{ textAlign: 'right', padding: '14px 24px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>{service.name}</p>
                    {service.description && <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{service.description}</p>}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{formatDuration(service.duration_minutes)}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{formatPrice(service.price)}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <button onClick={() => handleToggle(service.id, service.is_active)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      backgroundColor: service.is_active ? '#ecfdf5' : '#f1f5f9', color: service.is_active ? '#059669' : '#64748b', fontSize: '12px', fontWeight: '500',
                      transition: 'all 0.15s'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: service.is_active ? '#10b981' : '#94a3b8' }}></span>
                      {service.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link to={`/partner/services/${service.id}/edit`} style={{ 
                      padding: '8px 16px', 
                      fontSize: '13px', 
                      color: '#6366f1', 
                      textDecoration: 'none', 
                      marginRight: '8px',
                      fontWeight: '500'
                    }}>
                      Düzenle
                    </Link>
                    <button onClick={() => handleDelete(service.id, service.name)} style={{
                      padding: '8px 16px', fontSize: '13px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '500'
                    }}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
