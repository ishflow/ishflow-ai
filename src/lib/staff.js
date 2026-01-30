import { supabase } from './supabase'

export const getStaff = async (partnerId) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const getStaffMember = async (id) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export const createStaff = async (staffData) => {
  const { data, error } = await supabase
    .from('staff')
    .insert([{
      partner_id: staffData.partner_id,
      name: staffData.name,
      email: staffData.email || null,
      phone: staffData.phone || null,
      role: staffData.role || 'staff',
      is_active: true
    }])
    .select()
    .single()
  
  return { data, error }
}

export const updateStaff = async (id, staffData) => {
  const { data, error } = await supabase
    .from('staff')
    .update({
      name: staffData.name,
      email: staffData.email || null,
      phone: staffData.phone || null,
      role: staffData.role || null
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteStaff = async (id) => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)
  
  return { error }
}

export const toggleStaffStatus = async (id, isActive) => {
  const { data, error } = await supabase
    .from('staff')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}
