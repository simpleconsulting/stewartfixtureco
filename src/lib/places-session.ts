'use client'

import { useRef, useCallback } from 'react'

/**
 * Generates a unique session token for Google Places API requests
 * Session tokens are used for billing purposes to group related requests
 */
export function generateSessionToken(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
}

/**
 * Hook for managing Places API session tokens
 * Ensures proper session lifecycle for billing optimization
 */
export function useSessionToken() {
  const sessionTokenRef = useRef<string | null>(null)
  const expirationRef = useRef<number | null>(null)

  const getSessionToken = useCallback((): string => {
    const now = Date.now()
    const SESSION_TIMEOUT = 3 * 60 * 1000 // 3 minutes (Google recommends concluding sessions within 3 minutes)

    // Generate new token if none exists or current one is expired
    if (!sessionTokenRef.current || !expirationRef.current || now > expirationRef.current) {
      sessionTokenRef.current = generateSessionToken()
      expirationRef.current = now + SESSION_TIMEOUT
    }

    return sessionTokenRef.current
  }, [])

  const clearSession = useCallback(() => {
    sessionTokenRef.current = null
    expirationRef.current = null
  }, [])

  const isSessionExpired = useCallback((): boolean => {
    if (!expirationRef.current) return true
    return Date.now() > expirationRef.current
  }, [])

  return {
    getSessionToken,
    clearSession,
    isSessionExpired
  }
}