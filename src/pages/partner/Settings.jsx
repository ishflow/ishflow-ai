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

const TelegramIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
)

const CheckIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const CopyIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
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
    city: '',
    description: ''
  })
  
  // Telegram state
  const [telegramSettings, setTelegramSettings] = useState(null)
  const [telegramCode, setTelegramCode] = useState(null)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [copied, setCopied] = useState(false)

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
        city: partnerData.city || '',
        description: partnerData.description || ''
      })
    }
    
    // Load telegram settings
    const { data: tgSettings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()
    
    if (tgSettings) {
      setTelegramSettings(tgSettings)
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

  const generateTelegramCode = async () => {
    setGeneratingCode(true)
    
    // Generate random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    // Delete any existing verification for this user
    await supabase
      .from('telegram_verifications')
      .delete()
      .eq('user_id', user.id)
    
    // Create new verification
    const { error } = await supabase
      .from('telegram_verifications')
      .insert({
        user_id: user.id,
        verification_code: code,
        expires_at: expiresAt.toISOString()
      })
    
    if (!error) {
      setTelegramCode(code)
    }
    
    setGeneratingCode(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(telegramCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const disconnectTelegram = async () => {
    if (!confirm('Telegram bağlantısını kaldırmak istediğinize emin misiniz?')) return
    
    const { error } = await supabase
      .from('notification_settings')
      .update({ telegram_chat_id: null })
      .eq('user_id', user.id)
    
    if (!error) {
      setTelegramSettings({ ...telegramSettings, telegram_chat_id: null })
    }
  }

  const updateNotificationSetting = async (field, value) => {
    const { error } = await supabase
      .from('notification_settings')
      .update({ [field]: value })
      .eq('user_id', user.id)
    
    if (!error) {
      setTelegramSettings({ ...telegramSettings, [field]: value })
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
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
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
        {/* Business Info Form */}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+90 555 123 4567" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>Şehir</label>
              <input 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="İstanbul" 
                style={inputStyle} 
              />
            </div>
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

        {/* Telegram Section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          border: '1px solid #f0f0f0', 
          padding: '32px',
          marginTop: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ color: '#0088cc' }}>{TelegramIcon}</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Telegram Bildirimleri
            </h2>
          </div>

          {telegramSettings?.telegram_chat_id ? (
            // Connected state
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#22c55e' }}>{CheckIcon}</div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#166534', margin: 0 }}>
                    Telegram Bağlı
                  </p>
                  <p style={{ fontSize: '13px', color: '#16a34a', margin: '4px 0 0' }}>
                    Bildirimler aktif
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '12px' }}>
                  Bildirim Tercihleri
                </p>
                {[
                  { field: 'notify_new_appointment', label: 'Yeni randevu bildirimleri' },
                  { field: 'notify_appointment_confirmed', label: 'Randevu onay bildirimleri' },
                  { field: 'notify_appointment_cancelled', label: 'İptal bildirimleri' },
                ].map(item => (
                  <label key={item.field} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#fafbfc',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={telegramSettings[item.field] !== false}
                      onChange={(e) => updateNotificationSetting(item.field, e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
                    />
                    <span style={{ fontSize: '14px', color: '#475569' }}>{item.label}</span>
                  </label>
                ))}
              </div>

              <button 
                onClick={disconnectTelegram}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Bağlantıyı Kaldır
              </button>
            </div>
          ) : (
            // Not connected state
            <div>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
                Telegram botumuza bağlanarak yeni randevu, onay ve iptal bildirimlerini anında alabilirsiniz.
              </p>

              {telegramCode ? (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '12px' }}>
                    1. Telegram'da @ishflow_bot'u açın
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '12px' }}>
                    2. Aşağıdaki kodu gönderin:
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '16px'
                  }}>
                    <code style={{ 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      color: '#6366f1',
                      letterSpacing: '4px',
                      flex: 1
                    }}>
                      {telegramCode}
                    </code>
                    <button 
                      onClick={copyCode}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        color: copied ? '#22c55e' : '#6366f1',
                        backgroundColor: copied ? '#f0fdf4' : '#f0f4ff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {copied ? CheckIcon : CopyIcon}
                      {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Kod 10 dakika içinde geçerliliğini yitirir.
                  </p>
                </div>
              ) : (
                <button 
                  onClick={generateTelegramCode}
                  disabled={generatingCode}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: '#0088cc',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: generatingCode ? 'not-allowed' : 'pointer',
                    opacity: generatingCode ? 0.7 : 1
                  }}
                >
                  {TelegramIcon}
                  {generatingCode ? 'Kod oluşturuluyor...' : 'Telegram Bağla'}
                </button>
              )}
            </div>
          )}
        </div>

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
