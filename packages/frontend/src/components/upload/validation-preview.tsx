'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ValidationResult } from '@autoenroll/common'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

interface ValidationPreviewProps {
  validation: ValidationResult
  employees: any[]
}

export function ValidationPreview({
  validation,
  employees,
}: ValidationPreviewProps) {
  const errorCount = validation.errors.length
  const warningCount = validation.warnings.length
  const validCount = validation.validEmployees.length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready for processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Non-critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Errors */}
      {errorCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validation.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 border-l-4 border-red-600 bg-red-50 dark:bg-red-950/20 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">Row {error.row}</p>
                    <p className="text-sm text-muted-foreground">
                      {error.field}: {error.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warningCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validation.warnings.slice(0, 10).map((warning, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 border-l-4 border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">Row {warning.row}</p>
                    <p className="text-sm text-muted-foreground">
                      {warning.field}: {warning.message}
                    </p>
                  </div>
                </div>
              ))}
              {warningCount > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  ... and {warningCount - 10} more warnings
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Valid Records Preview */}
      {validCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Valid Records Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employment Status</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.slice(0, 5).map((employee, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.employmentStatus}</TableCell>
                    <TableCell>€{employee.grossPay.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(employee.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Valid</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {validCount > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                ... and {validCount - 5} more valid records
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
