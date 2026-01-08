import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/Pagination'
import { GiftInterestAPI, DocTypeAPI } from '@/services/api'
import { format } from 'date-fns'

const statusColors: Record<string, string> = {
  'New': 'bg-yellow-500 text-white dark:bg-yellow-600',
  'Contacted': 'bg-blue-500 text-white dark:bg-blue-600',
  'Follow Up Required': 'bg-orange-500 text-white dark:bg-orange-600',
  'Converted to Issue': 'bg-green-500 text-white dark:bg-green-600',
  'Not Interested': 'bg-gray-500 text-white dark:bg-gray-600',
  'Lost': 'bg-red-500 text-white dark:bg-red-600',
}

const levelColors: Record<string, string> = {
  'Very Interested': 'bg-green-500 text-white dark:bg-green-600',
  'Interested': 'bg-blue-500 text-white dark:bg-blue-600',
  'Just Browsing': 'bg-gray-500 text-white dark:bg-gray-600',
  'Reserved': 'bg-purple-500 text-white dark:bg-purple-600',
}

export default function InterestList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const navigate = useNavigate()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch interest status options from backend
  const { data: interestStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift Interest', 'follow_up_status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Interest', 'follow_up_status')
      return result.success ? result.data : []
    },
  })

  const { data: interests, isLoading } = useQuery({
    queryKey: ['gift-interests', statusFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (statusFilter && statusFilter !== 'all') filters.follow_up_status = statusFilter
      const result = await GiftInterestAPI.list(filters)
      return result.success ? result.data : []
    },
  })

  // Pagination logic
  const totalItems = interests?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedInterests = interests?.slice(
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
          <h1 className="text-2xl font-bold text-foreground">Gift Interests</h1>
          <p className="text-muted-foreground">Track interest leads for gifts</p>
        </div>
        <Button asChild>
          <Link to="/interests/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Interest
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Follow-up Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {interestStatuses.map((status) => (
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
                <TableHead className="hidden lg:table-cell">Interested Party</TableHead>
                <TableHead className="hidden xl:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : paginatedInterests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Heart className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No interests found</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInterests?.map((interest) => (
                  <TableRow 
                    key={interest.name} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/interests/${interest.name}`)}
                  >
                    <TableCell className="hidden md:table-cell font-mono text-sm">{interest.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{interest.gift_name || interest.gift || '-'}</p>
                        {/* Show party name on mobile */}
                        <p className="text-xs text-muted-foreground lg:hidden">{interest.owner_full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{interest.owner_full_name || '-'}</TableCell>
                    <TableCell className="hidden xl:table-cell">{interest.interest_source || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {interest.interest_level && (
                        <Badge className={levelColors[interest.interest_level] || 'bg-gray-500 text-white'}>
                          {interest.interest_level}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {interest.follow_up_status && (
                        <Badge className={statusColors[interest.follow_up_status] || 'bg-gray-500 text-white'}>
                          {interest.follow_up_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {interest.date ? format(new Date(interest.date), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/interests/${interest.name}`}>
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
