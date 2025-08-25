'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserCheck, Search, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchLeads, updateLeadStatus } from '@/lib/database'
import { getUTMSourceLabel } from '@/lib/utm'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row'] & {
  lead_service_interests?: Array<{
    quantity: number
    service_offering_id: string
    service_offerings: {
      id: string
      name: string
      base_price_cents: number
    }
  }>
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await fetchLeads(supabase, {
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter as Database['public']['Enums']['lead_status'],
        search: searchTerm || undefined
      })

      if (fetchError) {
        setError(fetchError)
        setLeads([])
      } else {
        setLeads(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter, searchTerm])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  const handleStatusChange = async (leadId: string, newStatus: Database['public']['Enums']['lead_status']) => {
    try {
      const { data, error: updateError } = await updateLeadStatus(supabase, leadId, newStatus)
      if (updateError) {
        toast.error('Failed to update lead status', {
          description: updateError
        })
      } else if (data?.success) {
        toast.success('Lead status updated successfully', {
          description: `Status changed to ${newStatus}`
        })
        // Refresh the leads list
        loadLeads()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      toast.error('Error updating lead status', {
        description: errorMessage
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-orange-100 text-orange-800'
      case 'quoted': return 'bg-purple-100 text-purple-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const statusOptions = [
    { value: 'all', label: 'All Leads', count: leads.length },
    { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
    { value: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
    { value: 'qualified', label: 'Qualified', count: leads.filter(l => l.status === 'qualified').length },
    { value: 'quoted', label: 'Quoted', count: leads.filter(l => l.status === 'quoted').length },
    { value: 'converted', label: 'Converted', count: leads.filter(l => l.status === 'converted').length },
    { value: 'lost', label: 'Lost', count: leads.filter(l => l.status === 'lost').length },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-600">Manage your leads and conversions</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading leads...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-600">Manage your leads and conversions</p>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[#FCA311]" />
          <span className="text-sm font-medium text-gray-600">
            {leads.length} total
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadLeads}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm">
                      {lead.full_name || 'Anonymous Lead'}
                    </h3>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    {lead.is_returning && (
                      <Badge variant="outline" className="text-xs">
                        Visit #{lead.submission_count}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-1 mb-3">
                    {lead.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {lead.phone}
                      </div>
                    )}
                    {(lead.address_line1 || lead.city) && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {[lead.address_line1, lead.city, lead.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Service Interests */}
                  {lead.lead_service_interests && lead.lead_service_interests.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Services interested in:</p>
                      <div className="flex flex-wrap gap-1">
                        {lead.lead_service_interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {interest.service_offerings.name}
                            {interest.quantity > 1 && ` (${interest.quantity})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* UTM Source & Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      {lead.utm_source && (
                        <span>Source: {getUTMSourceLabel(lead.utm_source)}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                    {lead.last_submission_at && lead.last_submission_at !== lead.created_at && (
                      <span>Last activity: {formatDate(lead.last_submission_at)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Select
                  value={lead.status}
                  onValueChange={(newStatus) => handleStatusChange(lead.id, newStatus as Database['public']['Enums']['lead_status'])}
                >
                  <SelectTrigger className="flex-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="quoted">Quoted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                {lead.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                )}
                {lead.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {leads.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <UserCheck className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No leads found</p>
            <p className="text-xs text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Leads will appear here when customers submit quotes'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}