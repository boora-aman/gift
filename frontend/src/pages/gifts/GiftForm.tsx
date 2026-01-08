import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GiftAPI, GiftCategoryAPI, FileAPI } from '@/services/api'
import type { Gift, GiftDetail, GiftImage, GiftCategory, GiftCategoryDetail } from '@/types/gift'
import { toast } from 'sonner'
import { config } from '@/config/environment'

// Schema matching Frappe backend
const giftSchema = z.object({
  gift_name: z.string().min(1, 'Gift name is required'),
  gift_id: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['', 'Available', 'Issued']).default('Available'),
  
  // Barcode
  import_barcode: z.boolean().default(false),
  barcode_value: z.string().optional(),
  
  // Note: item_condition, health_status, qr_code_enabled are NOT in Gift doctype
  
  // Location
  current_location_type: z.enum([
    'Warehouse', 'Farm', 'Event', 'In Transit', 'With Recipient', 'Maintenance Center', 'Other'
  ]).optional(),
  warehouse: z.string().optional(),
  storage_location: z.string().optional(),
  storage_date: z.string().optional(),
  location_contact_person: z.string().optional(),
  location_contact_number: z.string().optional(),
  location_address: z.string().optional(),
  
  
  // Child tables
  gift_details: z.array(z.object({
    attribute_name: z.string(),
    attribute_type: z.enum(['Text', 'Number', 'Select', 'Date', 'Checkbox']).optional(),
    is_mandatory: z.boolean().optional(),
    select_options: z.string().optional(),
    default_value: z.string().optional(),
    display_order: z.number().optional(),
  })).default([]),
  gift_images: z.array(z.object({
    image: z.string().optional(),
  })).default([]),
})

type GiftFormData = z.infer<typeof giftSchema>

interface GiftFormProps {
  mode: 'create' | 'edit'
}

// Location type options
const LOCATION_TYPES = [
  'Warehouse', 'Farm', 'Event', 'In Transit', 'With Recipient', 'Maintenance Center', 'Other'
] as const

export default function GiftForm({ mode }: GiftFormProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [warehouses, setWarehouses] = useState<any[]>([])

  const form = useForm<GiftFormData>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      gift_name: '',
      gift_id: '',
      description: '',
      category: '',
      status: 'Available',
      import_barcode: false,
      barcode_value: '',
      current_location_type: undefined,
      warehouse: '',
      storage_location: '',
      storage_date: '',
      location_contact_person: '',
      location_contact_number: '',
      location_address: '',
      gift_details: [],
      gift_images: [],
    },
  })

  const { fields: detailFields, replace: replaceDetails, append: appendDetail, remove: removeDetail } = useFieldArray({
    control: form.control,
    name: 'gift_details',
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'gift_images',
  })

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['gift-categories'],
    queryFn: async () => {
      const result = await GiftCategoryAPI.list()
      if (result.success) return result.data
      return []
    },
  })

  // Fetch gift for edit mode
  const { data: gift, isLoading: isLoadingGift } = useQuery({
    queryKey: ['gift', id],
    queryFn: async () => {
      if (!id) return null
      const result = await GiftAPI.get(id)
      if (result.success) return result.data
      throw new Error(result.error)
    },
    enabled: mode === 'edit' && !!id,
  })

  // Load gift data into form
  useEffect(() => {
    if (gift && mode === 'edit') {
      form.reset({
        gift_name: gift.gift_name || '',
        gift_id: gift.gift_id || '',
        description: gift.description || '',
        category: gift.category || '',
        status: gift.status || 'Available',
        import_barcode: gift.import_barcode || false,
        barcode_value: gift.barcode_value || '',
        current_location_type: gift.current_location_type,
        warehouse: gift.warehouse || '',
        storage_location: gift.storage_location || '',
        storage_date: gift.storage_date || '',
        location_contact_person: gift.location_contact_person || '',
        location_contact_number: gift.location_contact_number || '',
        location_address: gift.location_address || '',
        gift_details: gift.gift_details?.map(d => ({
          attribute_name: d.attribute_name,
          attribute_type: d.attribute_type,
          is_mandatory: d.is_mandatory,
          select_options: d.select_options,
          default_value: d.default_value || '',
          display_order: d.display_order,
        })) || [],
        gift_images: gift.gift_images?.map(i => ({
          image: i.image || '',
        })) || [],
      })
      
      // Also fetch category to set selectedCategory
      if (gift.category) {
        GiftCategoryAPI.get(gift.category).then(result => {
          if (result.success && result.data) {
            setSelectedCategory(result.data)
          }
        })
      }
    }
  }, [gift, mode, form])

    // Fetch warehouses on mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        console.log('🏭 Fetching warehouses...')
        const response = await fetch(
          `${config.apiBaseUrl}/api/resource/Warehouse?fields=["name","warehouse_name"]&limit_page_length=999`,
          { credentials: 'include' }
        )
        const data = await response.json()
        if (data.data) {
          setWarehouses(data.data)
          console.log(`✅ Loaded ${data.data.length} warehouses`)
        }
      } catch (error) {
        console.error('❌ Failed to fetch warehouses:', error)
        toast.error('Failed to load warehouses')
      }
    }
    
    fetchWarehouses()
  }, [])


  // Handle category change - load category attributes as template
  const handleCategoryChange = async (categoryName: string) => {
    form.setValue('category', categoryName)
    
    if (!categoryName) {
      setSelectedCategory(null)
      return
    }

    // Fetch category details to get template attributes
    const result = await GiftCategoryAPI.get(categoryName)
    if (result.success && result.data) {
      setSelectedCategory(result.data)
      
      // Only replace details if in create mode or if there are no existing details
      if (mode === 'create' || detailFields.length === 0) {
        const categoryAttributes = result.data.category_attributes || []
        // Map category template attributes to gift details with default values
        replaceDetails(categoryAttributes.map((attr: GiftCategoryDetail) => ({
          attribute_name: attr.attribute_name,
          attribute_type: attr.attribute_type || 'Text',
          is_mandatory: attr.is_mandatory || false,
          select_options: attr.select_options || '',
          default_value: attr.default_value || '',
          display_order: attr.display_order || 0,
        })))
      }
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await FileAPI.upload(file)
      if (result.success && result.data) {
        appendImage({ image: result.data.file_url })
        toast.success('Image uploaded successfully')
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (data: GiftFormData) => {
      const payload: Partial<Gift> = {
        gift_name: data.gift_name,
        gift_id: data.gift_id,
        description: data.description,
        category: data.category,
        status: data.status || 'Available',
        import_barcode: data.import_barcode,
        barcode_value: data.barcode_value,
        current_location_type: data.current_location_type,
        warehouse: data.warehouse,
        storage_location: data.storage_location,
        storage_date: data.storage_date,
        location_contact_person: data.location_contact_person,
        location_contact_number: data.location_contact_number,
        location_address: data.location_address,
        gift_details: data.gift_details.map((d, idx) => ({
          ...d,
          idx: idx + 1,
          doctype: 'Gift Details',
          parentfield: 'gift_details',
          parenttype: 'Gift',
        })) as GiftDetail[],
        gift_images: data.gift_images.map((i, idx) => ({
          ...i,
          idx: idx + 1,
          doctype: 'Gift Images',
          parentfield: 'gift_images',
          parenttype: 'Gift',
        })) as GiftImage[],
      }

      if (mode === 'edit' && id) {
        return GiftAPI.update(id, payload)
      }
      return GiftAPI.create(payload)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(mode === 'edit' ? 'Gift updated successfully' : 'Gift created successfully')
        navigate('/gifts')
      } else {
        toast.error(result.error || 'Failed to save gift')
      }
    },
    onError: () => {
      toast.error('Failed to save gift')
    },
  })

  const onSubmit = (data: GiftFormData) => {
    mutation.mutate(data)
  }
  if (mode === 'edit' && isLoadingGift) {
    return <div className="p-8 text-center">Loading...</div>
  }

  // Render attribute input based on type
  const renderAttributeInput = (index: number, attr: GiftFormData['gift_details'][0]) => {
    const fieldName = `gift_details.${index}.default_value` as const
    
    switch (attr.attribute_type) {
      case 'Select':
        const options = (attr.select_options || '').split('\n').filter(Boolean)
        return (
          <Select
            value={form.watch(fieldName) || ''}
            onValueChange={(val) => form.setValue(fieldName, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'Number':
        return (
          <Input
            type="number"
            placeholder="Enter number"
            {...form.register(fieldName)}
          />
        )
      case 'Date':
        return (
          <Input
            type="date"
            {...form.register(fieldName)}
          />
        )
      case 'Checkbox':
        return (
          <Checkbox
            checked={form.watch(fieldName) === '1'}
            onCheckedChange={(checked) => form.setValue(fieldName, checked ? '1' : '0')}
          />
        )
      default: // Text
        return (
          <Input
            placeholder="Enter value"
            {...form.register(fieldName)}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gifts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'edit' ? 'Edit Gift' : 'New Gift'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'edit' ? 'Update gift information' : 'Add a new gift to the inventory'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the gift details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gift_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gift Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter gift name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gift_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gift Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Auto-generated if empty" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter description" rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleCategoryChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.name} value={cat.name}>
                                  {cat.category_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Issued">Issued</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Barcode Section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="import_barcode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Import Barcode</FormLabel>
                            <FormDescription>Check to manually enter a barcode ID (otherwise auto-generated)</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {form.watch('import_barcode') && (
                      <FormField
                        control={form.control}
                        name="barcode_value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter barcode value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                </CardContent>
              </Card>

              {/* Gift Details (Dynamic Attributes) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gift Additional Attributes</CardTitle>
                      <CardDescription>
                        Custom attributes for this gift
                        {selectedCategory && ` (from ${selectedCategory.category_name})`}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendDetail({ 
                        attribute_name: '', 
                        attribute_type: 'Text',
                        is_mandatory: false,
                        select_options: '',
                        default_value: '',
                        display_order: detailFields.length,
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {detailFields.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No attributes. Select a category or add custom attributes.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {detailFields.map((field, index) => {
                        const attr = form.watch(`gift_details.${index}`)
                        return (
                          <div key={field.id} className="flex gap-3 items-start p-3 border rounded-lg">
                            <div className="flex-1 grid sm:grid-cols-3 gap-3">
                              <FormField
                                control={form.control}
                                name={`gift_details.${index}.attribute_name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Attribute Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Name" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`gift_details.${index}.attribute_type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Type</FormLabel>
                                    <Select value={field.value || 'Text'} onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="Text">Text</SelectItem>
                                        <SelectItem value="Number">Number</SelectItem>
                                        <SelectItem value="Select">Select</SelectItem>
                                        <SelectItem value="Date">Date</SelectItem>
                                        <SelectItem value="Checkbox">Checkbox</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Value {attr.is_mandatory && <span className="text-destructive">*</span>}
                                </FormLabel>
                                {renderAttributeInput(index, attr)}
                              </FormItem>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-6"
                              onClick={() => removeDetail(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gift Images */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gift Images</CardTitle>
                      <CardDescription>Upload images of the gift</CardDescription>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImage}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={uploadingImage}
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </label>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {imageFields.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No images uploaded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imageFields.map((field, index) => (
                        <div key={field.id} className="relative group">
                          <img
                            src={`${config.apiBaseUrl}${form.watch(`gift_images.${index}.image`)}`}
                            alt={`Gift image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>Storage and location information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="current_location_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type</FormLabel>
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOCATION_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
  control={form.control}
  name="warehouse"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Warehouse</FormLabel>
      <Select
        value={field.value || 'none'}
        onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select warehouse (optional)" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {warehouses.length > 0 ? (
            <>
              <SelectItem value="none">None</SelectItem>
              {warehouses.map(wh => (
                <SelectItem key={wh.name} value={wh.name}>
                  {wh.warehouse_name || wh.name}
                </SelectItem>
              ))}
            </>
          ) : (
            <SelectItem value="no-wh" disabled>Loading warehouses...</SelectItem>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

                  <FormField
                    control={form.control}
                    name="storage_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Location/Section</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Shelf A, Row 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storage_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stored Since</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Full address" rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Saving...' : mode === 'edit' ? 'Update Gift' : 'Create Gift'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/gifts')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
