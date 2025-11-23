'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'

interface PreviewData {
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
    errorCount: number
    warningCount: number
    eligibleCount?: number
  }
  sampleEmployees: Array<{
    index: number
    age: number
    salaryBand: string
    isEligible: boolean
    reason?: string
  }>
  topIssues: Array<{
    type: 'error' | 'warning'
    message: string
    count: number
  }>
}

interface InstantPreviewProps {
  previewData: PreviewData
  onUnlock: () => void
  isUnlocking?: boolean
}

export function InstantPreview({ previewData, onUnlock, isUnlocking = false }: InstantPreviewProps) {
  const { summary, sampleEmployees, topIssues } = previewData
  const eligibilityRate = summary.eligibleCount 
    ? Math.round((summary.eligibleCount / summary.validRows) * 100) 
    : 0

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Instant Preview</DialogTitle>
              <DialogDescription>
                Here's a preview of your auto-enrolment analysis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{summary.validRows}</div>
                  <p className="text-sm text-muted-foreground mt-1">Valid Records</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{summary.errorCount}</div>
                  <p className="text-sm text-muted-foreground mt-1">Errors Found</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{summary.eligibleCount || '?'}</div>
                  <p className="text-sm text-muted-foreground mt-1">Eligible</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{eligibilityRate}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Employees */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Employee Preview</CardTitle>
                  <CardDescription>
                    3 randomly selected employees from your file
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-normal">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Anonymised
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleEmployees.map((employee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-200 text-neutral-700 font-semibold">
                        {employee.index}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">[REDACTED]</p>
                        <p className="text-sm text-muted-foreground">
                          Age {employee.age} • {employee.salaryBand}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {employee.isEligible ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Eligible
                        </Badge>
                      )}
                      {employee.reason && (
                        <p className="text-xs text-muted-foreground mt-1">{employee.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Issues */}
          {topIssues.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Top Issues Found</CardTitle>
                <CardDescription>
                  Most common validation issues in your file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topIssues.slice(0, 3).map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        issue.type === 'error' 
                          ? 'bg-red-50 border-l-4 border-red-600' 
                          : 'bg-yellow-50 border-l-4 border-yellow-600'
                      }`}
                    >
                      {issue.type === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {issue.count} {issue.count === 1 ? 'employee' : 'employees'} affected
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="border-t my-6"></div>

          {/* Unlock CTA */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Unlock Full Report
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Get complete eligibility analysis, contribution calculations, and compliance report
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-sm">
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Full employee breakdown</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Contribution calculations</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>PDF compliance report</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Issue explanations</span>
                  </div>
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Instant download</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    €49
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    One-time payment • No subscription • Instant download
                  </p>
                  
                  <Button
                    onClick={onUnlock}
                    disabled={isUnlocking}
                    size="lg"
                    className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isUnlocking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Unlock Full Report
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-3">
                    <Shield className="inline h-3 w-3 mr-1" />
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-green-600" />
              <p className="text-xs text-muted-foreground">Instant<br/>Delivery</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              <p className="text-xs text-muted-foreground">GDPR<br/>Compliant</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-green-600" />
              <p className="text-xs text-muted-foreground">Revenue<br/>Validated</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
