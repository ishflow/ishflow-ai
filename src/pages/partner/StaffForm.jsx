import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { auth } from '../../lib/supabase'
import { createStaff, getStaffMember, updateStaff } from '../../lib/staff'

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

  const inputStyle = { width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px', outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px' }}>
          <Link to="/partner/staff" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </Link>
        </div>
      </header>

      {/* Form */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>
          {isEdit ? 'Personel Düzenle' : 'Yeni Personel'}
        </h1>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              İsim <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Ad Soyad" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>E-posta</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ornek@email.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Telefon</label>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+90 555 123 4567" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Pozisyon</label>
            <input name="role" value={formData.role} onChange={handleChange} placeholder="Örn: Kuaför, Masör, Uzman" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={() => navigate('/partner/staff')} style={{
              flex: 1, padding: '14px', fontSize: '16px', fontWeight: '600', color: '#374151', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer'
            }}>
              İptal
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '14px', fontSize: '16px', fontWeight: '600', color: 'white', backgroundColor: loading ? '#93c5fd' : '#2563eb', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </main>

      <style>{`input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important; }`}</style>
    </div>
  )
}
