'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Phone, Mail, MapPin } from 'lucide-react'

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock clients data - will be replaced with real data from database
  const clients = [
    {
      id: '1',
      name: 'Johnson Family',
      email: 'sarah.johnson@email.com',
      phone: '(615) 555-0123',
      address: '123 Oak Street, Spring Hill, TN 37174',
      totalJobs: 3,
      totalSpent: 57500, // in cents
      lastJobDate: '2024-01-15',
      isActive: true
    },
    {
      id: '2',
      name: 'Smith Residence',
      email: 'mike.smith@email.com',
      phone: '(615) 555-0456',
      address: '456 Pine Avenue, Thompson\'s Station, TN 37179',
      totalJobs: 1,
      totalSpent: 22500,
      lastJobDate: '2024-01-10',
      isActive: true
    },
    {
      id: '3',
      name: 'Davis Home',
      email: 'emily.davis@email.com',
      phone: '(615) 555-0789',
      address: '789 Maple Drive, Columbia, TN 38401',
      totalJobs: 2,
      totalSpent: 32500,
      lastJobDate: '2024-01-08',
      isActive: true
    },
    {
      id: '4',
      name: 'Wilson Property',
      email: 'robert.wilson@email.com',
      phone: '(615) 555-0321',
      address: '321 Cedar Lane, Spring Hill, TN 37174',
      totalJobs: 4,
      totalSpent: 78000,
      lastJobDate: '2024-01-20',
      isActive: true
    }
  ]

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  )

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-600">Manage your customer base</p>
        </div>
        <Button size="sm" className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            <p className="text-xs text-gray-600">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {clients.reduce((sum, client) => sum + client.totalJobs, 0)}
            </p>
            <p className="text-xs text-gray-600">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(clients.reduce((sum, client) => sum + client.totalSpent, 0))}
            </p>
            <p className="text-xs text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{client.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {client.totalJobs} jobs
                    </Badge>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-1 mb-2">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{client.address}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Last job: {formatDate(client.lastJobDate)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      Total: {formatPrice(client.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  New Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No clients found</p>
            <p className="text-xs text-gray-500">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}