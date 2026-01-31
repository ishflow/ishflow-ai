import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCustomerUser } from '../../lib/customerAuth'
import CustomerLayout from '../../components/CustomerLayout'

const DAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

// Icons
const Icons = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  mapPin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  scissors: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  chevronLeft: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  heartFilled: <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
  messageCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
}

export default function CustomerSearch() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [businessData, setBusinessData] = useState(null)
  const [businessLoading, setBusinessLoading] = useState(false)
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadFilters()
      loadBusinesses()
      loadFavorites()
    }
  }, [user, city, category])

  const checkAuth = async () => {
    const { user } = await getCustomerUser()
    if (!user || user.user_metadata?.role === 'partner') {
      navigate('/customer/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  const loadFilters = async () => {
    const [citiesRes, categoriesRes] = await Promise.all([
      supabase.from('cities').select('*').order('name'),
      supabase.from('categories').select('*').order('sort_order')
    ])
    setCities(citiesRes.data || [])
    setCategories(categoriesRes.data || [])
  }

  const loadBusinesses = async () => {
    let query = supabase.from('partners').select('*').eq('is_public', true)
    if (city) query = query.eq('city', city)
    if (category) query = query.eq('category', category)
    if (search) query = query.ilike('company_name', `%${search}%`)
    const { data } = await query
    setBusinesses(data || [])
    if (data && data.length > 0 && !selectedBusiness) {
      selectBusiness(data[0])
    }
  }

  const loadFavorites = async () => {
    const { data } = await supabase
      .from('customer_favorites')
      .select('partner_id')
      .eq('customer_id', user.id)
    setFavorites((data || []).map(f => f.partner_id))
  }

  const toggleFavorite = async (partnerId) => {
    const isFav = favorites.includes(partnerId)
    if (isFav) {
      await supabase.from('customer_favorites').delete().eq('customer_id', user.id).eq('partner_id', partnerId)
      setFavorites(favorites.filter(id => id !== partnerId))
    } else {
      await supabase.from('customer_favorites').insert({ customer_id: user.id, partner_id: partnerId })
      setFavorites([...favorites, partnerId])
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <CustomerLayout user={user} title="İşletme Ara" subtitle="Randevu almak için işletme bulun">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div style={styles.container}>
        {/* Left - Business List */}
        <aside style={styles.sidebar}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchInputWrapper}>
              <span style={styles.searchIcon}>{Icons.search}</span>
              <input type="text" placeholder="İşletme ara..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
            </div>
          </form>
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
          <div style={styles.resultsCount}>{businesses.length} işletme</div>
          <div className="thin-scrollbar" style={styles.businessList}>
            {businesses.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</span>
                <p>İşletme bulunamadı</p>
              </div>
            ) : (
              businesses.map(business => (
                <div key={business.id} onClick={() => selectBusiness(business)}
                  style={{ ...styles.businessCard, backgroundColor: selectedBusiness?.id === business.id ? '#f0f4ff' : '#fff', borderColor: selectedBusiness?.id === business.id ? '#6366f1' : '#f0f0f0' }}>
                  <div style={styles.businessCardLogo}>
                    {business.logo_url ? <img src={business.logo_url} alt="" style={styles.businessCardLogoImg} /> : <span>🏢</span>}
                  </div>
                  <div style={styles.businessCardInfo}>
                    <h3 style={styles.businessCardName}>{business.company_name}</h3>
                    <div style={styles.businessCardAddress}>{Icons.mapPin} {business.city || 'Adres eklenmemiş'}</div>
                    <div style={styles.businessCardRating}>
                      <span style={{ color: '#fbbf24' }}>{Icons.star}</span>
                      <span style={styles.businessCardRatingValue}>4.8</span>
                      <span style={styles.businessCardRatingCount}>(124)</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(business.id) }} style={styles.favButton}>
                    {favorites.includes(business.id) ? Icons.heartFilled : Icons.heart}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right - Business Detail */}
        <main style={styles.mainPanel}>
          {!selectedBusiness ? (
            <div style={styles.noSelection}>
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>👈</span>
              <p style={{ color: '#64748b' }}>Soldan bir işletme seçin</p>
            </div>
          ) : businessLoading ? (
            <div style={styles.loadingPanel}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <BusinessProfile 
              business={selectedBusiness} 
              services={businessData?.services || []}
              staff={businessData?.staff || []}
              reviews={businessData?.reviews || []}
              user={user}
              isFavorite={favorites.includes(selectedBusiness.id)}
              onToggleFavorite={() => toggleFavorite(selectedBusiness.id)}
            />
          )}
        </main>
      </div>
    </CustomerLayout>
  )
}

// Business Profile Component
function BusinessProfile({ business, services, staff, reviews, user, isFavorite, onToggleFavorite }) {
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const reviewsSliderRef = useRef(null)

  const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : '4.8'
  const reviewCount = reviews.length || 124

  const gallery = business?.gallery?.length > 0 ? business.gallery : [
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=600&fit=crop' },
    { url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=600&fit=crop' },
  ]

  const displayReviews = reviews.length > 0 ? reviews : [
    { id: 1, rating: 5, comment: 'Harika bir deneyimdi, çok memnun kaldım.', customers: { name: 'Ayşe K.' } },
    { id: 2, rating: 4, comment: 'Personel çok ilgili, mekan temiz ve şık.', customers: { name: 'Mehmet Y.' } },
    { id: 3, rating: 5, comment: 'Her zaman buraya geliyorum, kalite hiç düşmüyor.', customers: { name: 'Zeynep A.' } },
  ]

  const displayServices = services.length > 0 ? services : [
    { id: 1, name: 'Saç Kesimi', duration_minutes: 30, price: 150 },
    { id: 2, name: 'Saç Boyama', duration_minutes: 90, price: 400 },
    { id: 3, name: 'Manikür', duration_minutes: 45, price: 120 },
    { id: 4, name: 'Cilt Bakımı', duration_minutes: 60, price: 250 },
  ]

  const displayStaff = staff.length > 0 ? staff : [
    { id: 1, name: 'Ayşe Kuaför', title: 'Kuaför' },
    { id: 2, name: 'Ayşe Yılmaz', title: 'Stilist' },
    { id: 3, name: 'Mehmet Demir', title: 'Uzman' },
  ]

  const prevImage = () => setActiveGalleryIndex(i => i > 0 ? i - 1 : gallery.length - 1)
  const nextImage = () => setActiveGalleryIndex(i => i < gallery.length - 1 ? i + 1 : 0)
  const scrollReviews = (direction) => { if (reviewsSliderRef.current) reviewsSliderRef.current.scrollBy({ left: direction * 240, behavior: 'smooth' }) }

  return (
    <div className="thin-scrollbar" style={profileStyles.container}>
      <div style={profileStyles.content}>
        {/* Top Section */}
        <div style={profileStyles.topSection}>
          {/* Info */}
          <div style={profileStyles.infoSection}>
            <div style={profileStyles.banner}>
              {business.banner_url ? <img src={business.banner_url} alt="" style={profileStyles.bannerImg} /> : <div style={profileStyles.bannerPlaceholder}><div style={profileStyles.bannerGradient} /></div>}
              <div style={profileStyles.logoOnBanner}>
                {business.logo_url ? <img src={business.logo_url} alt="" style={profileStyles.logoImg} /> : <span style={{ fontSize: '28px' }}>✨</span>}
              </div>
            </div>
            <div style={profileStyles.infoContent}>
              <div style={profileStyles.infoTop}>
                <div>
                  <h1 style={profileStyles.businessName}>{business.company_name}</h1>
                  <div style={profileStyles.ratingRow}>
                    <div style={profileStyles.ratingBadgeSmall}><span style={{ color: '#fbbf24' }}>{Icons.star}</span><span style={profileStyles.rating}>{avgRating}</span></div>
                    <span style={profileStyles.reviewCount}>({reviewCount} yorum)</span>
                  </div>
                </div>
                <button onClick={onToggleFavorite} style={profileStyles.favButtonLarge}>
                  {isFavorite ? Icons.heartFilled : Icons.heart}
                </button>
              </div>
              <p style={profileStyles.description}>{business.description || 'Profesyonel ekibimiz ve modern ekipmanlarımızla sizlere en kaliteli hizmeti sunmak için buradayız.'}</p>
              <div style={profileStyles.contactRow}>
                {business.phone && <a href={`tel:${business.phone}`} style={profileStyles.phoneButton}>{Icons.phone} {business.phone}</a>}
                {business.city && <span style={profileStyles.addressBadge}>{Icons.mapPin} {business.city}</span>}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div style={profileStyles.gallerySection}>
            <div className="hide-scrollbar" style={profileStyles.thumbnailsVertical}>
              {gallery.map((img, i) => (
                <div key={i} onClick={() => setActiveGalleryIndex(i)} style={{ ...profileStyles.thumbnailV, border: activeGalleryIndex === i ? '2px solid #6366f1' : '2px solid transparent' }}>
                  {img.url && <img src={img.url} alt="" style={profileStyles.thumbnailImg} />}
                </div>
              ))}
            </div>
            <div style={profileStyles.mainImage}>
              {gallery[activeGalleryIndex]?.url && <img src={gallery[activeGalleryIndex].url} alt="" style={profileStyles.mainImageImg} draggable={false} />}
              <button onClick={prevImage} style={{ ...profileStyles.navButton, left: '10px' }}>{Icons.chevronLeft}</button>
              <button onClick={nextImage} style={{ ...profileStyles.navButton, right: '10px' }}>{Icons.chevronRight}</button>
              <div style={profileStyles.imageCounter}>{activeGalleryIndex + 1} / {gallery.length}</div>
            </div>
          </div>
        </div>

        {/* Services, Team, Map */}
        <div style={profileStyles.grid}>
          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}><span style={{ color: '#6366f1' }}>{Icons.scissors}</span><span style={profileStyles.cardTitle}>Hizmetler</span></div>
            <div style={profileStyles.servicesList}>
              {displayServices.slice(0, 4).map(s => (
                <div key={s.id} style={profileStyles.serviceItem}>
                  <div><div style={profileStyles.serviceName}>{s.name}</div><div style={profileStyles.serviceDuration}>{Icons.clock} {s.duration_minutes} dk</div></div>
                  <span style={profileStyles.servicePrice}>{formatPrice(s.price)}</span>
                </div>
              ))}
              {displayServices.length > 4 && <button onClick={() => setShowServicesModal(true)} style={profileStyles.showAllBtn}>Tüm Hizmetleri Gör ({displayServices.length})</button>}
            </div>
          </div>

          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}><span style={{ color: '#6366f1' }}>{Icons.users}</span><span style={profileStyles.cardTitle}>Ekip</span></div>
            <div style={profileStyles.teamList}>
              {displayStaff.map(p => (
                <div key={p.id} style={profileStyles.teamMember}>
                  <div style={profileStyles.teamAvatar}>{p.name?.charAt(0)}</div>
                  <div><div style={profileStyles.teamName}>{p.name}</div>{p.title && <div style={profileStyles.teamTitle}>{p.title}</div>}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={profileStyles.card}>
            <div style={profileStyles.cardHeader}><span style={{ color: '#6366f1' }}>{Icons.mapPin}</span><span style={profileStyles.cardTitle}>Konum</span></div>
            {business.address ? (
              <>
                <div style={profileStyles.mapWrapper}>
                  <iframe title="map" width="100%" height="100%" style={{ border: 0, borderRadius: '8px' }} loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(business.address + (business.city ? ', ' + business.city : ''))}&output=embed`} />
                </div>
                <p style={profileStyles.address}>{business.address}{business.city ? `, ${business.city}` : ''}</p>
              </>
            ) : <div style={profileStyles.noMap}>Konum eklenmemiş</div>}
          </div>
        </div>

        {/* Reviews + Book */}
        <div style={profileStyles.bottomRow}>
          <div style={{ ...profileStyles.reviewsSection, gridColumn: 'span 2' }}>
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
                <div key={r.id} style={profileStyles.reviewCard}>
                  <div style={profileStyles.reviewHeader}>
                    <div style={profileStyles.reviewAvatar}>{r.customers?.name?.charAt(0) || '?'}</div>
                    <div><div style={profileStyles.reviewName}>{r.customers?.name || 'Anonim'}</div><div>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= (r.rating || 0) ? '#fbbf24' : '#e5e7eb', fontSize: '11px' }}>★</span>)}</div></div>
                  </div>
                  {r.comment && <p style={profileStyles.reviewText}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
          
          <div style={profileStyles.bookCard}>
            <div style={profileStyles.bookCardInfo}>
              <div style={profileStyles.bookCardIcon}>{Icons.calendar}</div>
              <div><div style={profileStyles.bookCardTitle}>Hemen Randevu Al</div><div style={profileStyles.bookCardSubtitle}>{displayServices.length} hizmet • {displayStaff.length} personel</div></div>
            </div>
            <button onClick={() => setShowBookingModal(true)} style={profileStyles.bookButtonNormal}>Randevu Al</button>
          </div>
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && (
        <div style={profileStyles.modalOverlay} onClick={() => setShowServicesModal(false)}>
          <div style={profileStyles.modal} onClick={e => e.stopPropagation()}>
            <div style={profileStyles.modalHeader}><span>{Icons.scissors} Tüm Hizmetler</span><button onClick={() => setShowServicesModal(false)} style={profileStyles.closeBtn}>×</button></div>
            <div className="thin-scrollbar" style={profileStyles.modalContent}>
              {displayServices.map(s => (
                <div key={s.id} style={profileStyles.modalServiceItem}>
                  <div><div style={{ fontWeight: '500', color: '#1e293b' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.duration_minutes} dakika</div></div>
                  <span style={{ fontWeight: '700', color: '#6366f1' }}>{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && <BookingModal partnerId={business.id} services={services.length > 0 ? services : displayServices} staff={staff.length > 0 ? staff : displayStaff} user={user} onClose={() => setShowBookingModal(false)} />}
    </div>
  )
}

// Booking Modal
function BookingModal({ partnerId, services, staff, user, onClose }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const customerInfo = { name: user?.user_metadata?.name || '', phone: user?.user_metadata?.phone || '', email: user?.email || '' }

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
  const timeSlots = []
  for (let h=9;h<18;h++) for (let m=0;m<60;m+=30) timeSlots.push({hour:h,minute:m,label:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`})

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
  const calDays = getDays(currentMonth)
  const sameDay = (a,b) => a.toDateString()===b.toDateString()
  const isPast = (d) => { const t=new Date(); t.setHours(0,0,0,0); return d<t }

  const handleSubmit = async () => {
    if (!selectedService || !selectedTime) return
    setSubmitting(true)
    let cid
    const {data:ex} = await supabase.from('customers').select('id').eq('partner_id',partnerId).eq('phone',customerInfo.phone).single()
    if (ex) { cid = ex.id; await supabase.from('customers').update({ auth_user_id: user.id }).eq('id', ex.id) }
    else { const {data:nw} = await supabase.from('customers').insert({ partner_id: partnerId, ...customerInfo, auth_user_id: user.id }).select().single(); cid = nw?.id }
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
              <div><div style={{ fontWeight: '500' }}>{s.name}</div><div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.duration_minutes} dk</div></div>
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
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>{customerInfo.name?.charAt(0) || '?'}</div>
                <div><div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>{customerInfo.name}</div><div style={{ fontSize: '12px', color: '#16a34a' }}>{customerInfo.phone || customerInfo.email}</div></div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '10px' }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '14px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Geri</button>}
          <button
            onClick={() => { if (step === 1 && selectedService) setStep(2); else if (step === 2) setStep(3); else handleSubmit() }}
            disabled={(step === 1 && !selectedService) || (step === 3 && !selectedTime) || submitting}
            style={{ flex: 1, padding: '14px', border: 'none', background: (step === 1 && !selectedService) || (step === 3 && !selectedTime) ? '#e5e7eb' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', fontWeight: '600', color: (step === 1 && !selectedService) || (step === 3 && !selectedTime) ? '#94a3b8' : '#fff', cursor: 'pointer' }}>
            {submitting ? '...' : step === 3 ? 'Onayla' : 'Devam'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Styles
const styles = {
  container: { display: 'flex', minHeight: 'calc(100vh - 140px)', gap: '24px' },
  sidebar: { width: '340px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  searchForm: { padding: '16px' },
  searchInputWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  filters: { display: 'flex', gap: '8px', padding: '0 16px 16px' },
  select: { flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  resultsCount: { padding: '14px 16px', fontSize: '14px', color: '#64748b', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' },
  businessList: { flex: 1, overflowY: 'auto', padding: '12px' },
  emptyState: { textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '15px' },
  businessCard: { display: 'flex', gap: '12px', padding: '14px', borderRadius: '12px', border: '2px solid', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.15s', alignItems: 'center' },
  businessCardLogo: { width: '52px', height: '52px', backgroundColor: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
  businessCardLogoImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' },
  businessCardInfo: { flex: 1, minWidth: 0 },
  businessCardName: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' },
  businessCardAddress: { fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' },
  businessCardRating: { display: 'flex', alignItems: 'center', gap: '4px' },
  businessCardRatingValue: { fontSize: '14px', fontWeight: '600', color: '#1e293b' },
  businessCardRatingCount: { fontSize: '12px', color: '#94a3b8' },
  favButton: { width: '40px', height: '40px', borderRadius: '8px', border: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 },
  mainPanel: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden' },
  noSelection: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '15px' },
  loadingPanel: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

const profileStyles = {
  container: { height: '100%', overflowY: 'auto' },
  content: { padding: '24px' },
  topSection: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '20px' },
  infoSection: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0f0f0', minHeight: '320px', display: 'flex', flexDirection: 'column' },
  banner: { position: 'relative', height: '100px', backgroundColor: '#e5e7eb', flexShrink: 0 },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerPlaceholder: { width: '100%', height: '100%', position: 'relative', overflow: 'hidden' },
  bannerGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' },
  logoOnBanner: { position: 'absolute', bottom: '-28px', left: '20px', width: '64px', height: '64px', backgroundColor: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '3px solid #fff', fontSize: '28px' },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' },
  infoContent: { padding: '36px 20px 16px', flex: 1 },
  infoTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  businessName: { fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  ratingBadgeSmall: { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', backgroundColor: '#fef3c7', borderRadius: '8px' },
  rating: { fontWeight: '700', color: '#d97706', fontSize: '14px' },
  reviewCount: { color: '#94a3b8', fontSize: '14px' },
  favButtonLarge: { width: '46px', height: '46px', borderRadius: '12px', border: '1px solid #f0f0f0', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' },
  description: { fontSize: '15px', lineHeight: '1.7', color: '#64748b', marginBottom: '16px' },
  contactRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  phoneButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f0f4ff', borderRadius: '10px', fontSize: '14px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', border: '1px solid #e0e7ff' },
  addressBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '14px', color: '#64748b', border: '1px solid #f0f0f0' },
  gallerySection: { display: 'flex', gap: '12px', height: '320px' },
  thumbnailsVertical: { display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', width: '70px', flexShrink: 0 },
  thumbnailV: { width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 },
  thumbnailImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainImage: { flex: 1, height: '320px', borderRadius: '14px', overflow: 'hidden', position: 'relative', backgroundColor: '#e5e7eb' },
  mainImageImg: { width: '100%', height: '100%', objectFit: 'cover' },
  navButton: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' },
  imageCounter: { position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', borderRadius: '14px', fontSize: '13px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
  card: { backgroundColor: '#f8fafc', borderRadius: '14px', padding: '20px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', flex: 1 },
  servicesList: {},
  serviceItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  serviceName: { fontSize: '14px', color: '#334155', marginBottom: '3px' },
  serviceDuration: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#94a3b8' },
  servicePrice: { fontSize: '15px', fontWeight: '600', color: '#6366f1' },
  showAllBtn: { marginTop: '12px', width: '100%', padding: '12px', backgroundColor: '#fff', border: '1px solid #e0e7ff', borderRadius: '10px', fontSize: '14px', color: '#6366f1', fontWeight: '600', cursor: 'pointer' },
  teamList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  teamMember: { display: 'flex', alignItems: 'center', gap: '12px' },
  teamAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  teamName: { fontSize: '14px', color: '#334155', fontWeight: '500' },
  teamTitle: { fontSize: '12px', color: '#94a3b8' },
  mapWrapper: { width: '100%', height: '110px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' },
  address: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
  noMap: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' },
  ratingBadge: { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#d97706' },
  sliderControls: { display: 'flex', gap: '6px', marginLeft: '10px' },
  sliderBtn: { width: '32px', height: '32px', backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' },
  reviewsSlider: { display: 'flex', gap: '14px', overflowX: 'auto', scrollBehavior: 'smooth' },
  reviewCard: { flexShrink: 0, width: '220px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px' },
  reviewHeader: { display: 'flex', gap: '10px', marginBottom: '10px' },
  reviewAvatar: { width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#6366f1' },
  reviewName: { fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '3px' },
  reviewText: { fontSize: '13px', lineHeight: '1.6', color: '#64748b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' },
  bottomRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  reviewsSection: { backgroundColor: '#f8fafc', borderRadius: '14px', padding: '20px' },
  bookCard: { backgroundColor: '#f8fafc', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' },
  bookCardInfo: { display: 'flex', alignItems: 'center', gap: '14px' },
  bookCardIcon: { width: '50px', height: '50px', backgroundColor: '#f0f4ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' },
  bookCardTitle: { fontSize: '17px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' },
  bookCardSubtitle: { fontSize: '14px', color: '#94a3b8' },
  bookButtonNormal: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: '600', fontSize: '16px', color: '#1e293b' },
  modalContent: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  modalServiceItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f8fafc', fontSize: '14px' },
  closeBtn: { width: '36px', height: '36px', backgroundColor: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '8px', fontSize: '20px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
