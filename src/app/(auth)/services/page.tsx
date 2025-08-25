'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, DollarSign } from 'lucide-react'

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock services data - will be replaced with real data from database
  const services = [
    {
      id: '1',
      name: 'Ceiling Fan Installation',
      description: 'Professional installation at any height',
      price: 20000,
      category: 'Lighting & Fixtures',
      duration: 120,
      isActive: true
    },
    {
      id: '2',
      name: 'Standard Light Fixture Replacement',
      description: 'Basic light fixture swap',
      price: 15000,
      category: 'Lighting & Fixtures',
      duration: 60,
      isActive: true
    },
    {
      id: '3',
      name: 'TV Mounting with Cord Concealment',
      description: 'Professional TV installation with hidden cords',
      price: 22500,
      category: 'Hardware & Other',
      duration: 90,
      isActive: true
    },
    {
      id: '4',
      name: 'Dimmer Switch Install',
      description: 'Standard dimmer switch installation',
      price: 12500,
      category: 'Switches & Outlets',
      duration: null,
      isActive: true
    }
  ]

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600">Manage your service offerings</p>
        </div>
        <Button size="sm" className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{service.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.price)}
                    </div>
                    <div>
                      Duration: {formatDuration(service.duration)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No services found</p>
            <p className="text-xs text-gray-500">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}

      {/* Service Categories Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Lighting & Fixtures', count: 6 },
              { name: 'Switches & Outlets', count: 6 },
              { name: 'Hardware & Other', count: 3 },
              { name: 'Safety & Ventilation', count: 1 }
            ].map((category) => (
              <div key={category.name} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-gray-600">{category.count} services</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}