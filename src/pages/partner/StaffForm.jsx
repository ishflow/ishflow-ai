import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../../lib/supabase'
import { createStaff, getStaffMember, updateStaff } from '../../lib/staff'

// Icons
const BackIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const UsersIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

export default function StaffForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  })

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
    if (isEdit) loadStaff()
  }

  const loadStaff = async () => {
    const { data } = await getStaffMember(id)
    if (data) setFormData(data)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return alert('İsim gerekli')
    
    setLoading(true)
    const staffData = { ...formData, partner_id: user.id }
    
    const { error } = isEdit 
      ? await updateStaff(id, staffData)
      : await createStaff(staffData)
    
    setLoading(false)
    if (error) return alert('Bir hata oluştu')
    navigate('/partner/staff')
  }

  const inputStyle = { 
    width: '100%', 
    padding: '14px 16px', 
    fontSize: '15px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    outline: 'none',
    backgroundColor: '#fafbfc',
    color: '#1e293b',
    transition: 'all 0.2s ease'
  }

  const labelStyle = { 
    display: 'block', 
    fontSize: '14px', 
    fontWeight: '500', 
    color: '#1e293b', 
    marginBottom: '8px' 
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafbfc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #f0f0f0', 
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          <Link to="/partner/staff" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#64748b', 
            textDecoration: 'none', 
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}>
            {BackIcon}
            Geri
          </Link>
          <img src="/logo.svg" alt="ishflow" style={{ height: '24px' }} />
        </div>
      </header>

      {/* Form */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Title */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px'
          }}>
            {UsersIcon}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {isEdit ? 'Personel Düzenle' : 'Yeni Personel'}
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8' }}>
            {isEdit ? 'Personel bilgilerini güncelleyin' : 'Ekibinize yeni bir çalışan ekleyin'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          border: '1px solid #f0f0f0', 
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              İsim <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Ad Soyad" 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>E-posta</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="ornek@email.com" 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Telefon</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+90 555 123 4567" 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Pozisyon</label>
            <input 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              placeholder="Örn: Kuaför, Masör, Uzman" 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/partner/staff')} 
              style={{
                flex: 1, 
                padding: '14px', 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#64748b', 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              İptal
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                flex: 1, 
                padding: '14px', 
                fontSize: '15px', 
                fontWeight: '600', 
                color: 'white', 
                background: loading ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </main>

      <style>{`
        input:focus { 
          border-color: #6366f1 !important; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important; 
          background-color: white !important;
        }
        input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}
