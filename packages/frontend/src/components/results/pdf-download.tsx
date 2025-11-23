'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Download, FileText, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface PDFDownloadProps {
  uploadId: string
  employeeCount: number
}

export function PDFDownload({ uploadId, employeeCount }: PDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      setError('')

      const response = await api.post(
        `/validation/generate-report/${uploadId}`,
        {},
        {
          responseType: 'blob',
        }
      )

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-report-${uploadId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Failed to generate PDF:', err)
      setError(err.response?.data?.message || 'Failed to generate PDF report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compliance Report
        </CardTitle>
        <CardDescription>
          Download a comprehensive PDF report with all eligibility results and
          compliance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Full Compliance Report</p>
            <p className="text-sm text-muted-foreground">
              Includes {employeeCount} employee records with detailed analysis
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 border border-destructive bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>The report includes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Executive summary with key metrics</li>
            <li>Detailed eligibility breakdown by employee</li>
            <li>Contribution calculations and projections</li>
            <li>Risk assessment and compliance recommendations</li>
            <li>Data quality analysis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
