import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCustomerUser } from '../lib/customerAuth'

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

// Icons
const Icons = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  star: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
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
  filter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
}

export default function Search() {
  const [searchParams] = useSearchParams()
  const [businesses, setBusinesses] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  
  // Selected business for right panel
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [businessData, setBusinessData] = useState(null)
  const [businessLoading, setBusinessLoading] = useState(false)
  
  // Customer auth state for header
  const [customerUser, setCustomerUser] = useState(null)

  useEffect(() => {
    // Check customer auth
    const checkAuth = async () => {
      const { user } = await getCustomerUser()
      if (user && user.user_metadata?.role !== 'partner') {
        setCustomerUser(user)
      }
    }
    checkAuth()
    loadFilters()
    loadBusinesses()
  }, [city, category])

  const loadFilters = async () => {
    const [citiesRes, categoriesRes] = await Promise.all([
      supabase.from('cities').select('*').order('name'),
      supabase.from('categories').select('*').order('sort_order')
    ])
    setCities(citiesRes.data || [])
    setCategories(categoriesRes.data || [])
  }

  const loadBusinesses = async () => {
    setLoading(true)
    let query = supabase.from('partners').select('*').eq('is_public', true)
    
    if (city) query = query.eq('city', city)
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('company_name', `%${search}%`)
    
    const { data } = await query
    setBusinesses(data || [])
    setLoading(false)
    
    // Auto-select first business if none selected
    if (data && data.length > 0 && !selectedBusiness) {
      selectBusiness(data[0])
    }
  }

  const selectBusiness = async (business) => {
    setSelectedBusiness(business)
    setBusinessLoading(true)
    
    const [servicesRes, staffRes, reviewsRes] = await Promise.all([
      supabase.from('services').select('*').eq('partner_id', business.id).eq('is_active', true),
      supabase.from('staff').select('*').eq('partner_id', business.id).eq('is_active', true),
      supabase.from('reviews').select('*, customers(name)').eq('partner_id', business.id).order('created_at', { ascending: false }).limit(20)
    ])
    
    setBusinessData({
      services: servicesRes.data || [],
      staff: staffRes.data || [],
      reviews: reviewsRes.data || []
    })
    setBusinessLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadBusinesses()
  }

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
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="ishflow" style={{ height: '26px' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {customerUser && (
            <Link to="/customer/dashboard" style={styles.dashboardButton}>
              ← Panelim
            </Link>
          )}
          <Link to="/partner/login" style={styles.loginButton}>
            İşletme Girişi
          </Link>
        </div>
      </header>

      <div style={styles.container}>
        {/* Left Sidebar */}
        <aside style={styles.sidebar}>
          {/* Search */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchInputWrapper}>
              <span style={styles.searchIcon}>{Icons.search}</span>
              <input
                type="text"
                placeholder="İşletme ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </form>

          {/* Filters */}
          <div style={styles.filters}>
            <select value={city} onChange={(e) => setCity(e.target.value)} style={styles.select}>
              <option value="">Tüm Şehirler</option>
              {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
              <option value="">Tüm Kategoriler</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {/* Results count */}
          <div style={styles.resultsCount}>
            {loading ? 'Yükleniyor...' : `${businesses.length} işletme`}
          </div>

          {/* Business List */}
          <div className="thin-scrollbar" style={styles.businessList}>
            {loading ? (
              <div style={styles.loadingSmall}>
                <div style={styles.spinnerSmall} />
              </div>
            ) : businesses.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</span>
                <p>İşletme bulunamadı</p>
              </div>
            ) : (
              businesses.map(business => (
                <div
                  key={business.id}
                  onClick={() => selectBusiness(business)}
                  style={{
                    ...styles.businessCard,
                    backgroundColor: selectedBusiness?.id === business.id ? '#f0f4ff' : '#fff',
                    borderColor: selectedBusiness?.id === business.id ? '#6366f1' : '#f0f0f0',
                  }}
                >
                  <div style={styles.businessCardLogo}>
                    {business.logo_url ? (
                      <img src={business.logo_url} alt="" style={styles.businessCardLogoImg} />
                    ) : (
                      <span>🏢</span>
                    )}
                  </div>
                  <div style={styles.businessCardInfo}>
                    <h3 style={styles.businessCardName}>{business.company_name}</h3>
                    <div style={styles.businessCardAddress}>
                      {Icons.mapPin} {business.address ? `${business.address}${business.city ? ', ' + business.city : ''}` : business.city || 'Adres eklenmemiş'}
                    </div>
                    <div style={styles.businessCardRating}>
                      <span style={{ color: '#fbbf24' }}>{Icons.star}</span>
                      <span style={styles.businessCardRatingValue}>4.8</span>
                      <span style={styles.businessCardRatingCount}>(124)</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel - Business Profile */}
        <main style={styles.mainPanel}>
          {!selectedBusiness ? (
            <div style={styles.noSelection}>
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>👈</span>
              <p style={{ color: '#64748b' }}>Soldan bir işletme seçin</p>
            </div>
          ) : businessLoading ? (
            <div style={styles.loadingPanel}>
              <div style={styles.spinner} />
            </div>
          ) : (
            <BusinessProfile 
              business={selectedBusiness} 
              services={businessData?.services || []}
              staff={businessData?.staff || []}
              reviews={businessData?.reviews || []}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// Business Profile Component (embedded)
function BusinessProfile({ business, services, staff, reviews }) {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [selectedReview, setSelectedReview] = useState(null)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const reviewsSliderRef = useRef(null)

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : '4.8'
  const reviewCount = reviews.length || 124

  const gallery = business?.gallery?.length > 0 ? business.gallery : [
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=600&fit=crop' },
  ]

  const displayReviews = reviews.length > 0 ? reviews : [
    { id: 1, rating: 5, comment: 'Harika bir deneyimdi, çok memnun kaldım. Kesinlikle tavsiye ederim! İlk gelişimde biraz tedirgin olsam da personelin samimi yaklaşımı sayesinde çok rahat ettim.', customers: { name: 'Ayşe K.' } },
    { id: 2, rating: 4, comment: 'Personel çok ilgili, mekan temiz ve şık. Randevu saatinde alındım, beklemedim.', customers: { name: 'Mehmet Y.' } },
    { id: 3, rating: 5, comment: 'Her zaman buraya geliyorum, kalite hiç düşmüyor. Yıllardır farklı yerler denedim ama buranın kalitesine yaklaşan olmadı.', customers: { name: 'Zeynep A.' } },
    { id: 4, rating: 5, comment: 'Fiyat/performans açısından mükemmel. Çok memnunum, herkese tavsiye ederim.', customers: { name: 'Ali R.' } },
    { id: 5, rating: 4, comment: 'Güler yüzlü personel, temiz ortam. Tekrar geleceğim kesinlikle.', customers: { name: 'Fatma S.' } },
    { id: 6, rating: 5, comment: 'Profesyonel hizmet, modern ekipmanlar. 5 yıldızı hak ediyor!', customers: { name: 'Emre T.' } },
    { id: 7, rating: 5, comment: 'Online randevu sistemi çok pratik. Hiç beklemeden işlemim yapıldı.', customers: { name: 'Selin K.' } },
  ]

  const displayServices = services.length > 0 ? services : [
    { id: 1, name: 'Saç Kesimi', duration_minutes: 30, price: 150 },
    { id: 2, name: 'Saç Boyama', duration_minutes: 90, price: 400 },
    { id: 3, name: 'Fön', duration_minutes: 20, price: 100 },
    { id: 4, name: 'Manikür', duration_minutes: 45, price: 120 },
    { id: 5, name: 'Pedikür', duration_minutes: 60, price: 150 },
    { id: 6, name: 'Cilt Bakımı', duration_minutes: 60, price: 250 },
    { id: 7, name: 'Kaş Dizaynı', duration_minutes: 15, price: 80 },
    { id: 8, name: 'Makyaj', duration_minutes: 45, price: 300 },
  ]

  const displayStaff = staff.length > 0 ? staff : [
    { id: 1, name: 'Aylin Yılmaz', title: 'Kuaför' },
    { id: 2, name: 'Mert Demir', title: 'Saç Stilisti' },
    { id: 3, name: 'Seda Kaya', title: 'Güzellik Uzmanı' },
    { id: 4, name: 'Can Öztürk', title: 'Makyaj Artisti' },
  ]

  const socials = business?.socials || { instagram: 'salonbeauty', facebook: 'salonbeauty', twitter: 'salonbeauty' }

  const prevImage = () => setActiveGalleryIndex(i => i > 0 ? i - 1 : gallery.length - 1)
  const nextImage = () => setActiveGalleryIndex(i => i < gallery.length - 1 ? i + 1 : 0)

  const handleMouseDown = (e) => { setIsDragging(true); setDragStartX(e.clientX) }
  const handleMouseUp = (e) => {
    if (!isDragging) return
    const diff = e.clientX - dragStartX
    if (Math.abs(diff) > 50) { if (diff > 0) prevImage(); else nextImage() }
    setIsDragging(false)
  }
  const handleMouseLeave = () => setIsDragging(false)

  const scrollReviews = (direction) => {
    if (reviewsSliderRef.current) {
      reviewsSliderRef.current.scrollBy({ left: direction * 240, behavior: 'smooth' })
    }
  }

  const mapQuery = encodeURIComponent((business.address || '') + (business.city ? ', ' + business.city : ''))

  return (
    <div className="thin-scrollbar" style={profileStyles.container}>
      <div style={profileStyles.content}>
        {/* Top Section */}
        <div style={profileStyles.topSection}>
          {/* Info with Banner */}
          <div style={profileStyles.infoSection}>
            {/* Banner */}
            <div style={profileStyles.banner}>
              {business.banner_url ? (
                <img src={business.banner_url} alt="" style={profileStyles.bannerImg} />
              ) : (
                <div style={profileStyles.bannerPlaceholder}>
                  <div style={profileStyles.bannerGradient} />
                </div>
              )}
              {/* Logo on banner */}
              <div style={profileStyles.logoOnBanner}>
                {business.logo_url ? <img src={business.logo_url} alt="" style={profileStyles.logoImg} /> : <span style={{ fontSize: '28px' }}>✨</span>}
              </div>
            </div>
            
            {/* Info content */}
            <div style={profileStyles.infoContent}>
              <div style={profileStyles.infoTop}>
                <div>
                  <h1 style={profileStyles.businessName}>{business.company_name}</h1>
                  <div style={profileStyles.ratingRow}>
                    <div style={profileStyles.ratingBadgeSmall}>
                      <span style={{ color: '#fbbf24' }}>{Icons.star}</span>
                      <span style={profileStyles.rating}>{avgRating}</span>
                    </div>
                    <span style={profileStyles.reviewCount}>({reviewCount} yorum)</span>
                    {business.category && <span style={profileStyles.category}>{business.category}</span>}
                  </div>
                </div>
                <div style={profileStyles.socials}>
                  {socials.instagram && <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer" style={profileStyles.socialIcon}>{Icons.instagram}</a>}
                  {socials.facebook && <a href={`https://facebook.com/${socials.facebook}`} target="_blank" rel="noopener noreferrer" style={profileStyles.socialIcon}>{Icons.facebook}</a>}
                </div>
              </div>
              
              <p style={profileStyles.description}>
                {business.description || 'Profesyonel ekibimiz ve modern ekipmanlarımızla sizlere en kaliteli hizmeti sunmak için buradayız. Müşteri memnuniyeti bizim önceliğimizdir.'}
              </p>
              
              <div style={profileStyles.contactRow}>
                {business.phone && (
                  <a href={`tel:${business.phone}`} style={profileStyles.phoneButton}>
                    {Icons.phone} {business.phone}
                  </a>
                )}
                {business.address && (
                  <span style={profileStyles.addressBadge}>
                    {Icons.mapPin} {business.city || business.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gallery - Thumbnails Left, Main Right */}
          <div style={profileStyles.gallerySection}>
            <div className="hide-scrollbar" style={profileStyles.thumbnailsVertical}>
              {gallery.map((img, i) => (
                <div key={i} onClick={() => setActiveGalleryIndex(i)}
                  style={{ ...profileStyles.thumbnailV, border: activeGalleryIndex === i ? '2px solid #6366f1' : '2px solid transparent' }}>
                  {img.url && <img src={img.url} alt="" style={profileStyles.thumbnailImg} />}
                </div>
              ))}
            </div>
            <div
              style={profileStyles.mainImage}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {gallery[activeGalleryIndex]?.url && (
                <img src={gallery[activeGalleryIndex].url} alt="" style={profileStyles.mainImageImg} draggable={false} />
              )}
              <button onClick={prevImage} style={{ ...profileStyles.navButton, left: '10px' }}>{Icons.chevronLeft}</button>
              <button onClick={nextImage} style={{ ...profileStyles.navButton, right: '10px' }}>{Icons.chevronRight}</button>
              <div style={profileStyles.imageCounter}>{activeGalleryIndex + 1} / {gallery.length}</div>
            </div>
          </div>
        </div>

        {/* Services & Team */}
        <div style={profileStyles.grid}>
          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}>
              <span style={{ color: '#6366f1' }}>{Icons.scissors}</span>
              <span style={profileStyles.cardTitle}>Hizmetler</span>
            </div>
            <div style={profileStyles.servicesList}>
              {displayServices.slice(0, 4).map(s => (
                <div key={s.id} style={profileStyles.serviceItem}>
                  <div>
                    <div style={profileStyles.serviceName}>{s.name}</div>
                    <div style={profileStyles.serviceDuration}>{Icons.clock} {s.duration_minutes} dk</div>
                  </div>
                  <span style={profileStyles.servicePrice}>{formatPrice(s.price)}</span>
                </div>
              ))}
              {displayServices.length > 4 && (
                <button onClick={() => setShowServicesModal(true)} style={profileStyles.showAllBtn}>
                  Tüm Hizmetleri Gör ({displayServices.length})
                </button>
              )}
            </div>
          </div>

          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}>
              <span style={{ color: '#6366f1' }}>{Icons.users}</span>
              <span style={profileStyles.cardTitle}>Ekip</span>
            </div>
            <div style={profileStyles.teamList}>
              {displayStaff.map(p => (
                <div key={p.id} style={profileStyles.teamMember}>
                  <div style={profileStyles.teamAvatar}>{p.name?.charAt(0)}</div>
                  <div>
                    <div style={profileStyles.teamName}>{p.name}</div>
                    {p.title && <div style={profileStyles.teamTitle}>{p.title}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map + Book Button */}
          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}>
              <span style={{ color: '#6366f1' }}>{Icons.mapPin}</span>
              <span style={profileStyles.cardTitle}>Konum</span>
            </div>
            {business.address ? (
              <>
                <div style={profileStyles.mapWrapper}>
                  <iframe title="map" width="100%" height="100%" style={{ border: 0, borderRadius: '8px' }} loading="lazy"
                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} />
                </div>
                <p style={profileStyles.address}>{business.address}{business.city ? `, ${business.city}` : ''}</p>
              </>
            ) : (
              <div style={profileStyles.noMap}>Konum eklenmemiş</div>
            )}
          </div>
        </div>

        {/* Reviews + Book Button Row */}
        <div style={profileStyles.bottomRow}>
          <div style={{...profileStyles.reviewsSection, ...profileStyles.reviewsSpan}}>
          <div style={profileStyles.cardHeader}>
            <span style={{ color: '#6366f1' }}>{Icons.messageCircle}</span>
            <span style={profileStyles.cardTitle}>Yorumlar</span>
            <span style={profileStyles.ratingBadge}>{Icons.star} {avgRating}</span>
            <div style={profileStyles.sliderControls}>
              <button onClick={() => scrollReviews(-1)} style={profileStyles.sliderBtn}>{Icons.chevronLeft}</button>
              <button onClick={() => scrollReviews(1)} style={profileStyles.sliderBtn}>{Icons.chevronRight}</button>
            </div>
          </div>
          <div ref={reviewsSliderRef} className="hide-scrollbar" style={profileStyles.reviewsSlider}>
            {displayReviews.map(r => (
              <div key={r.id} style={profileStyles.reviewCard} onClick={() => setSelectedReview(r)}>
                <div style={profileStyles.reviewHeader}>
                  <div style={profileStyles.reviewAvatar}>{r.customers?.name?.charAt(0) || '?'}</div>
                  <div>
                    <div style={profileStyles.reviewName}>{r.customers?.name || 'Anonim'}</div>
                    <div>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= (r.rating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '11px' }}>★</span>)}</div>
                  </div>
                </div>
                {r.comment && <p style={profileStyles.reviewText}>{r.comment}</p>}
                {r.comment && r.comment.length > 60 && <span style={profileStyles.readMore}>Devamını oku</span>}
              </div>
            ))}
          </div>
          </div>
          
          {/* Book Card */}
          <div style={profileStyles.bookCard}>
            <div style={profileStyles.bookCardInfo}>
              <div style={profileStyles.bookCardIcon}>{Icons.calendar}</div>
              <div>
                <div style={profileStyles.bookCardTitle}>Hemen Randevu Al</div>
                <div style={profileStyles.bookCardSubtitle}>{displayServices.length} hizmet • {displayStaff.length} personel</div>
              </div>
            </div>
            <button onClick={() => setShowBookingModal(true)} style={profileStyles.bookButtonNormal}>
              Randevu Al
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showServicesModal && (
        <div style={profileStyles.modalOverlay} onClick={() => setShowServicesModal(false)}>
          <div style={profileStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={profileStyles.modalHeader}>
              <span>{Icons.scissors} Tüm Hizmetler</span>
              <button onClick={() => setShowServicesModal(false)} style={profileStyles.closeBtn}>×</button>
            </div>
            <div className="thin-scrollbar" style={profileStyles.modalContent}>
              {displayServices.map(s => (
                <div key={s.id} style={profileStyles.modalServiceItem}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.duration_minutes} dakika</div>
                  </div>
                  <span style={{ fontWeight: '700', color: '#6366f1' }}>{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReview && (
        <div style={profileStyles.modalOverlay} onClick={() => setSelectedReview(null)}>
          <div style={profileStyles.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReview(null)} style={{ ...profileStyles.closeBtn, position: 'absolute', top: '16px', right: '16px' }}>×</button>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ ...profileStyles.reviewAvatar, width: '48px', height: '48px', fontSize: '18px' }}>{selectedReview.customers?.name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{selectedReview.customers?.name}</div>
                  <div>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= (selectedReview.rating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '14px' }}>★</span>)}</div>
                </div>
              </div>
              <p style={{ color: '#475569', lineHeight: '1.7' }}>{selectedReview.comment}</p>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && <BookingModal partnerId={business.id} services={services} staff={staff} onClose={() => setShowBookingModal(false)} />}
    </div>
  )
}

// Booking Modal
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
  const [loggedInCustomer, setLoggedInCustomer] = useState(null)

  // Check customer auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCustomerUser()
      if (user && user.user_metadata?.role !== 'partner') {
        setLoggedInCustomer(user)
        setCustomerInfo({
          name: user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || ''
        })
      }
    }
    checkAuth()
  }, [])

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
    if (ex) {
      cid = ex.id
      // Update auth_user_id if logged in
      if (loggedInCustomer) {
        await supabase.from('customers').update({ auth_user_id: loggedInCustomer.id }).eq('id', ex.id)
      }
    } else { 
      const {data:nw} = await supabase.from('customers').insert({
        partner_id: partnerId,
        ...customerInfo,
        auth_user_id: loggedInCustomer?.id || null
      }).select().single()
      cid = nw?.id 
    }
    const [h,m] = selectedTime.split(':').map(Number)
    const st = new Date(selectedDate); st.setHours(h,m,0,0)
    const en = new Date(st.getTime() + selectedService.duration_minutes * 60000)
    await supabase.from('appointments').insert({partner_id:partnerId,customer_id:cid,service_id:selectedService.id,staff_id:selectedStaff?.id||null,start_time:st.toISOString(),end_time:en.toISOString(),status:'pending'})
    setSubmitting(false); setSuccess(true)
  }

  if (success) return (
    <div style={profileStyles.modalOverlay} onClick={onClose}>
      <div style={profileStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981, #34d399)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', fontSize: '28px' }}>✓</div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Randevu Alındı!</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>İşletme sizinle iletişime geçecek.</p>
          <button onClick={onClose} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Tamam</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={profileStyles.modalOverlay} onClick={onClose}>
      <div style={{ ...profileStyles.modal, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700' }}>Randevu Al</span>
            <button onClick={onClose} style={profileStyles.closeBtn}>×</button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '4px', backgroundColor: step >= i ? '#6366f1' : '#e5e7eb', borderRadius: '2px' }} />)}
          </div>
        </div>

        <div style={{ padding: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
          {step === 1 && services.map(s => (
            <div key={s.id} onClick={() => setSelectedService(s)}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedService?.id === s.id ? '#f0f4ff' : '#f8fafc', border: selectedService?.id === s.id ? '2px solid #6366f1' : '2px solid transparent' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.duration_minutes} dk</div>
              </div>
              <span style={{ fontWeight: '600', color: '#6366f1' }}>{formatPrice(s.price)}</span>
            </div>
          ))}

          {step === 2 && (
            <>
              <div onClick={() => setSelectedStaff(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedStaff === null ? '#f0f4ff' : '#f8fafc', border: selectedStaff === null ? '2px solid #6366f1' : '2px solid transparent' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                <span style={{ fontWeight: '500' }}>Fark etmez</span>
              </div>
              {staff.map(p => (
                <div key={p.id} onClick={() => setSelectedStaff(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer', backgroundColor: selectedStaff?.id === p.id ? '#f0f4ff' : '#f8fafc', border: selectedStaff?.id === p.id ? '2px solid #6366f1' : '2px solid transparent' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>{p.name?.charAt(0)}</div>
                  <span style={{ fontWeight: '500' }}>{p.name}</span>
                </div>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>←</button>
                  <span style={{ fontWeight: '600' }}>{MONTHS_TR[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>→</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {DAYS_TR.map(d => <div key={d} style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '6px' }}>{d}</div>)}
                  {calDays.map((d, i) => (
                    <button key={i} onClick={() => !isPast(d.date) && d.cur && setSelectedDate(d.date)} disabled={isPast(d.date) || !d.cur}
                      style={{ padding: '8px', fontSize: '13px', border: 'none', borderRadius: '8px', cursor: isPast(d.date) || !d.cur ? 'default' : 'pointer', backgroundColor: sameDay(d.date, selectedDate) ? '#6366f1' : 'transparent', color: sameDay(d.date, selectedDate) ? '#fff' : !d.cur || isPast(d.date) ? '#d1d5db' : '#374151' }}>
                      {d.date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '20px' }}>
                {timeSlots.map(s => {
                  const av = isSlotAvailable(s), sel = selectedTime === s.label
                  return <button key={s.label} onClick={() => av && setSelectedTime(s.label)} disabled={!av}
                    style={{ padding: '10px', fontSize: '13px', borderRadius: '8px', border: sel ? '2px solid #6366f1' : '2px solid #f0f0f0', backgroundColor: sel ? '#f0f4ff' : '#fff', color: av ? '#1e293b' : '#d1d5db', cursor: av ? 'pointer' : 'not-allowed', textDecoration: av ? 'none' : 'line-through' }}>{s.label}</button>
                })}
              </div>
              {loggedInCustomer ? (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>
                    {customerInfo.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>{customerInfo.name}</div>
                    <div style={{ fontSize: '12px', color: '#16a34a' }}>{customerInfo.phone}</div>
                  </div>
                </div>
              ) : (
                <>
                  <input value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Ad Soyad"
                    style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }} />
                  <input value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="Telefon"
                    style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '14px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Geri</button>}
          <button
            onClick={() => { if (step === 1 && selectedService) setStep(2); else if (step === 2) setStep(3); else handleSubmit() }}
            disabled={(step === 1 && !selectedService) || (step === 3 && (!selectedTime || !customerInfo.name || !customerInfo.phone)) || submitting}
            style={{ flex: 1, padding: '14px', border: 'none', background: (step === 1 && !selectedService) || (step === 3 && (!selectedTime || !customerInfo.name || !customerInfo.phone)) ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', fontWeight: '600', color: (step === 1 && !selectedService) || (step === 3 && (!selectedTime || !customerInfo.name || !customerInfo.phone)) ? '#94a3b8' : '#fff', cursor: 'pointer' }}>
            {submitting ? '...' : step === 3 ? 'Onayla' : 'Devam'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Styles
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#fafbfc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 20 },
  loginButton: { padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' },
  dashboardButton: { padding: '8px 16px', backgroundColor: '#f0f4ff', color: '#6366f1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e0e7ff' },
  container: { display: 'flex', height: 'calc(100vh - 52px)' },
  sidebar: { width: '300px', backgroundColor: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  searchForm: { padding: '16px' },
  searchInputWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '12px 12px 12px 42px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  filters: { display: 'flex', gap: '8px', padding: '0 16px 16px' },
  select: { flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' },
  resultsCount: { padding: '12px 16px', fontSize: '13px', color: '#64748b', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' },
  businessList: { flex: 1, overflowY: 'auto', padding: '12px' },
  loadingSmall: { display: 'flex', justifyContent: 'center', padding: '32px' },
  spinnerSmall: { width: '24px', height: '24px', border: '2px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { textAlign: 'center', padding: '32px', color: '#64748b' },
  businessCard: { display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', border: '2px solid', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.15s' },
  businessCardLogo: { width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  businessCardLogoImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' },
  businessCardInfo: { flex: 1, minWidth: 0 },
  businessCardName: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  businessCardAddress: { fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  businessCardRating: { display: 'flex', alignItems: 'center', gap: '4px' },
  businessCardRatingValue: { fontSize: '13px', fontWeight: '600', color: '#1e293b' },
  businessCardRatingCount: { fontSize: '11px', color: '#94a3b8' },
  mainPanel: { flex: 1, backgroundColor: '#f8fafc', overflow: 'hidden' },
  noSelection: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  loadingPanel: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}

const profileStyles = {
  container: { height: '100%', overflowY: 'auto' },
  content: { padding: '16px', marginRight: '180px' },
  topSection: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px', marginBottom: '12px', alignItems: 'start' },
  gallerySection: { display: 'flex', gap: '8px', height: '260px' },
  thumbnailsVertical: { display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', width: '50px', flexShrink: 0 },
  thumbnailV: { width: '46px', height: '46px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 },
  mainImage: { flex: 1, height: '260px', borderRadius: '10px', overflow: 'hidden', position: 'relative', backgroundColor: '#e5e7eb', cursor: 'grab' },
  mainImageImg: { width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' },
  navButton: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  imageCounter: { position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '10px' },
  thumbnails: { display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto' },
  thumbnail: { width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 },
  thumbnailImg: { width: '100%', height: '100%', objectFit: 'cover' },
  infoSection: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0', height: '260px', display: 'flex', flexDirection: 'column' },
  banner: { position: 'relative', height: '70px', backgroundColor: '#e5e7eb', flexShrink: 0 },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerPlaceholder: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  bannerGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' },
  logoOnBanner: { position: 'absolute', bottom: '-20px', left: '14px', width: '48px', height: '48px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #fff' },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' },
  infoContent: { padding: '28px 14px 12px', flex: 1, overflow: 'hidden' },
  infoTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  businessName: { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  ratingBadgeSmall: { display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', backgroundColor: '#fef3c7', borderRadius: '6px' },
  rating: { fontWeight: '700', color: '#d97706', fontSize: '12px' },
  reviewCount: { color: '#94a3b8', fontSize: '11px' },
  category: { padding: '3px 8px', backgroundColor: '#f0f4ff', borderRadius: '6px', fontSize: '11px', color: '#6366f1', fontWeight: '500' },
  description: { fontSize: '12px', lineHeight: '1.6', color: '#64748b', marginBottom: '10px' },
  contactRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  phoneButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f0f4ff', borderRadius: '8px', fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', border: '1px solid #e0e7ff' },
  addressBadge: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b', border: '1px solid #f0f0f0' },
  socials: { display: 'flex', gap: '6px' },
  socialIcon: { width: '34px', height: '34px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #f0f0f0', transition: 'all 0.15s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #f0f0f0' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  cardTitle: { fontSize: '12px', fontWeight: '600', color: '#1e293b', flex: 1 },
  servicesList: {},
  serviceItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8fafc' },
  serviceName: { fontSize: '11px', color: '#334155', marginBottom: '1px' },
  serviceDuration: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#94a3b8' },
  servicePrice: { fontSize: '11px', fontWeight: '600', color: '#6366f1' },
  showAllBtn: { marginTop: '6px', width: '100%', padding: '6px', backgroundColor: '#f0f4ff', border: '1px solid #e0e7ff', borderRadius: '6px', fontSize: '10px', color: '#6366f1', fontWeight: '600', cursor: 'pointer' },
  teamList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  teamMember: { display: 'flex', alignItems: 'center', gap: '8px' },
  teamAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600' },
  teamName: { fontSize: '11px', color: '#334155', fontWeight: '500' },
  teamTitle: { fontSize: '9px', color: '#94a3b8' },
  mapWrapper: { width: '100%', height: '80px', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' },
  address: { fontSize: '10px', color: '#64748b', lineHeight: '1.4' },
  noMap: { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' },
  ratingBadge: { display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '10px', fontWeight: '600', color: '#d97706' },
  sliderControls: { display: 'flex', gap: '3px', marginLeft: '6px' },
  sliderBtn: { width: '24px', height: '24px', backgroundColor: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' },
  reviewsSlider: { display: 'flex', gap: '8px', overflowX: 'auto', scrollBehavior: 'smooth' },
  reviewCard: { flexShrink: 0, width: '160px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' },
  reviewHeader: { display: 'flex', gap: '6px', marginBottom: '6px' },
  reviewAvatar: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#6366f1' },
  reviewName: { fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '1px' },
  reviewText: { fontSize: '10px', lineHeight: '1.4', color: '#64748b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  readMore: { fontSize: '9px', color: '#6366f1', fontWeight: '500', marginTop: '3px', display: 'block' },
  bookButton: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' },
  bookButtonSmall: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', marginTop: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' },
  bottomRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  reviewsSpan: { gridColumn: 'span 2' },
  reviewsSection: { backgroundColor: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #f0f0f0' },
  bookButtonSide: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' },
  bookCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '12px' },
  bookCardInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  bookCardIcon: { width: '40px', height: '40px', backgroundColor: '#f0f4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' },
  bookCardTitle: { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' },
  bookCardSubtitle: { fontSize: '11px', color: '#94a3b8' },
  bookButtonNormal: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)', transition: 'transform 0.15s, box-shadow 0.15s' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontWeight: '600', color: '#1e293b' },
  modalContent: { flex: 1, overflowY: 'auto', padding: '16px 20px' },
  modalServiceItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  closeBtn: { width: '32px', height: '32px', backgroundColor: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '8px', fontSize: '18px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
