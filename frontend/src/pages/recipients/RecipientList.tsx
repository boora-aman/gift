import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, MoreHorizontal, Search, Upload, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Pagination } from '@/components/Pagination'
import { GiftRecipientAPI, FileAPI } from '@/services/api'
import type { GiftRecipient } from '@/types/gift'
import { toast } from 'sonner'
import { config } from '@/config/environment'

export default function RecipientList() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingRecipient, setViewingRecipient] = useState<GiftRecipient | null>(null)
  const [editingRecipient, setEditingRecipient] = useState<GiftRecipient | null>(null)
  const [formData, setFormData] = useState({
    owner_full_name: '',
    coordinator_full_name: '',
    coordinator_mobile_no: '',
    coordinator_emirates_id: '',
    address: '',
    person_photo: ''
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const queryClient = useQueryClient()

  const { data: recipients, isLoading } = useQuery({
    queryKey: ['gift-recipients', search],
    queryFn: async () => {
      const result = await GiftRecipientAPI.list(search)
      return result.success ? result.data : []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingRecipient) return GiftRecipientAPI.update(editingRecipient.name, formData)
      return GiftRecipientAPI.create(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(editingRecipient ? 'Recipient updated' : 'Recipient created')
        queryClient.invalidateQueries({ queryKey: ['gift-recipients'] })
        closeDialog()
      } else toast.error(result.error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (name: string) => GiftRecipientAPI.delete(name),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Recipient deleted')
        queryClient.invalidateQueries({ queryKey: ['gift-recipients'] })
      } else toast.error(result.error)
    },
  })

  // View recipient details
  const openViewDialog = (recipient: GiftRecipient) => {
    setViewingRecipient(recipient)
    setViewDialogOpen(true)
  }

  const openEditDialog = (recipient?: GiftRecipient) => {
    if (recipient) {
      setEditingRecipient(recipient)
      setFormData({
        owner_full_name: recipient.owner_full_name || '',
        coordinator_full_name: recipient.coordinator_full_name || '',
        coordinator_mobile_no: recipient.coordinator_mobile_no || '',
        coordinator_emirates_id: recipient.coordinator_emirates_id || '',
        address: recipient.address || '',
        person_photo: recipient.person_photo || ''
      })
    } else {
      setEditingRecipient(null)
      setFormData({
        owner_full_name: '',
        coordinator_full_name: '',
        coordinator_mobile_no: '',
        coordinator_emirates_id: '',
        address: '',
        person_photo: ''
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => { 
    setDialogOpen(false)
    setEditingRecipient(null) 
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const result = await FileAPI.upload(file)
    if (result.success && result.data) {
      setFormData({ ...formData, person_photo: result.data.file_url })
      toast.success('Photo uploaded')
    } else {
      toast.error(result.error || 'Failed to upload photo')
    }
  }

  // Pagination logic
  const totalItems = recipients?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedRecipients = recipients?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recipients</h1>
          <p className="text-muted-foreground">Manage gift recipients</p>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />Add Recipient
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search recipients..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead className="hidden md:table-cell">Coordinator</TableHead>
                <TableHead className="hidden lg:table-cell">Mobile</TableHead>
                <TableHead className="hidden lg:table-cell">Emirates ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : paginatedRecipients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No recipients</TableCell>
                </TableRow>
              ) : (
                paginatedRecipients?.map((r) => (
                  <TableRow 
                    key={r.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openViewDialog(r)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {r.person_photo && (
                            <AvatarImage src={`${config.apiBaseUrl}${r.person_photo}`} />
                          )}
                          <AvatarFallback>{r.owner_full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{r.owner_full_name}</p>
                          {/* Show coordinator on mobile */}
                          <p className="text-xs text-muted-foreground md:hidden">{r.coordinator_full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{r.coordinator_full_name || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.coordinator_mobile_no || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm">{r.coordinator_emirates_id || '-'}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(r)}>
                            <Eye className="h-4 w-4 mr-2" />View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(r)}>
                            <Edit className="h-4 w-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(r.name)} 
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Delete
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recipient Details</DialogTitle>
          </DialogHeader>
          
          {viewingRecipient && (
            <div className="space-y-6">
              {/* Photo and Owner */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {viewingRecipient.person_photo && (
                    <AvatarImage src={`${config.apiBaseUrl}${viewingRecipient.person_photo}`} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {viewingRecipient.owner_full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label className="text-muted-foreground text-xs">Owner Name</Label>
                  <p className="text-lg font-semibold">{viewingRecipient.owner_full_name}</p>
                </div>
              </div>

              <Separator />

              {/* Coordinator Details */}
              <div className="space-y-4">
                <h4 className="font-medium">Coordinator Information</h4>
                
                <div>
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <p>{viewingRecipient.coordinator_full_name || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Mobile Number</Label>
                    <p>{viewingRecipient.coordinator_mobile_no || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Emirates ID</Label>
                    <p className="font-mono text-sm">{viewingRecipient.coordinator_emirates_id || '-'}</p>
                  </div>
                </div>

                {viewingRecipient.address && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Address</Label>
                    <p className="text-sm whitespace-pre-wrap">{viewingRecipient.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false)
              if (viewingRecipient) openEditDialog(viewingRecipient)
            }}>
              <Edit className="h-4 w-4 mr-2" />Edit Recipient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecipient ? 'Edit Recipient' : 'New Recipient'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {formData.person_photo && (
                  <AvatarImage src={`${config.apiBaseUrl}${formData.person_photo}`} />
                )}
                <AvatarFallback>{formData.owner_full_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </div>
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div>
              <Label>Owner Full Name *</Label>
              <Input 
                value={formData.owner_full_name} 
                onChange={(e) => setFormData({ ...formData, owner_full_name: e.target.value })} 
                placeholder="The actual recipient"
              />
            </div>
            <div>
              <Label>Coordinator Full Name *</Label>
              <Input 
                value={formData.coordinator_full_name} 
                onChange={(e) => setFormData({ ...formData, coordinator_full_name: e.target.value })} 
                placeholder="Person coordinating delivery"
              />
            </div>
            <div>
              <Label>Coordinator Mobile *</Label>
              <Input 
                value={formData.coordinator_mobile_no} 
                onChange={(e) => setFormData({ ...formData, coordinator_mobile_no: e.target.value })} 
                placeholder="+971 XX XXX XXXX"
              />
            </div>
            <div>
              <Label>Coordinator Emirates ID</Label>
              <Input 
                value={formData.coordinator_emirates_id} 
                onChange={(e) => setFormData({ ...formData, coordinator_emirates_id: e.target.value })} 
                placeholder="XXX-XXXX-XXXXXXX-X"
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                placeholder="Full address"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending || !formData.owner_full_name || !formData.coordinator_full_name || !formData.coordinator_mobile_no}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
