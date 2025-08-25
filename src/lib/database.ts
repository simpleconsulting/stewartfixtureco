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

// Lead management database functions

// Fetch all leads with pagination
export async function fetchLeads(
  supabase: SupabaseClientType,
  options?: {
    limit?: number
    offset?: number
    status?: Database['public']['Enums']['lead_status']
    search?: string
  }
): Promise<{ data: Database['public']['Tables']['leads']['Row'][] | null; error: string | null }> {
  const { limit = 50, offset = 0, status, search } = options || {}
  
  return executeQuery(async () => {
    let query = supabase
      .from('leads')
      .select(`
        *,
        lead_service_interests (
          quantity,
          service_offering_id,
          service_offerings (
            id,
            name,
            base_price_cents
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error } = await query

    return { data, error }
  })
}

// Fetch a single lead by ID with service interests
export async function fetchLeadById(
  supabase: SupabaseClientType,
  id: string
): Promise<{ data: Database['public']['Tables']['leads']['Row'] | null; error: string | null }> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_service_interests (
          quantity,
          service_offering_id,
          service_offerings (
            id,
            name,
            base_price_cents,
            description
          )
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  })
}

// Update lead status
export async function updateLeadStatus(
  supabase: SupabaseClientType,
  id: string,
  status: Database['public']['Enums']['lead_status'],
  notes?: string
): Promise<{ data: { success: boolean } | null; error: string | null }> {
  return executeQuery(async () => {
    const updateData: Partial<Database['public']['Tables']['leads']['Update']> = {
      status,
      updated_at: new Date().toISOString()
    }
    
    if (notes) {
      updateData.notes = notes
    }

    if (status === 'contacted') {
      // Get current contact count first
      const { data: currentLead } = await supabase
        .from('leads')
        .select('contact_count')
        .eq('id', id)
        .single()

      const newContactCount = (currentLead?.contact_count || 0) + 1
      
      updateData.last_contacted_at = new Date().toISOString()
      updateData.contact_count = newContactCount
    }

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    return { data: { success: true }, error: null }
  })
}

// Convert lead to client
export async function convertLeadToClient(
  supabase: SupabaseClientType,
  leadId: string,
  clientData?: {
    full_name?: string
    phone?: string
    notes?: string
  }
): Promise<{ data: { clientId: string } | null; error: string | null }> {
  return executeQuery(async () => {
    // First, get the lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      throw new Error('Lead not found')
    }

    // Create the client
    const clientInsert = {
      full_name: clientData?.full_name || lead.full_name || 'Unknown Client',
      email: lead.email,
      phone: clientData?.phone || lead.phone,
      address_line1: lead.address_line1,
      address_line2: lead.address_line2,
      city: lead.city,
      state: lead.state,
      postal_code: lead.postal_code,
      country: lead.country,
      lat: lead.lat,
      lng: lead.lng,
      notes: clientData?.notes || lead.notes,
      is_active: true
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert([clientInsert])
      .select('id')
      .single()

    if (clientError || !client) {
      throw new Error('Failed to create client')
    }

    // Update the lead to mark it as converted
    await supabase
      .from('leads')
      .update({
        status: 'converted' as Database['public']['Enums']['lead_status'],
        converted_client_id: client.id,
        converted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)

    return { data: { clientId: client.id }, error: null }
  })
}

// Get lead statistics
export async function getLeadStats(
  supabase: SupabaseClientType
): Promise<{ 
  data: {
    total: number
    new: number
    contacted: number
    qualified: number
    converted: number
    returningLeads: number
    avgConversionTime?: number
  } | null; 
  error: string | null 
}> {
  return executeQuery(async () => {
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('leads')
      .select('status')

    if (statusError) {
      throw statusError
    }

    // Get returning leads count
    const { count: returningCount, error: returningError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('is_returning', true)

    if (returningError) {
      throw returningError
    }

    // Process the data
    const stats = {
      total: statusCounts?.length || 0,
      new: statusCounts?.filter(l => l.status === 'new').length || 0,
      contacted: statusCounts?.filter(l => l.status === 'contacted').length || 0,
      qualified: statusCounts?.filter(l => l.status === 'qualified').length || 0,
      converted: statusCounts?.filter(l => l.status === 'converted').length || 0,
      returningLeads: returningCount || 0
    }

    return { data: stats, error: null }
  })
}

// Client-specific database functions

// Fetch all clients with pagination and job stats
export async function fetchClients(
  supabase: SupabaseClientType,
  options?: {
    limit?: number
    offset?: number
    search?: string
  }
): Promise<{ data: Database['public']['Tables']['clients']['Row'][] | null; error: string | null }> {
  const { limit = 50, offset = 0, search } = options || {}
  
  return executeQuery(async () => {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data, error } = await query

    return { data, error }
  })
}

// Fetch a single client by ID with job history
export async function fetchClientById(
  supabase: SupabaseClientType,
  id: string
): Promise<{ data: Database['public']['Tables']['clients']['Row'] | null; error: string | null }> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  })
}

// Update client information
export async function updateClient(
  supabase: SupabaseClientType,
  id: string,
  clientData: Partial<Database['public']['Tables']['clients']['Update']>
): Promise<{ data: { success: boolean } | null; error: string | null }> {
  return executeQuery(async () => {
    const updateData = {
      ...clientData,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    return { data: { success: true }, error: null }
  })
}

// Get client statistics
export async function getClientStats(
  supabase: SupabaseClientType
): Promise<{ 
  data: {
    total: number
    totalRevenue: number
    totalJobs: number
    averageJobValue: number
  } | null; 
  error: string | null 
}> {
  return executeQuery(async () => {
    // Get client count
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('is_active', true)

    if (clientError) {
      throw clientError
    }

    // Get job statistics
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('final_price_cents')

    if (jobError) {
      throw jobError
    }

    const totalRevenue = jobs?.reduce((sum, job) => sum + (job.final_price_cents || 0), 0) || 0
    const totalJobs = jobs?.length || 0
    const averageJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0

    const stats = {
      total: clients?.length || 0,
      totalRevenue,
      totalJobs,
      averageJobValue
    }

    return { data: stats, error: null }
  })
}

// Job-specific database functions

// Fetch all jobs with client information
export async function fetchJobs(
  supabase: SupabaseClientType,
  options?: {
    limit?: number
    offset?: number
    status?: Database['public']['Enums']['job_status']
    search?: string
  }
): Promise<{ data: (Database['public']['Tables']['jobs']['Row'] & { client?: Database['public']['Tables']['clients']['Row'] })[] | null; error: string | null }> {
  const { limit = 50, offset = 0, status, search } = options || {}
  
  return executeQuery(async () => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`notes.ilike.%${search}%,clients.full_name.ilike.%${search}%`)
    }

    const { data, error } = await query

    return { data, error }
  })
}

// Fetch a single job by ID with client information
export async function fetchJobById(
  supabase: SupabaseClientType,
  id: string
): Promise<{ data: (Database['public']['Tables']['jobs']['Row'] & { client?: Database['public']['Tables']['clients']['Row'] }) | null; error: string | null }> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        clients (
          id,
          full_name,
          email,
          phone,
          address_line1,
          city,
          state
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  })
}

// Update job status
export async function updateJobStatus(
  supabase: SupabaseClientType,
  id: string,
  status: Database['public']['Enums']['job_status'],
  notes?: string
): Promise<{ data: { success: boolean } | null; error: string | null }> {
  return executeQuery(async () => {
    const updateData: Partial<Database['public']['Tables']['jobs']['Update']> = {
      status,
      updated_at: new Date().toISOString()
    }
    
    if (notes) {
      updateData.notes = notes
    }

    const { error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    return { data: { success: true }, error: null }
  })
}

// Update job payment status
export async function updateJobPaymentStatus(
  supabase: SupabaseClientType,
  id: string,
  paymentStatus: Database['public']['Enums']['payment_status']
): Promise<{ data: { success: boolean } | null; error: string | null }> {
  return executeQuery(async () => {
    const { error } = await supabase
      .from('jobs')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    return { data: { success: true }, error: null }
  })
}

// Get job statistics
export async function getJobStats(
  supabase: SupabaseClientType
): Promise<{ 
  data: {
    total: number
    draft: number
    quoted: number
    scheduled: number
    inProgress: number
    completed: number
    canceled: number
    totalRevenue: number
    averageJobValue: number
  } | null; 
  error: string | null 
}> {
  return executeQuery(async () => {
    // Get all jobs with status and revenue data
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('status, final_price_cents')

    if (jobsError) {
      throw jobsError
    }

    const totalRevenue = jobs?.reduce((sum, job) => sum + (job.final_price_cents || 0), 0) || 0
    const totalJobs = jobs?.length || 0

    const stats = {
      total: totalJobs,
      draft: jobs?.filter(j => j.status === 'draft').length || 0,
      quoted: jobs?.filter(j => j.status === 'quoted').length || 0,
      scheduled: jobs?.filter(j => j.status === 'scheduled').length || 0,
      inProgress: jobs?.filter(j => j.status === 'in_progress').length || 0,
      completed: jobs?.filter(j => j.status === 'completed').length || 0,
      canceled: jobs?.filter(j => j.status === 'canceled').length || 0,
      totalRevenue,
      averageJobValue: totalJobs > 0 ? totalRevenue / totalJobs : 0
    }

    return { data: stats, error: null }
  })
}