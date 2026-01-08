import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Truck, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/Pagination'
import { GiftDispatchAPI, DocTypeAPI } from '@/services/api'
import { format } from 'date-fns'

const typeColors: Record<string, string> = {
  'Gift Issue': 'bg-blue-500 text-white dark:bg-blue-600',
  'Event': 'bg-purple-500 text-white dark:bg-purple-600',
  'Maintenance': 'bg-orange-500 text-white dark:bg-orange-600',
  'Transfer': 'bg-green-500 text-white dark:bg-green-600',
}

const statusColors: Record<string, string> = {
  'Prepared': 'bg-cyan-500 text-white dark:bg-cyan-600',
  'Pending': 'bg-yellow-500 text-white dark:bg-yellow-600',
  'In Transit': 'bg-blue-500 text-white dark:bg-blue-600',
  'Delivered': 'bg-green-500 text-white dark:bg-green-600',
  'Returned': 'bg-gray-500 text-white dark:bg-gray-600',
}

export default function DispatchList() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const navigate = useNavigate()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch dispatch type options from backend
  const { data: dispatchTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Dispatch', 'dispatch_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Dispatch', 'dispatch_type')
      return result.success ? result.data : []
    },
  })

  // Fetch dispatch status options from backend
  const { data: dispatchStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift Dispatch', 'dispatch_status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Dispatch', 'dispatch_status')
      return result.success ? result.data : []
    },
  })

  const { data: dispatches, isLoading } = useQuery({
    queryKey: ['gift-dispatch', typeFilter, statusFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (typeFilter && typeFilter !== 'all') filters.dispatch_type = typeFilter
      if (statusFilter && statusFilter !== 'all') filters.dispatch_status = statusFilter
      const result = await GiftDispatchAPI.list(filters)
      return result.success ? result.data : []
    },
  })

  // Pagination logic
  const totalItems = dispatches?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedDispatches = dispatches?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gift Dispatch</h1>
          <p className="text-muted-foreground">Track gift movements and deliveries</p>
        </div>
        <Button asChild>
          <Link to="/dispatch/new">
            <Plus className="h-4 w-4 mr-2" />
            New Dispatch
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-4 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {dispatchTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {dispatchStatuses.map((status) => (
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
                <TableHead className="hidden md:table-cell">ID</TableHead>
                <TableHead>Gift</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Destination</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : paginatedDispatches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Truck className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No dispatch records</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDispatches?.map((d) => (
                  <TableRow 
                    key={d.name} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => navigate(`/dispatch/${d.name}`)}
                  >
                    <TableCell className="hidden md:table-cell font-mono text-sm">{d.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{d.gift_name || d.gift || '-'}</p>
                        {/* Show type on mobile */}
                        <p className="text-xs text-muted-foreground lg:hidden">{d.dispatch_type}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={typeColors[d.dispatch_type || ''] || 'bg-gray-500 text-white'}>
                        {d.dispatch_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[d.dispatch_status || ''] || 'bg-gray-500 text-white'}>
                        {d.dispatch_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {d.recipient_name || d.to_warehouse || '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {d.dispatch_date ? format(new Date(d.dispatch_date), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dispatch/${d.name}`}>
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
