import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface SportsWeekConfig {
  id: string
  start_date: string
  end_date: string | null
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useSportsWeekConfig = () => {
  const [config, setConfig] = useState<SportsWeekConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseBrowserClient()
        
        const { data, error } = await supabase
          .from('sports_week_config')
          .select('*')
          .eq('is_active', true)
          .single()

        if (error) {
          setError(error.message)
          setConfig(null)
        } else {
          setConfig(data)
        }
      } catch (err) {
        setError('Failed to fetch sports week configuration')
        setConfig(null)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading, error }
}