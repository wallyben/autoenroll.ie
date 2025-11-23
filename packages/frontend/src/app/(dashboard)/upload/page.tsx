'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/layout/sidebar'
import { FileUpload } from '@/components/upload/file-upload'
import { ValidationPreview } from '@/components/upload/validation-preview'
import { InstantPreview } from '@/components/upload/instant-preview'
import { useAuth } from '@/hooks/useAuth'
import { useUpload } from '@/hooks/useUpload'
import { 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  FileText,
  HelpCircle,
  Users,
  Calendar,
  Euro
} from 'lucide-react'
import { 
  EmptyUploadState,
  UploadingState,
  ValidatingState,
  ValidationSuccessState,
  ValidationErrorState,
  InfoBanner
} from '@/components/ui/states'

export default function UploadPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { uploadFile, validateFile, isUploading, isValidating, error, clearError } = useUpload()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadId, setUploadId] = useState<string>('')
  const [validation, setValidation] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [step, setStep] = useState<'upload' | 'validate' | 'complete'>('upload')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    clearError()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await uploadFile(selectedFile)
      setUploadId(result.uploadId)
      setStep('validate')
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const handleValidate = async () => {
    if (!uploadId) return

    try {
      const result = await validateFile(uploadId)
      setValidation(result.validation)
      setEmployees(result.employees)
      
      // Fetch instant preview data
      const previewResponse = await fetch(`/api/validation/${uploadId}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (previewResponse.ok) {
        const previewData = await previewResponse.json()
        setPreviewData(previewData.data)
        setShowPreview(true)
      }
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  const handleUnlock = async () => {
    setIsUnlocking(true)
    
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ uploadId })
      })
      
      const data = await response.json()
      
      if (data.success && data.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.checkoutUrl
      } else {
        console.error('Failed to create checkout session')
        setIsUnlocking(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setIsUnlocking(false)
    }
  }

  const handleProcessEligibility = () => {
    router.push(`/results?uploadId=${uploadId}`)
  }

  if (authLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-neutral-50 to-green-50/30">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-8 max-w-5xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Upload Payroll Data</h1>
            <p className="text-lg text-gray-600">
              Upload your employee payroll file to calculate auto-enrolment eligibility
            </p>
          </div>

          {/* First-time user info banner */}
          {step === 'upload' && !selectedFile && (
            <InfoBanner
              message="First time? Download our template to see the required format"
              action={{
                label: "Download Template",
                onClick: () => window.open('/templates/payroll-template.xlsx')
              }}
            />
          )}

          {/* Progress Dots (simplified, less intimidating) */}
          <div className="flex items-center justify-center gap-3">
            <div className={`transition-all duration-300 ${
              step === 'upload' 
                ? 'w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold' 
                : 'w-3 h-3 bg-green-600 rounded-full'
            }`}>
              {step === 'upload' && '1'}
            </div>
            <div className={`w-12 h-1 transition-colors duration-300 ${
              step !== 'upload' ? 'bg-green-600' : 'bg-neutral-300'
            }`}></div>
            <div className={`transition-all duration-300 ${
              step === 'validate' 
                ? 'w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold' 
                : step === 'complete'
                ? 'w-3 h-3 bg-green-600 rounded-full'
                : 'w-3 h-3 bg-neutral-300 rounded-full'
            }`}>
              {step === 'validate' && '2'}
            </div>
            <div className={`w-12 h-1 transition-colors duration-300 ${
              step === 'complete' ? 'bg-green-600' : 'bg-neutral-300'
            }`}></div>
            <div className={`transition-all duration-300 ${
              step === 'complete' 
                ? 'w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold' 
                : 'w-3 h-3 bg-neutral-300 rounded-full'
            }`}>
              {step === 'complete' && '3'}
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Upload Zone */}
              {isUploading && selectedFile ? (
                <UploadingState 
                  fileName={selectedFile.name} 
                  progress={75} 
                />
              ) : error ? (
                <ValidationErrorState
                  errorCount={1}
                  onFix={() => clearError()}
                  onReupload={() => {
                    setSelectedFile(null)
                    clearError()
                  }}
                />
              ) : (
                <Card className="border-2 border-dashed border-neutral-300 hover:border-green-300 transition-colors">
                  <CardContent className="p-8">
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      disabled={isUploading}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Action Button */}
              {selectedFile && !isUploading && !error && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Continue to Validation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {/* Help Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-neutral-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Required Fields</CardTitle>
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <CardDescription>
                      Your CSV/XLSX must include these columns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Employee Details</p>
                        <p className="text-xs text-gray-600">First name, last name, employee ID</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Employment Data</p>
                        <p className="text-xs text-gray-600">Start date, status, date of birth</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Euro className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payroll Info</p>
                        <p className="text-xs text-gray-600">Gross pay, pay frequency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-neutral-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Need Help?</CardTitle>
                      <HelpCircle className="h-5 w-5 text-cyan-600" />
                    </div>
                    <CardDescription>
                      Quick start resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/templates/payroll-template.xlsx')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Excel Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/docs/file-format')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Format Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/help')}
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Validate */}
          {step === 'validate' && (
            <div className="space-y-6">
              {isValidating ? (
                <ValidatingState rowCount={employees.length || 0} />
              ) : (
                <Card className="border-2 border-green-200">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      File uploaded successfully
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Ready to validate your payroll data. This will check for missing fields, invalid formats, and data quality issues.
                    </p>
                    <Button onClick={handleValidate} size="lg" className="bg-green-600 hover:bg-green-700">
                      Start Validation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && validation && (
            <div className="space-y-6">
              {/* Success Banner */}
              <ValidationSuccessState
                employeeCount={employees.length}
                onContinue={handleProcessEligibility}
              />
              
              {/* Validation Details */}
              <ValidationPreview validation={validation} employees={employees} />
              
              {/* CTA */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Ready to calculate eligibility
                      </h3>
                      <p className="text-gray-600">
                        Process {employees.length} employees and generate your compliance report
                      </p>
                    </div>
                    <Button
                      onClick={handleProcessEligibility}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Calculate Eligibility
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Instant Preview Modal */}
      {showPreview && previewData && (
        <InstantPreview
          previewData={previewData}
          onUnlock={handleUnlock}
          isUnlocking={isUnlocking}
        />
      )}
    </div>
  )
}
