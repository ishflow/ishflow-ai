import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../../lib/supabase'
import { createService, getServiceById, updateService } from '../../lib/services'

// Icons
const BackIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const ServiceIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

export default function ServiceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0
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
    if (isEdit) loadService()
  }

  const loadService = async () => {
    const { data } = await getServiceById(id)
    if (data) setFormData(data)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'duration_minutes' || name === 'price' ? Number(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return alert('Hizmet adı gerekli')
    
    setLoading(true)
    const serviceData = { ...formData, partner_id: user.id }
    
    const { error } = isEdit 
      ? await updateService(id, serviceData)
      : await createService(serviceData)
    
    setLoading(false)
    if (error) return alert('Bir hata oluştu')
    navigate('/partner/services')
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
          <Link to="/partner/services" style={{ 
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
            {ServiceIcon}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {isEdit ? 'Hizmet Düzenle' : 'Yeni Hizmet'}
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8' }}>
            {isEdit ? 'Hizmet bilgilerini güncelleyin' : 'Sunduğunuz hizmeti ekleyin'}
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
              Hizmet Adı <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Örn: Saç Kesimi" 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Açıklama</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Hizmet detayları..." 
              rows={3} 
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div>
              <label style={labelStyle}>Süre (dakika)</label>
              <input 
                type="number" 
                name="duration_minutes" 
                value={formData.duration_minutes} 
                onChange={handleChange} 
                min="5" 
                step="5" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Fiyat (₺)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                min="0" 
                step="0.01" 
                style={inputStyle} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/partner/services')} 
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
        input:focus, textarea:focus { 
          border-color: #6366f1 !important; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important; 
          background-color: white !important;
        }
        input::placeholder, textarea::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}
