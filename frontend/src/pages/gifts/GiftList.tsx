import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GiftAPI, GiftCategoryAPI } from '@/services/api'
import type { Gift } from '@/types/gift'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  Available: 'bg-green-100 text-green-800',
  Issued: 'bg-blue-100 text-blue-800',
}

export default function GiftList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Sync status filter from URL
  useEffect(() => {
    const urlStatus = searchParams.get('status')
    if (urlStatus) setStatusFilter(urlStatus)
  }, [searchParams])

  const { data: gifts, isLoading, refetch } = useQuery({
    queryKey: ['gifts', statusFilter, categoryFilter],
    queryFn: async () => {
      const filters: Record<string, string> = {}
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
      if (categoryFilter && categoryFilter !== 'all') filters.category = categoryFilter
      
      const result = await GiftAPI.list(filters)
      if (result.success) return result.data
      throw new Error(result.error)
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['gift-categories'],
    queryFn: async () => {
      const result = await GiftCategoryAPI.list()
      if (result.success) return result.data
      return []
    },
  })

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this gift?')) return
    
    const result = await GiftAPI.delete(name)
    if (result.success) {
      toast.success('Gift deleted successfully')
      refetch()
    } else {
      toast.error(result.error || 'Failed to delete gift')
    }
  }

  // Apply client-side search filter
  const filteredGifts = gifts?.filter((gift) =>
    gift.gift_name?.toLowerCase().includes(search.toLowerCase()) ||
    gift.gift_id?.toLowerCase().includes(search.toLowerCase())
  )

  const totalFilteredItems = filteredGifts?.length || 0
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage)

  // Paginate the filtered results
  const paginatedGifts = filteredGifts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gifts</h1>
          <p className="text-muted-foreground">Manage your gift inventory</p>
        </div>
        <Button asChild>
          <Link to="/gifts/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Gift
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Gift ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedGifts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No gifts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGifts?.map((gift) => (
                  <TableRow 
                    key={gift.name} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/gifts/${gift.name}`)}
                  >
                    <TableCell className="hidden md:table-cell font-mono text-sm">{gift.gift_id || gift.name}</TableCell>
                    <TableCell className="font-medium">{gift.gift_name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{gift.category || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[gift.status || 'Available'] || 'bg-muted'}>
                        {gift.status || 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{gift.warehouse || '-'}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/gifts/${gift.name}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/gifts/${gift.name}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(gift.name)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFilteredItems}
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
