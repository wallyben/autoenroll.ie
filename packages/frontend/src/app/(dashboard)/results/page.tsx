'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { ResultsTable } from '@/components/results/results-table'
import { PDFDownload } from '@/components/results/pdf-download'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uploadId = searchParams.get('uploadId')
  const { user, loading: authLoading } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && uploadId) {
      fetchResults()
    } else if (user && !uploadId) {
      fetchLatestResults()
    }
  }, [user, authLoading, uploadId, router])

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/validation/results/${uploadId}`)
      setResults(response.data.results)
    } catch (err: any) {
      console.error('Failed to fetch results:', err)
      setError(err.response?.data?.message || 'Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLatestResults = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/validation/results/latest')
      setResults(response.data.results)
    } catch (err: any) {
      console.error('Failed to fetch latest results:', err)
      setError(err.response?.data?.message || 'No results found')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await api.post(
        `/validation/generate-report/${uploadId || 'latest'}`,
        {},
        {
          responseType: 'blob',
        }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-report-${uploadId || Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download PDF:', err)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => router.push('/upload')}
              className="text-primary hover:underline"
            >
              Upload a file to get started
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Eligibility Results</h1>
            <p className="text-muted-foreground">
              Auto-enrolment eligibility analysis for your employees
            </p>
          </div>

          {results.length > 0 ? (
            <>
              <ResultsTable
                results={results}
                onDownloadPDF={handleDownloadPDF}
              />
              {uploadId && (
                <PDFDownload
                  uploadId={uploadId}
                  employeeCount={results.length}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No results available yet
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="text-primary hover:underline"
              >
                Upload a payroll file to get started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
