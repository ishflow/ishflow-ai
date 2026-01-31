import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getCustomerUser } from '../../lib/customerAuth'
import CustomerLayout from '../../components/CustomerLayout'

// Icons
const HeartIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
const MapPinIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
const StarIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
const TrashIcon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>

export default function CustomerFavorites() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

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
    await loadFavorites(currentUser.id)
    setLoading(false)
  }

  const loadFavorites = async (userId) => {
    const { data, error } = await supabase
      .from('customer_favorites')
      .select(`
        id,
        partner_id,
        created_at,
        partners (
          id,
          company_name,
          logo_url,
          banner_url,
          address,
          city,
          phone,
          category
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setFavorites(data.filter(f => f.partners)) // Filter out any broken references
    }
  }

  const removeFavorite = async (favoriteId, partnerName) => {
    if (!confirm(`${partnerName} favorilerden kaldırılsın mı?`)) return
    
    const { error } = await supabase
      .from('customer_favorites')
      .delete()
      .eq('id', favoriteId)
    
    if (!error) {
      setFavorites(favorites.filter(f => f.id !== favoriteId))
    }
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
    <CustomerLayout user={user} title="Favorilerim" subtitle="Kaydettiğiniz işletmeler">
      <div style={styles.container}>
        {favorites.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>❤️</div>
            <h3 style={styles.emptyTitle}>Henüz favori işletmeniz yok</h3>
            <p style={styles.emptyText}>
              İşletmeleri favorilere ekleyerek kolayca erişebilirsiniz.
            </p>
            <Link to="/customer/search" style={styles.searchButton}>
              İşletme Ara
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.header}>
              <span style={styles.count}>{favorites.length} favori işletme</span>
            </div>
            <div style={styles.grid}>
              {favorites.map(fav => (
                <div key={fav.id} style={styles.card}>
                  <div style={styles.cardBanner}>
                    {fav.partners.banner_url ? (
                      <img src={fav.partners.banner_url} alt="" style={styles.bannerImg} />
                    ) : (
                      <div style={styles.bannerPlaceholder} />
                    )}
                    <button 
                      onClick={() => removeFavorite(fav.id, fav.partners.company_name)} 
                      style={styles.removeBtn}
                      title="Favorilerden kaldır"
                    >
                      {TrashIcon}
                    </button>
                    <div style={styles.logoOnBanner}>
                      {fav.partners.logo_url ? (
                        <img src={fav.partners.logo_url} alt="" style={styles.logoImg} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>🏢</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{fav.partners.company_name}</h3>
                    {fav.partners.category && (
                      <span style={styles.categoryBadge}>{fav.partners.category}</span>
                    )}
                    <div style={styles.cardMeta}>
                      {(fav.partners.address || fav.partners.city) && (
                        <div style={styles.metaItem}>
                          {MapPinIcon}
                          <span>{fav.partners.city || fav.partners.address}</span>
                        </div>
                      )}
                      <div style={styles.metaItem}>
                        {StarIcon}
                        <span style={{ fontWeight: '600' }}>4.8</span>
                        <span style={{ color: '#94a3b8' }}>(124)</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    <Link to={`/customer/search?select=${fav.partners.id}`} style={styles.viewButton}>
                      Görüntüle
                    </Link>
                    <Link to={`/book/${fav.partners.id}`} style={styles.bookButton}>
                      Randevu Al
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  )
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    padding: '24px',
    minHeight: '400px',
  },
  header: {
    marginBottom: '20px',
  },
  count: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
    maxWidth: '300px',
    margin: '0 auto 24px',
    lineHeight: '1.6',
  },
  searchButton: {
    display: 'inline-block',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardBanner: {
    position: 'relative',
    height: '120px',
    backgroundColor: '#e5e7eb',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
  },
  removeBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.95)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logoOnBanner: {
    position: 'absolute',
    bottom: '-24px',
    left: '16px',
    width: '56px',
    height: '56px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '3px solid #fff',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  cardContent: {
    padding: '32px 20px 16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#f0f4ff',
    color: '#6366f1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '12px',
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#64748b',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    padding: '0 20px 20px',
  },
  viewButton: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#6366f1',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: '1px solid #e0e7ff',
  },
  bookButton: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
  },
}
