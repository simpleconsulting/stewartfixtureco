'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, DollarSign, Clock, MapPin, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchJobs, updateJobStatus } from '@/lib/database'
import type { Database } from '@/types/database'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  clients?: Database['public']['Tables']['clients']['Row']
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await fetchJobs(supabase, {
        limit: 50,
        status: statusFilter === 'all' ? undefined : statusFilter as Database['public']['Enums']['job_status'],
        search: searchTerm || undefined
      })

      if (fetchError) {
        setError(fetchError)
        setJobs([])
      } else {
        setJobs(data || [])
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter, searchTerm])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const handleStatusChange = async (jobId: string, newStatus: Database['public']['Enums']['job_status']) => {
    try {
      const { data, error: updateError } = await updateJobStatus(supabase, jobId, newStatus)
      if (updateError) {
        console.error('Failed to update job status:', updateError)
      } else if (data?.success) {
        loadJobs()
      }
    } catch (err) {
      console.error('Error updating job status:', err)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Jobs', count: jobs.length },
    { value: 'draft', label: 'Draft', count: jobs.filter(j => j.status === 'draft').length },
    { value: 'quoted', label: 'Quoted', count: jobs.filter(j => j.status === 'quoted').length },
    { value: 'scheduled', label: 'Scheduled', count: jobs.filter(j => j.status === 'scheduled').length },
    { value: 'in_progress', label: 'In Progress', count: jobs.filter(j => j.status === 'in_progress').length },
    { value: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'completed').length },
    { value: 'canceled', label: 'Canceled', count: jobs.filter(j => j.status === 'canceled').length }
  ]

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'quoted': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-orange-100 text-orange-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-sm text-gray-600">Track and manage your jobs</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading jobs...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-600">Track and manage your jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#FCA311]" />
          <span className="text-sm font-medium text-gray-600">
            {jobs.length} total
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search jobs by client or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadJobs}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
            className={`flex-shrink-0 text-xs ${
              statusFilter === option.value 
                ? 'bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]' 
                : ''
            }`}
          >
            {option.label} ({option.count})
          </Button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm">
                      {job.clients?.full_name || 'Unknown Client'}
                    </h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {/* Job Details */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {job.scheduled_start 
                        ? formatDate(job.scheduled_start) 
                        : 'Not scheduled'}
                    </div>
                    {(job.address_line1 || job.city) && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>
                          {[job.address_line1, job.city, job.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {job.notes && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{job.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount and Payment Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-sm font-semibold">
                          {formatPrice(job.final_price_cents)}
                        </span>
                      </div>
                      {job.quoted_price_cents !== job.final_price_cents && (
                        <span className="text-xs text-gray-500">
                          Quoted: {formatPrice(job.quoted_price_cents)}
                        </span>
                      )}
                    </div>
                    <Badge className={getPaymentStatusColor(job.payment_status)}>
                      {job.payment_status}
                    </Badge>
                  </div>

                  {/* Created Date */}
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {formatDateOnly(job.created_at)}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => {
                    // Status progression logic
                    const nextStatus = 
                      job.status === 'draft' ? 'quoted' :
                      job.status === 'quoted' ? 'scheduled' :
                      job.status === 'scheduled' ? 'in_progress' :
                      job.status === 'in_progress' ? 'completed' :
                      job.status
                    
                    if (nextStatus !== job.status) {
                      handleStatusChange(job.id, nextStatus as Database['public']['Enums']['job_status'])
                    }
                  }}
                >
                  {job.status === 'draft' ? 'Quote' :
                   job.status === 'quoted' ? 'Schedule' :
                   job.status === 'scheduled' ? 'Start' :
                   job.status === 'in_progress' ? 'Complete' :
                   'View Details'}
                </Button>
                {job.clients?.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`mailto:${job.clients?.email}`, '_blank')}
                  >
                    Email
                  </Button>
                )}
                {job.clients?.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(`tel:${job.clients?.phone}`, '_blank')}
                  >
                    Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Briefcase className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No jobs found</p>
            <p className="text-xs text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Jobs will appear here when you create them from leads or clients'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}