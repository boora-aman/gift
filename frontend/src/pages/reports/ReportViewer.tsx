import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Download, Filter, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ReportsAPI } from '@/services/api'
import { reportConfigs } from './ReportList'
import type { ReportFilters } from '@/types/report'

export default function ReportViewer() {
  const navigate = useNavigate()
  const { reportId } = useParams()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const report = reportConfigs.find(r => r.id === reportId)
  
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 100,
  })
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({
    page: 1,
    limit: 100,
  })

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['report', reportId, appliedFilters],
    queryFn: async () => {
      if (!report) throw new Error('Report not found')
      const result = await ReportsAPI.fetchReport(report.apiMethod, appliedFilters)
      if (result.success) return result.data
      throw new Error(result.error)
    },
    enabled: !!report,
  })

  if (!report) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{t('reports.notFound')}</p>
        <Button variant="link" onClick={() => navigate('/reports')}>{t('common.back')}</Button>
      </div>
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
  }

  const handleClearFilters = () => {
    const cleared: ReportFilters = { page: 1, limit: 100 }
    setFilters(cleared)
    setAppliedFilters(cleared)
  }

  const handleDownloadCSV = () => {
    try {
      ReportsAPI.downloadCSV(report.apiMethod, appliedFilters)
      toast.success(t('reports.downloadStarted'))
    } catch {
      toast.error(t('reports.downloadFailed'))
    }
  }

  const Icon = report.icon

  // Get column headers from first data row
  const columns = data?.data && data.data.length > 0 
    ? Object.keys(data.data[0]).filter(k => !k.startsWith('_'))
    : []

  // Format column header for display
  const formatHeader = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  // Format cell value for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toLocaleString()
    return String(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isArabic ? report.nameAr : report.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isArabic ? report.descriptionAr : report.description}
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
          <Download className="h-4 w-4 mr-2" />
          {t('reports.exportCSV')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            {t('reports.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {report.filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label htmlFor={filter.key}>{filter.label}</Label>
{filter.type === 'select' ? (
                  <Select
                    value={filters[filter.key] as string || 'all'}
                    onValueChange={(value) => handleFilterChange(filter.key, value === 'all' ? '' : value)}
                  >
                    <SelectTrigger id={filter.key}>
                      <SelectValue placeholder={t('common.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {filter.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value || `option-${opt.label}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : filter.type === 'date' ? (
                  <Input
                    id={filter.key}
                    type="date"
                    value={filters[filter.key] as string || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={filter.key}
                    type={filter.type === 'number' ? 'number' : 'text'}
                    placeholder={filter.placeholder}
                    value={filters[filter.key] as string || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('reports.applyFilters')}
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              {t('reports.clearFilters')}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('reports.results')}</CardTitle>
            {data?.total !== undefined && (
              <Badge variant="secondary">
                {data.total} {t('reports.records')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('common.noResults')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {formatHeader(col)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap">
                          {formatValue(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
