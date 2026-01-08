import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Calendar, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { EventAPI, GiftAPI } from '@/services/api'
import { toast } from 'sonner'
import type { Event, EventGift, EventResource } from '@/types/event'

const eventTypes = ['Exhibition', 'Auction', 'Distribution', 'Showcase']
const eventStatuses = ['Open', 'Completed', 'Closed', 'Cancelled']
const resourceTypes = ['Coordinator', 'Manager', 'Veterinarian', 'Security', 'Driver', 'Staff', 'Other']
const displayStatuses = ['On Display', 'Reserved', 'Distributed', 'In Storage']

export default function EventForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState<Partial<Event>>({
    subject: '',
    event_type_gift: 'Exhibition',
    status: 'Open',
    registration_required: false,
    event_gifts: [],
    event_resources: [],
  })

  // Fetch available gifts
  const { data: availableGifts } = useQuery({
    queryKey: ['available-gifts'],
    queryFn: async () => {
      const result = await GiftAPI.list({ status: 'Available' })
      return result.success ? result.data : []
    },
  })

  // Fetch event if editing
  useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null
      const result = await EventAPI.get(id)
      if (result.success && result.data) {
        setFormData(result.data)
        return result.data
      }
      throw new Error(result.error)
    },
    enabled: isEdit,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      if (isEdit && id) {
        return EventAPI.update(id, data)
      }
      return EventAPI.create(data)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(isEdit ? 'Event updated' : 'Event created')
        queryClient.invalidateQueries({ queryKey: ['events'] })
        navigate('/events')
      } else {
        toast.error(result.error || 'Failed to save event')
      }
    },
    onError: () => toast.error('Failed to save event'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject?.trim()) {
      toast.error('Event name is required')
      return
    }
    saveMutation.mutate(formData)
  }

  const updateField = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Event Gifts management
  const addEventGift = () => {
    setFormData(prev => ({
      ...prev,
      event_gifts: [...(prev.event_gifts || []), { gift: '', display_status: 'On Display' }]
    }))
  }

  const removeEventGift = (index: number) => {
    setFormData(prev => ({
      ...prev,
      event_gifts: prev.event_gifts?.filter((_, i) => i !== index)
    }))
  }

  const updateEventGift = (index: number, field: keyof EventGift, value: string) => {
    setFormData(prev => ({
      ...prev,
      event_gifts: prev.event_gifts?.map((g, i) => 
        i === index ? { ...g, [field]: value } : g
      )
    }))
  }

  // Event Resources management
  const addEventResource = () => {
    setFormData(prev => ({
      ...prev,
      event_resources: [...(prev.event_resources || []), { resource_type: 'Staff', employee_name: '' }]
    }))
  }

  const removeEventResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      event_resources: prev.event_resources?.filter((_, i) => i !== index)
    }))
  }

  const updateEventResource = (index: number, field: keyof EventResource, value: string) => {
    setFormData(prev => ({
      ...prev,
      event_resources: prev.event_resources?.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/events')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Event' : 'New Event'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update event details' : 'Create a new gift event'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject">Event Name *</Label>
              <Input
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => updateField('subject', e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.event_type_gift || 'Exhibition'}
                onValueChange={(value) => updateField('event_type_gift', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status || 'Open'}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="starts_on">Start Date & Time</Label>
              <Input
                id="starts_on"
                type="datetime-local"
                value={formData.starts_on?.slice(0, 16) || ''}
                onChange={(e) => updateField('starts_on', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_on">End Date & Time</Label>
              <Input
                id="ends_on"
                type="datetime-local"
                value={formData.ends_on?.slice(0, 16) || ''}
                onChange={(e) => updateField('ends_on', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue Name</Label>
              <Input
                id="venue_name"
                value={formData.venue_name || ''}
                onChange={(e) => updateField('venue_name', e.target.value)}
                placeholder="Event venue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_guests">Max Guests</Label>
              <Input
                id="max_guests"
                type="number"
                value={formData.max_guests || ''}
                onChange={(e) => updateField('max_guests', parseInt(e.target.value) || 0)}
                placeholder="Maximum number of guests"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="venue_address">Venue Address</Label>
              <Textarea
                id="venue_address"
                value={formData.venue_address || ''}
                onChange={(e) => updateField('venue_address', e.target.value)}
                placeholder="Full address of the venue"
                rows={2}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="registration_required"
                checked={formData.registration_required || false}
                onCheckedChange={(checked) => updateField('registration_required', checked)}
              />
              <Label htmlFor="registration_required">Registration Required</Label>
            </div>
          </CardContent>
        </Card>

        {/* Event Gifts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Gifts</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addEventGift}>
                <Plus className="h-4 w-4 mr-2" />
                Add Gift
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.event_gifts?.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No gifts added to this event yet
              </p>
            )}
            {formData.event_gifts?.map((gift, index) => (
              <div key={index} className="flex gap-3 items-end p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Gift</Label>
                  <Select
                    value={gift.gift || ''}
                    onValueChange={(value) => updateEventGift(index, 'gift', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gift" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGifts?.map(g => (
                        <SelectItem key={g.name} value={g.name}>
                          {g.gift_name} ({g.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40 space-y-2">
                  <Label>Display Status</Label>
                  <Select
                    value={gift.display_status || 'On Display'}
                    onValueChange={(value) => updateEventGift(index, 'display_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {displayStatuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEventGift(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Event Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Resources</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addEventResource}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.event_resources?.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No resources assigned to this event yet
              </p>
            )}
            {formData.event_resources?.map((resource, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-4 items-end p-3 border rounded-lg">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={resource.resource_type || 'Staff'}
                    onValueChange={(value) => updateEventResource(index, 'resource_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={resource.employee_name || ''}
                    onChange={(e) => updateEventResource(index, 'employee_name', e.target.value)}
                    placeholder="Employee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input
                    value={resource.contact_number || ''}
                    onChange={(e) => updateEventResource(index, 'contact_number', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={resource.email || ''}
                    onChange={(e) => updateEventResource(index, 'email', e.target.value)}
                    placeholder="Email"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEventResource(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes about this event"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/events')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
