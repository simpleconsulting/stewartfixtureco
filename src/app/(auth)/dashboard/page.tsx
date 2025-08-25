'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, Briefcase, UserCheck, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getLeadStats, getClientStats, getJobStats, fetchJobs } from '@/lib/database'
import type { Database } from '@/types/database'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  clients?: Database['public']['Tables']['clients']['Row']
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    returningLeads: 0
  })
  const [clientStats, setClientStats] = useState({
    total: 0,
    totalRevenue: 0,
    totalJobs: 0,
    averageJobValue: 0
  })
  const [jobStats, setJobStats] = useState({
    total: 0,
    draft: 0,
    quoted: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    canceled: 0,
    totalRevenue: 0,
    averageJobValue: 0
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  
  const supabase = createClient()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load all stats in parallel
      const [leads, clients, jobs, recent] = await Promise.all([
        getLeadStats(supabase),
        getClientStats(supabase),
        getJobStats(supabase),
        fetchJobs(supabase, { limit: 5 })
      ])

      if (leads.data) setLeadStats(leads.data)
      if (clients.data) setClientStats(clients.data)
      if (jobs.data) setJobStats(jobs.data)
      if (recent.data) setRecentJobs(recent.data)
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back to Stewart Services</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back to Stewart Services</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#FCA311]" />
          <span className="text-sm font-medium text-gray-600">
            {formatPrice(jobStats.totalRevenue)} total revenue
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">New Leads</p>
                <p className="text-lg font-semibold">{leadStats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Active Jobs</p>
                <p className="text-lg font-semibold">{jobStats.scheduled + jobStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Total Clients</p>
                <p className="text-lg font-semibold">{clientStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Job Value</p>
                <p className="text-lg font-semibold">
                  {jobStats.averageJobValue > 0 ? formatPrice(jobStats.averageJobValue) : '$0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="p-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">
                      {job.clients?.full_name || 'Unknown Client'}
                    </p>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatDate(job.created_at)}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(job.final_price_cents)}
                    </p>
                  </div>
                  {job.notes && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{job.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent jobs</p>
                <p className="text-xs">Jobs will appear here when created</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Business Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{leadStats.qualified}</p>
              <p className="text-xs text-gray-600">Qualified Leads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{jobStats.completed}</p>
              <p className="text-xs text-gray-600">Completed Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{jobStats.quoted}</p>
              <p className="text-xs text-gray-600">Pending Quotes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{leadStats.converted}</p>
              <p className="text-xs text-gray-600">Converted Leads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <UserCheck className="w-4 h-4 mr-2" />
            View New Leads ({leadStats.new})
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Briefcase className="w-4 h-4 mr-2" />
            Manage Active Jobs ({jobStats.scheduled + jobStats.inProgress})
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <DollarSign className="w-4 h-4 mr-2" />
            View Revenue ({formatPrice(jobStats.totalRevenue)})
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}