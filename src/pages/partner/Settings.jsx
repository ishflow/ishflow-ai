import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import PartnerLayout from '../../components/PartnerLayout'

// Icons
const SaveIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
  </svg>
)

export default function Settings() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    address: '',
    description: ''
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
    
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', currentUser.id).single()
    setPartner(partnerData)
    if (partnerData) {
      setFormData({
        company_name: partnerData.company_name || '',
        phone: partnerData.phone || '',
        address: partnerData.address || '',
        description: partnerData.description || ''
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('partners')
      .update(formData)
      .eq('id', user.id)
    
    setSaving(false)
    if (!error) {
      setPartner({ ...partner, ...formData })
      alert('Ayarlar kaydedildi!')
    }
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
      title="Ayarlar" 
      subtitle="İşletme bilgilerinizi yönetin"
    >
      <div style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          border: '1px solid #f0f0f0', 
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
            İşletme Bilgileri
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>İşletme Adı</label>
            <input 
              name="company_name" 
              value={formData.company_name} 
              onChange={handleChange} 
              placeholder="Örn: Güzellik Salonu" 
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

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Adres</label>
            <input 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="İşletme adresi" 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={labelStyle}>Açıklama</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="İşletme hakkında kısa açıklama..." 
              rows={4} 
              style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px', 
              fontSize: '15px', 
              fontWeight: '600', 
              color: 'white', 
              background: saving ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              border: 'none', 
              borderRadius: '12px', 
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            {SaveIcon}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>

        {/* Account Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          border: '1px solid #f0f0f0', 
          padding: '32px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Hesap Bilgileri
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#fafbfc', borderRadius: '12px' }}>
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
              fontSize: '18px'
            }}>
              {partner?.company_name?.charAt(0) || 'İ'}
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {user?.email}
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Partner hesabı
              </p>
            </div>
          </div>
        </div>
      </div>

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
    </PartnerLayout>
  )
}
