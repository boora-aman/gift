import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Wrench, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/Pagination'
import { GiftMaintenanceAPI, DocTypeAPI } from '@/services/api'
import { format } from 'date-fns'

const typeColors: Record<string, string> = {
  'Health Checkup': 'bg-blue-500 text-white dark:bg-blue-600',
  'Feeding': 'bg-green-500 text-white dark:bg-green-600',
  'Grooming': 'bg-purple-500 text-white dark:bg-purple-600',
  'Medical Treatment': 'bg-red-500 text-white dark:bg-red-600',
  'Vaccination': 'bg-teal-500 text-white dark:bg-teal-600',
  'Repair': 'bg-yellow-500 text-white dark:bg-yellow-600',
  'Cleaning': 'bg-cyan-500 text-white dark:bg-cyan-600',
  'Other': 'bg-gray-500 text-white dark:bg-gray-600',
}

const paymentColors: Record<string, string> = {
  'Pending': 'bg-yellow-500 text-white dark:bg-yellow-600',
  'Paid': 'bg-green-500 text-white dark:bg-green-600',
  'Partially Paid': 'bg-orange-500 text-white dark:bg-orange-600',
}

export default function MaintenanceList() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const navigate = useNavigate()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch maintenance type options from backend
  const { data: maintenanceTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Maintenance', 'maintenance_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Maintenance', 'maintenance_type')
      return result.success ? result.data : []
    },
  })

  const { data: records, isLoading } = useQuery({
    queryKey: ['gift-maintenance', typeFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (typeFilter && typeFilter !== 'all') filters.maintenance_type = typeFilter
      const result = await GiftMaintenanceAPI.list(filters)
      return result.success ? result.data : []
    },
  })

  const totalItems = records?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedRecords = records?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gift Maintenance</h1>
          <p className="text-muted-foreground">Track health checkups, treatments, and repairs</p>
        </div>
        <Button asChild>
          <Link to="/maintenance/new">
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {maintenanceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Performed By</TableHead>
                <TableHead className="hidden lg:table-cell">Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : paginatedRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Wrench className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No maintenance records</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords?.map((r) => (
                  <TableRow 
                    key={r.name} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => navigate(`/maintenance/${r.name}`)}
                  >
                    <TableCell className="hidden md:table-cell font-mono text-sm">{r.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{r.gift_name || r.gift || '-'}</p>
                        {r.maintenance_date && (
                          <p className="text-xs text-muted-foreground md:hidden">
                            {format(new Date(r.maintenance_date), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColors[r.maintenance_type || ''] || 'bg-gray-500 text-white'}>
                        {r.maintenance_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {r.maintenance_date ? format(new Date(r.maintenance_date), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{r.performed_by || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {r.payment_status && (
                        <Badge className={paymentColors[r.payment_status] || 'bg-gray-500 text-white'}>
                          {r.payment_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/maintenance/${r.name}`}>
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
