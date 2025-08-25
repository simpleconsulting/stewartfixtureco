'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/utils/supabase/client';
import { Shield, AlertCircle } from 'lucide-react';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized_domain') {
      setError('Access denied. Only @stewartservicestn.com email addresses are allowed.');
    } else if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'stewartservicestn.com' // Hint for Google to show stewartservicestn.com accounts
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213D] via-[#000000] to-[#14213D] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon_w_name.svg"
              alt="Stewart Services Logo"
              width={250}
              height={80}
              className="w-auto h-20"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-[#14213D]">
            Admin Login
          </CardTitle>
          <CardDescription className="text-[#000000]/70 mt-2">
            Sign in with your Stewart Services account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-10">
          <div className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D] font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-2 border-[#14213D] border-t-transparent rounded-full" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </div>
              )}
            </Button>
            
            <div className="text-center pt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-[#000000]/60">
                <Shield className="h-4 w-4" />
                <span>Only @stewartservicestn.com accounts allowed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#14213D] via-[#000000] to-[#14213D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-[#FCA311] border-t-transparent rounded-full" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}