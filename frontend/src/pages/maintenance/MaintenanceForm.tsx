import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Wrench, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { GiftMaintenanceAPI, GiftAPI, FileAPI, DocTypeAPI } from '@/services/api'
import { toast } from 'sonner'
import type { GiftMaintenance } from '@/types/gift'
import { format } from 'date-fns'

export default function MaintenanceForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const isEdit = !!id

  const [formData, setFormData] = useState<Partial<GiftMaintenance>>({
    maintenance_date: format(new Date(), 'yyyy-MM-dd'),
    maintenance_type: '',
    follow_up_required: false,
    payment_status: 'Pending',
  })

  // Fetch dynamic options from backend
  const { data: maintenanceTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Maintenance', 'maintenance_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Maintenance', 'maintenance_type')
      return result.success ? result.data : []
    },
  })

  const { data: providerTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Maintenance', 'provider_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Maintenance', 'provider_type')
      return result.success ? result.data : []
    },
  })

  const { data: healthStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift', 'health_status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift', 'health_status')
      return result.success ? result.data : []
    },
  })

  const { data: paymentStatuses = [] } = useQuery({
    queryKey: ['field-options', 'Gift Maintenance', 'payment_status'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Maintenance', 'payment_status')
      return result.success ? result.data : []
    },
  })

  // Fetch all gifts
  const { data: gifts } = useQuery({
    queryKey: ['all-gifts'],
    queryFn: async () => {
      const result = await GiftAPI.list()
      return result.success ? result.data : []
    },
  })

  // Fetch existing record if editing
  useQuery({
    queryKey: ['gift-maintenance', id],
    queryFn: async () => {
      if (!id) return null
      const result = await GiftMaintenanceAPI.get(id)
      if (result.success && result.data) {
        setFormData(result.data)
        return result.data
      }
      throw new Error(result.error)
    },
    enabled: isEdit,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<GiftMaintenance>) => {
      let result
      if (isEdit && id) {
        result = await GiftMaintenanceAPI.update(id, data)
      } else {
        result = await GiftMaintenanceAPI.create(data)
      }

      // Update gift health status if changed
      if (result.success && data.gift && data.health_status) {
        await GiftAPI.update(data.gift, { health_status: data.health_status as any })
      }

      return result
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(isEdit ? 'Record updated' : 'Record created')
        queryClient.invalidateQueries({ queryKey: ['gift-maintenance'] })
        queryClient.invalidateQueries({ queryKey: ['gifts'] })
        navigate('/maintenance')
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
    if (!formData.performed_by?.trim()) {
      toast.error('Performed by is required')
      return
    }
    saveMutation.mutate(formData)
  }

  const updateField = (field: keyof GiftMaintenance, value: any) => {
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
        current_location: result.data?.storage_location || '',
      }))
    }
  }

  const handleFileUpload = async (field: keyof GiftMaintenance, file: File) => {
    const result = await FileAPI.upload(file)
    if (result.success && result.data) {
      updateField(field, result.data.file_url)
      toast.success('File uploaded')
    } else {
      toast.error(result.error || 'Failed to upload')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Edit Maintenance Record' : 'New Maintenance Record'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update maintenance details' : 'Record a maintenance activity'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gift Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Gift & Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Gift *</Label>
              <Select value={formData.gift || ''} onValueChange={handleGiftChange} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gift" />
                </SelectTrigger>
                <SelectContent>
                  {gifts?.map(g => (
                    <SelectItem key={g.name} value={g.name}>
                      {g.gift_name} ({g.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Warehouse</Label>
              <Input value={formData.current_warehouse || ''} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_date">Date *</Label>
              <Input
                id="maintenance_date"
                type="date"
                value={formData.maintenance_date || ''}
                onChange={(e) => updateField('maintenance_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.maintenance_type || ''}
                onValueChange={(value) => updateField('maintenance_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="performed_by">Performed By *</Label>
              <Input
                id="performed_by"
                value={formData.performed_by || ''}
                onChange={(e) => updateField('performed_by', e.target.value)}
                placeholder="Name of person/organization"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Provider Type</Label>
              <Select
                value={formData.provider_type || ''}
                onValueChange={(value) => updateField('provider_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {providerTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                value={formData.contact_number || ''}
                onChange={(e) => updateField('contact_number', e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number || ''}
                onChange={(e) => updateField('license_number', e.target.value)}
                placeholder="Professional license"
              />
            </div>
          </CardContent>
        </Card>

        {/* Health Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Health Assessment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Health Status</Label>
              <Select
                value={formData.health_status || ''}
                onValueChange={(value) => updateField('health_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {healthStatuses.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                value={formData.weight || ''}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder="Current weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                value={formData.temperature || ''}
                onChange={(e) => updateField('temperature', e.target.value)}
                placeholder="Body temperature"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vital_signs">Vital Signs</Label>
              <Input
                id="vital_signs"
                value={formData.vital_signs || ''}
                onChange={(e) => updateField('vital_signs', e.target.value)}
                placeholder="Heart rate, BP, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations || ''}
                onChange={(e) => updateField('observations', e.target.value)}
                placeholder="What was observed"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis || ''}
                onChange={(e) => updateField('diagnosis', e.target.value)}
                placeholder="Diagnosis if any"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment_given">Treatment Given</Label>
              <Textarea
                id="treatment_given"
                value={formData.treatment_given || ''}
                onChange={(e) => updateField('treatment_given', e.target.value)}
                placeholder="What treatment was provided"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications || ''}
                onChange={(e) => updateField('medications', e.target.value)}
                placeholder="List medications, dosages, and frequencies"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations || ''}
                onChange={(e) => updateField('recommendations', e.target.value)}
                placeholder="Future recommendations"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle>Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="follow_up_required"
                checked={formData.follow_up_required || false}
                onCheckedChange={(checked) => updateField('follow_up_required', checked)}
              />
              <Label htmlFor="follow_up_required">Follow-up Required</Label>
            </div>

            {formData.follow_up_required && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="next_checkup_date">Next Checkup Date</Label>
                  <Input
                    id="next_checkup_date"
                    type="date"
                    value={formData.next_checkup_date || ''}
                    onChange={(e) => updateField('next_checkup_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follow_up_notes">Follow-up Notes</Label>
                  <Input
                    id="follow_up_notes"
                    value={formData.follow_up_notes || ''}
                    onChange={(e) => updateField('follow_up_notes', e.target.value)}
                    placeholder="Notes for next visit"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Cost & Payment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maintenance_cost">Cost (AED)</Label>
              <Input
                id="maintenance_cost"
                type="number"
                value={formData.maintenance_cost || ''}
                onChange={(e) => updateField('maintenance_cost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_by">Paid By</Label>
              <Input
                id="paid_by"
                value={formData.paid_by || ''}
                onChange={(e) => updateField('paid_by', e.target.value)}
                placeholder="Who paid"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={formData.payment_status || ''}
                onValueChange={(value) => updateField('payment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number || ''}
                onChange={(e) => updateField('invoice_number', e.target.value)}
                placeholder="Invoice reference"
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
              <Label>Reports</Label>
              <div className="flex gap-2">
                <Input value={formData.reports || ''} readOnly placeholder="No file" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('reports_input')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="reports_input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('reports', e.target.files[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certificate</Label>
              <div className="flex gap-2">
                <Input value={formData.certificate || ''} readOnly placeholder="No file" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('cert_input')?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                <input id="cert_input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload('certificate', e.target.files[0])} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/maintenance')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
