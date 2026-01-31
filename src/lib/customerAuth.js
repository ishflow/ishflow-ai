import { supabase } from './supabase'

/**
 * Müşteri kayıt
 * @param {Object} data - { phone, name, email, password }
 */
export const customerRegister = async ({ phone, name, email, password }) => {
  try {
    // 1. Supabase Auth ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          phone: phone,
          name: name,
          role: 'customer'
        }
      }
    })

    if (authError) throw authError

    // 2. Mevcut müşteri kaydı var mı kontrol et (telefon ile)
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id, partner_id')
      .eq('phone', phone)

    // 3. Mevcut müşteri kayıtlarını auth_user_id ile güncelle
    if (existingCustomers && existingCustomers.length > 0) {
      for (const customer of existingCustomers) {
        await supabase
          .from('customers')
          .update({ 
            auth_user_id: authData.user.id,
            email: email,
            name: name 
          })
          .eq('id', customer.id)
      }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Müşteri giriş
 * @param {Object} data - { email, password }
 */
export const customerLogin = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

/**
 * Müşteri çıkış
 */
export const customerLogout = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Mevcut müşteri session'ı al
 */
export const getCustomerSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Mevcut müşteri bilgilerini al
 */
export const getCustomerUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Müşterinin randevularını getir
 * @param {string} authUserId - Auth user ID
 */
export const getCustomerAppointments = async (authUserId) => {
  // Önce bu auth user'a bağlı customer ID'lerini bul
  const { data: customers, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', authUserId)

  if (customerError || !customers || customers.length === 0) {
    // Auth user'a bağlı customer yoksa, telefon ile dene
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.phone) {
      const { data: phoneCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', user.user_metadata.phone)
      
      if (phoneCustomers && phoneCustomers.length > 0) {
        const customerIds = phoneCustomers.map(c => c.id)
        return getAppointmentsByCustomerIds(customerIds)
      }
    }
    return { data: [], error: null }
  }

  const customerIds = customers.map(c => c.id)
  return getAppointmentsByCustomerIds(customerIds)
}

/**
 * Customer ID'lere göre randevuları getir
 */
const getAppointmentsByCustomerIds = async (customerIds) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      services:service_id (name, price, duration_minutes),
      staff:staff_id (name),
      partners:partner_id (company_name, phone, address)
    `)
    .in('customer_id', customerIds)
    .order('start_time', { ascending: false })

  return { data, error }
}

/**
 * Müşteri profilini güncelle
 */
export const updateCustomerProfile = async (authUserId, updates) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('auth_user_id', authUserId)
    .select()

  return { data, error }
}
