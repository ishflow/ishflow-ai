import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const BellIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)

const CheckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const typeIcons = {
  appointment_new: '📅',
  appointment_confirmed: '✅',
  appointment_cancelled: '❌',
  appointment_reminder: '⏰',
  review_new: '⭐',
}

const typeColors = {
  appointment_new: '#6366f1',
  appointment_confirmed: '#22c55e',
  appointment_cancelled: '#ef4444',
  appointment_reminder: '#f59e0b',
  review_new: '#8b5cf6',
}

export default function NotificationBell({ userId, userType = 'partner' }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    
    loadNotifications()
    
    // Subscribe to realtime notifications
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload.new)
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
    setLoading(false)
  }

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    
    // Close dropdown
    setIsOpen(false)
    
    // Navigate based on notification type and user type
    if (notification.type.startsWith('appointment_')) {
      if (userType === 'partner') {
        navigate('/partner/appointments')
      } else {
        navigate('/customer/appointments')
      }
    } else if (notification.type === 'review_new') {
      navigate('/partner/reviews')
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Şimdi'
    if (diffMins < 60) return `${diffMins}dk önce`
    if (diffHours < 24) return `${diffHours}sa önce`
    if (diffDays < 7) return `${diffDays}g önce`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div ref={dropdownRef} style={styles.container}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.button}>
        {BellIcon}
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Bildirimler</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={styles.markAllBtn}>
                {CheckIcon}
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div style={styles.list}>
            {loading ? (
              <div style={styles.loading}>Yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</span>
                <p>Henüz bildirim yok</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    ...styles.item,
                    backgroundColor: notification.is_read ? '#fff' : '#f0f4ff',
                    cursor: 'pointer',
                  }}
                >
                  <div 
                    style={{
                      ...styles.itemIcon,
                      backgroundColor: `${typeColors[notification.type]}15`,
                      color: typeColors[notification.type],
                    }}
                  >
                    {typeIcons[notification.type] || '📌'}
                  </div>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitle}>{notification.title}</div>
                    <div style={styles.itemMessage}>{notification.message}</div>
                    <div style={styles.itemTime}>{formatTime(notification.created_at)}</div>
                  </div>
                  {!notification.is_read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div style={styles.footer}>
              <a href="/notifications" style={styles.viewAll}>
                Tüm bildirimleri gör
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
  },
  button: {
    position: 'relative',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: '0',
    width: '380px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid #f0f0f0',
    zIndex: 1000,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  markAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    color: '#6366f1',
    backgroundColor: '#f0f4ff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  list: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  loading: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8',
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 20px',
    borderBottom: '1px solid #f8fafc',
    transition: 'background-color 0.2s',
    position: 'relative',
  },
  itemIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2px',
  },
  itemMessage: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '4px',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  unreadDot: {
    position: 'absolute',
    top: '50%',
    right: '16px',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid #f0f0f0',
    textAlign: 'center',
  },
  viewAll: {
    fontSize: '13px',
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500',
  },
}
