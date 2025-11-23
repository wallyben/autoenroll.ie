'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Upload, FileText, CheckCircle2, TrendingUp } from 'lucide-react'
import { WelcomeModal, useFirstTimeUser } from '@/components/onboarding/welcome-modal'

interface DashboardStats {
  totalUploads: number
  totalEmployees: number
  eligibleEmployees: number
  lastUploadDate: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { showWelcome, setShowWelcome, markWelcomeSeen } = useFirstTimeUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalUploads: 0,
    totalEmployees: 0,
    eligibleEmployees: 0,
    lastUploadDate: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDashboardStats()
    }
  }, [user, loading, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/user/dashboard-stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWelcomeClose = () => {
    markWelcomeSeen()
  }

  const handleGetStarted = () => {
    router.push('/upload')
  }

  if (loading || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {showWelcome && (
        <WelcomeModal onClose={handleWelcomeClose} onGetStarted={handleGetStarted} />
      )}
      
      <div className="flex h-screen bg-muted/30">
        <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your pension auto-enrolment compliance
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Uploads
                </CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUploads}</div>
                <p className="text-xs text-muted-foreground">
                  Payroll files processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Records analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eligible for Auto-Enrolment
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.eligibleEmployees}
                </div>
                <p className="text-xs text-muted-foreground">
                  Employees eligible
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Eligibility Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalEmployees > 0
                    ? Math.round((stats.eligibleEmployees / stats.totalEmployees) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Of total employees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/upload">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Payroll File
                  </Button>
                </Link>
                <Link href="/results">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Latest Results
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  New to AutoEnroll.ie? Follow these steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload payroll data</p>
                    <p className="text-xs text-muted-foreground">
                      CSV or XLSX format accepted
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review validation results</p>
                    <p className="text-xs text-muted-foreground">
                      Check for any data quality issues
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Download compliance report</p>
                    <p className="text-xs text-muted-foreground">
                      Get PDF with detailed analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Upload Info */}
          {stats.lastUploadDate && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Last upload:{' '}
                  <span className="font-medium text-foreground">
                    {new Date(stats.lastUploadDate).toLocaleString()}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
