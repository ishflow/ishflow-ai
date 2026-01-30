import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navbar */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, 
        backgroundColor: 'white', borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
            </Link>
            
            {/* Desktop Menu */}
            <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/partner/login" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#374151', textDecoration: 'none' }}>
                Giriş Yap
              </Link>
              <Link to="/partner/register" style={{ 
                padding: '10px 20px', fontSize: '14px', fontWeight: '600', color: 'white', 
                backgroundColor: '#2563eb', borderRadius: '8px', textDecoration: 'none'
              }}>
                Ücretsiz Başla
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'none', padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="24" height="24" fill="none" stroke="#374151" strokeWidth="2">
                {menuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{ 
            display: 'none', padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: 'white'
          }}>
            <Link to="/partner/login" onClick={() => setMenuOpen(false)} style={{ 
              display: 'block', padding: '12px', fontSize: '16px', color: '#374151', textDecoration: 'none', textAlign: 'center'
            }}>
              Giriş Yap
            </Link>
            <Link to="/partner/register" onClick={() => setMenuOpen(false)} style={{ 
              display: 'block', padding: '12px', marginTop: '8px', fontSize: '16px', fontWeight: '600',
              color: 'white', backgroundColor: '#2563eb', borderRadius: '8px', textDecoration: 'none', textAlign: 'center'
            }}>
              Ücretsiz Başla
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: '100px', paddingBottom: '60px', padding: '100px 16px 60px', background: 'linear-gradient(to bottom, white, #f9fafb)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', 
            padding: '8px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '500', marginBottom: '24px'
          }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></span>
            <span style={{ color: '#1d4ed8' }}>Randevu yönetiminde yeni dönem</span>
          </div>
          
          {/* Title */}
          <h1 className="hero-title" style={{ fontSize: '40px', fontWeight: 'bold', color: '#111827', marginBottom: '20px', lineHeight: '1.15' }}>
            Randevu Yönetimini
            <br />
            <span style={{ background: 'linear-gradient(to right, #2563eb, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kolaylaştırın
            </span>
          </h1>
          
          {/* Subtitle */}
          <p style={{ fontSize: '17px', color: '#4b5563', maxWidth: '540px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            Müşterileriniz online randevu alsın, siz işinize odaklanın. 
            Kuaför, klinik, spor salonu — her işletme için.
          </p>
          
          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto 24px' }}>
            <Link to="/partner/register" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              padding: '16px 24px', fontSize: '16px', fontWeight: '600', color: 'white', 
              backgroundColor: '#2563eb', borderRadius: '12px', textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
            }}>
              İşletme Olarak Başla
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/search" style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              padding: '16px 24px', fontSize: '16px', fontWeight: '600', color: '#374151', 
              backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none',
              border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              İşletme Ara
            </Link>
          </div>

          {/* Trust Badges */}
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            ✓ Kurulum gerektirmez<br className="mobile-only" /><span className="desktop-only"> · </span>
            ✓ İlk ay ücretsiz<br className="mobile-only" /><span className="desktop-only"> · </span>
            ✓ Kredi kartı gerekmez
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 16px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Özellikler</p>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
              Neden ishflow?
            </h2>
            <p style={{ fontSize: '16px', color: '#4b5563', maxWidth: '400px', margin: '0 auto' }}>
              Modern işletmeler için tasarlanmış randevu sistemi
            </p>
          </div>
          
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }}>
            {[
              { icon: '📅', title: 'Online Randevu', desc: 'Müşterileriniz 7/24 online randevu alabilir.', bg: '#dbeafe' },
              { icon: '👥', title: 'Personel Yönetimi', desc: 'Her çalışanın kendi takvimi olsun.', bg: '#dcfce7' },
              { icon: '🔔', title: 'Hatırlatmalar', desc: 'Otomatik SMS ve Telegram bildirimleri.', bg: '#ffedd5' },
            ].map((f, i) => (
              <div key={i} style={{ 
                backgroundColor: 'white', borderRadius: '16px', padding: '24px', 
                border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', backgroundColor: f.bg, borderRadius: '12px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{f.title}</h3>
                    <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.5' }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '48px 16px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', textAlign: 'center' }}>
            {[
              { value: '500+', label: 'Aktif İşletme' },
              { value: '10K+', label: 'Aylık Randevu' },
              { value: '98%', label: 'Memnuniyet' },
              { value: '24/7', label: 'Destek' },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>{s.value}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 16px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
            borderRadius: '20px', padding: '40px 24px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.25)'
          }}>
            <div style={{ 
              width: '56px', height: '56px', backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 20px', fontSize: '28px'
            }}>
              🚀
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
              Hemen Başlayın
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '24px' }}>
              İlk ay ücretsiz. Kredi kartı gerekmez.
            </p>
            <Link to="/partner/register" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              padding: '14px 28px', fontSize: '16px', fontWeight: '600', 
              color: '#2563eb', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none'
            }}>
              Ücretsiz Dene
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ishflow" style={{ height: '24px' }} />
          </Link>
          <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
            © 2026 ishflow.ai — Tüm hakları saklıdır.
          </p>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (min-width: 640px) {
          .hero-title { font-size: 52px !important; }
          .features-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .mobile-only { display: none !important; }
        }
        @media (max-width: 639px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-menu { display: block !important; }
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  )
}
