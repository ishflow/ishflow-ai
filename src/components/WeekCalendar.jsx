import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

// Grid sabitleri
const HOUR_HEIGHT = 80 // 80px per hour = 40px per 30min
const TIME_COLUMN_WIDTH = 72
const GRID_PADDING_TOP = 8

// 24 saat
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

// Durum renkleri
const STATUS_COLORS = {
  pending: { bg: '#fffbeb', border: '#fcd34d', title: '#92400e', time: '#d97706', dot: '#f59e0b' },
  confirmed: { bg: '#ecfeff', border: '#67e8f9', title: '#155e75', time: '#0891b2', dot: null },
  completed: { bg: '#ecfdf5', border: '#6ee7b7', title: '#065f46', time: '#059669', dot: null },
  cancelled: { bg: '#fef2f2', border: '#fca5a5', title: '#b91c1c', time: '#ef4444', dot: null }
}

const PAST_COLORS = { bg: '#ffffff', border: '#d1d5db', title: '#6b7280', time: '#9ca3af', dot: null }

// Yardımcı fonksiyonlar
function getWeekDates(date) {
  const week = []
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? -6 : 1 - day
  current.setDate(current.getDate() + diff)
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return week
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getDate() === date2.getDate()
}

function formatDateRange(dates) {
  if (dates.length < 2) return ''
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  return `${dates[0].getDate()} - ${dates[6].getDate()} ${months[dates[0].getMonth()]} ${dates[0].getFullYear()}`
}

function isAppointmentPast(apt) {
  return new Date(apt.end_time || apt.start_time) < new Date()
}

const snapToGrid = (minutes) => Math.round(minutes / 30) * 30

function calculateOverlaps(appointments) {
  if (appointments.length === 0) return new Map()
  const ranges = appointments.map(apt => {
    const start = new Date(apt.start_time)
    const end = new Date(apt.end_time)
    return { id: apt.id, startMinutes: start.getHours() * 60 + start.getMinutes(), endMinutes: end.getHours() * 60 + end.getMinutes() }
  })
  ranges.sort((a, b) => a.startMinutes - b.startMinutes)
  
  const result = new Map()
  const columnAssignments = new Map()
  const activeColumns = []
  
  const events = []
  ranges.forEach(r => {
    events.push({ time: r.startMinutes, type: 'start', id: r.id })
    events.push({ time: r.endMinutes, type: 'end', id: r.id })
  })
  events.sort((a, b) => a.time !== b.time ? a.time - b.time : (a.type === 'end' ? -1 : 1))
  
  events.forEach(event => {
    if (event.type === 'start') {
      let col = activeColumns.findIndex(o => !o)
      if (col === -1) { col = activeColumns.length; activeColumns.push(true) }
      else activeColumns[col] = true
      columnAssignments.set(event.id, col)
    } else {
      activeColumns[columnAssignments.get(event.id)] = false
    }
  })
  
  ranges.forEach(range => {
    const overlapping = ranges.filter(o => range.startMinutes < o.endMinutes && range.endMinutes > o.startMinutes)
    const maxCol = Math.max(...overlapping.map(o => columnAssignments.get(o.id)))
    result.set(range.id, { columnIndex: columnAssignments.get(range.id), totalColumns: maxCol + 1, startMinutes: range.startMinutes, endMinutes: range.endMinutes })
  })
  return result
}

export default function WeekCalendar({ appointments = [], onAppointmentClick, onAppointmentCreate, onAppointmentMove, onAppointmentResize, isLoading = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const scrollRef = useRef(null)
  const gridRef = useRef(null)
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const today = new Date()

  const [isCreating, setIsCreating] = useState(false)
  const [createStart, setCreateStart] = useState(null)
  const [createEnd, setCreateEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedApt, setDraggedApt] = useState(null)
  const [dragPosition, setDragPosition] = useState(null)
  const [pendingDrag, setPendingDrag] = useState(null)
  const didDragRef = useRef(false)
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizingApt, setResizingApt] = useState(null)
  const [resizeEndMinutes, setResizeEndMinutes] = useState(null)

  const appointmentsByDay = useMemo(() => {
    const grouped = {}
    weekDates.forEach(date => {
      const key = date.toISOString().split('T')[0]
      const dayApts = appointments.filter(apt => isSameDay(new Date(apt.start_time), date))
      grouped[key] = { appointments: dayApts, overlaps: calculateOverlaps(dayApts) }
    })
    return grouped
  }, [appointments, weekDates])

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date()
      const scrollTo = Math.max(0, (now.getHours() - 2) * HOUR_HEIGHT)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [])

  const getGridPosition = useCallback((e) => {
    if (!gridRef.current) return null
    const rect = gridRef.current.getBoundingClientRect()
    const relativeX = e.clientX - rect.left - TIME_COLUMN_WIDTH
    const relativeY = e.clientY - rect.top - GRID_PADDING_TOP
    const dayWidth = (rect.width - TIME_COLUMN_WIDTH) / 7
    const dayIndex = Math.max(0, Math.min(6, Math.floor(relativeX / dayWidth)))
    const rawMinutes = (relativeY / HOUR_HEIGHT) * 60
    const minutes = snapToGrid(Math.max(0, Math.min(24 * 60 - 30, rawMinutes)))
    return { dayIndex, minutes }
  }, [])

  const handleGridMouseDown = useCallback((e, dayIndex) => {
    if (e.target.closest('.apt-card')) return
    const pos = getGridPosition(e)
    if (!pos) return
    
    // Geçmiş tarihe randevu oluşturulamaz
    const selectedDate = weekDates[dayIndex]
    const selectedDateTime = new Date(selectedDate)
    selectedDateTime.setHours(Math.floor(pos.minutes / 60), pos.minutes % 60, 0, 0)
    if (selectedDateTime < new Date()) return
    
    setIsCreating(true)
    setCreateStart({ dayIndex, minutes: pos.minutes })
    setCreateEnd({ dayIndex, minutes: pos.minutes + 30 })
  }, [getGridPosition, weekDates])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return
      const rect = gridRef.current.getBoundingClientRect()
      const relativeX = e.clientX - rect.left - TIME_COLUMN_WIDTH
      const relativeY = e.clientY - rect.top - GRID_PADDING_TOP
      const dayWidth = (rect.width - TIME_COLUMN_WIDTH) / 7
      const dayIndex = Math.max(0, Math.min(6, Math.floor(relativeX / dayWidth)))
      const minutes = snapToGrid(Math.max(0, Math.min(24 * 60, (relativeY / HOUR_HEIGHT) * 60)))

      if (pendingDrag && !isDragging) {
        const dx = Math.abs(e.clientX - pendingDrag.startX)
        const dy = Math.abs(e.clientY - pendingDrag.startY)
        if (dx > 5 || dy > 5) {
          setIsDragging(true)
          setDraggedApt(pendingDrag.apt)
          setDragPosition({ dayIndex: pendingDrag.dayIndex, minutes: pendingDrag.startMinutes })
          didDragRef.current = true
        }
      }
      if (isCreating && createStart) {
        setCreateEnd({ dayIndex: createStart.dayIndex, minutes: Math.min(24 * 60, Math.max(createStart.minutes + 30, minutes + 30)) })
      }
      if (isDragging && draggedApt && pendingDrag) {
        // Offset'i çıkararak kartın bütün olarak kaymasını sağla
        const adjustedMinutes = snapToGrid(Math.max(0, minutes - (pendingDrag.clickOffset || 0)))
        setDragPosition({ dayIndex, minutes: adjustedMinutes })
      }
      // Resize handling
      if (isResizing && resizingApt) {
        const start = new Date(resizingApt.start_time)
        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const newEndMinutes = Math.max(startMinutes + 30, minutes) // minimum 30dk
        setResizeEndMinutes(newEndMinutes)
      }
    }

    const handleMouseUp = () => {
      if (isCreating && createStart && createEnd && onAppointmentCreate) {
        const duration = createEnd.minutes - createStart.minutes
        if (duration >= 30) onAppointmentCreate(weekDates[createStart.dayIndex], createStart.minutes, duration)
      }
      if (isDragging && draggedApt && dragPosition && onAppointmentMove) {
        onAppointmentMove(draggedApt.id, weekDates[dragPosition.dayIndex], dragPosition.minutes)
      }
      // Resize complete
      if (isResizing && resizingApt && resizeEndMinutes && onAppointmentResize) {
        const start = new Date(resizingApt.start_time)
        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const newDuration = resizeEndMinutes - startMinutes
        onAppointmentResize(resizingApt.id, newDuration)
      }
      setIsCreating(false); setCreateStart(null); setCreateEnd(null)
      setIsDragging(false); setDraggedApt(null); setDragPosition(null); setPendingDrag(null)
      setIsResizing(false); setResizingApt(null); setResizeEndMinutes(null)
      setTimeout(() => { didDragRef.current = false }, 100)
    }

    if (isCreating || isDragging || pendingDrag || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }
    }
  }, [isCreating, isDragging, pendingDrag, isResizing, createStart, createEnd, draggedApt, dragPosition, resizingApt, resizeEndMinutes, weekDates, onAppointmentCreate, onAppointmentMove, onAppointmentResize])

  const handleAptDragStart = useCallback((e, apt) => {
    e.stopPropagation(); e.preventDefault()
    const pos = getGridPosition(e)
    if (!pos) return
    const start = new Date(apt.start_time)
    const aptStartMinutes = start.getHours() * 60 + start.getMinutes()
    // Tıklanan nokta ile kartın üstü arasındaki farkı hesapla (offset)
    const clickOffset = pos.minutes - aptStartMinutes
    setPendingDrag({ 
      apt, 
      startX: e.clientX, 
      startY: e.clientY, 
      dayIndex: pos.dayIndex, 
      startMinutes: aptStartMinutes,
      clickOffset: Math.max(0, clickOffset) // Kartın neresinden tutulduğu
    })
    didDragRef.current = false
  }, [getGridPosition])

  const handleResizeStart = useCallback((e, apt) => {
    e.stopPropagation(); e.preventDefault()
    setIsResizing(true)
    setResizingApt(apt)
    const end = new Date(apt.end_time)
    setResizeEndMinutes(end.getHours() * 60 + end.getMinutes())
    didDragRef.current = true
  }, [])

  const handlePrevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d) }
  const handleNextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d) }
  const handleToday = () => setCurrentDate(new Date())

  if (isLoading) return <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Yükleniyor...</div>

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      {/* Header - Kompakt */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '44px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: '100%', backgroundColor: '#f9fafb', padding: '1px 6px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                {currentDate.toLocaleDateString('tr-TR', { month: 'short' })}
              </span>
            </div>
            <div style={{ width: '100%', padding: '1px 6px', textAlign: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#6366f1' }}>{currentDate.getDate()}</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{formatDateRange(weekDates)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <button onClick={handlePrevWeek} style={{ padding: '6px 10px', border: 'none', background: 'white', cursor: 'pointer', borderRight: '1px solid #e5e7eb' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={handleToday} style={{ padding: '6px 12px', border: 'none', background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#374151', borderRight: '1px solid #e5e7eb' }}>Bugün</button>
            <button onClick={handleNextWeek} style={{ padding: '6px 10px', border: 'none', background: 'white', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: '#374151', background: 'white' }}>Haftalık</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, 1fr)`, borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 20, background: 'white' }}>
          <div style={{ borderRight: '1px solid #f0f0f0', height: '40px' }} />
          {weekDates.map((date, i) => {
            const isToday = isSameDay(date, today)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', borderRight: i < 6 ? '1px solid #f0f0f0' : 'none', height: '40px', backgroundColor: isToday ? '#eef2ff' : 'white' }}>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280' }}>{DAYS_TR[i]}</span>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', backgroundColor: isToday ? '#6366f1' : 'transparent', color: isToday ? 'white' : '#374151' }}>
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time Grid */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: `${TIME_COLUMN_WIDTH}px repeat(7, 1fr)`, paddingTop: '8px', position: 'relative' }}>
          {/* Time Labels */}
          <div style={{ borderRight: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
            {TIME_SLOTS.map((time, i) => (
              <div key={i} style={{ height: HOUR_HEIGHT, position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-8px', right: '8px', fontSize: '11px', fontWeight: '500', color: '#9ca3af' }}>{time}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDates.map((date, dayIndex) => {
            const dateKey = date.toISOString().split('T')[0]
            const dayData = appointmentsByDay[dateKey] || { appointments: [], overlaps: new Map() }
            const isToday = isSameDay(date, today)

            return (
              <div
                key={dayIndex}
                style={{ position: 'relative', borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none', height: 24 * HOUR_HEIGHT, backgroundColor: isToday ? 'rgba(99,102,241,0.03)' : 'white', cursor: 'crosshair' }}
                onMouseDown={(e) => handleGridMouseDown(e, dayIndex)}
              >
                {/* Hour Lines */}
                {TIME_SLOTS.map((_, i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i + 1) * HOUR_HEIGHT, borderBottom: '1px solid #f0f0f0' }} />
                ))}

                {/* Create Preview */}
                {isCreating && createStart && createEnd && createStart.dayIndex === dayIndex && (
                  <div style={{ position: 'absolute', left: '6px', right: '6px', top: (createStart.minutes / 60) * HOUR_HEIGHT + 4, height: ((createEnd.minutes - createStart.minutes) / 60) * HOUR_HEIGHT - 8, backgroundColor: 'rgba(99,102,241,0.15)', border: '2px dashed #6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 15, pointerEvents: 'none' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6366f1' }}>
                      {String(Math.floor(createStart.minutes / 60)).padStart(2, '0')}:{String(createStart.minutes % 60).padStart(2, '0')} - {String(Math.floor(createEnd.minutes / 60)).padStart(2, '0')}:{String(createEnd.minutes % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Drag Ghost */}
                {isDragging && draggedApt && dragPosition && dragPosition.dayIndex === dayIndex && (
                  <div style={{ position: 'absolute', left: '6px', right: '6px', top: (dragPosition.minutes / 60) * HOUR_HEIGHT, height: ((new Date(draggedApt.end_time) - new Date(draggedApt.start_time)) / 60000 / 60) * HOUR_HEIGHT, backgroundColor: 'rgba(99,102,241,0.3)', border: '2px solid #6366f1', borderRadius: '8px', zIndex: 25, pointerEvents: 'none' }} />
                )}

                {/* Appointments */}
                {dayData.appointments.map(apt => {
                  const overlapInfo = dayData.overlaps.get(apt.id)
                  if (!overlapInfo) return null
                  const { columnIndex, totalColumns, startMinutes, endMinutes } = overlapInfo
                  const duration = endMinutes - startMinutes
                  const isPast = isAppointmentPast(apt)
                  const colors = isPast ? PAST_COLORS : (STATUS_COLORS[apt.status] || STATUS_COLORS.pending)
                  const isBeingDragged = isDragging && draggedApt?.id === apt.id
                  const isBeingResized = isResizing && resizingApt?.id === apt.id

                  const padding = 4
                  const gap = 4
                  const totalGaps = (totalColumns - 1) * gap
                  const colWidth = `calc((100% - ${padding * 2}px - ${totalGaps}px) / ${totalColumns})`
                  const leftPos = `calc(${padding}px + ${columnIndex} * (${colWidth} + ${gap}px))`
                  
                  // Resize preview height
                  const displayEndMinutes = isBeingResized && resizeEndMinutes ? resizeEndMinutes : endMinutes
                  const displayDuration = displayEndMinutes - startMinutes
                  
                  // Minimum 30dk boyutu
                  const minDuration = 30 // dakika
                  const minHeight = (minDuration / 60) * HOUR_HEIGHT - padding * 2
                  const calculatedHeight = (displayDuration / 60) * HOUR_HEIGHT - padding * 2
                  const cardHeight = Math.max(minHeight, calculatedHeight)

                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: isBeingDragged ? 0.5 : 1, scale: 1 }}
                      className="apt-card"
                      style={{
                        position: 'absolute',
                        top: (startMinutes / 60) * HOUR_HEIGHT + padding,
                        left: leftPos,
                        width: colWidth,
                        height: cardHeight,
                        zIndex: isBeingResized ? 25 : 10,
                        cursor: isPast ? 'default' : 'grab'
                      }}
                      onMouseDown={(e) => !isPast && !e.target.closest('.resize-handle') && handleAptDragStart(e, apt)}
                      onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) onAppointmentClick?.(apt) }}
                    >
                      <div style={{
                        height: '100%',
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        padding: '6px 8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: colors.title, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {apt.customers?.name || apt.services?.name || 'Randevu'}
                            </p>
                            {displayDuration > 30 && (
                              <p style={{ fontSize: '11px', color: colors.time, margin: '2px 0 0 0' }}>
                                {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          {colors.dot && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.dot, marginLeft: '4px', flexShrink: 0 }} />}
                        </div>
                        
                        {/* Resize Handle - tek çizgi */}
                        {!isPast && (
                          <div
                            className="resize-handle"
                            onMouseDown={(e) => handleResizeStart(e, apt)}
                            style={{
                              position: 'absolute',
                              bottom: '1px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '24px',
                              height: '8px',
                              cursor: 'ns-resize',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <div style={{ width: '20px', height: '1px', backgroundColor: colors.border }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )
          })}

          {/* Current Time Line */}
          {weekDates.some(d => isSameDay(d, today)) && <CurrentTimeLine weekDates={weekDates} />}
        </div>
      </div>
    </div>
  )
}

function CurrentTimeLine({ weekDates }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(i) }, [])
  
  const todayIndex = weekDates.findIndex(d => isSameDay(d, now))
  if (todayIndex === -1) return null
  
  const top = GRID_PADDING_TOP + (now.getHours() * HOUR_HEIGHT) + (now.getMinutes() / 60 * HOUR_HEIGHT)
  
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: `${top + 48}px`, display: 'flex', alignItems: 'center', pointerEvents: 'none', zIndex: 20 }}>
      <div style={{ width: `${TIME_COLUMN_WIDTH}px`, textAlign: 'right', paddingRight: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6366f1' }}>
          {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#6366f1', borderRadius: '50%', marginLeft: '-5px' }} />
        <div style={{ flex: 1, height: '2px', backgroundColor: '#6366f1' }} />
      </div>
    </div>
  )
}
