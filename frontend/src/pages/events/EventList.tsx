import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Calendar, MapPin, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/Pagination'
import { EventAPI, DocTypeAPI } from '@/services/api'
import { format } from 'date-fns'
import type { Event } from '@/types/event'

const statusColors: Record<string, string> = {
  'Open': 'bg-yellow-500 text-white dark:bg-yellow-600',
  'Completed': 'bg-green-500 text-white dark:bg-green-600',
  'Closed': 'bg-gray-500 text-white dark:bg-gray-600',
  'Cancelled': 'bg-red-500 text-white dark:bg-red-600',
}

export default function EventList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const navigate = useNavigate()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12) // 12 for grid, adjust for table

  // Fetch event status options from backend
  const { data: eventStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Event', 'status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Event', 'status')
      return result.success ? result.data : []
    },
  })

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', statusFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
      const result = await EventAPI.list(filters)
      if (result.success) return result.data || []
      throw new Error(result.error)
    },
  })

  // Pagination logic
  const totalItems = events?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedEvents = events?.slice(
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
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage exhibitions and gift display events</p>
        </div>
        <Button asChild>
          <Link to="/events/new">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex gap-4 flex-wrap items-center justify-between">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {eventStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center py-8">Loading events...</div>}
      {error && <div className="text-center py-8 text-destructive">Failed to load events</div>}

      {!isLoading && events.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'all' 
                ? 'Create your first event to get started' 
                : 'No events match the selected filter'}
            </p>
            <Button asChild>
              <Link to="/events/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {!isLoading && events.length > 0 && viewMode === 'grid' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedEvents.map((event: Event) => (
              <Link key={event.name} to={`/events/${event.name}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-1">{event.subject}</CardTitle>
                      <Badge className={statusColors[event.status || 'Open']}>
                        {event.status || 'Open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.starts_on && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.starts_on), 'PPP')}</span>
                      </div>
                    )}
                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.venue_name}</span>
                      </div>
                    )}
                    {event.max_guests && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Max {event.max_guests} guests</span>
                      </div>
                    )}
                    {event.event_type_gift && (
                      <Badge variant="outline" className="text-xs">
                        {event.event_type_gift}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
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
        </>
      )}

      {/* Table View */}
      {!isLoading && events.length > 0 && viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden md:table-cell">Venue</TableHead>
                  <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event: Event) => (
                  <TableRow 
                    key={event.name} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/events/${event.name}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.subject}</p>
                        {/* Show venue on mobile */}
                        <p className="text-xs text-muted-foreground md:hidden">{event.venue_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{event.venue_name || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {event.starts_on ? format(new Date(event.starts_on), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {event.event_type_gift ? (
                        <Badge variant="outline">{event.event_type_gift}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[event.status || 'Open']}>
                        {event.status || 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/events/${event.name}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      )}
    </div>
  )
}
