import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { GiftAPI, GiftRecipientAPI, GiftIssueAPI, FileAPI } from '@/services/api'
import type { GiftIssue, GiftIssueDocument } from '@/types/gift'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const documentTypes = [
  'Emirates ID Front',
  'Emirates ID Back',
  'Passport',
  'Visa',
  'Employment Letter',
  'Others'
] as const

export default function IssueForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const preselectedGift = searchParams.get('gift')
  const queryClient = useQueryClient()
  const isEdit = !!id
  const [showNewRecipientForm, setShowNewRecipientForm] = useState(false)
  const [newRecipient, setNewRecipient] = useState({
    owner_full_name: '',
    coordinator_full_name: '',
    coordinator_mobile_no: '',
    coordinator_emirates_id: '',
    address: ''
  })

  const [formData, setFormData] = useState<Partial<GiftIssue>>({
    gift: preselectedGift || '',
    gift_name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Dispatched',
    category: '',
    gift_recipient: '',
    owner_full_name: '',
    coordinator_full_name: '',
    mobile_number: '',
    emirates_id: '',
    address: '',
    delivery_description: '',
    delivery_date: '',
    delivery_note: '',
    documents: []
  })

  // Fetch available gifts only
  const { data: availableGifts, isLoading: giftsLoading } = useQuery({
    queryKey: ['available-gifts'],
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

  // Fetch existing issue if editing
  const { data: existingIssue } = useQuery({
    queryKey: ['gift-issue', id],
    queryFn: async () => {
      if (!id) return null
      const result = await GiftIssueAPI.get(id)
      return result.success ? result.data : null
    },
    enabled: isEdit,
  })

  // Populate form when editing
  useEffect(() => {
    if (existingIssue) {
      setFormData(existingIssue)
    }
  }, [existingIssue])

  // Auto-fill gift details when gift is selected
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

  // Auto-fill recipient details when recipient is selected
  const handleRecipientChange = async (recipientName: string) => {
    const result = await GiftRecipientAPI.get(recipientName)
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        gift_recipient: recipientName,
        owner_full_name: result.data?.owner_full_name || '',
        coordinator_full_name: result.data?.coordinator_full_name || '',
        mobile_number: result.data?.coordinator_mobile_no || '',
        emirates_id: result.data?.coordinator_emirates_id || '',
        address: result.data?.address || '',
        person_photo: result.data?.person_photo || ''
      }))
    }
  }

  // Handle preselected gift
  useEffect(() => {
    if (preselectedGift && !isEdit) {
      handleGiftChange(preselectedGift)
    }
  }, [preselectedGift])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && id) {
        return GiftIssueAPI.update(id, formData)
      }
      return GiftIssueAPI.create(formData)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(isEdit ? 'Issue updated' : 'Gift issued successfully')
        queryClient.invalidateQueries({ queryKey: ['gift-issues'] })
        queryClient.invalidateQueries({ queryKey: ['gifts'] })
        navigate('/issues')
      } else {
        toast.error(result.error)
      }
    },
  })

  // Document handling
  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), { document_type: undefined, document_attachment: '', description: '' }]
    }))
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index)
    }))
  }

  const updateDocument = (index: number, field: keyof GiftIssueDocument, value: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }))
  }

  const handleDocumentUpload = async (index: number, file: File) => {
    const result = await FileAPI.upload(file)
    if (result.success && result.data) {
      updateDocument(index, 'document_attachment', result.data.file_url)
      toast.success('Document uploaded')
    } else {
      toast.error(result.error || 'Failed to upload')
    }
  }

  const handleDeliveryNoteUpload = async (file: File) => {
    const result = await FileAPI.upload(file)
    if (result.success && result.data) {
      setFormData(prev => ({ ...prev, delivery_note: result.data?.file_url }))
      toast.success('Delivery note uploaded')
    } else {
      toast.error(result.error || 'Failed to upload')
    }
  }

  const isValid = formData.gift && formData.gift_recipient && formData.owner_full_name && formData.coordinator_full_name && formData.mobile_number

  // Gift options for searchable select
  const giftOptions = availableGifts?.map(g => ({
    value: g.name,
    label: g.gift_name,
    sublabel: g.name
  })) || []

  // Recipient options for searchable select
  const recipientOptions = recipients?.map(r => ({
    value: r.name,
    label: r.owner_full_name,
    sublabel: r.coordinator_mobile_no
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/issues')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Gift Issue' : 'Issue Gift'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update issue details' : 'Issue a gift to a recipient'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Gift */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Gift</CardTitle>
              <CardDescription>Choose an available gift to issue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Gift *</Label>
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

          {/* Step 2: Select Recipient */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>2. Select Recipient</CardTitle>
                  <CardDescription>Choose or create a new recipient</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowNewRecipientForm(!showNewRecipientForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showNewRecipientForm ? 'Select Existing' : 'Add New'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewRecipientForm ? (
                <>
                  <div>
                    <Label>Recipient *</Label>
                    <SearchableSelect
                      value={formData.gift_recipient || ''}
                      onValueChange={handleRecipientChange}
                      options={recipientOptions}
                      placeholder="Search and select a recipient..."
                      searchPlaceholder="Search by name or phone..."
                      emptyMessage="No recipients found"
                      isLoading={recipientsLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Owner Full Name *</Label>
                      <Input 
                        value={formData.owner_full_name || ''} 
                        onChange={(e) => setFormData({ ...formData, owner_full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Coordinator Full Name *</Label>
                      <Input 
                        value={formData.coordinator_full_name || ''} 
                        onChange={(e) => setFormData({ ...formData, coordinator_full_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Mobile Number *</Label>
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
                        placeholder="XXX-XXXX-XXXXXXX-X"
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
                </>
              ) : (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium text-muted-foreground">Create New Recipient</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Owner Full Name *</Label>
                      <Input 
                        value={newRecipient.owner_full_name} 
                        onChange={(e) => setNewRecipient({ ...newRecipient, owner_full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Coordinator Full Name *</Label>
                      <Input 
                        value={newRecipient.coordinator_full_name} 
                        onChange={(e) => setNewRecipient({ ...newRecipient, coordinator_full_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Mobile Number *</Label>
                      <Input 
                        value={newRecipient.coordinator_mobile_no} 
                        onChange={(e) => setNewRecipient({ ...newRecipient, coordinator_mobile_no: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Emirates ID</Label>
                      <Input 
                        value={newRecipient.coordinator_emirates_id} 
                        onChange={(e) => setNewRecipient({ ...newRecipient, coordinator_emirates_id: e.target.value })}
                        placeholder="XXX-XXXX-XXXXXXX-X"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea 
                      value={newRecipient.address} 
                      onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={async () => {
                      if (!newRecipient.owner_full_name || !newRecipient.coordinator_full_name || !newRecipient.coordinator_mobile_no) {
                        toast.error('Please fill required recipient fields')
                        return
                      }
                      const result = await GiftRecipientAPI.create(newRecipient)
                      if (result.success && result.data) {
                        toast.success('Recipient created')
                        setFormData(prev => ({
                          ...prev,
                          gift_recipient: result.data.name,
                          owner_full_name: newRecipient.owner_full_name,
                          coordinator_full_name: newRecipient.coordinator_full_name,
                          mobile_number: newRecipient.coordinator_mobile_no,
                          emirates_id: newRecipient.coordinator_emirates_id,
                          address: newRecipient.address
                        }))
                        queryClient.invalidateQueries({ queryKey: ['gift-recipients'] })
                        setShowNewRecipientForm(false)
                        setNewRecipient({ owner_full_name: '', coordinator_full_name: '', coordinator_mobile_no: '', coordinator_emirates_id: '', address: '' })
                      } else {
                        toast.error(result.error || 'Failed to create recipient')
                      }
                    }}
                    disabled={!newRecipient.owner_full_name || !newRecipient.coordinator_full_name || !newRecipient.coordinator_mobile_no}
                  >
                    Create & Use Recipient
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Status & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>3. Status & Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v as 'Dispatched' | 'Delivered' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.delivery_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.delivery_date 
                          ? format(new Date(formData.delivery_date), "PPP")
                          : <span>Pick a date</span>
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.delivery_date ? new Date(formData.delivery_date) : undefined}
                        onSelect={(date) => setFormData({ ...formData, delivery_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Delivery Note</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.delivery_note || ''} 
                      readOnly 
                      placeholder="No file" 
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      type="button"
                      onClick={() => document.getElementById('delivery_note_input')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input 
                      id="delivery_note_input"
                      type="file" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleDeliveryNoteUpload(e.target.files[0])}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Delivery Description</Label>
                <Textarea 
                  value={formData.delivery_description || ''} 
                  onChange={(e) => setFormData({ ...formData, delivery_description: e.target.value })}
                  placeholder="Notes about the delivery..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>4. Supporting Documents</CardTitle>
                <Button variant="outline" size="sm" onClick={addDocument} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.documents?.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No documents added. Click "Add Document" to attach supporting documents.
                </p>
              )}
              
              {formData.documents?.map((doc, index) => (
                <div key={index} className="grid sm:grid-cols-3 gap-3 items-end p-3 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={doc.document_type || ''}
                      onValueChange={(v) => updateDocument(index, 'document_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>File</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={doc.document_attachment || ''} 
                        readOnly 
                        placeholder="No file" 
                        className="flex-1 text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        type="button"
                        onClick={() => document.getElementById(`doc_input_${index}`)?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <input 
                        id={`doc_input_${index}`}
                        type="file" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleDocumentUpload(index, e.target.files[0])}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      value={doc.description || ''} 
                      onChange={(e) => updateDocument(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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
                disabled={!isValid || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : (isEdit ? 'Update Issue' : 'Issue Gift')}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/issues')}>
                Cancel
              </Button>
            </CardContent>
          </Card>

          {formData.person_photo && (
            <Card>
              <CardHeader>
                <CardTitle>Recipient Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={formData.person_photo} 
                  alt="Recipient" 
                  className="rounded-lg w-full aspect-square object-cover"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
