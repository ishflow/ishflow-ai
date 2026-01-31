import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

// Icons (consistent with other pages)
const Icons = {
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
    </svg>
  ),
  mapPin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  scissors: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  messageCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  chevronLeft: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  chevronRight: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
}

export default function BusinessProfile() {
  const { id } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [selectedReview, setSelectedReview] = useState(null)
  const [showServicesModal, setShowServicesModal] = useState(false)
  
  // Refs for sliders
  const reviewsSliderRef = useRef(null)
  const mainImageRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  useEffect(() => { loadBusiness() }, [id])

  const loadBusiness = async () => {
    const [businessRes, servicesRes, staffRes, reviewsRes] = await Promise.all([
      supabase.from('partners').select('*').eq('id', id).single(),
      supabase.from('services').select('*').eq('partner_id', id).eq('is_active', true),
      supabase.from('staff').select('*').eq('partner_id', id).eq('is_active', true),
      supabase.from('reviews').select('*, customers(name)').eq('partner_id', id).order('created_at', { ascending: false }).limit(20)
    ])
    setBusiness(businessRes.data)
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
    setReviews(reviewsRes.data || [])
    setLoading(false)
  }

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : '4.8'
  const reviewCount = reviews.length || 124

  // Örnek galeri görselleri
  const gallery = business?.gallery?.length > 0 ? business.gallery : [
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop' },
  ]
  
  // Örnek yorumlar
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: 1, rating: 5, comment: 'Harika bir deneyimdi, çok memnun kaldım. Kesinlikle tavsiye ederim! İlk gelişimde biraz tedirgin olsam da personelin samimi ve profesyonel yaklaşımı sayesinde çok rahat ettim. Sonuç beklediğimin çok üstündeydi, artık düzenli müşteriyim.', customers: { name: 'Ayşe K.' } },
    { id: 2, rating: 4, comment: 'Personel çok ilgili, mekan temiz ve şık.', customers: { name: 'Mehmet Y.' } },
    { id: 3, rating: 5, comment: 'Her zaman buraya geliyorum, kalite hiç düşmüyor. Yıllardır farklı yerler denedim ama buranın kalitesine yaklaşan olmadı. Fiyatlar makul, randevu almak çok kolay ve personel her zaman güler yüzlü. Herkese gönül rahatlığıyla önerebilirim.', customers: { name: 'Zeynep A.' } },
    { id: 4, rating: 5, comment: 'Fiyat/performans açısından mükemmel.', customers: { name: 'Ali R.' } },
    { id: 5, rating: 4, comment: 'Randevu sistemi çok pratik, bekleme olmadı. Online randevu aldım, tam saatinde girdim ve hiç beklemeden işlemim yapıldı. Modern ve teknolojik bir yaklaşımları var, çok beğendim.', customers: { name: 'Fatma S.' } },
    { id: 6, rating: 5, comment: 'Çok profesyonel bir ekip, teşekkürler!', customers: { name: 'Emre T.' } },
  ]

  // Sosyal medya
  const socials = business?.socials || { instagram: 'salonbeauty', facebook: 'salonbeauty' }

  // Gallery navigation
  const prevImage = () => setActiveGalleryIndex(i => i > 0 ? i - 1 : gallery.length - 1)
  const nextImage = () => setActiveGalleryIndex(i => i < gallery.length - 1 ? i + 1 : 0)

  // Mouse drag for gallery
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
  }
  const handleMouseUp = (e) => {
    if (!isDragging) return
    const diff = e.clientX - dragStartX
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevImage()
      else nextImage()
    }
    setIsDragging(false)
  }
  const handleMouseLeave = () => setIsDragging(false)

  // Reviews slider scroll
  const scrollReviews = (direction) => {
    if (reviewsSliderRef.current) {
      const scrollAmount = 240
      reviewsSliderRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!business) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>İşletme bulunamadı</p>
          <Link to="/search" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>← Geri dön</Link>
        </div>
      </div>
    )
  }

  const mapQuery = encodeURIComponent((business.address || '') + (business.city ? ', ' + business.city : ''))

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .thin-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
        @media (max-width: 900px) {
          .desktop-layout { flex-direction: column !important; }
          .gallery-section { width: 100% !important; max-width: 100% !important; }
          .main-image { width: 100% !important; height: auto !important; aspect-ratio: 1 !important; max-height: 400px !important; }
          .right-column { width: 100% !important; }
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="ishflow" style={{ height: '26px' }} />
        </Link>
        <Link to="/search" style={styles.backButton}>
          {Icons.back}
          <span>Geri</span>
        </Link>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div className="desktop-layout" style={styles.contentGrid}>
          
          {/* Left Column - Gallery + Map + Button */}
          <div className="gallery-section" style={styles.gallerySection}>
            {/* Main Image with drag and navigation */}
            <div 
              className="main-image" 
              style={styles.mainImage}
              ref={mainImageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {gallery[activeGalleryIndex]?.url ? (
                <img 
                  src={gallery[activeGalleryIndex].url} 
                  alt="" 
                  style={{ ...styles.mainImageImg, cursor: isDragging ? 'grabbing' : 'grab' }} 
                  draggable={false}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <span style={{ fontSize: '48px', opacity: 0.3 }}>🖼️</span>
                </div>
              )}
              
              {/* Glass navigation buttons */}
              <button onClick={prevImage} style={{ ...styles.glassNavButton, left: '12px' }}>
                {Icons.chevronLeft}
              </button>
              <button onClick={nextImage} style={{ ...styles.glassNavButton, right: '12px' }}>
                {Icons.chevronRight}
              </button>
              
              <div style={styles.imageCounter}>{activeGalleryIndex + 1} / {gallery.length}</div>
            </div>

            {/* Thumbnail Slider */}
            <div className="hide-scrollbar" style={styles.thumbnailSlider}>
              {gallery.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveGalleryIndex(i)}
                  style={{
                    ...styles.thumbnail,
                    border: activeGalleryIndex === i ? '3px solid #6366f1' : '3px solid transparent',
                    opacity: activeGalleryIndex === i ? 1 : 0.7,
                  }}
                >
                  {img.url && <img src={img.url} alt="" style={styles.thumbnailImg} />}
                </div>
              ))}
            </div>

            {/* Map - Taller */}
            <div style={styles.mapContainer}>
              <div style={styles.mapHeader}>
                <span style={{ color: '#6366f1' }}>{Icons.mapPin}</span>
                <span style={styles.mapTitle}>Konum</span>
              </div>
              {business.address ? (
                <div style={styles.mapWrapper}>
                  <iframe
                    title="map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  />
                </div>
              ) : (
                <div style={styles.mapPlaceholder}>
                  <span style={{ color: '#94a3b8' }}>{Icons.mapPin}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Konum eklenmemiş</span>
                </div>
              )}
              {business.address && (
                <p style={styles.addressText}>{business.address}{business.city ? `, ${business.city}` : ''}</p>
              )}
            </div>

            {/* Book Button - Below Map, aligned with reviews bottom */}
            <button onClick={() => setShowBookingModal(true)} style={styles.bookButton}>
              {Icons.calendar}
              <span>Randevu Al</span>
            </button>
          </div>

          {/* Right Column - Info */}
          <div className="right-column" style={styles.rightColumn}>
            
            {/* Business Info Card */}
            <div style={styles.card}>
              <div style={styles.businessHeader}>
                <div style={styles.businessLogo}>
                  {business.logo_url ? (
                    <img src={business.logo_url} alt="" style={styles.businessLogoImg} />
                  ) : (
                    <span style={{ fontSize: '24px' }}>✨</span>
                  )}
                </div>
                <div style={styles.businessInfo}>
                  <h1 style={styles.businessName}>{business.company_name}</h1>
                  <div style={styles.ratingRow}>
                    <div style={styles.ratingBadge}>
                      <span style={{ color: '#fbbf24' }}>{Icons.star}</span>
                      <span style={styles.ratingValue}>{avgRating}</span>
                      <span style={styles.reviewCount}>({reviewCount} yorum)</span>
                    </div>
                    {business.category && (
                      <span style={styles.categoryBadge}>{business.category}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* About */}
              <p style={styles.aboutText}>
                {business.description || 'Profesyonel ekibimiz ve modern ekipmanlarımızla sizlere en kaliteli hizmeti sunmak için buradayız. Müşteri memnuniyeti bizim önceliğimizdir. Randevu alarak bekleme sürenizi minimuma indirin.'}
              </p>

              {/* Contact & Social */}
              <div style={styles.contactRow}>
                {business.phone && (
                  <a href={`tel:${business.phone}`} style={styles.contactItem}>
                    <span style={{ color: '#6366f1' }}>{Icons.phone}</span>
                    <span>{business.phone}</span>
                  </a>
                )}
                <div style={styles.socialIcons}>
                  {socials.instagram && (
                    <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                      {Icons.instagram}
                    </a>
                  )}
                  {socials.facebook && (
                    <a href={`https://facebook.com/${socials.facebook}`} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                      {Icons.facebook}
                    </a>
                  )}
                  {socials.twitter && (
                    <a href={`https://twitter.com/${socials.twitter}`} target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                      {Icons.twitter}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Services & Team Grid */}
            <div className="info-grid" style={styles.infoGrid}>
              {/* Services Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{ color: '#6366f1' }}>{Icons.scissors}</span>
                  <span style={styles.cardTitle}>Hizmetler</span>
                </div>
                <div style={styles.servicesList}>
                  {services.slice(0, 3).map(s => (
                    <div key={s.id} style={styles.serviceItem}>
                      <div style={styles.serviceName}>
                        <span>{s.name}</span>
                        <span style={styles.serviceDuration}>
                          {Icons.clock} {s.duration_minutes} dk
                        </span>
                      </div>
                      <span style={styles.servicePrice}>{formatPrice(s.price)}</span>
                    </div>
                  ))}
                  {services.length > 3 && (
                    <button onClick={() => setShowServicesModal(true)} style={styles.showAllButton}>
                      Tüm Hizmetleri Gör ({services.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Team Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{ color: '#6366f1' }}>{Icons.users}</span>
                  <span style={styles.cardTitle}>Ekip</span>
                </div>
                <div style={styles.teamList}>
                  {staff.slice(0, 4).map(p => (
                    <div key={p.id} style={styles.teamMember}>
                      <div style={styles.teamAvatar}>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" style={styles.teamAvatarImg} />
                        ) : (
                          <span>{p.name?.charAt(0)}</span>
                        )}
                      </div>
                      <span style={styles.teamName}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Card with Slider Controls */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ color: '#6366f1' }}>{Icons.messageCircle}</span>
                <span style={styles.cardTitle}>Yorumlar</span>
                <span style={styles.cardBadge}>
                  <span style={{ color: '#fbbf24', marginRight: '4px' }}>{Icons.star}</span>
                  {avgRating}
                </span>
                {/* Slider controls */}
                <div style={styles.sliderControls}>
                  <button onClick={() => scrollReviews(-1)} style={styles.sliderButton}>
                    {Icons.chevronLeft}
                  </button>
                  <button onClick={() => scrollReviews(1)} style={styles.sliderButton}>
                    {Icons.chevronRight}
                  </button>
                </div>
              </div>
              <div ref={reviewsSliderRef} className="hide-scrollbar" style={styles.reviewsSlider}>
                {displayReviews.map(r => (
                  <div key={r.id} style={styles.reviewCard} onClick={() => setSelectedReview(r)}>
                    <div style={styles.reviewHeader}>
                      <div style={styles.reviewAvatar}>
                        {r.customers?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={styles.reviewName}>{r.customers?.name || 'Anonim'}</div>
                        <div style={styles.reviewStars}>
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{ color: i <= (r.rating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '12px' }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p style={styles.reviewText}>{r.comment}</p>}
                    {r.comment && r.comment.length > 80 && (
                      <span style={styles.readMore}>Devamını oku</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && <BookingModal partnerId={id} services={services} staff={staff} onClose={() => setShowBookingModal(false)} />}
      
      {/* Services Modal */}
      {showServicesModal && (
        <div style={styles.reviewModalOverlay} onClick={() => setShowServicesModal(false)}>
          <div style={styles.servicesModal} onClick={e => e.stopPropagation()}>
            <div style={styles.servicesModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#6366f1' }}>{Icons.scissors}</span>
                <span style={styles.servicesModalTitle}>Tüm Hizmetler</span>
              </div>
              <button onClick={() => setShowServicesModal(false)} style={styles.reviewModalClose}>×</button>
            </div>
            <div className="thin-scrollbar" style={styles.servicesModalList}>
              {services.map(s => (
                <div key={s.id} style={styles.servicesModalItem}>
                  <div>
                    <div style={styles.servicesModalName}>{s.name}</div>
                    <div style={styles.servicesModalDuration}>{Icons.clock} {s.duration_minutes} dakika</div>
                  </div>
                  <span style={styles.servicesModalPrice}>{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReview && (
        <div style={styles.reviewModalOverlay} onClick={() => setSelectedReview(null)}>
          <div style={styles.reviewModal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReview(null)} style={styles.reviewModalClose}>×</button>
            <div style={styles.reviewModalHeader}>
              <div style={styles.reviewModalAvatar}>
                {selectedReview.customers?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div style={styles.reviewModalName}>{selectedReview.customers?.name || 'Anonim'}</div>
                <div style={styles.reviewModalStars}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= (selectedReview.rating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '16px' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
            <p style={styles.reviewModalText}>{selectedReview.comment}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fafbfc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafbfc',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    border: '1px solid #f0f0f0',
    transition: 'all 0.15s ease',
  },
  main: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  contentGrid: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
  },
  gallerySection: {
    width: '380px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mainImage: {
    width: '380px',
    height: '380px',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    position: 'relative',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    userSelect: 'none',
  },
  mainImageImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassNavButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
  },
  imageCounter: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  thumbnailSlider: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  thumbnail: {
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '14px',
    border: '1px solid #f0f0f0',
    flex: 1,
  },
  mapHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  mapTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  mapWrapper: {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  mapPlaceholder: {
    width: '100%',
    height: '150px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  addressText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '10px',
    lineHeight: '1.4',
  },
  bookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '18px 32px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
    transition: 'all 0.2s ease',
  },
  rightColumn: {
    flex: 1,
    maxWidth: '700px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #f0f0f0',
  },
  businessHeader: {
    display: 'flex',
    gap: '14px',
    marginBottom: '14px',
  },
  businessLogo: {
    width: '56px',
    height: '56px',
    backgroundColor: '#f0f4ff',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid #e0e7ff',
  },
  businessLogoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '14px',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
  },
  ratingValue: {
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewCount: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  categoryBadge: {
    padding: '4px 10px',
    backgroundColor: '#f0f4ff',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#6366f1',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#64748b',
    margin: '0 0 14px 0',
  },
  contactRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '14px',
    borderTop: '1px solid #f0f0f0',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#1e293b',
    textDecoration: 'none',
    fontWeight: '500',
  },
  socialIcons: {
    display: 'flex',
    gap: '8px',
  },
  socialIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    border: '1px solid #f0f0f0',
    transition: 'all 0.15s ease',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  cardBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '3px 10px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d97706',
    marginRight: '8px',
  },
  sliderControls: {
    display: 'flex',
    gap: '4px',
  },
  sliderButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.15s ease',
  },
  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  showAllButton: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f0f4ff',
    border: '1px solid #e0e7ff',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#6366f1',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  serviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f8fafc',
  },
  serviceName: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    fontSize: '13px',
    color: '#334155',
  },
  serviceDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#94a3b8',
  },
  servicePrice: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6366f1',
  },
  showMoreButton: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#6366f1',
    fontWeight: '500',
    cursor: 'pointer',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  teamAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },
  teamAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
  teamName: {
    fontSize: '13px',
    color: '#334155',
    fontWeight: '500',
  },
  reviewsSlider: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollBehavior: 'smooth',
  },
  reviewCard: {
    flexShrink: 0,
    width: '220px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  reviewHeader: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  reviewAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6366f1',
    flexShrink: 0,
  },
  reviewName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2px',
  },
  reviewStars: {
    letterSpacing: '1px',
  },
  reviewText: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#64748b',
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  readMore: {
    fontSize: '11px',
    color: '#6366f1',
    fontWeight: '500',
    marginTop: '6px',
    display: 'block',
  },
  reviewModalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '20px',
  },
  reviewModal: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    padding: '24px',
    position: 'relative',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  reviewModalClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f0f0f0',
    borderRadius: '10px',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewModalHeader: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
  },
  reviewModalAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#6366f1',
    flexShrink: 0,
  },
  reviewModalName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  reviewModalStars: {
    letterSpacing: '2px',
  },
  reviewModalText: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#475569',
    margin: 0,
  },
  servicesModal: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '450px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  servicesModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f0f0f0',
  },
  servicesModalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
  },
  servicesModalList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
  },
  servicesModalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #f8fafc',
  },
  servicesModalName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '4px',
  },
  servicesModalDuration: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  servicesModalPrice: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#6366f1',
  },
}

function BookingModal({ partnerId, services, staff, onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { if (step === 3) loadAppointments() }, [step, selectedDate, selectedStaff])

  const loadAppointments = async () => {
    const start = new Date(selectedDate); start.setHours(0,0,0,0)
    const end = new Date(selectedDate); end.setHours(23,59,59,999)
    let q = supabase.from('appointments').select('start_time, end_time').eq('partner_id', partnerId)
      .gte('start_time', start.toISOString()).lte('start_time', end.toISOString()).in('status', ['pending', 'confirmed'])
    if (selectedStaff) q = q.eq('staff_id', selectedStaff.id)
    const { data } = await q
    setAppointments(data || [])
  }

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
  const timeSlots = useMemo(() => { const s = []; for (let h=9;h<18;h++) for (let m=0;m<60;m+=30) s.push({hour:h,minute:m,label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}); return s }, [])
  
  const isSlotAvailable = (slot) => {
    const st = new Date(selectedDate); st.setHours(slot.hour, slot.minute, 0, 0)
    const en = new Date(st.getTime() + (selectedService?.duration_minutes || 30) * 60000)
    if (st < new Date()) return false
    return !appointments.some(a => { const as = new Date(a.start_time), ae = new Date(a.end_time); return st < ae && en > as })
  }

  const getDays = (d) => {
    const y=d.getFullYear(), m=d.getMonth(), f=new Date(y,m,1), l=new Date(y,m+1,0), days=[]
    for(let i=0;i<f.getDay();i++) days.push({date:new Date(y,m,-f.getDay()+i+1),cur:false})
    for(let i=1;i<=l.getDate();i++) days.push({date:new Date(y,m,i),cur:true})
    while(days.length<42) days.push({date:new Date(y,m+1,days.length-l.getDate()-f.getDay()+1),cur:false})
    return days
  }
  const calDays = useMemo(() => getDays(currentMonth), [currentMonth])
  const sameDay = (a,b) => a.toDateString()===b.toDateString()
  const isPast = (d) => { const t=new Date(); t.setHours(0,0,0,0); return d<t }

  const handleSubmit = async () => {
    if (!selectedService || !selectedTime || !customerInfo.name || !customerInfo.phone) return
    setSubmitting(true)
    let cid
    const {data:ex} = await supabase.from('customers').select('id').eq('partner_id',partnerId).eq('phone',customerInfo.phone).single()
    if (ex) cid = ex.id
    else { const {data:nw} = await supabase.from('customers').insert({partner_id:partnerId,...customerInfo}).select().single(); cid = nw?.id }
    const [h,m] = selectedTime.split(':').map(Number)
    const st = new Date(selectedDate); st.setHours(h,m,0,0)
    const en = new Date(st.getTime() + selectedService.duration_minutes * 60000)
    await supabase.from('appointments').insert({partner_id:partnerId,customer_id:cid,service_id:selectedService.id,staff_id:selectedStaff?.id||null,start_time:st.toISOString(),end_time:en.toISOString(),status:'pending'})
    setSubmitting(false); setSuccess(true)
  }

  const modalStyles = {
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' },
    modal: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
    header: { padding: '20px', borderBottom: '1px solid #f0f0f0' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    title: { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
    closeBtn: { width: '32px', height: '32px', backgroundColor: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '10px', fontSize: '18px', color: '#94a3b8', cursor: 'pointer' },
    progress: { display: 'flex', gap: '6px' },
    progressDot: (active) => ({ flex: 1, height: '4px', backgroundColor: active ? '#6366f1' : '#e5e7eb', borderRadius: '2px', transition: 'all 0.2s ease' }),
    content: { padding: '20px', flex: 1, overflowY: 'auto' },
    footer: { padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' },
    backBtn: { flex: 1, padding: '14px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
    nextBtn: (disabled) => ({ flex: 1, padding: '14px', border: 'none', background: disabled ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: disabled ? '#94a3b8' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer' }),
  }

  if (success) return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', fontSize: '28px' }}>✓</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Randevu Alındı!</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>İşletme sizinle iletişime geçecek.</p>
          <button onClick={onClose} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Tamam</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.headerTop}>
            <p style={modalStyles.title}>Randevu Al</p>
            <button onClick={onClose} style={modalStyles.closeBtn}>×</button>
          </div>
          <div style={modalStyles.progress}>
            {[1,2,3].map(i => <div key={i} style={modalStyles.progressDot(step >= i)} />)}
          </div>
        </div>

        <div style={modalStyles.content}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {services.map(s => (
                <div key={s.id} onClick={() => setSelectedService(s)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedService?.id === s.id ? '#f0f4ff' : '#f8fafc', border: selectedService?.id === s.id ? '2px solid #6366f1' : '2px solid transparent' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: '0 0 4px 0' }}>{s.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{s.duration_minutes} dakika</p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#6366f1' }}>{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div onClick={() => setSelectedStaff(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedStaff === null ? '#f0f4ff' : '#f8fafc', border: selectedStaff === null ? '2px solid #6366f1' : '2px solid transparent' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>?</div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Fark etmez</span>
              </div>
              {staff.map(p => (
                <div key={p.id} onClick={() => setSelectedStaff(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedStaff?.id === p.id ? '#f0f4ff' : '#f8fafc', border: selectedStaff?.id === p.id ? '2px solid #6366f1' : '2px solid transparent' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' }}>{p.name?.charAt(0)}</div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{p.name}</span>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>←</button>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{MONTHS_TR[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}>→</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {DAYS_TR.map(d => <div key={d} style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '6px' }}>{d}</div>)}
                  {calDays.map((d, i) => (
                    <button key={i} onClick={() => !isPast(d.date) && d.cur && setSelectedDate(d.date)} disabled={isPast(d.date) || !d.cur}
                      style={{ padding: '8px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: isPast(d.date) || !d.cur ? 'default' : 'pointer', backgroundColor: sameDay(d.date, selectedDate) ? '#6366f1' : 'transparent', color: sameDay(d.date, selectedDate) ? '#fff' : !d.cur || isPast(d.date) ? '#d1d5db' : '#374151', fontWeight: sameDay(d.date, selectedDate) ? '600' : '400' }}>
                      {d.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '20px' }}>
                {timeSlots.map(s => {
                  const av = isSlotAvailable(s), sel = selectedTime === s.label
                  return (
                    <button key={s.label} onClick={() => av && setSelectedTime(s.label)} disabled={!av}
                      style={{ padding: '10px', fontSize: '13px', borderRadius: '8px', border: sel ? '2px solid #6366f1' : '2px solid #f0f0f0', backgroundColor: sel ? '#f0f4ff' : '#fff', color: av ? '#1e293b' : '#d1d5db', cursor: av ? 'pointer' : 'not-allowed', textDecoration: av ? 'none' : 'line-through', fontWeight: sel ? '600' : '400' }}>{s.label}</button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Ad Soyad"
                  style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
                <input value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="Telefon"
                  style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          )}
        </div>

        <div style={modalStyles.footer}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={modalStyles.backBtn}>Geri</button>}
          <button
            onClick={() => { if (step === 1 && selectedService) setStep(2); else if (step === 2) setStep(3); else handleSubmit() }}
            disabled={(step === 1 && !selectedService) || (step === 3 && (!selectedTime || !customerInfo.name || !customerInfo.phone)) || submitting}
            style={modalStyles.nextBtn((step === 1 && !selectedService) || (step === 3 && (!selectedTime || !customerInfo.name || !customerInfo.phone)))}>
            {submitting ? '...' : step === 3 ? 'Onayla' : 'Devam'}
          </button>
        </div>
      </div>
    </div>
  )
}
