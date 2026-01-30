import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/supabase'
import { getStaff, deleteStaff, toggleStaffStatus } from '../../lib/staff'

export default function Staff() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [staff, setStaff] = useState([])
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
    await loadStaff(currentUser.id)
  }

  const loadStaff = async (partnerId) => {
    const { data } = await getStaff(partnerId)
    setStaff(data || [])
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" personelini silmek istediğinizden emin misiniz?`)) return
    await deleteStaff(id)
    setStaff(staff.filter(s => s.id !== id))
  }

  const handleToggle = async (id, currentStatus) => {
    const { data } = await toggleStaffStatus(id, !currentStatus)
    if (data) setStaff(staff.map(s => s.id === id ? data : s))
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/partner/dashboard' },
    { icon: '🛎️', label: 'Hizmetler', path: '/partner/services' },
    { icon: '👥', label: 'Personel', path: '/partner/staff', active: true },
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>Personel</h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Çalışanlarınızı yönetin</p>
          </div>
          <Link to="/partner/staff/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none'
          }}>
            <span>➕</span> Yeni Personel
          </Link>
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Henüz personel yok</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>İlk personelinizi ekleyerek başlayın</p>
              <Link to="/partner/staff/new" style={{
                display: 'inline-flex', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', fontWeight: '600', textDecoration: 'none'
              }}>
                Personel Ekle
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>İsim</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>E-posta</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Telefon</th>
                  <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Durum</th>
                  <th style={{ textAlign: 'right', padding: '14px 20px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(person => (
                  <tr key={person.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{person.name}</p>
                          {person.role && <p style={{ fontSize: '12px', color: '#6b7280' }}>{person.role}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{person.email || '-'}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>{person.phone || '-'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <button onClick={() => handleToggle(person.id, person.is_active)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        backgroundColor: person.is_active ? '#dcfce7' : '#f3f4f6', color: person.is_active ? '#166534' : '#374151', fontSize: '12px', fontWeight: '500'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: person.is_active ? '#22c55e' : '#9ca3af' }}></span>
                        {person.is_active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <Link to={`/partner/staff/${person.id}/edit`} style={{ padding: '8px 12px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', marginRight: '8px' }}>
                        Düzenle
                      </Link>
                      <button onClick={() => handleDelete(person.id, person.name)} style={{
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
