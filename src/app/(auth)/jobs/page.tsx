'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Calendar, DollarSign, Clock, MapPin } from 'lucide-react'

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock jobs data - will be replaced with real data from database
  const jobs = [
    {
      id: '1',
      clientName: 'Johnson Family',
      service: 'Ceiling Fan Installation',
      status: 'scheduled',
      scheduledDate: '2024-01-24T14:00:00',
      address: '123 Oak Street, Spring Hill, TN',
      totalAmount: 20000,
      paymentStatus: 'unpaid',
      createdDate: '2024-01-20',
      notes: 'Customer prefers afternoon appointment'
    },
    {
      id: '2',
      clientName: 'Smith Residence',
      service: 'TV Mounting',
      status: 'in_progress',
      scheduledDate: '2024-01-23T10:00:00',
      address: '456 Pine Avenue, Thompson\'s Station, TN',
      totalAmount: 22500,
      paymentStatus: 'partial',
      createdDate: '2024-01-18',
      notes: '65" TV, needs wall mount kit'
    },
    {
      id: '3',
      clientName: 'Davis Home',
      service: 'Light Fixture Replacement',
      status: 'completed',
      scheduledDate: '2024-01-22T09:00:00',
      address: '789 Maple Drive, Columbia, TN',
      totalAmount: 15000,
      paymentStatus: 'paid',
      createdDate: '2024-01-15',
      notes: 'Kitchen pendant lights'
    },
    {
      id: '4',
      clientName: 'Wilson Property',
      service: 'Dimmer Switch Install',
      status: 'quoted',
      scheduledDate: null,
      address: '321 Cedar Lane, Spring Hill, TN',
      totalAmount: 12500,
      paymentStatus: 'unpaid',
      createdDate: '2024-01-21',
      notes: 'Multiple rooms - dining and living'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Jobs', count: jobs.length },
    { value: 'draft', label: 'Draft', count: jobs.filter(j => j.status === 'draft').length },
    { value: 'quoted', label: 'Quoted', count: jobs.filter(j => j.status === 'quoted').length },
    { value: 'scheduled', label: 'Scheduled', count: jobs.filter(j => j.status === 'scheduled').length },
    { value: 'in_progress', label: 'In Progress', count: jobs.filter(j => j.status === 'in_progress').length },
    { value: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'completed').length }
  ]

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-600">Track and manage your jobs</p>
        </div>
        <Button size="sm" className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

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
        {filteredJobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{job.clientName}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{job.service}</p>
                  
                  {/* Job Details */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(job.scheduledDate)}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{job.address}</span>
                    </div>
                    {job.notes && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{job.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount and Payment Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-sm font-semibold">{formatPrice(job.totalAmount)}</span>
                    </div>
                    <Badge className={getPaymentStatusColor(job.paymentStatus)}>
                      {job.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No jobs found</p>
            <p className="text-xs text-gray-500">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}