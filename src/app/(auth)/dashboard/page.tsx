'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, Users, Briefcase, Clock } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back to Stewart Services</p>
        </div>
        <Button size="sm" className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D]">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">This Month</p>
                <p className="text-lg font-semibold">$2,450</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Active Jobs</p>
                <p className="text-lg font-semibold">8</p>
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
                <p className="text-lg font-semibold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-semibold">3</p>
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
            {[
              {
                id: 1,
                client: 'Johnson Family',
                service: 'Ceiling Fan Installation',
                status: 'scheduled',
                amount: '$200',
                date: 'Today, 2:00 PM'
              },
              {
                id: 2,
                client: 'Smith Residence',
                service: 'TV Mounting',
                status: 'in_progress',
                amount: '$225',
                date: 'Yesterday'
              },
              {
                id: 3,
                client: 'Davis Home',
                service: 'Light Fixture Replacement',
                status: 'completed',
                amount: '$150',
                date: '2 days ago'
              }
            ].map((job) => (
              <div key={job.id} className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{job.client}</p>
                  <Badge 
                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-1">{job.service}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{job.date}</p>
                  <p className="text-sm font-semibold text-gray-900">{job.amount}</p>
                </div>
              </div>
            ))}
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
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Briefcase className="w-4 h-4 mr-2" />
            Create Job Quote
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <DollarSign className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}