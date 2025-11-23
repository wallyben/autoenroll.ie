'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { EligibilityResult } from '@autoenroll/common'
import { Search, Download } from 'lucide-react'

interface ResultsTableProps {
  results: EligibilityResult[]
  onDownloadPDF?: () => void
}

export function ResultsTable({ results, onDownloadPDF }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      searchTerm === '' ||
      result.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || result.eligible.toString() === statusFilter

    return matchesSearch && matchesStatus
  })

  const eligibleCount = results.filter((r) => r.eligible).length
  const ineligibleCount = results.length - eligibleCount

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {eligibleCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ineligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {ineligibleCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Eligibility Results</CardTitle>
              <CardDescription>
                Review auto-enrolment eligibility for all employees
              </CardDescription>
            </div>
            {onDownloadPDF && (
              <Button onClick={onDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'true' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('true')}
              >
                Eligible
              </Button>
              <Button
                variant={statusFilter === 'false' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('false')}
              >
                Ineligible
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Eligibility Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Enrolment Date</TableHead>
                  <TableHead>Waiting Period</TableHead>
                  <TableHead className="text-right">Annual Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No results found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.employeeId}>
                      <TableCell className="font-medium">
                        {result.employeeId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={result.eligible ? 'default' : 'secondary'}
                        >
                          {result.eligible ? 'Eligible' : 'Ineligible'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {result.reason}
                      </TableCell>
                      <TableCell>
                        {result.enrolmentDate
                          ? new Date(result.enrolmentDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {result.waitingPeriodEnd
                            ? new Date(
                                result.waitingPeriodEnd
                              ).toLocaleDateString()
                            : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        €{result.annualEarnings?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredResults.length} of {results.length} results
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
