import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Pagination } from '@/components/Pagination'
import { GiftCategoryAPI, DocTypeAPI } from '@/services/api'
import type { GiftCategory, GiftCategoryDetail } from '@/types/gift'
import { toast } from 'sonner'

const ATTRIBUTE_TYPES = ['Text', 'Number', 'Select', 'Date', 'Checkbox'] as const

interface CategoryAttribute {
  attribute_name: string
  attribute_type: 'Text' | 'Number' | 'Select' | 'Date' | 'Checkbox'
  is_mandatory: boolean
  select_options: string
  default_value: string
  display_order: number
}

interface FormData {
  category_name: string
  category_type: string
  description: string
  requires_maintenance: boolean
  category_attributes: CategoryAttribute[]
}

const defaultAttribute = (): CategoryAttribute => ({
  attribute_name: '',
  attribute_type: 'Text',
  is_mandatory: false,
  select_options: '',
  default_value: '',
  display_order: 0,
})

export default function CategoryList() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingCategory, setViewingCategory] = useState<GiftCategory | null>(null)
  const [editingCategory, setEditingCategory] = useState<GiftCategory | null>(null)
  const [formData, setFormData] = useState<FormData>({ 
    category_name: '', 
    category_type: '', 
    description: '',
    requires_maintenance: false,
    category_attributes: []
  })
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const queryClient = useQueryClient()

  // Fetch category type options from backend
  const { data: categoryTypes = [] } = useQuery({
    queryKey: ['field-options', 'Gift Category', 'category_type'],
    queryFn: async () => {
      const result = await DocTypeAPI.getFieldOptions('Gift Category', 'category_type')
      return result.success ? result.data : []
    },
  })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['gift-categories'],
    queryFn: async () => {
      const result = await GiftCategoryAPI.list()
      if (!result.success || !result.data) return []
      
      // Fetch full details for each category to get child tables
      const detailedCategories = await Promise.all(
        result.data.map(async (cat) => {
          const fullResult = await GiftCategoryAPI.get(cat.name)
          return fullResult.success && fullResult.data ? fullResult.data : cat
        })
      )
      return detailedCategories
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Partial<GiftCategory> = {
        category_name: formData.category_name,
        category_type: formData.category_type,
        description: formData.description,
        requires_maintenance: formData.requires_maintenance,
        category_attributes: formData.category_attributes.map((attr, idx) => ({
          attribute_name: attr.attribute_name,
          attribute_type: attr.attribute_type,
          is_mandatory: attr.is_mandatory,
          select_options: attr.select_options,
          default_value: attr.default_value,
          display_order: attr.display_order || idx,
          idx: idx + 1,
          doctype: 'Gift Category Details',
          parentfield: 'category_attributes',
          parenttype: 'Gift Category',
        })) as GiftCategoryDetail[]
      }
      if (editingCategory) {
        return GiftCategoryAPI.update(editingCategory.name, payload)
      }
      return GiftCategoryAPI.create(payload)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(editingCategory ? 'Category updated' : 'Category created')
        queryClient.invalidateQueries({ queryKey: ['gift-categories'] })
        closeDialog()
      } else {
        toast.error(result.error)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (name: string) => GiftCategoryAPI.delete(name),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Category deleted')
        queryClient.invalidateQueries({ queryKey: ['gift-categories'] })
      } else {
        toast.error(result.error)
      }
    },
  })

  // View category details
  const openViewDialog = async (category: GiftCategory) => {
    const result = await GiftCategoryAPI.get(category.name)
    if (result.success && result.data) {
      setViewingCategory(result.data)
      setViewDialogOpen(true)
    }
  }

  const openEditDialog = async (category?: GiftCategory) => {
    if (category) {
      // Fetch full category with child table
      const result = await GiftCategoryAPI.get(category.name)
      if (result.success && result.data) {
        const fullCategory = result.data
        setEditingCategory(fullCategory)
        setFormData({ 
          category_name: fullCategory.category_name, 
          category_type: fullCategory.category_type || '', 
          description: fullCategory.description || '',
          requires_maintenance: fullCategory.requires_maintenance || false,
          category_attributes: fullCategory.category_attributes?.map(attr => ({
            attribute_name: attr.attribute_name,
            attribute_type: attr.attribute_type || 'Text',
            is_mandatory: attr.is_mandatory || false,
            select_options: attr.select_options || '',
            default_value: attr.default_value || '',
            display_order: attr.display_order || 0,
          })) || []
        })
      }
    } else {
      setEditingCategory(null)
      setFormData({ 
        category_name: '', 
        category_type: categoryTypes[0] || '', 
        description: '', 
        requires_maintenance: false,
        category_attributes: [] 
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
  }

  const addAttribute = () => {
    setFormData({
      ...formData,
      category_attributes: [...formData.category_attributes, defaultAttribute()]
    })
  }

  const removeAttribute = (index: number) => {
    setFormData({
      ...formData,
      category_attributes: formData.category_attributes.filter((_, i) => i !== index)
    })
  }

  const updateAttribute = <K extends keyof CategoryAttribute>(index: number, field: K, value: CategoryAttribute[K]) => {
    const updated = [...formData.category_attributes]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, category_attributes: updated })
  }

  // Pagination logic
  const totalItems = categories?.length || 0
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedCategories = categories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage gift categories and their attributes</p>
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="h-4 w-4 mr-2" />Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden lg:table-cell">Attributes</TableHead>
                <TableHead className="hidden xl:table-cell">Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : paginatedCategories?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories</TableCell></TableRow>
              ) : (
                paginatedCategories?.map((cat) => (
                  <TableRow 
                    key={cat.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openViewDialog(cat)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{cat.category_name}</p>
                        {/* Show type on mobile */}
                        <p className="text-xs text-muted-foreground md:hidden">{cat.category_type || 'Other'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{cat.category_type || 'Other'}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary">{cat.category_attributes?.length || 0} attributes</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground max-w-[200px] truncate">
                      {cat.description || '-'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(cat)}>
                            <Eye className="h-4 w-4 mr-2" />View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(cat)}>
                            <Edit className="h-4 w-4 mr-2" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteMutation.mutate(cat.name)} className="text-destructive">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          
          {viewingCategory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Category Name</Label>
                  <p className="font-medium">{viewingCategory.category_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{viewingCategory.category_type || 'Other'}</Badge>
                  </div>
                </div>
              </div>

              {viewingCategory.description && (
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm">{viewingCategory.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox checked={viewingCategory.requires_maintenance} disabled />
                <Label className="text-sm">Requires Regular Maintenance</Label>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Category Attributes ({viewingCategory.category_attributes?.length || 0})</h4>
                {viewingCategory.category_attributes && viewingCategory.category_attributes.length > 0 ? (
                  <div className="space-y-3">
                    {viewingCategory.category_attributes.map((attr, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{attr.attribute_name}</p>
                              <Badge variant="secondary" className="text-xs">{attr.attribute_type}</Badge>
                              {attr.is_mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            {attr.default_value && (
                              <p className="text-sm text-muted-foreground mt-1">Default: {attr.default_value}</p>
                            )}
                            {attr.attribute_type === 'Select' && attr.select_options && (
                              <p className="text-sm text-muted-foreground mt-1">Options: {attr.select_options}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No attributes defined</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false)
              if (viewingCategory) openEditDialog(viewingCategory)
            }}>
              <Edit className="h-4 w-4 mr-2" />Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Name *</Label>
                  <Input 
                    value={formData.category_name} 
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })} 
                    placeholder="e.g., Electronics, Animals"
                  />
                </div>
                <div>
                  <Label>Category Type</Label>
                  <Select 
                    value={formData.category_type} 
                    onValueChange={(v) => setFormData({ ...formData, category_type: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Brief description of this category"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="requires_maintenance"
                  checked={formData.requires_maintenance}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_maintenance: !!checked })}
                />
                <Label htmlFor="requires_maintenance">Requires Regular Maintenance</Label>
              </div>
            </div>

            <Separator />

            {/* Category Attributes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Default Attributes for this Category</h4>
                  <p className="text-sm text-muted-foreground">
                    These attributes will be auto-populated when creating gifts in this category
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                  <Plus className="h-4 w-4 mr-2" />Add Attribute
                </Button>
              </div>

              {formData.category_attributes.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground">
                  <p>No attributes defined yet.</p>
                  <p className="text-sm">Add attributes that will appear when creating gifts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.category_attributes.map((attr, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Attribute Name *</Label>
                          <Input
                            placeholder="e.g., Color, Size, Breed"
                            value={attr.attribute_name}
                            onChange={(e) => updateAttribute(index, 'attribute_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select 
                            value={attr.attribute_type} 
                            onValueChange={(v) => updateAttribute(index, 'attribute_type', v as typeof ATTRIBUTE_TYPES[number])}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ATTRIBUTE_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Default Value</Label>
                          <Input
                            placeholder="Default value (optional)"
                            value={attr.default_value}
                            onChange={(e) => updateAttribute(index, 'default_value', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={attr.is_mandatory}
                              onCheckedChange={(checked) => updateAttribute(index, 'is_mandatory', !!checked)}
                            />
                            <Label className="text-xs">Mandatory</Label>
                          </div>
                          {attr.attribute_type === 'Select' && (
                            <div className="flex-1">
                              <Input
                                placeholder="Options (comma separated)"
                                value={attr.select_options}
                                onChange={(e) => updateAttribute(index, 'select_options', e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttribute(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
