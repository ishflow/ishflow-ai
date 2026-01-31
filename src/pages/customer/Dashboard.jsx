import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCustomerUser, getCustomerAppointments } from '../../lib/customerAuth'
import CustomerLayout from '../../components/CustomerLayout'

// Icons
const CalendarIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const CheckCircleIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

const HeartIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)

const ClockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const MapPinIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const ArrowRightIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
)

const RepeatIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
)

const StatusBadge = ({ status }) => {
  const config = {
    pending: { label: 'Bekliyor', bg: '#fef3c7', color: '#d97706' },
    confirmed: { label: 'Onaylandı', bg: '#d1fae5', color: '#059669' },
    completed: { label: 'Tamamlandı', bg: '#e5e7eb', color: '#6b7280' },
    cancelled: { label: 'İptal', bg: '#fee2e2', color: '#dc2626' },
  }
  const c = config[status] || config.pending
  return (
    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { user: currentUser } = await getCustomerUser()
    
    if (!currentUser) {
      navigate('/customer/login')
      return
    }
    
    if (currentUser.user_metadata?.role === 'partner') {
      navigate('/customer/login')
      return
    }

    setUser(currentUser)
    
    const { data: appts } = await getCustomerAppointments(currentUser.id)
    setAppointments(appts || [])
    setLoading(false)
  }

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.start_time) >= new Date() && a.status !== 'cancelled'
  ).slice(0, 3)

  const pastAppointments = appointments.filter(a => 
    new Date(a.start_time) < new Date() || a.status === 'completed'
  ).slice(0, 3)

  const stats = {
    upcoming: appointments.filter(a => new Date(a.start_time) >= new Date() && a.status !== 'cancelled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    favorites: 0, // TODO: implement favorites
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Bugün'
    if (date.toDateString() === tomorrow.toDateString()) return 'Yarın'

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })
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
    <CustomerLayout user={user} title={`Merhaba, ${user?.user_metadata?.name?.split(' ')[0] || 'Kullanıcı'}! 👋`} subtitle="Randevularınızı buradan takip edebilirsiniz">
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            {CalendarIcon}
          </div>
          <div>
            <div style={styles.statValue}>{stats.upcoming}</div>
            <div style={styles.statLabel}>Yaklaşan</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#f0fdf4', color: '#22c55e' }}>
            {CheckCircleIcon}
          </div>
          <div>
            <div style={styles.statValue}>{stats.completed}</div>
            <div style={styles.statLabel}>Tamamlanan</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fef2f2', color: '#ef4444' }}>
            {HeartIcon}
          </div>
          <div>
            <div style={styles.statValue}>{stats.favorites}</div>
            <div style={styles.statLabel}>Favori</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Upcoming Appointments */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Yaklaşan Randevular</h2>
            <Link to="/customer/appointments" style={styles.viewAllLink}>
              Tümünü Gör {ArrowRightIcon}
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <p style={styles.emptyText}>Yaklaşan randevunuz yok</p>
              <Link to="/customer/search" style={styles.emptyButton}>İşletme Bul</Link>
            </div>
          ) : (
            <div style={styles.appointmentsList}>
              {upcomingAppointments.map(apt => (
                <div key={apt.id} style={styles.appointmentCard}>
                  <div style={styles.appointmentDate}>
                    <div style={styles.dateDay}>{new Date(apt.start_time).getDate()}</div>
                    <div style={styles.dateMonth}>
                      {new Date(apt.start_time).toLocaleDateString('tr-TR', { month: 'short' })}
                    </div>
                  </div>
                  <div style={styles.appointmentInfo}>
                    <div style={styles.appointmentBusiness}>{apt.partners?.company_name || 'İşletme'}</div>
                    <div style={styles.appointmentService}>
                      {apt.services?.name} • {formatTime(apt.start_time)}
                    </div>
                    {apt.partners?.address && (
                      <div style={styles.appointmentAddress}>
                        {MapPinIcon} {apt.partners.address}
                      </div>
                    )}
                  </div>
                  <div style={styles.appointmentRight}>
                    <StatusBadge status={apt.status} />
                    <div style={styles.appointmentPrice}>
                      ₺{apt.services?.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Hızlı İşlemler</h2>
          </div>
          <div style={styles.quickActions}>
            <Link to="/customer/search" style={styles.quickAction}>
              <div style={{ ...styles.quickActionIcon, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div>
                <div style={styles.quickActionTitle}>İşletme Bul</div>
                <div style={styles.quickActionDesc}>Yeni randevu al</div>
              </div>
            </Link>
            <Link to="/customer/appointments" style={styles.quickAction}>
              <div style={{ ...styles.quickActionIcon, background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                {CalendarIcon}
              </div>
              <div>
                <div style={styles.quickActionTitle}>Randevularım</div>
                <div style={styles.quickActionDesc}>Tüm randevuları gör</div>
              </div>
            </Link>
            <Link to="/customer/favorites" style={styles.quickAction}>
              <div style={{ ...styles.quickActionIcon, background: 'linear-gradient(135deg, #f43f5e, #fb7185)' }}>
                {HeartIcon}
              </div>
              <div>
                <div style={styles.quickActionTitle}>Favorilerim</div>
                <div style={styles.quickActionDesc}>Kayıtlı işletmeler</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent History */}
      {pastAppointments.length > 0 && (
        <div style={{ ...styles.section, marginTop: '24px' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Geçmiş Randevular</h2>
            <Link to="/customer/appointments?tab=past" style={styles.viewAllLink}>
              Tümünü Gör {ArrowRightIcon}
            </Link>
          </div>
          <div style={styles.historyGrid}>
            {pastAppointments.map(apt => (
              <div key={apt.id} style={styles.historyCard}>
                <div style={styles.historyTop}>
                  <div style={styles.historyBusiness}>{apt.partners?.company_name || 'İşletme'}</div>
                  <StatusBadge status={apt.status} />
                </div>
                <div style={styles.historyService}>{apt.services?.name}</div>
                <div style={styles.historyDate}>
                  {ClockIcon} {formatDate(apt.start_time)} • {formatTime(apt.start_time)}
                </div>
                <button style={styles.rebookButton}>
                  {RepeatIcon} Tekrar Randevu Al
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #f0f0f0',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #f0f0f0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyText: {
    color: '#64748b',
    marginBottom: '16px',
  },
  emptyButton: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  appointmentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  appointmentDate: {
    width: '52px',
    height: '52px',
    backgroundColor: '#6366f1',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    flexShrink: 0,
  },
  dateDay: {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: 1,
  },
  dateMonth: {
    fontSize: '11px',
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    flex: 1,
    minWidth: 0,
  },
  appointmentBusiness: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  appointmentService: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '4px',
  },
  appointmentAddress: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  appointmentRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  appointmentPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  quickActionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  quickActionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2px',
  },
  quickActionDesc: {
    fontSize: '12px',
    color: '#64748b',
  },
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  historyCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  historyBusiness: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  historyService: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
  },
  historyDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '12px',
  },
  rebookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6366f1',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
