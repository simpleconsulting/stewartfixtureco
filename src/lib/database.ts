import type { Database, ServiceOffering, LeadInsert, LeadServiceInterestInsert } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type for the Supabase client
export type SupabaseClientType = SupabaseClient<Database>

// Generic database query helpers with error handling
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await queryFn()
    
    if (result.error) {
      console.error('Database query error:', result.error)
      // Handle Supabase error objects properly
      const errorMessage = (result.error as { message?: string })?.message || result.error.message || 'Database operation failed'
      return { 
        data: null, 
        error: errorMessage
      }
    }
    
    return { data: result.data, error: null }
  } catch (error) {
    console.error('Unexpected database error:', error)
    // Better error handling for different error types
    let errorMessage = 'Unexpected error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as { message: string }).message
    }
    return { 
      data: null, 
      error: errorMessage
    }
  }
}

// Batch insert helper with transaction support
export async function batchInsert<T extends Record<string, unknown>>(
  supabase: SupabaseClientType,
  table: keyof Database['public']['Tables'],
  records: T[],
  chunkSize: number = 1000
): Promise<{ success: boolean; insertedCount: number; error?: string }> {
  try {
    let insertedCount = 0
    
    // Process in chunks to avoid query size limits
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize)
      const { error } = await supabase
        .from(table as keyof Database['public']['Tables'])
        .insert(chunk as never)
        .select()
      
      if (error) {
        return { 
          success: false, 
          insertedCount, 
          error: error.message 
        }
      }
      
      insertedCount += chunk.length
    }
    
    return { success: true, insertedCount }
  } catch (error) {
    return {
      success: false,
      insertedCount: 0,
      error: error instanceof Error ? error.message : 'Batch insert failed'
    }
  }
}

// Soft delete helper (sets is_active to false instead of deleting)
export async function softDelete(
  supabase: SupabaseClientType,
  table: keyof Database['public']['Tables'],
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(table as keyof Database['public']['Tables'])
      .update({ is_active: false } as never)
      .eq('id', id)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Soft delete failed'
    }
  }
}

// Service-specific database functions

// Fetch all active service offerings
export async function fetchServices(
  supabase: SupabaseClientType
): Promise<{ data: ServiceOffering[] | null; error: string | null }> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('service_offerings')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  })
}

// Fetch a single service by ID
export async function fetchServiceById(
  supabase: SupabaseClientType,
  id: string
): Promise<{ data: ServiceOffering | null; error: string | null }> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('service_offerings')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  })
}

// Fetch services by multiple IDs
export async function fetchServicesByIds(
  supabase: SupabaseClientType,
  ids: string[]
): Promise<{ data: ServiceOffering[] | null; error: string | null }> {
  if (ids.length === 0) {
    return { data: [], error: null }
  }
  
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('service_offerings')
      .select('*')
      .in('id', ids)
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  })
}

// Lead-specific database functions

// Create a lead from quote form data
export async function createLeadFromQuote(
  supabase: SupabaseClientType,
  leadData: {
    full_name?: string
    email?: string
    phone?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
    lat?: number
    lng?: number
    service_notes?: string
    source?: string
    utm_source?: string | null
    utm_medium?: string | null
    utm_campaign?: string | null
    utm_term?: string | null
    utm_content?: string | null
  },
  serviceQuantities: Record<string, number>
): Promise<{ data: { leadId: string } | null; error: string | null }> {
  return executeQuery(async () => {
    let leadId: string

    // Check if lead with this email already exists
    if (leadData.email) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', leadData.email)
        .single()

      if (existingLead) {
        leadId = existingLead.id
        
        // Get current submission count to increment it
        const { data: currentLead } = await supabase
          .from('leads')
          .select('submission_count')
          .eq('id', leadId)
          .single()
        
        const currentCount = currentLead?.submission_count || 1
        const newCount = currentCount + 1
        
        console.log(`Returning lead (visit #${newCount}) with email:`, leadData.email)
        
        // Update the existing lead with new information
        const updateData: Partial<LeadInsert> = {
          updated_at: new Date().toISOString(),
          last_submission_at: new Date().toISOString(),
          submission_count: newCount,
          is_returning: true
        }
        
        // Only update fields if they're provided and not empty
        if (leadData.full_name) updateData.full_name = leadData.full_name
        if (leadData.phone) updateData.phone = leadData.phone
        if (leadData.address_line1) updateData.address_line1 = leadData.address_line1
        if (leadData.city) updateData.city = leadData.city
        if (leadData.state) updateData.state = leadData.state
        if (leadData.postal_code) updateData.postal_code = leadData.postal_code
        if (leadData.service_notes) updateData.service_notes = leadData.service_notes
        
        // Always update UTM params if provided (for latest campaign)
        if (leadData.utm_source) updateData.utm_source = leadData.utm_source
        if (leadData.utm_medium) updateData.utm_medium = leadData.utm_medium
        if (leadData.utm_campaign) updateData.utm_campaign = leadData.utm_campaign
        if (leadData.utm_term) updateData.utm_term = leadData.utm_term
        if (leadData.utm_content) updateData.utm_content = leadData.utm_content

        await supabase
          .from('leads')
          .update(updateData)
          .eq('id', leadId)
      } else {
        // Create new lead
        const leadInsert: LeadInsert = {
          full_name: leadData.full_name || null,
          email: leadData.email || null,
          phone: leadData.phone || null,
          address_line1: leadData.address_line1 || null,
          address_line2: leadData.address_line2 || null,
          city: leadData.city || null,
          state: leadData.state || null,
          postal_code: leadData.postal_code || null,
          country: leadData.country || 'USA',
          lat: leadData.lat || null,
          lng: leadData.lng || null,
          service_notes: leadData.service_notes || null,
          source: leadData.source || 'website',
          utm_source: leadData.utm_source || null,
          utm_medium: leadData.utm_medium || null,
          utm_campaign: leadData.utm_campaign || null,
          utm_term: leadData.utm_term || null,
          utm_content: leadData.utm_content || null,
          status: 'new',
          contact_count: 0
        }

        console.log('Creating NEW lead with email:', leadData.email)

        const { data: leadResult, error: leadError } = await supabase
          .from('leads')
          .insert([leadInsert])
          .select('id')
          .single()

        if (leadError) {
          throw leadError
        }

        leadId = leadResult.id
      }
    } else {
      // No email provided, always create new lead
      const leadInsert: LeadInsert = {
        full_name: leadData.full_name || null,
        email: leadData.email || null,
        phone: leadData.phone || null,
        address_line1: leadData.address_line1 || null,
        address_line2: leadData.address_line2 || null,
        city: leadData.city || null,
        state: leadData.state || null,
        postal_code: leadData.postal_code || null,
        country: leadData.country || 'USA',
        lat: leadData.lat || null,
        lng: leadData.lng || null,
        service_notes: leadData.service_notes || null,
        source: leadData.source || 'website',
        utm_source: leadData.utm_source || null,
        utm_medium: leadData.utm_medium || null,
        utm_campaign: leadData.utm_campaign || null,
        utm_term: leadData.utm_term || null,
        utm_content: leadData.utm_content || null,
        status: 'new',
        contact_count: 0
      }

      console.log('Creating NEW lead (no email provided)')

      const { data: leadResult, error: leadError } = await supabase
        .from('leads')
        .insert([leadInsert])
        .select('id')
        .single()

      if (leadError) {
        throw leadError
      }

      leadId = leadResult.id
    }

    console.log('Lead ID:', leadId)
    console.log('Service quantities:', serviceQuantities)

    // Handle service interests with quantities
    const serviceIds = Object.keys(serviceQuantities)
    if (serviceIds.length > 0) {
      // First, delete existing service interests for this lead (if updating)
      await supabase
        .from('lead_service_interests')
        .delete()
        .eq('lead_id', leadId)

      // Then insert new service interests with quantities
      const serviceInterests: LeadServiceInterestInsert[] = serviceIds.map(serviceId => ({
        lead_id: leadId,
        service_offering_id: serviceId,
        quantity: serviceQuantities[serviceId]
      }))

      const { error: interestsError } = await supabase
        .from('lead_service_interests')
        .insert(serviceInterests)

      if (interestsError) {
        throw interestsError
      }
      
      console.log('Service interests saved:', serviceInterests.length)
    }

    return { data: { leadId }, error: null }
  })
}