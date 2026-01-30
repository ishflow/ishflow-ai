import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function BusinessProfile() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusiness()
  }, [id])

  const loadBusiness = async () => {
    const [businessRes, servicesRes] = await Promise.all([
      supabase.from('partners').select('*').eq('id', id).single(),
      supabase.from('services').select('*').eq('partner_id', id).eq('is_active', true)
    ])
    setBusiness(businessRes.data)
    setServices(servicesRes.data || [])
    setLoading(false)
  }

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
  const formatDuration = (min) => min < 60 ? `${min} dk` : `${Math.floor(min/60)} sa ${min%60 > 0 ? min%60 + ' dk' : ''}`

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!business) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>İşletme bulunamadı</h1>
          <Link to="/search" style={{ color: '#2563eb', textDecoration: 'none' }}>Aramaya dön</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ishflow" style={{ height: '28px' }} />
          </Link>
          <Link to="/search" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{ width: '120px', height: '120px', backgroundColor: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
              🏢
            </div>
            
            {/* Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                {business.company_name}
              </h1>
              {business.category && (
                <span style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '14px', fontWeight: '500', marginBottom: '16px' }}>
                  {business.category}
                </span>
              )}
              {business.description && (
                <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}>
                  {business.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {business.city && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                    <span>📍</span> {business.city}{business.address && `, ${business.address}`}
                  </p>
                )}
                {business.phone && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                    <span>📞</span> {business.phone}
                  </p>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              to={`/book/${id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
              }}
            >
              📅 Randevu Al
            </Link>
          </div>
        </div>
      </div>

      {/* Services */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
          Hizmetler
        </h2>
        
        {services.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>Henüz hizmet eklenmemiş</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {service.name}
                  </h3>
                  {service.description && (
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{service.description}</p>
                  )}
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                    ⏱️ {formatDuration(service.duration_minutes)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                    {formatPrice(service.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
