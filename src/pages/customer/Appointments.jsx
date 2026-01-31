import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCustomerUser, getCustomerAppointments } from '../../lib/customerAuth'
import CustomerLayout from '../../components/CustomerLayout'

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Bekliyor', bg: '#fef3c7', color: '#d97706' },
    confirmed: { label: 'Onaylandı', bg: '#d1fae5', color: '#059669' },
    completed: { label: 'Tamamlandı', bg: '#e5e7eb', color: '#6b7280' },
    cancelled: { label: 'İptal', bg: '#fee2e2', color: '#dc2626' },
  }
  const c = config[status] || config.pending
  return (
    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

export default function CustomerAppointments() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'upcoming')

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
    const { data } = await getCustomerAppointments(currentUser.id)
    setAppointments(data || [])
    setLoading(false)
  }

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.start_time) >= new Date() && a.status !== 'cancelled'
  )
  const pastAppointments = appointments.filter(a => 
    new Date(a.start_time) < new Date() || a.status === 'cancelled' || a.status === 'completed'
  )

  const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
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
    <CustomerLayout user={user} title="Randevularım" subtitle="Tüm randevularınızı buradan takip edebilirsiniz">
      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{ ...styles.tab, ...(activeTab === 'upcoming' ? styles.tabActive : {}) }}
        >
          Yaklaşan ({upcomingAppointments.length})
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          style={{ ...styles.tab, ...(activeTab === 'past' ? styles.tabActive : {}) }}
        >
          Geçmiş ({pastAppointments.length})
        </button>
      </div>

      {/* Appointments List */}
      <div style={styles.container}>
        {displayedAppointments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📅</div>
            <p style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'Yaklaşan randevunuz yok' : 'Geçmiş randevunuz yok'}
            </p>
            <p style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Yeni bir randevu almak için işletme arayın.' : 'Tamamlanan randevularınız burada görünecek.'}
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {displayedAppointments.map(apt => (
              <div key={apt.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.businessInfo}>
                    <div style={styles.businessLogo}>
                      {apt.partners?.company_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={styles.businessName}>{apt.partners?.company_name || 'İşletme'}</div>
                      <div style={styles.businessAddress}>
                        📍 {apt.partners?.address || 'Adres belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.serviceRow}>
                    <div>
                      <div style={styles.serviceLabel}>Hizmet</div>
                      <div style={styles.serviceName}>{apt.services?.name || 'Hizmet'}</div>
                    </div>
                    <div style={styles.servicePrice}>₺{apt.services?.price?.toFixed(2) || '0.00'}</div>
                  </div>
                  
                  <div style={styles.detailsRow}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>📅</span>
                      <span>{formatDate(apt.start_time)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>🕐</span>
                      <span>{formatTime(apt.start_time)} - {formatTime(apt.end_time)}</span>
                    </div>
                    {apt.staff?.name && (
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>👤</span>
                        <span>{apt.staff.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === 'upcoming' && apt.status !== 'cancelled' && (
                  <div style={styles.cardFooter}>
                    <button style={styles.cancelButton}>İptal Et</button>
                    <button style={styles.rescheduleButton}>Tarih Değiştir</button>
                  </div>
                )}

                {activeTab === 'past' && apt.status === 'completed' && (
                  <div style={styles.cardFooter}>
                    <button style={styles.reviewButton}>⭐ Değerlendir</button>
                    <button style={styles.rebookButton}>🔄 Tekrar Al</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

const styles = {
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    color: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    padding: '20px',
    borderBottom: '1px solid #f0f0f0',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  businessInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  businessLogo: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
  },
  businessName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  businessAddress: {
    fontSize: '13px',
    color: '#64748b',
  },
  cardBody: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  serviceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  serviceLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  serviceName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
  },
  servicePrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#6366f1',
  },
  detailsRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
  },
  detailIcon: {
    fontSize: '14px',
  },
  cardFooter: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  rescheduleButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  reviewButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #fef3c7',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  rebookButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
