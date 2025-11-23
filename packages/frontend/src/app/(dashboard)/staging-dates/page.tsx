'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Calendar, Save, RefreshCw } from 'lucide-react'

interface StagingConfig {
  id: string
  userId: string
  frequency: 'MONTHLY' | 'QUARTERLY' | 'BI_ANNUALLY' | 'ANNUALLY'
  dates: number[]
  effectiveFrom: string
  effectiveTo: string | null
}

interface NextStagingDate {
  nextDate: string
  daysUntil: number
  quarterLabel?: string
}

export default function StagingDatesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [config, setConfig] = useState<StagingConfig | null>(null)
  const [nextDate, setNextDate] = useState<NextStagingDate | null>(null)
  const [yearDates, setYearDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('QUARTERLY')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchStagingData()
    }
  }, [user, authLoading, router])

  const fetchStagingData = async () => {
    try {
      setIsLoading(true)
      const [configRes, nextRes, yearRes] = await Promise.all([
        api.get('/staging-dates/config').catch(() => ({ data: { data: null } })),
        api.get('/staging-dates/next').catch(() => ({ data: { data: null } })),
        api.get('/staging-dates/year', { params: { year: new Date().getFullYear() } }).catch(() => ({ data: { data: { dates: [] } } }))
      ])
      
      setConfig(configRes.data.data)
      setNextDate(nextRes.data.data)
      setYearDates(yearRes.data.data.dates || [])
      
      if (configRes.data.data) {
        setSelectedFrequency(configRes.data.data.frequency)
      }
    } catch (error) {
      console.error('Failed to fetch staging data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      setIsSaving(true)
      await api.post('/staging-dates/config', {
        frequency: selectedFrequency
      })
      alert('Staging date configuration saved successfully!')
      fetchStagingData()
    } catch (error: any) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration: ' + (error.response?.data?.error?.message || error.message))
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading staging dates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Auto-Enrolment Staging Dates</h1>
        <p className="text-muted-foreground">
          Configure when employees become eligible for auto-enrolment
        </p>
      </div>

      {/* Next Staging Date */}
      {nextDate && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Staging Date
            </CardTitle>
            <CardDescription>Upcoming auto-enrolment eligibility date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {new Date(nextDate.nextDate).toLocaleDateString('en-IE', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
                {nextDate.quarterLabel && (
                  <div className="text-sm text-muted-foreground mt-1">{nextDate.quarterLabel}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-700">{nextDate.daysUntil} days</div>
                <div className="text-sm text-muted-foreground">until next staging date</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Staging Frequency Configuration</CardTitle>
          <CardDescription>
            Choose how often staging dates occur throughout the year
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: 'MONTHLY', label: 'Monthly', description: '12 staging dates per year (1st of each month)' },
              { value: 'QUARTERLY', label: 'Quarterly', description: '4 staging dates per year (Jan 1, Apr 1, Jul 1, Oct 1)', recommended: true },
              { value: 'BI_ANNUALLY', label: 'Bi-Annually', description: '2 staging dates per year (Jan 1, Jul 1)' },
              { value: 'ANNUALLY', label: 'Annually', description: '1 staging date per year (Jan 1)' },
            ].map((freq) => (
              <div
                key={freq.value}
                onClick={() => setSelectedFrequency(freq.value)}
                className={`
                  cursor-pointer p-4 rounded-lg border-2 transition-all relative
                  ${selectedFrequency === freq.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {freq.recommended && (
                  <Badge className="absolute top-2 right-2 bg-green-600">Recommended</Badge>
                )}
                <div className="font-semibold text-lg mb-1">{freq.label}</div>
                <div className="text-sm text-muted-foreground">{freq.description}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {config && (
                <span>
                  Current: <strong>{config.frequency.replace('_', '-')}</strong> (since {new Date(config.effectiveFrom).toLocaleDateString()})
                </span>
              )}
              {!config && (
                <span>No configuration set - using default quarterly</span>
              )}
            </div>
            <Button 
              onClick={handleSaveConfig}
              disabled={isSaving || (config?.frequency === selectedFrequency)}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {yearDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staging Dates for {new Date().getFullYear()}</CardTitle>
            <CardDescription>
              All scheduled auto-enrolment eligibility dates this year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {yearDates.map((date, idx) => {
                const d = new Date(date)
                const isPast = d < new Date()
                return (
                  <div
                    key={idx}
                    className={`
                      p-3 rounded-lg border-2 text-center
                      ${isPast 
                        ? 'border-gray-200 bg-gray-50 text-gray-500' 
                        : 'border-blue-200 bg-blue-50 text-blue-700'
                      }
                    `}
                  >
                    <div className="font-semibold">
                      {d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs mt-1">
                      {isPast ? 'Completed' : 'Upcoming'}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How Staging Dates Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Staging dates</strong> are the dates on which employees become eligible for auto-enrolment, 
            after completing their 6-month waiting period.
          </p>
          <p>
            <strong>Example:</strong> If an employee starts on March 15th with quarterly staging dates:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Waiting period ends: September 15th</li>
            <li>Next staging date after waiting period: October 1st</li>
            <li>Auto-enrolment date: October 1st</li>
          </ul>
          <p className="pt-2">
            The <strong>quarterly frequency</strong> (Jan 1, Apr 1, Jul 1, Oct 1) is recommended as it provides 
            regular enrolment opportunities while minimizing administrative burden.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
