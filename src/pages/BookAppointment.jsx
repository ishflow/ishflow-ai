import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCustomerUser } from '../lib/customerAuth'

export default function BookAppointment() {
  const { businessId } = useParams()
  const [step, setStep] = useState(1)
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', notes: '' })
  
  // Müşteri auth bilgisi
  const [loggedInCustomer, setLoggedInCustomer] = useState(null)

  useEffect(() => {
    loadData()
    checkCustomerAuth()
  }, [businessId])
  
  const checkCustomerAuth = async () => {
    const { user } = await getCustomerUser()
    console.log('BookAppointment - checkCustomerAuth:', user)
    console.log('BookAppointment - user_metadata:', user?.user_metadata)
    // Partner değilse ve giriş yapmışsa kabul et
    if (user && user.user_metadata?.role !== 'partner') {
      console.log('BookAppointment - Setting loggedInCustomer')
      setLoggedInCustomer(user)
      // Müşteri bilgilerini otomatik doldur
      setCustomerInfo({
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || '',
        notes: ''
      })
    }
  }

  const loadData = async () => {
    const [businessRes, servicesRes, staffRes] = await Promise.all([
      supabase.from('partners').select('*').eq('id', businessId).single(),
      supabase.from('services').select('*').eq('partner_id', businessId).eq('is_active', true),
      supabase.from('staff').select('*').eq('partner_id', businessId).eq('is_active', true)
    ])
    setBusiness(businessRes.data)
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
    setLoading(false)
  }

  const timeSlots = []
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone) {
      return alert('Lütfen tüm gerekli alanları doldurun')
    }

    setSubmitting(true)
    
    // Create or find customer
    let customerId
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('partner_id', businessId)
      .eq('phone', customerInfo.phone)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Eğer giriş yapmış müşteri ise auth_user_id'yi güncelle
      if (loggedInCustomer) {
        await supabase
          .from('customers')
          .update({ auth_user_id: loggedInCustomer.id })
          .eq('id', existingCustomer.id)
      }
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({ 
          partner_id: businessId, 
          ...customerInfo,
          // Giriş yapmış müşteri ise auth_user_id ekle
          auth_user_id: loggedInCustomer?.id || null
        })
        .select()
        .single()
      customerId = newCustomer?.id
    }

    // Create appointment
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)

    const { error } = await supabase.from('appointments').insert({
      partner_id: businessId,
      customer_id: customerId,
      service_id: selectedService.id,
      staff_id: selectedStaff?.id || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending',
      notes: customerInfo.notes
    })

    setSubmitting(false)
    if (error) return alert('Bir hata oluştu')
    setSuccess(true)
  }

  const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '40px' }}>
            ✅
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>Randevu Alındı!</h1>
          <p style={{ color: '#6b7280', marginBottom: '32px' }}>Randevunuz başarıyla oluşturuldu. İşletme sizinle iletişime geçecek.</p>
          <Link to={`/business/${businessId}`} style={{
            display: 'inline-flex', padding: '14px 28px', backgroundColor: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: '600', textDecoration: 'none'
          }}>
            Tamam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <Link to={`/business/${businessId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri
          </Link>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Adım {step}/3</span>
        </div>
      </header>

      {/* Progress */}
      <div style={{ backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: s <= step ? '#2563eb' : '#e5e7eb' }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          {business?.company_name}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '32px' }}>
          {step === 1 && 'Hizmet seçin'}
          {step === 2 && 'Tarih ve saat seçin'}
          {step === 3 && (loggedInCustomer ? 'Randevuyu onaylayın' : 'Bilgilerinizi girin')}
        </p>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {services.map(service => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '20px',
                  border: selectedService?.id === service.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{service.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{service.duration_minutes} dk</p>
                </div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{formatPrice(service.price)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Tarih</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Saat</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '10px',
                      fontSize: '14px',
                      border: selectedTime === time ? '2px solid #2563eb' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: selectedTime === time ? '#eff6ff' : 'white',
                      color: selectedTime === time ? '#2563eb' : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            {staff.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Personel (opsiyonel)</label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {staff.map(person => (
                    <div
                      key={person.id}
                      onClick={() => setSelectedStaff(selectedStaff?.id === person.id ? null : person)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        border: selectedStaff?.id === person.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#2563eb' }}>
                        {person.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '14px', color: '#111827' }}>{person.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer Info / Confirmation */}
        {step === 3 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Giriş yapmış müşteri için özet göster */}
            {loggedInCustomer ? (
              <>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }}>
                    {customerInfo.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#166534' }}>{customerInfo.name}</div>
                    <div style={{ fontSize: '14px', color: '#16a34a' }}>{customerInfo.phone} • {customerInfo.email}</div>
                  </div>
                </div>
                
                {/* Randevu özeti */}
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Randevu Özeti</h3>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hizmet:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{selectedService?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tarih:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{selectedDate && new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Saat:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{selectedTime}</span>
                    </div>
                    {selectedStaff && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Personel:</span>
                        <span style={{ fontWeight: '500', color: '#111827' }}>{selectedStaff.name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Toplam:</span>
                      <span style={{ fontWeight: '700', color: '#2563eb' }}>{formatPrice(selectedService?.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Not alanı */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Not (opsiyonel)</label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Eklemek istediğiniz bir not..."
                    rows={2}
                    style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px', resize: 'vertical' }}
                  />
                </div>
              </>
            ) : (
              /* Giriş yapmamış kullanıcı için form göster */
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Ad Soyad *</label>
                  <input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Telefon *</label>
                  <input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="+90 555 123 4567"
                    style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>E-posta</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="ornek@email.com"
                    style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Not</label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Eklemek istediğiniz bir not..."
                    rows={3}
                    style={{ width: '100%', padding: '12px 16px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '10px', resize: 'vertical' }}
                  />
                </div>
                
                {/* Giriş yap linki */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px' }}>Zaten hesabınız var mı?</p>
                  <Link to="/customer/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Giriş yapın →</Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Geri
            </button>
          )}
          <button
            onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
            disabled={
              (step === 1 && !selectedService) ||
              (step === 2 && (!selectedDate || !selectedTime)) ||
              submitting
            }
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              opacity: ((step === 1 && !selectedService) || (step === 2 && (!selectedDate || !selectedTime)) || submitting) ? 0.5 : 1
            }}
          >
            {submitting ? 'Gönderiliyor...' : (step === 3 ? 'Randevu Al' : 'Devam')}
          </button>
        </div>
      </main>
    </div>
  )
}
