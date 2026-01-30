import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../lib/supabase'

export default function PartnerLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Tüm alanları doldurun')
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await auth.signIn(formData.email, formData.password)
      if (authError) {
        setError(authError.message.includes('Invalid login') ? 'Email veya şifre hatalı' : authError.message)
        setLoading(false)
        return
      }
      navigate('/partner/dashboard')
    } catch (err) {
      setError('Bir hata oluştu. Tekrar deneyin.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    paddingLeft: '48px',
    fontSize: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#fafbfc',
    color: '#1e293b'
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #8b5cf6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo-white.svg" alt="ishflow" style={{ height: '36px' }} />
          </Link>
        </div>

        {/* Login Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '24px', 
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              Hoş Geldiniz 👋
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              İşletme hesabınıza giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>
                E-posta
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>
                Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '12px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="20" height="20" fill="#ef4444" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: '14px', color: '#b91c1c', fontWeight: '500' }}>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ 
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: 'white',
                background: loading ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.35)'
              }}
            >
              {loading && (
                <svg style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Giriş Yap
            </button>
          </form>

          {/* Register Link */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Hesabınız yok mu?{' '}
              <Link to="/partner/register" style={{ color: '#6366f1', fontWeight: '600', textDecoration: 'none' }}>
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana sayfaya dön
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
