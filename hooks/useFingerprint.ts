import { useState, useEffect } from 'react'
import { getFingerprint } from '@/lib/fingerprint'

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadFingerprint() {
      try {
        setIsLoading(true)
        const fp = await getFingerprint()
        if (isMounted) {
          setFingerprint(fp)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load fingerprint'))
          setFingerprint(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFingerprint()

    return () => {
      isMounted = false
    }
  }, [])

  return { fingerprint, isLoading, error }
}
