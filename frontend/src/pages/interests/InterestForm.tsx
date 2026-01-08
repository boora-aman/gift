import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { GiftAPI, GiftRecipientAPI, GiftInterestAPI } from '@/services/api'
import type { GiftInterest } from '@/types/gift'
import { toast } from 'sonner'
import { format } from 'date-fns'

const interestSources = [
  'Direct Inquiry',
  'Event Registration',
  'Website',
  'Referral',
  'QR Code Scan',
  'Phone Call',
  'Email',
  'Other'
] as const

const interestLevels = [
  'Very Interested',
  'Interested',
  'Just Browsing',
  'Reserved'
] as const

const followUpStatuses = [
  'New',
  'Contacted',
  'Follow Up Required',
  'Converted to Issue',
  'Not Interested',
  'Lost'
] as const

export default function InterestForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const preselectedGift = searchParams.get('gift')
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [formData, setFormData] = useState<Partial<GiftInterest>>({
    gift: preselectedGift || '',
    gift_name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    gift_recipient: '',
    owner_full_name: '',
    coordinator_full_name: '',
    mobile_number: '',
    emirates_id: '',
    address: '',
    interest_source: 'Direct Inquiry',
    event: '',
    interest_level: 'Interested',
    remarks: '',
    follow_up_status: 'New'
  })

  // Fetch only Available gifts for interest
  const { data: gifts, isLoading: giftsLoading } = useQuery({
    queryKey: ['available-gifts-for-interest'],
    queryFn: async () => {
      const result = await GiftAPI.list({ status: 'Available' })
      return result.success ? result.data : []
    },
  })

  // Fetch recipients
  const { data: recipients, isLoading: recipientsLoading } = useQuery({
    queryKey: ['gift-recipients'],
    queryFn: async () => {
      const result = await GiftRecipientAPI.list()
      return result.success ? result.data : []
    },
  })

  // Fetch existing interest if editing
  const { data: existingInterest } = useQuery({
    queryKey: ['gift-interest', id],
    queryFn: async () => {
      if (!id) return null
      const result = await GiftInterestAPI.get(id)
      return result.success ? result.data : null
    },
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingInterest) {
      setFormData(existingInterest)
    }
  }, [existingInterest])

  const handleGiftChange = async (giftName: string) => {
    const result = await GiftAPI.get(giftName)
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        gift: giftName,
        gift_name: result.data?.gift_name || '',
        category: result.data?.category || ''
      }))
    }
  }

  const handleRecipientChange = async (recipientName: string) => {
    if (recipientName === 'manual') {
      setFormData(prev => ({ ...prev, gift_recipient: '' }))
      return
    }
    const result = await GiftRecipientAPI.get(recipientName)
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        gift_recipient: recipientName,
        owner_full_name: result.data?.owner_full_name || '',
        coordinator_full_name: result.data?.coordinator_full_name || '',
        mobile_number: result.data?.coordinator_mobile_no || '',
        emirates_id: result.data?.coordinator_emirates_id || '',
        address: result.data?.address || ''
      }))
    }
  }

  useEffect(() => {
    if (preselectedGift && !isEdit) {
      handleGiftChange(preselectedGift)
    }
  }, [preselectedGift])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && id) {
        return GiftInterestAPI.update(id, formData)
      }
      return GiftInterestAPI.create(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(isEdit ? 'Interest updated' : 'Interest recorded')
        queryClient.invalidateQueries({ queryKey: ['gift-interests'] })
        navigate('/interests')
      } else {
        toast.error(result.error)
      }
    },
  })

  // Gift options for searchable select
  const giftOptions = gifts?.map(g => ({
    value: g.name,
    label: g.gift_name,
    sublabel: `${g.status || 'Available'}`
  })) || []

  // Recipient options for searchable select
  const recipientOptions = [
    { value: 'manual', label: '-- Enter manually --' },
    ...(recipients?.map(r => ({
      value: r.name,
      label: r.owner_full_name,
      sublabel: r.coordinator_mobile_no
    })) || [])
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/interests')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Interest' : 'Record Interest'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update interest details' : 'Track someone interested in a gift'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Gift Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Gift Information</CardTitle>
              <CardDescription>Only available gifts can be selected for interest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Gift</Label>
                <SearchableSelect
                  value={formData.gift || ''}
                  onValueChange={handleGiftChange}
                  options={giftOptions}
                  placeholder="Search and select a gift..."
                  searchPlaceholder="Search by name or ID..."
                  emptyMessage="No available gifts found"
                  isLoading={giftsLoading}
                  disabled={isEdit || !!preselectedGift}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Gift Name</Label>
                  <Input value={formData.gift_name || ''} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={formData.category || ''} readOnly className="bg-muted" />
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={formData.date || ''} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interested Party */}
          <Card>
            <CardHeader>
              <CardTitle>Interested Party</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Existing Recipient (Optional)</Label>
                <SearchableSelect
                  value={formData.gift_recipient || 'manual'}
                  onValueChange={handleRecipientChange}
                  options={recipientOptions}
                  placeholder="Select or enter new"
                  searchPlaceholder="Search recipients..."
                  isLoading={recipientsLoading}
                />
              </div>
              
              <Separator />
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Owner Full Name</Label>
                  <Input 
                    value={formData.owner_full_name || ''} 
                    onChange={(e) => setFormData({ ...formData, owner_full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Coordinator Full Name</Label>
                  <Input 
                    value={formData.coordinator_full_name || ''} 
                    onChange={(e) => setFormData({ ...formData, coordinator_full_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Mobile Number</Label>
                  <Input 
                    value={formData.mobile_number || ''} 
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Emirates ID</Label>
                  <Input 
                    value={formData.emirates_id || ''} 
                    onChange={(e) => setFormData({ ...formData, emirates_id: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea 
                  value={formData.address || ''} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interest Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interest Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Interest Source</Label>
                  <Select 
                    value={formData.interest_source} 
                    onValueChange={(v) => setFormData({ ...formData, interest_source: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interestSources.map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.interest_source === 'Event Registration' && (
                  <div>
                    <Label>Event</Label>
                    <Input 
                      value={formData.event || ''} 
                      onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                      placeholder="Event name or ID"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Interest Level</Label>
                  <Select 
                    value={formData.interest_level} 
                    onValueChange={(v) => setFormData({ ...formData, interest_level: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {interestLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Follow-up Status</Label>
                  <Select 
                    value={formData.follow_up_status} 
                    onValueChange={(v) => setFormData({ ...formData, follow_up_status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {followUpStatuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Remarks</Label>
                <Textarea 
                  value={formData.remarks || ''} 
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Notes about this interest..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : (isEdit ? 'Update' : 'Save Interest')}
              </Button>
              {isEdit && formData.follow_up_status !== 'Converted to Issue' && formData.gift && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/issues/new?gift=${formData.gift}`)}
                >
                  Convert to Issue
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate('/interests')}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
