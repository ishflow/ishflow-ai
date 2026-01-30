import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/supabase'
import { getServices, deleteService, toggleServiceStatus } from '../../lib/services'

export default function Services() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
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

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/partner/dashboard' },
    { icon: '🛎️', label: 'Hizmetler', path: '/partner/services', active: true },
    { icon: '👥', label: 'Personel', path: '/partner/staff' },
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', padding: '24px 16px', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: '32px', paddingLeft: '12px' }}>
          <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
        </Link>
        <nav>
          {menuItems.map((item, i) => (
            <Link key={i} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', marginBottom: '4px', textDecoration: 'none',
              backgroundColor: item.active ? '#eff6ff' : 'transparent', color: item.active ? '#2563eb' : '#4b5563', fontWeight: item.active ? '600' : '500', fontSize: '14px'
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>Hizmetler</h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Sunduğunuz hizmetleri yönetin</p>
          </div>
          <Link to="/partner/services/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
          }}>
            <span>➕</span> Yeni Hizmet
          </Link>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛎️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Henüz hizmet yok</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>İlk hizmetinizi ekleyerek başlayın</p>
              <Link to="/partner/services/new" style={{
                display: 'inline-flex', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', fontWeight: '600', textDecoration: 'none'
              }}>
                Hizmet Ekle
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Hizmet</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Süre</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Fiyat</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Durum</th>
                  <th style={{ textAlign: 'right', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{service.name}</p>
                      {service.description && <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{service.description}</p>}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{formatDuration(service.duration_minutes)}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatPrice(service.price)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => handleToggle(service.id, service.is_active)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        backgroundColor: service.is_active ? '#dcfce7' : '#f3f4f6', color: service.is_active ? '#166534' : '#374151', fontSize: '12px', fontWeight: '500'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: service.is_active ? '#22c55e' : '#9ca3af' }}></span>
                        {service.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <Link to={`/partner/services/${service.id}/edit`} style={{ padding: '8px 12px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', marginRight: '8px' }}>
                        Düzenle
                      </Link>
                      <button onClick={() => handleDelete(service.id, service.name)} style={{
                        padding: '8px 12px', fontSize: '13px', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer'
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
      </main>
    </div>
  )
}
