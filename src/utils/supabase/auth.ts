import { createClient } from './server'

const ALLOWED_DOMAIN = '@stewartservicestn.com'

export function validateEmailDomain(email: string): boolean {
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN.toLowerCase())
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user || !user.email) {
    return null
  }

  // Validate domain even for authenticated users
  if (!validateEmailDomain(user.email)) {
    await supabase.auth.signOut()
    return null
  }

  return user
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        hd: 'stewartservicestn.com' // Google hosted domain hint
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  return { data, error }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}