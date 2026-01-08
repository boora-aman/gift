import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/Pagination'
import { GiftIssueAPI, DocTypeAPI } from '@/services/api'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  'Dispatched': 'bg-blue-500 text-white dark:bg-blue-600',
  'Delivered': 'bg-green-500 text-white dark:bg-green-600',
}

export default function IssueList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const navigate = useNavigate()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch issue status options from backend
  const { data: issueStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift Issue', 'status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Issue', 'status')
      return result.success ? result.data : []
    },
  })

  const { data: issues, isLoading } = useQuery({
    queryKey: ['gift-issues', statusFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
      const result = await GiftIssueAPI.list(filters)
      return result.success ? result.data : []
    },
  })

  // Pagination logic
  const totalItems = issues?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedIssues = issues?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gift Issues</h1>
          <p className="text-muted-foreground">Track gift issuances to recipients</p>
        </div>
        <Button asChild>
          <Link to="/issues/new">
            <Plus className="h-4 w-4 mr-2" />
            Issue Gift
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {issueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Issue ID</TableHead>
                <TableHead>Gift</TableHead>
                <TableHead className="hidden lg:table-cell">Recipient</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : paginatedIssues?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Gift className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No gift issues found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIssues?.map((issue) => (
                  <TableRow 
                    key={issue.name} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/issues/${issue.name}`)}
                  >
                    <TableCell className="hidden md:table-cell font-mono text-sm">{issue.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{issue.gift_name || issue.gift}</p>
                        {/* Show date on mobile */}
                        {issue.date && (
                          <p className="text-xs text-muted-foreground md:hidden">
                            {format(new Date(issue.date), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{issue.owner_full_name || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {issue.date ? format(new Date(issue.date), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[issue.status] || 'bg-gray-500 text-white'}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/issues/${issue.name}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items)
              setCurrentPage(1)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
