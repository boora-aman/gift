import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Truck, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { GiftDispatchAPI, GiftAPI, GiftIssueAPI, EventAPI, FileAPI, DocTypeAPI } from '@/services/api'
import { toast } from 'sonner'
import type { GiftDispatch } from '@/types/gift'
import { format } from 'date-fns'

export default function DispatchForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const preselectedGift = searchParams.get('gift')
  const isEdit = !!id

  const [formData, setFormData] = useState<Partial<GiftDispatch>>({
    dispatch_date: format(new Date(), 'yyyy-MM-dd'),
    dispatch_status: 'Pending',
    dispatch_type: 'Gift Issue',
    gift: preselectedGift || '',
  })

  // Fetch dynamic options from backend
  const { data: dispatchTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Dispatch', 'dispatch_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Dispatch', 'dispatch_type')
      return result.success ? result.data : []
    },
  })

  const { data: dispatchStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift Dispatch', 'dispatch_status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Dispatch', 'dispatch_status')
      return result.success ? result.data : []
    },
  })

  const { data: transportModes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Dispatch', 'transport_mode'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Dispatch', 'transport_mode')
      return result.success ? result.data : []
    },
  })

  // Fetch all active dispatches to exclude gifts already dispatched
  const { data: activeDispatches = [] } = useQuery({
    queryKey: ['active-dispatches'],
    queryFn: async () => {
      const result = await GiftDispatchAPI.list({
        dispatch_status: ['!=', 'Delivered']
      })
      return result.success ? result.data : []
    },
    enabled: !isEdit, // Only fetch when creating new dispatch
  })

  // Fetch gifts based on dispatch type and exclude already dispatched gifts
  const { data: gifts, isLoading: giftsLoading } = useQuery({
    queryKey: ['gifts-for-dispatch', formData.dispatch_type, activeDispatches.length],
    queryFn: async () => {
      let filters: Record<string, any> = {}
      if (formData.dispatch_type === 'Gift Issue') {
        filters.status = 'Issued'
      } else if (formData.dispatch_type === 'Event' || formData.dispatch_type === 'Transfer') {
        filters.status = 'Available'
      }
      
      const result = await GiftAPI.list(filters)
      if (!result.success) return []
      
      // Get list of gift IDs that already have active dispatches
      const dispatchedGiftIds = activeDispatches.map(d => d.gift)
      
      // Filter out gifts that already have active dispatches
      const availableGifts = result.data?.filter(gift => 
        !dispatchedGiftIds.includes(gift.name)
      ) || []
      
      return availableGifts
    },
  })

  // Fetch gift issues for linking (only non-delivered issues)
  const { data: giftIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['gift-issues-for-dispatch'],
    queryFn: async () => {
      const result = await GiftIssueAPI.list()
      if (!result.success) return []
      return result.data?.filter(i => i.status !== 'Delivered') || []
    },
    enabled: formData.dispatch_type === 'Gift Issue',
  })

  // Fetch events for linking
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events-for-dispatch'],
    queryFn: async () => {
      const result = await EventAPI.list()
      if (!result.success) return []
      return result.data?.filter(e => e.status === 'Open') || []
    },
    enabled: formData.dispatch_type === 'Event',
  })

  // Fetch existing dispatch if editing
  useQuery({
    queryKey: ['gift-dispatch', id],
    queryFn: async () => {
      if (!id) return null
      const result = await GiftDispatchAPI.get(id)
      if (result.success && result.data) {
        setFormData(result.data)
        return result.data
      }
      throw new Error(result.error)
    },
    enabled: isEdit,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<GiftDispatch>) => {
      if (isEdit && id) {
        return GiftDispatchAPI.update(id, data)
      }
      return GiftDispatchAPI.create(data)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(isEdit ? 'Dispatch updated' : 'Dispatch created')
        queryClient.invalidateQueries({ queryKey: ['gift-dispatch'] })
        queryClient.invalidateQueries({ queryKey: ['active-dispatches'] })
        navigate('/dispatch')
      } else {
        toast.error(result.error || 'Failed to save')
      }
    },
    onError: () => toast.error('Failed to save'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.gift) {
      toast.error('Gift is required')
      return
    }
    saveMutation.mutate(formData)
  }

  const updateField = (field: keyof GiftDispatch, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGiftChange = async (giftName: string) => {
    const result = await GiftAPI.get(giftName)
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        gift: giftName,
        gift_name: result.data?.gift_name || '',
        current_warehouse: result.data?.warehouse || '',
      }))
    }
  }

  const handleFileUpload = async (field: keyof GiftDispatch, file: File) => {
    const result = await FileAPI.upload(file)
    if (result.success && result.data) {
      updateField(field, result.data.file_url)
      toast.success('File uploaded')
    } else {
      toast.error(result.error || 'Failed to upload')
    }
  }

  // Gift options
  const giftOptions = gifts?.map(g => ({
    value: g.name,
    label: g.gift_name,
    sublabel: `${g.status} - ${g.name}`
  })) || []

  // Issue options
  const issueOptions = giftIssues?.map(i => ({
    value: i.name,
    label: i.name,
    sublabel: i.owner_full_name
  })) || []

  // Event options
  const eventOptions = events?.map(e => ({
    value: e.name,
    label: e.subject,
    sublabel: e.status
  })) || []

  // Get helper text based on dispatch type
  const getGiftHelperText = () => {
    const baseText = (() => {
      switch (formData.dispatch_type) {
        case 'Gift Issue':
          return 'Only issued gifts without active dispatch'
        case 'Event':
        case 'Transfer':
          return 'Only available gifts without active dispatch'
        default:
          return 'Only gifts without active dispatch'
      }
    })()
    
    const dispatchedCount = activeDispatches.length
    return dispatchedCount > 0 
      ? `${baseText} (${dispatchedCount} gifts currently dispatched)`
      : baseText
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dispatch')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Dispatch' : 'New Dispatch'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update dispatch details' : 'Create a new gift dispatch'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Dispatch Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dispatch Type *</Label>
              <Select
                value={formData.dispatch_type || ''}
                onValueChange={(value) => {
                  updateField('dispatch_type', value)
                  // Clear gift selection when type changes
                  if (!isEdit) {
                    setFormData(prev => ({ ...prev, gift: '', gift_name: '', current_warehouse: '' }))
                  }
                }}
                disabled={isEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gift *</Label>
              <SearchableSelect
                value={formData.gift || ''}
                onValueChange={handleGiftChange}
                options={giftOptions}
                placeholder="Search and select a gift..."
                searchPlaceholder="Search by name or ID..."
                emptyMessage="No eligible gifts found"
                isLoading={giftsLoading}
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">{getGiftHelperText()}</p>
            </div>

            <div className="space-y-2">
              <Label>Current Warehouse</Label>
              <Input value={formData.current_warehouse || ''} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispatch_date">Dispatch Date *</Label>
              <Input
                id="dispatch_date"
                type="date"
                value={formData.dispatch_date || ''}
                onChange={(e) => updateField('dispatch_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.dispatch_status || ''}
                onValueChange={(value) => updateField('dispatch_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchStatuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional fields based on dispatch type */}
            {formData.dispatch_type === 'Gift Issue' && (
              <div className="space-y-2">
                <Label>Related Gift Issue</Label>
                <SearchableSelect
                  value={formData.related_gift_issue || ''}
                  onValueChange={(value) => updateField('related_gift_issue', value)}
                  options={issueOptions}
                  placeholder="Select related issue..."
                  searchPlaceholder="Search issues..."
                  emptyMessage="No pending issues found"
                  isLoading={issuesLoading}
                />
              </div>
            )}

            {formData.dispatch_type === 'Event' && (
              <div className="space-y-2">
                <Label>Related Event</Label>
                <SearchableSelect
                  value={formData.related_event || ''}
                  onValueChange={(value) => updateField('related_event', value)}
                  options={eventOptions}
                  placeholder="Select event..."
                  searchPlaceholder="Search events..."
                  emptyMessage="No open events found"
                  isLoading={eventsLoading}
                />
              </div>
            )}

            {formData.dispatch_type === 'Transfer' && (
              <div className="space-y-2">
                <Label htmlFor="to_warehouse">To Warehouse</Label>
                <Input
                  id="to_warehouse"
                  value={formData.to_warehouse || ''}
                  onChange={(e) => updateField('to_warehouse', e.target.value)}
                  placeholder="Destination warehouse"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader>
            <CardTitle>Destination</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient_name">Recipient Name</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name || ''}
                onChange={(e) => updateField('recipient_name', e.target.value)}
                placeholder="Name of receiver"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_contact">Recipient Contact</Label>
              <Input
                id="recipient_contact"
                value={formData.recipient_contact || ''}
                onChange={(e) => updateField('recipient_contact', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="destination_address">Destination Address</Label>
              <Textarea
                id="destination_address"
                value={formData.destination_address || ''}
                onChange={(e) => updateField('destination_address', e.target.value)}
                placeholder="Full delivery address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transport Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transport Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Transport Mode</Label>
              <Select
                value={formData.transport_mode || ''}
                onValueChange={(value) => updateField('transport_mode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {transportModes.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input
                id="vehicle_number"
                value={formData.vehicle_number || ''}
                onChange={(e) => updateField('vehicle_number', e.target.value)}
                placeholder="Vehicle plate number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name</Label>
              <Input
                id="driver_name"
                value={formData.driver_name || ''}
                onChange={(e) => updateField('driver_name', e.target.value)}
                placeholder="Driver's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_contact">Driver Contact</Label>
              <Input
                id="driver_contact"
                value={formData.driver_contact || ''}
                onChange={(e) => updateField('driver_contact', e.target.value)}
                placeholder="Driver's phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_arrival">Estimated Arrival</Label>
              <Input
                id="estimated_arrival"
                type="datetime-local"
                value={formData.estimated_arrival?.slice(0, 16) || ''}
                onChange={(e) => updateField('estimated_arrival', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_delivery_date">Actual Delivery Date</Label>
              <Input
                id="actual_delivery_date"
                type="datetime-local"
                value={formData.actual_delivery_date?.slice(0, 16) || ''}
                onChange={(e) => updateField('actual_delivery_date', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Health Certificate</Label>
              <div className="flex gap-2">
                <Input value={formData.health_certificate || ''} readOnly placeholder="No file" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('health_input')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="health_input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('health_certificate', e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transport Permit</Label>
              <div className="flex gap-2">
                <Input value={formData.transport_permit || ''} readOnly placeholder="No file" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('permit_input')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="permit_input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('transport_permit', e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delivery Note</Label>
              <div className="flex gap-2">
                <Input value={formData.delivery_note || ''} readOnly placeholder="No file" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('note_input')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="note_input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('delivery_note', e.target.files[0])} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="received_by_name">Received By Name</Label>
              <Input
                id="received_by_name"
                value={formData.received_by_name || ''}
                onChange={(e) => updateField('received_by_name', e.target.value)}
                placeholder="Who received the gift"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_id">Receiver ID</Label>
              <Input
                id="receiver_id"
                value={formData.receiver_id || ''}
                onChange={(e) => updateField('receiver_id', e.target.value)}
                placeholder="Emirates ID of receiver"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="delivery_remarks">Delivery Remarks</Label>
              <Textarea
                id="delivery_remarks"
                value={formData.delivery_remarks || ''}
                onChange={(e) => updateField('delivery_remarks', e.target.value)}
                placeholder="Condition notes, comments"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/dispatch')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending || (!formData.gift && !isEdit)}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Dispatch' : 'Create Dispatch'}
          </Button>
        </div>
      </form>
    </div>
  )
}
