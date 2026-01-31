import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../../lib/supabase'
import PartnerLayout from '../../components/PartnerLayout'
import WeekCalendar from '../../components/WeekCalendar'

// Icons
const CalendarIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const CheckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
)

const XIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

const ListIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const GridIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

export default function Appointments() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' veya 'list'
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createData, setCreateData] = useState(null) // { date, startMinutes, duration }
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null) // { title, message, onConfirm }

  useEffect(() => {
    checkUser()
  }, [])

  // Realtime subscription for appointment updates
  useEffect(() => {
    if (!partner?.id) return

    const channel = supabase
      .channel(`appointments-${partner.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `partner_id=eq.${partner.id}`,
        },
        (payload) => {
          console.log('Appointment change:', payload)
          // Reload appointments when any change happens
          loadAppointments(partner.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partner?.id])

  const checkUser = async () => {
    const { user: currentUser, error } = await auth.getUser()
    if (error || !currentUser) {
      navigate('/partner/login')
      return
    }
    setUser(currentUser)
    
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', currentUser.id).single()
    setPartner(partnerData)
    
    await loadAppointments(currentUser.id)
  }

  const loadAppointments = async (partnerId) => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, duration_minutes, price),
        staff(name),
        customers(name, phone, email)
      `)
      .eq('partner_id', partnerId)
      .order('start_time', { ascending: true })
    
    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status } : apt
      ))
      setSelectedAppointment(null)
    }
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

  const formatTime = (timeStr) => timeStr?.slice(0, 5) || ''

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price || 0)

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter)

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const handleAppointmentClick = (apt) => {
    setSelectedAppointment(apt)
  }

  // Takvimde sürükleyerek yeni randevu oluşturma
  const handleAppointmentCreate = (date, startMinutes, duration) => {
    const hours = Math.floor(startMinutes / 60)
    const mins = startMinutes % 60
    setCreateData({
      date: date.toISOString().split('T')[0],
      time: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      duration
    })
    setShowCreateModal(true)
  }

  // Randevuyu taşıma
  const handleAppointmentMove = async (appointmentId, newDate, newStartMinutes) => {
    // Mevcut randevuyu bul ve süresini hesapla
    const apt = appointments.find(a => a.id === appointmentId)
    if (!apt) return

    const oldStart = new Date(apt.start_time)
    const oldEnd = new Date(apt.end_time)
    const duration = oldEnd - oldStart // milisaniye cinsinden süre

    // Yeni start_time ve end_time hesapla
    const newStartTime = new Date(newDate)
    newStartTime.setHours(Math.floor(newStartMinutes / 60), newStartMinutes % 60, 0, 0)
    const newEndTime = new Date(newStartTime.getTime() + duration)
    
    // Eski ve yeni zamanı formatla
    const formatDateTime = (date) => date.toLocaleString('tr-TR', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    })

    const doMove = async (reasonNote = '') => {
      // Mevcut nota sebep ekle
      let updatedNotes = apt.notes || ''
      if (reasonNote) {
        const timestamp = new Date().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        updatedNotes = updatedNotes 
          ? `${updatedNotes}\n\n[${timestamp}] Zaman değişikliği: ${reasonNote}`
          : `[${timestamp}] Zaman değişikliği: ${reasonNote}`
      }

      const { error } = await supabase
        .from('appointments')
        .update({ 
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          notes: updatedNotes || apt.notes
        })
        .eq('id', appointmentId)

      if (!error) {
        setAppointments(prev => prev.map(a =>
          a.id === appointmentId 
            ? { ...a, start_time: newStartTime.toISOString(), end_time: newEndTime.toISOString(), notes: updatedNotes || a.notes }
            : a
        ))
      }
    }

    // Onay dialogu göster
    setConfirmDialog({
      title: 'Randevu Taşıma',
      message: `Randevu zamanı değiştirilecek.\n\nEski: ${formatDateTime(oldStart)}\nYeni: ${formatDateTime(newStartTime)}`,
      onConfirm: (note) => {
        doMove(note)
        setConfirmDialog(null)
      }
    })
  }

  // Randevu süresini değiştirme (sadece bitiş saati)
  const handleAppointmentResize = async (appointmentId, newDuration) => {
    const apt = appointments.find(a => a.id === appointmentId)
    if (!apt) return

    // Hizmet süresini kontrol et
    const serviceDuration = apt.services?.duration_minutes || 30
    
    const doResize = async (reasonNote = '') => {
      const startTime = new Date(apt.start_time)
      const newEndTime = new Date(startTime.getTime() + newDuration * 60000)
      
      // Mevcut nota sebep ekle
      let updatedNotes = apt.notes || ''
      if (reasonNote) {
        const timestamp = new Date().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        updatedNotes = updatedNotes 
          ? `${updatedNotes}\n\n[${timestamp}] Süre değişikliği: ${reasonNote}`
          : `[${timestamp}] Süre değişikliği: ${reasonNote}`
      }

      const { error } = await supabase
        .from('appointments')
        .update({ 
          end_time: newEndTime.toISOString(),
          notes: updatedNotes || apt.notes
        })
        .eq('id', appointmentId)

      if (!error) {
        setAppointments(prev => prev.map(a =>
          a.id === appointmentId 
            ? { ...a, end_time: newEndTime.toISOString(), notes: updatedNotes || a.notes }
            : a
        ))
      }
    }
    
    // Süre farklıysa uyarı göster
    if (newDuration !== serviceDuration) {
      setConfirmDialog({
        title: 'Süre Değişikliği',
        message: `Bu randevunun süresi hizmet süresinden (${serviceDuration} dk) farklı olacak.\n\nYeni süre: ${newDuration} dk`,
        onConfirm: (note) => {
          doResize(note)
          setConfirmDialog(null)
        }
      })
    } else {
      doResize()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <PartnerLayout 
      partner={partner} 
      user={user} 
      title="Randevular"
    >
      {/* Filter Tabs & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Filter Tabs with Counts */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Tümü', count: stats.total, color: '#6366f1', bgActive: '#6366f1' },
            { key: 'pending', label: 'Bekleyen', count: stats.pending, color: '#f59e0b', bgActive: '#f59e0b' },
            { key: 'confirmed', label: 'Onaylanan', count: stats.confirmed, color: '#10b981', bgActive: '#10b981' },
            { key: 'cancelled', label: 'İptal', count: stats.cancelled, color: '#ef4444', bgActive: '#ef4444' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: filter === f.key ? 'none' : '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: filter === f.key ? f.bgActive : 'white',
                color: filter === f.key ? 'white' : '#64748b'
              }}
            >
              {f.label}
              <span style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: filter === f.key ? 'rgba(255,255,255,0.25)' : f.color + '15',
                color: filter === f.key ? 'white' : f.color
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: viewMode === 'calendar' ? 'white' : 'transparent',
              color: viewMode === 'calendar' ? '#6366f1' : '#6b7280',
              boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
            title="Takvim Görünümü"
          >
            {GridIcon}
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
              color: viewMode === 'list' ? '#6366f1' : '#6b7280',
              boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
            title="Liste Görünümü"
          >
            {ListIcon}
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <WeekCalendar 
          appointments={filteredAppointments}
          onAppointmentClick={handleAppointmentClick}
          onAppointmentCreate={handleAppointmentCreate}
          onAppointmentMove={handleAppointmentMove}
          onAppointmentResize={handleAppointmentResize}
        />
      ) : (
        <ListView 
          appointments={filteredAppointments}
          formatDate={formatDate}
          formatTime={formatTime}
          formatPrice={formatPrice}
          updateStatus={updateStatus}
          CalendarIcon={CalendarIcon}
          CheckIcon={CheckIcon}
          XIcon={XIcon}
          PhoneIcon={PhoneIcon}
        />
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentModal 
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={updateStatus}
          onEdit={(apt) => {
            setSelectedAppointment(null)
            setEditingAppointment(apt)
          }}
          formatTime={formatTime}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          partnerId={user?.id}
          onClose={() => setEditingAppointment(null)}
          onSuccess={async () => {
            setEditingAppointment(null)
            await loadAppointments(user.id)
          }}
        />
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && createData && (
        <CreateAppointmentModal
          data={createData}
          partnerId={user?.id}
          onClose={() => {
            setShowCreateModal(false)
            setCreateData(null)
          }}
          onSuccess={async () => {
            setShowCreateModal(false)
            setCreateData(null)
            await loadAppointments(user.id)
          }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </PartnerLayout>
  )
}

// Stat Card Component (Dashboard style)
function StatCard({ label, value, color, active, onClick }) {
  const gradients = {
    indigo: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    amber: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    emerald: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    red: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
  }

  const borderColors = {
    indigo: '#6366f1',
    amber: '#f59e0b',
    emerald: '#10b981',
    red: '#ef4444'
  }

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: active ? `2px solid ${borderColors[color]}` : '1px solid #f0f0f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: gradients[color],
        borderRadius: '50%',
        opacity: 0.1
      }} />
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{value}</p>
    </div>
  )
}

// List View Component
function ListView({ 
  appointments, 
  formatDate, 
  formatTime, 
  formatPrice, 
  updateStatus,
  CalendarIcon,
  CheckIcon,
  XIcon,
  PhoneIcon
}) {
  const statusConfig = {
    confirmed: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', label: 'Onaylı', dateBg: '#10b981' },
    pending: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', label: 'Bekliyor', dateBg: '#f59e0b' },
    cancelled: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', label: 'İptal', dateBg: '#9ca3af' },
    completed: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', label: 'Tamamlandı', dateBg: '#22c55e' }
  }

  if (appointments.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #f0f0f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ color: '#9ca3af', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{CalendarIcon}</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Henüz randevu yok</h3>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Müşterileriniz randevu aldığında burada görünecek</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #f0f0f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {appointments.map((apt, index) => {
        const status = statusConfig[apt.status] || statusConfig.pending
        const startDate = new Date(apt.start_time)
        const isPast = new Date(apt.end_time || apt.start_time) < new Date()
        
        return (
          <div 
            key={apt.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px 24px',
              borderBottom: index < appointments.length - 1 ? '1px solid #f1f5f9' : 'none',
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
          >
            {/* Date Badge */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: status.dateBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1 }}>
                {startDate.getDate()}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.9, textTransform: 'capitalize' }}>
                {startDate.toLocaleDateString('tr-TR', { month: 'short' })}
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  {apt.customers?.name || 'Müşteri'}
                </p>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: status.bg,
                  color: status.text,
                  border: `1px solid ${status.border}`
                }}>
                  {status.label}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0' }}>
                {apt.services?.name} • {startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} • {apt.services?.duration_minutes || 30} dk
              </p>
              {apt.customers?.phone && (
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {apt.customers.phone}
                </p>
              )}
            </div>

            {/* Price & Staff */}
            <div style={{ textAlign: 'right', marginRight: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{formatPrice(apt.services?.price)}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>{apt.staff?.name || '-'}</p>
            </div>

            {/* Actions - Geçmiş değilse göster */}
            {apt.status === 'pending' && !isPast && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'confirmed') }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Onayla
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateStatus(apt.id, 'cancelled') }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  İptal
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Appointment Detail Modal
function AppointmentModal({ appointment, onClose, onStatusChange, onEdit, formatTime, formatPrice, formatDate }) {
  const apt = appointment
  
  // Geçmiş randevu kontrolü
  const isPast = new Date(apt.end_time || apt.start_time) < new Date()

  const statusColors = {
    confirmed: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', label: 'Onaylandı' },
    pending: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', label: 'Bekliyor' },
    cancelled: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', label: 'İptal' },
    completed: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', label: 'Tamamlandı' }
  }
  const status = statusColors[apt.status] || statusColors.pending

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{formatDate(apt.start_time)}</p>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {apt.services?.name || 'Randevu'}
              </h3>
              <span style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '20px',
                backgroundColor: status.bg,
                color: status.text,
                border: `1px solid ${status.border}`
              }}>
                {status.label}
              </span>
            </div>
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Customer Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#6366f1' }}>
                {(apt.customers?.name || 'M')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {apt.customers?.name || 'Müşteri'}
              </p>
              {apt.customers?.phone && (
                <p style={{ fontSize: '14px', color: '#64748b', margin: '2px 0 0 0' }}>{apt.customers.phone}</p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            padding: '20px 0',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Saat</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Süre</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {apt.services?.duration_minutes || 30} dakika
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Ücret</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {formatPrice(apt.services?.price)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Personel</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                {apt.staff?.name || '-'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {apt.notes && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Notlar</p>
              <p style={{ fontSize: '14px', color: '#1e293b', margin: 0, lineHeight: '1.5' }}>{apt.notes}</p>
            </div>
          )}
        </div>

        {/* Actions - Geçmiş randevular için sadece görüntüleme */}
        {isPast ? (
          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ 
              textAlign: 'center', 
              color: '#94a3b8', 
              fontSize: '13px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              margin: 0
            }}>
              Bu randevu geçmiş tarihli olduğu için düzenlenemez
            </p>
          </div>
        ) : (
          <div style={{ padding: '0 24px 24px', display: 'flex', gap: '12px' }}>
            {/* Düzenle butonu */}
            <button
              onClick={() => onEdit(apt)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Düzenle
            </button>
            
            {/* Pending: Onayla + İptal */}
            {apt.status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusChange(apt.id, 'confirmed')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Onayla
                </button>
                <button
                  onClick={() => onStatusChange(apt.id, 'cancelled')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  İptal Et
                </button>
              </>
            )}
            
            {/* Confirmed: Tamamla + İptal */}
            {apt.status === 'confirmed' && (
              <>
                <button
                  onClick={() => onStatusChange(apt.id, 'completed')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Tamamla
                </button>
                <button
                  onClick={() => onStatusChange(apt.id, 'cancelled')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  İptal Et
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Create Appointment Modal
function CreateAppointmentModal({ data, partnerId, onClose, onSuccess }) {
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    service_id: '',
    staff_id: '',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [servicesRes, staffRes, customersRes] = await Promise.all([
      supabase.from('services').select('*').eq('partner_id', partnerId).eq('is_active', true),
      supabase.from('staff').select('*').eq('partner_id', partnerId).eq('is_active', true),
      supabase.from('customers').select('*').eq('partner_id', partnerId).limit(100)
    ])
    
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
    setCustomers(customersRes.data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Müşteri yoksa oluştur
      let customerId = form.customer_id
      if (!customerId && form.customer_name) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            partner_id: partnerId,
            name: form.customer_name,
            phone: form.customer_phone
          })
          .select()
          .single()
        
        if (customerError) throw customerError
        customerId = newCustomer.id
      }

      // Seçilen hizmetin süresini al (yoksa varsayılan 30dk)
      const selectedService = services.find(s => s.id === form.service_id)
      const serviceDuration = selectedService?.duration_minutes || 30
      
      // start_time ve end_time hesapla
      const [hours, mins] = data.time.split(':').map(Number)
      const startTime = new Date(data.date)
      startTime.setHours(hours, mins, 0, 0)
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000)

      // Randevu oluştur
      const { error } = await supabase
        .from('appointments')
        .insert({
          partner_id: partnerId,
          service_id: form.service_id || null,
          staff_id: form.staff_id || null,
          customer_id: customerId || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'pending',
          notes: form.notes
        })

      if (error) throw error
      
      onSuccess()
    } catch (err) {
      console.error('Randevu oluşturulamadı:', err)
      alert('Randevu oluşturulurken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Input style helper
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '8px'
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Yeni Randevu</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                {formatDate(data.date)} • {data.time} - {data.duration} dk
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Hizmet */}
              <div>
                <label style={labelStyle}>Hizmet</label>
                <select
                  value={form.service_id}
                  onChange={e => setForm({ ...form, service_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Hizmet seçin</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.duration_minutes} dk - {s.price} ₺
                    </option>
                  ))}
                </select>
              </div>

              {/* Personel */}
              <div>
                <label style={labelStyle}>Personel</label>
                <select
                  value={form.staff_id}
                  onChange={e => setForm({ ...form, staff_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Personel seçin (opsiyonel)</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Müşteri */}
              <div>
                <label style={labelStyle}>Müşteri</label>
                <select
                  value={form.customer_id}
                  onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Yeni müşteri ekle</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>

              {/* Yeni Müşteri Alanları */}
              {!form.customer_id && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <div>
                    <label style={labelStyle}>Müşteri Adı</label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={e => setForm({ ...form, customer_name: e.target.value })}
                      placeholder="Ad Soyad"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Telefon</label>
                    <input
                      type="tel"
                      value={form.customer_phone}
                      onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                      placeholder="0555 123 4567"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Notlar */}
              <div>
                <label style={labelStyle}>Notlar (opsiyonel)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Randevu ile ilgili notlar..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {submitting ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// Edit Appointment Modal
function EditAppointmentModal({ appointment, partnerId, onClose, onSuccess }) {
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const startDate = new Date(appointment.start_time)
  const endDate = new Date(appointment.end_time)
  const durationMinutes = Math.round((endDate - startDate) / 60000)
  
  const [form, setForm] = useState({
    service_id: appointment.service_id || '',
    staff_id: appointment.staff_id || '',
    date: startDate.toISOString().split('T')[0],
    time: startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    duration: durationMinutes,
    notes: appointment.notes || '',
    status: appointment.status
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [servicesRes, staffRes] = await Promise.all([
      supabase.from('services').select('*').eq('partner_id', partnerId),
      supabase.from('staff').select('*').eq('partner_id', partnerId)
    ])
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const [hours, mins] = form.time.split(':').map(Number)
      const startTime = new Date(form.date)
      startTime.setHours(hours, mins, 0, 0)
      const endTime = new Date(startTime.getTime() + form.duration * 60000)

      const { error } = await supabase
        .from('appointments')
        .update({
          service_id: form.service_id || null,
          staff_id: form.staff_id || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          notes: form.notes,
          status: form.status
        })
        .eq('id', appointment.id)

      if (error) throw error
      onSuccess()
    } catch (err) {
      console.error('Randevu güncellenemedi:', err)
      alert('Randevu güncellenirken bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'white',
    outline: 'none'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '8px'
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Randevuyu Düzenle</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                {appointment.customers?.name || 'Müşteri'}
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tarih & Saat */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Tarih</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Saat</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Süre */}
              <div>
                <label style={labelStyle}>Süre (dakika)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 30 })}
                  min="15"
                  step="15"
                  style={inputStyle}
                />
              </div>

              {/* Hizmet */}
              <div>
                <label style={labelStyle}>Hizmet</label>
                <select
                  value={form.service_id}
                  onChange={e => setForm({ ...form, service_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Hizmet seçin</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Personel */}
              <div>
                <label style={labelStyle}>Personel</label>
                <select
                  value={form.staff_id}
                  onChange={e => setForm({ ...form, staff_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Personel seçin</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Durum */}
              <div>
                <label style={labelStyle}>Durum</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="pending">Bekliyor</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              {/* Notlar */}
              <div>
                <label style={labelStyle}>Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Randevu notları..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// Confirm Dialog Component with Notes
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const [note, setNote] = useState('')
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: '16px'
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>{title}</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>{message}</p>
        </div>

        {/* Note Input */}
        <div style={{ padding: '20px 24px 0' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
            Sebep (opsiyonel)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Süre değişikliği sebebini yazın..."
            rows={2}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#1e293b',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            İptal
          </button>
          <button
            onClick={() => onConfirm(note)}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  )
}
