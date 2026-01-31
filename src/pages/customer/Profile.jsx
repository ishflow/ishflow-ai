import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomerUser } from '../../lib/customerAuth'
import { supabase } from '../../lib/supabase'
import CustomerLayout from '../../components/CustomerLayout'

export default function CustomerProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { user: currentUser } = await getCustomerUser()
    if (!currentUser || currentUser.user_metadata?.role === 'partner') {
      navigate('/customer/login')
      return
    }
    setUser(currentUser)
    setFormData({
      name: currentUser.user_metadata?.name || '',
      phone: currentUser.user_metadata?.phone || '',
      email: currentUser.email || '',
    })
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
        }
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Profil güncellendi!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }

    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor!' })
      return
    }

    if (passwordData.new.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı!' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Şifre değiştirildi!' })
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <CustomerLayout user={user} title="Profilim" subtitle="Hesap bilgilerinizi düzenleyin">
      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: message.type === 'success' ? '#166534' : '#dc2626',
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* Profile Info */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Kişisel Bilgiler</h2>
          </div>
          <form onSubmit={handleSaveProfile} style={styles.form}>
            <div style={styles.avatarSection}>
              <div style={styles.avatar}>
                {formData.name?.charAt(0) || '?'}
              </div>
              <button type="button" style={styles.changeAvatarBtn}>Fotoğraf Değiştir</button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Ad Soyad</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="+90 5XX XXX XX XX"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#94a3b8' }}
              />
              <p style={styles.hint}>E-posta değiştirilemez</p>
            </div>

            <button type="submit" disabled={saving} style={styles.saveButton}>
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Şifre Değiştir</h2>
          </div>
          <form onSubmit={handleChangePassword} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Yeni Şifre</label>
              <input
                type="password"
                name="new"
                value={passwordData.new}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Şifre Tekrar</label>
              <input
                type="password"
                name="confirm"
                value={passwordData.confirm}
                onChange={handlePasswordChange}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={saving} style={styles.passwordButton}>
              {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={{ ...styles.card, borderColor: '#fecaca' }}>
          <div style={styles.cardHeader}>
            <h2 style={{ ...styles.cardTitle, color: '#dc2626' }}>Tehlikeli Bölge</h2>
          </div>
          <div style={styles.dangerContent}>
            <p style={styles.dangerText}>
              Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>
            <button style={styles.deleteButton}>
              Hesabı Sil
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

const styles = {
  message: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '20px',
    borderBottom: '1px solid #f0f0f0',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '600',
  },
  changeAvatarBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  hint: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  saveButton: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  passwordButton: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  dangerContent: {
    padding: '20px',
  },
  dangerText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  deleteButton: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
