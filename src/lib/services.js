import { supabase } from './supabase'

/**
 * Get all services for a partner
 * @param {string} partnerId - The partner's user ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getServices = async (partnerId) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

/**
 * Get a single service by ID
 * @param {string} id - The service ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getServiceById = async (id) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

/**
 * Create a new service
 * @param {Object} data - Service data
 * @param {string} data.partner_id - Partner's user ID
 * @param {string} data.name - Service name
 * @param {string} [data.description] - Service description
 * @param {number} data.duration_minutes - Duration in minutes
 * @param {number} data.price - Price
 * @param {boolean} [data.is_active=true] - Is service active
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createService = async (data) => {
  const { data: result, error } = await supabase
    .from('services')
    .insert([{
      partner_id: data.partner_id,
      name: data.name,
      description: data.description || null,
      duration_minutes: data.duration_minutes,
      price: data.price,
      is_active: data.is_active !== undefined ? data.is_active : true
    }])
    .select()
    .single()
  
  return { data: result, error }
}

/**
 * Update a service
 * @param {string} id - Service ID
 * @param {Object} data - Updated service data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateService = async (id, data) => {
  const { data: result, error } = await supabase
    .from('services')
    .update({
      name: data.name,
      description: data.description || null,
      duration_minutes: data.duration_minutes,
      price: data.price,
      is_active: data.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data: result, error }
}

/**
 * Delete a service
 * @param {string} id - Service ID
 * @returns {Promise<{error: Error|null}>}
 */
export const deleteService = async (id) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
  
  return { error }
}

/**
 * Toggle service active status
 * @param {string} id - Service ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const toggleServiceStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('services')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
