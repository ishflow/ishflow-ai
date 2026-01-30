import { supabase } from './supabase'

/**
 * Get business by ID (public)
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getBusinessById = async (id) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  return { data, error }
}

/**
 * Get business by slug (public)
 * @param {string} slug - URL-friendly business slug
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getBusinessBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  return { data, error }
}

/**
 * Get business by partner ID
 * @param {string} partnerId - Partner's user ID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getBusinessByPartnerId = async (partnerId) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('partner_id', partnerId)
    .single()
  
  return { data, error }
}

/**
 * Get business with services (public)
 * @param {string} id - Business UUID
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getBusinessWithServices = async (id) => {
  // First get the business
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  if (bizError || !business) {
    return { data: null, error: bizError }
  }

  // Then get active services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('partner_id', business.partner_id)
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (servicesError) {
    return { data: business, error: servicesError }
  }

  return { 
    data: { ...business, services: services || [] }, 
    error: null 
  }
}

/**
 * Get services for a business (public)
 * @param {string} partnerId - Partner's user ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getPublicServices = async (partnerId) => {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price')
    .eq('partner_id', partnerId)
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  return { data, error }
}

/**
 * Create business profile (partner only)
 * @param {Object} data - Business data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const createBusiness = async (data) => {
  const { data: result, error } = await supabase
    .from('businesses')
    .insert([{
      partner_id: data.partner_id,
      name: data.name,
      description: data.description || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      category: data.category || null,
      is_active: true
    }])
    .select()
    .single()
  
  return { data: result, error }
}

/**
 * Update business profile (partner only)
 * @param {string} id - Business ID
 * @param {Object} data - Updated business data
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateBusiness = async (id, data) => {
  const { data: result, error } = await supabase
    .from('businesses')
    .update({
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      category: data.category,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data: result, error }
}

/**
 * Search businesses (public)
 * @param {Object} options - Search options
 * @param {string} [options.query] - Search query
 * @param {string} [options.category] - Category filter
 * @param {number} [options.limit=20] - Results limit
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchBusinesses = async ({ query, category, limit = 20 } = {}) => {
  let queryBuilder = supabase
    .from('businesses')
    .select('id, name, slug, description, address, category, logo_url')
    .eq('is_active', true)
    .limit(limit)

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`)
  }

  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  const { data, error } = await queryBuilder.order('name', { ascending: true })
  
  return { data, error }
}

export default {
  getBusinessById,
  getBusinessBySlug,
  getBusinessByPartnerId,
  getBusinessWithServices,
  getPublicServices,
  createBusiness,
  updateBusiness,
  searchBusinesses
}
