import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MobileNav } from '@/components/mobile-nav'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user email is from stewartservicestn.com domain
  const userEmail = user.email
  if (!userEmail?.endsWith('@stewartservicestn.com')) {
    redirect('/login?error=unauthorized_domain')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-16 px-4 pt-6">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}