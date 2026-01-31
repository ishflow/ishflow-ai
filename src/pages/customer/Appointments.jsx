import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
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
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)

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

  const handleCancel = async (appointment) => {
    setCancelling(true)
    
    // Update appointment status to cancelled
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)
    
    if (error) {
      alert('İptal işlemi başarısız: ' + error.message)
    } else {
      // Update local state
      setAppointments(prev => 
        prev.map(a => a.id === appointment.id ? { ...a, status: 'cancelled' } : a)
      )
      setCancelModal(null)
    }
    setCancelling(false)
  }

  const openRescheduleModal = (appointment) => {
    setRescheduleModal(appointment)
    setRescheduleDate('')
    setRescheduleTime('')
    setAvailableSlots([])
  }

  const loadAvailableSlots = async (date) => {
    if (!rescheduleModal || !date) return
    
    setLoadingSlots(true)
    setRescheduleDate(date)
    setRescheduleTime('')
    
    const selectedDate = new Date(date)
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 999)
    
    // Get existing appointments for that day (excluding current appointment)
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('partner_id', rescheduleModal.partner_id)
      .neq('id', rescheduleModal.id)
      .neq('status', 'cancelled')
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString())
    
    // Generate time slots (09:00 - 18:00, 30 min intervals)
    const slots = []
    const duration = rescheduleModal.services?.duration_minutes || 30
    
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = new Date(selectedDate)
        slotStart.setHours(hour, min, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)
        
        // Check if slot is in the past
        if (slotStart < new Date()) continue
        
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppts?.some(apt => {
          const aptStart = new Date(apt.start_time)
          const aptEnd = new Date(apt.end_time)
          return (slotStart < aptEnd && slotEnd > aptStart)
        })
        
        if (!hasConflict) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            start: slotStart,
            end: slotEnd
          })
        }
      }
    }
    
    setAvailableSlots(slots)
    setLoadingSlots(false)
  }

  const handleReschedule = async () => {
    if (!rescheduleModal || !rescheduleDate || !rescheduleTime) return
    
    setRescheduling(true)
    
    const slot = availableSlots.find(s => s.time === rescheduleTime)
    if (!slot) {
      alert('Geçersiz saat seçimi')
      setRescheduling(false)
      return
    }
    
    const { error } = await supabase
      .from('appointments')
      .update({
        start_time: slot.start.toISOString(),
        end_time: slot.end.toISOString(),
        status: 'pending' // Reset to pending after reschedule
      })
      .eq('id', rescheduleModal.id)
    
    if (error) {
      alert('Tarih değiştirme başarısız: ' + error.message)
    } else {
      // Update local state
      setAppointments(prev => 
        prev.map(a => a.id === rescheduleModal.id 
          ? { ...a, start_time: slot.start.toISOString(), end_time: slot.end.toISOString(), status: 'pending' } 
          : a
        )
      )
      setRescheduleModal(null)
    }
    setRescheduling(false)
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
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
                    <button onClick={() => setCancelModal(apt)} style={styles.cancelButton}>İptal Et</button>
                    <button onClick={() => openRescheduleModal(apt)} style={styles.rescheduleButton}>Tarih Değiştir</button>
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

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Randevuyu İptal Et</h3>
            <p style={styles.modalText}>
              <strong>{cancelModal.partners?.company_name}</strong> işletmesindeki 
              <strong> {cancelModal.services?.name}</strong> randevunuzu iptal etmek istediğinize emin misiniz?
            </p>
            <p style={styles.modalDate}>
              📅 {formatDate(cancelModal.start_time)} - {formatTime(cancelModal.start_time)}
            </p>
            <div style={styles.modalButtons}>
              <button 
                onClick={() => setCancelModal(null)} 
                style={styles.modalCancelBtn}
                disabled={cancelling}
              >
                Vazgeç
              </button>
              <button 
                onClick={() => handleCancel(cancelModal)} 
                style={styles.modalConfirmBtn}
                disabled={cancelling}
              >
                {cancelling ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '500px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ ...styles.modalTitle, marginBottom: 0 }}>📅 Tarih Değiştir</h3>
              <button 
                onClick={() => setRescheduleModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                <strong style={{ color: '#1e293b' }}>{rescheduleModal.partners?.company_name}</strong>
                <br />
                {rescheduleModal.services?.name} • {rescheduleModal.services?.duration_minutes} dk
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                Mevcut: {formatDate(rescheduleModal.start_time)} - {formatTime(rescheduleModal.start_time)}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>
                Yeni Tarih Seçin
              </label>
              <input
                type="date"
                min={getMinDate()}
                value={rescheduleDate}
                onChange={(e) => loadAvailableSlots(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {rescheduleDate && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '8px' }}>
                  Uygun Saatler
                </label>
                {loadingSlots ? (
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>Yükleniyor...</p>
                ) : availableSlots.length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: '14px' }}>Bu tarihte uygun saat yok</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => setRescheduleTime(slot.time)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: rescheduleTime === slot.time ? '2px solid #6366f1' : '1px solid #e5e7eb',
                          backgroundColor: rescheduleTime === slot.time ? '#f0f4ff' : '#fff',
                          color: rescheduleTime === slot.time ? '#6366f1' : '#64748b',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={styles.modalButtons}>
              <button 
                onClick={() => setRescheduleModal(null)} 
                style={styles.modalCancelBtn}
                disabled={rescheduling}
              >
                Vazgeç
              </button>
              <button 
                onClick={handleReschedule} 
                style={{
                  ...styles.modalConfirmBtn,
                  backgroundColor: '#6366f1',
                  opacity: (!rescheduleDate || !rescheduleTime) ? 0.5 : 1
                }}
                disabled={!rescheduleDate || !rescheduleTime || rescheduling}
              >
                {rescheduling ? 'Kaydediliyor...' : 'Tarihi Değiştir'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  },
  modalIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px',
  },
  modalText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  modalDate: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: '24px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  modalCancelBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
