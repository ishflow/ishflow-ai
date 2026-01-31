import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { customerLogin, getCustomerSession } from '../../lib/customerAuth'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { session } = await getCustomerSession()
    if (session?.user?.user_metadata?.role === 'customer') {
      navigate('/customer/dashboard')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Lütfen e-posta ve şifrenizi girin')
      return
    }

    setLoading(true)
    const { user, error: loginError } = await customerLogin(formData)
    setLoading(false)

    if (loginError) {
      setError('E-posta veya şifre hatalı')
      return
    }

    navigate('/customer/dashboard')
  }

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.logo}>
        <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
      </Link>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Hoş Geldiniz 👋</h1>
            <p style={styles.subtitle}>Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.field}>
              <label style={styles.label}>E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p style={styles.footer}>
            Hesabınız yok mu?{' '}
            <Link to="/customer/register" style={styles.link}>Kayıt olun</Link>
          </p>
        </div>

        <div style={styles.infoCard}>
          <p style={styles.infoText}>
            💡 <strong>İpucu:</strong> Hesap oluşturmadan da randevu alabilirsiniz. 
            Hesap sadece randevularınızı takip etmek için gerekli.
          </p>
        </div>
      </div>

      <Link to="/" style={styles.backLink}>
        ← Ana sayfaya dön
      </Link>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  logo: {
    marginBottom: '32px',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '14px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#64748b',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500',
  },
  infoCard: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
  },
  infoText: {
    fontSize: '13px',
    color: '#0369a1',
    margin: 0,
    lineHeight: '1.5',
  },
  backLink: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#64748b',
    textDecoration: 'none',
  },
}
