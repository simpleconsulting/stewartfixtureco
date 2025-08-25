'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Wrench, Users, Briefcase, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: UserCheck,
  },
  {
    label: 'Services',
    href: '/services',
    icon: Wrench,
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-bottom">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                'touch-manipulation select-none',
                'focus:outline-none focus:ring-2 focus:ring-[#FCA311] focus:ring-offset-2',
                isActive 
                  ? 'bg-[#FCA311]/10 text-[#FCA311]' 
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 mb-1 transition-all',
                isActive ? 'text-[#FCA311] scale-110' : 'text-gray-500'
              )} />
              <span className={cn(
                'text-xs font-medium truncate',
                isActive ? 'text-[#FCA311]' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}