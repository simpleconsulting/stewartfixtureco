import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError && session) {
      // Validate email domain
      const userEmail = session.user.email
      
      if (!userEmail || !userEmail.toLowerCase().endsWith('@stewartservicestn.com')) {
        // Sign out the user if they don't have the correct domain
        await supabase.auth.signOut()
        
        // Redirect to login with error
        return NextResponse.redirect(`${origin}/login?error=unauthorized_domain`)
      }
      
      // Successful authentication with correct domain
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}