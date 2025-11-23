/**
 * Universal State Components
 * 
 * Empty states, loading states, and error states for consistent UX
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  AlertCircle, 
  FileX, 
  Upload, 
  RefreshCw, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'

// ============================================
// EMPTY STATES
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-neutral-300">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          {icon || <FileX className="h-8 w-8 text-neutral-400" />}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
        {action && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={action.onClick} size="lg">
              {action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick} variant="outline" size="lg">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Prebuilt empty states
export function EmptyUploadState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={<Upload className="h-8 w-8 text-green-600" />}
      title="No files uploaded yet"
      description="Upload your first payroll file to calculate auto-enrolment eligibility and contributions"
      action={{
        label: "Upload Payroll File",
        onClick: onUpload
      }}
      secondaryAction={{
        label: "Download Template",
        onClick: () => window.open('/templates/payroll-template.xlsx')
      }}
    />
  )
}

export function EmptyResultsState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={<FileX className="h-8 w-8 text-neutral-400" />}
      title="No results yet"
      description="Upload a payroll file to see eligibility calculations and compliance reports"
      action={{
        label: "Upload File",
        onClick: onUpload
      }}
    />
  )
}

// ============================================
// LOADING STATES
// ============================================

interface LoadingStateProps {
  message?: string
  progress?: number
  estimatedTime?: string
}

export function LoadingState({ 
  message = "Loading...", 
  progress,
  estimatedTime 
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-neutral-200 border-t-green-600 rounded-full animate-spin"></div>
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
      <p className="mt-4 text-lg font-medium text-gray-900">{message}</p>
      {estimatedTime && (
        <p className="mt-2 text-sm text-gray-600">
          Estimated time: {estimatedTime}
        </p>
      )}
    </div>
  )
}

// Skeleton loaders
export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4 bg-white rounded-lg border border-neutral-200">
          <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/6"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
        </div>
      ))}
    </div>
  )
}

// Specific loading states
export function UploadingState({ fileName, progress }: { fileName: string; progress: number }) {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-green-600 animate-bounce" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Uploading {fileName}...
            </p>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{Math.round(progress)}% complete</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ValidatingState({ rowCount }: { rowCount: number }) {
  return (
    <Card className="border-2 border-cyan-200 bg-cyan-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-cyan-600 animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Validating {rowCount} employees...
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Checking PPSN format, age, earnings, PRSI class...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// ERROR STATES
// ============================================

interface ErrorStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  severity?: 'error' | 'warning' | 'info'
}

export function ErrorState({ 
  title, 
  message, 
  action,
  severity = 'error' 
}: ErrorStateProps) {
  const colors = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      icon: <XCircle className="h-8 w-8 text-red-600" />,
      text: 'text-red-900'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      icon: <AlertTriangle className="h-8 w-8 text-amber-600" />,
      text: 'text-amber-900'
    },
    info: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-100',
      icon: <AlertCircle className="h-8 w-8 text-cyan-600" />,
      text: 'text-cyan-900'
    }
  }
  
  const style = colors[severity]
  
  return (
    <Card className={`border-2 ${style.border} ${style.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${style.text} mb-2`}>
              {title}
            </h3>
            <p className="text-gray-700 mb-4">
              {message}
            </p>
            {action && (
              <Button onClick={action.onClick} variant="outline" size="sm">
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Prebuilt error states
export function UploadErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <ErrorState
      severity="error"
      title="Upload failed"
      message={error || "There was a problem uploading your file. Please try again."}
      action={{
        label: "Try Again",
        onClick: onRetry
      }}
    />
  )
}

export function ValidationErrorState({ 
  errorCount, 
  onFix, 
  onReupload 
}: { 
  errorCount: number
  onFix: () => void
  onReupload: () => void
}) {
  return (
    <ErrorState
      severity="warning"
      title={`${errorCount} validation ${errorCount === 1 ? 'error' : 'errors'} found`}
      message="Some employee records have missing or invalid data. Fix these issues to continue."
      action={{
        label: "Review Errors",
        onClick: onFix
      }}
    />
  )
}

// ============================================
// SUCCESS STATES
// ============================================

interface SuccessStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function SuccessState({ title, message, action }: SuccessStateProps) {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-700 mb-4">
              {message}
            </p>
            {action && (
              <Button onClick={action.onClick} className="bg-green-600 hover:bg-green-700">
                {action.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ValidationSuccessState({ 
  employeeCount, 
  onContinue 
}: { 
  employeeCount: number
  onContinue: () => void
}) {
  return (
    <SuccessState
      title="Validation successful!"
      message={`${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'} validated with no errors. Ready to calculate eligibility.`}
      action={{
        label: "Continue to Results",
        onClick: onContinue
      }}
    />
  )
}

// ============================================
// INFO BANNERS
// ============================================

interface InfoBannerProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  onDismiss?: () => void
}

export function InfoBanner({ message, action, dismissible, onDismiss }: InfoBannerProps) {
  return (
    <div className="bg-cyan-50 border-l-4 border-cyan-600 p-4 rounded-r-lg flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <AlertCircle className="h-5 w-5 text-cyan-600 flex-shrink-0" />
        <p className="text-sm text-cyan-900">{message}</p>
      </div>
      <div className="flex items-center space-x-2">
        {action && (
          <Button onClick={action.onClick} variant="ghost" size="sm" className="text-cyan-700 hover:text-cyan-900">
            {action.label}
          </Button>
        )}
        {dismissible && onDismiss && (
          <button onClick={onDismiss} className="text-cyan-600 hover:text-cyan-800">
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
