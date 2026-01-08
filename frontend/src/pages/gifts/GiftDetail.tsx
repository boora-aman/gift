import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, Edit, Trash2, QrCode, MapPin, Package, Truck, Wrench, 
  Calendar, Send, User, Clock, ExternalLink, Image as ImageIcon,
  Heart, FileText, Plus, CheckCircle, MoreVertical, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GiftAPI, GiftIssueAPI, GiftDispatchAPI, GiftMaintenanceAPI, EventAPI, GiftInterestAPI } from '@/services/api'
import { toast } from 'sonner'
import { config } from '@/config/environment'
import { format } from 'date-fns'
import type { GiftStore, GiftIssue, GiftDispatch, GiftMaintenance, GiftInterest } from '@/types/gift'
import type { Event } from '@/types/event'
import { useTranslation } from 'react-i18next'

const statusColors: Record<string, string> = {
  Available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

// Timeline event types with icons and colors
const timelineConfig = {
  created: { icon: Plus, color: 'bg-green-500', label: 'Gift Created' },
  interest: { icon: Heart, color: 'bg-pink-500', label: 'Interest Recorded' },
  issued: { icon: Send, color: 'bg-blue-500', label: 'Gift Issued' },
  dispatched: { icon: Truck, color: 'bg-orange-500', label: 'Dispatched' },
  delivered: { icon: CheckCircle, color: 'bg-green-600', label: 'Delivered' },
  maintenance: { icon: Wrench, color: 'bg-purple-500', label: 'Maintenance' },
  event: { icon: Calendar, color: 'bg-indigo-500', label: 'Event Display' },
  location: { icon: MapPin, color: 'bg-gray-500', label: 'Location Change' },
}

interface TimelineEvent {
  type: keyof typeof timelineConfig
  date: string
  title: string
  description?: string
  link?: string
}

export default function GiftDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()

  // Fetch gift details
  const { data: gift, isLoading, error } = useQuery({
    queryKey: ['gift', id],
    queryFn: async () => {
      if (!id) throw new Error('No gift ID')
      const result = await GiftAPI.get(id)
      if (result.success) return result.data
      throw new Error(result.error)
    },
    enabled: !!id,
  })

  // Fetch related gift issues
  const { data: relatedIssues } = useQuery({
    queryKey: ['gift-issues', id],
    queryFn: async () => {
      if (!id) return []
      const result = await GiftIssueAPI.list({ gift: id })
      return result.success ? result.data || [] : []
    },
    enabled: !!id,
  })

  // Fetch related dispatches
  const { data: relatedDispatches } = useQuery({
    queryKey: ['gift-dispatches', id],
    queryFn: async () => {
      if (!id) return []
      const result = await GiftDispatchAPI.list({ gift: id })
      return result.success ? result.data || [] : []
    },
    enabled: !!id,
  })

  // Fetch related maintenance
  const { data: relatedMaintenance } = useQuery({
    queryKey: ['gift-maintenance', id],
    queryFn: async () => {
      if (!id) return []
      const result = await GiftMaintenanceAPI.list({ gift: id })
      return result.success ? result.data || [] : []
    },
    enabled: !!id,
  })

  // Fetch related interests
  const { data: relatedInterests } = useQuery({
    queryKey: ['gift-interests', id],
    queryFn: async () => {
      if (!id) return []
      const result = await GiftInterestAPI.list({ gift: id })
      return result.success ? result.data || [] : []
    },
    enabled: !!id,
  })

  // Fetch events where this gift is displayed
  const { data: relatedEvents } = useQuery({
    queryKey: ['gift-events', id],
    queryFn: async () => {
      if (!id) return []
      const result = await EventAPI.list({})
      if (!result.success || !result.data) return []
      return result.data.filter(event => 
        event.event_gifts?.some(eg => eg.gift === id)
      )
    },
    enabled: !!id,
  })

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this gift?')) return
    const result = await GiftAPI.delete(id)
    if (result.success) {
      toast.success('Gift deleted successfully')
      navigate('/gifts')
    } else {
      toast.error(result.error || 'Failed to delete gift')
    }
  }

  const getImageUrl = (path: string | undefined) => {
    if (!path) return ''
    if (path.startsWith('http') || path.startsWith('data:')) return path
    // Handle Frappe file paths
    if (path.startsWith('/files/') || path.startsWith('/private/files/')) {
      return `${config.apiBaseUrl}${path}`
    }
    return `${config.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // Build comprehensive timeline
  const buildTimeline = (): TimelineEvent[] => {
    const events: TimelineEvent[] = []
    
    // Gift creation
    if (gift?.creation) {
      events.push({
        type: 'created',
        date: gift.creation,
        title: t('timeline.created'),
        description: `${gift.gift_name} added to inventory`,
      })
    }

    // Interests
    relatedInterests?.forEach((interest: GiftInterest) => {
      events.push({
        type: 'interest',
        date: interest.date || interest.creation || '',
        title: t('timeline.interest'),
        description: `${interest.owner_full_name || 'Someone'} showed interest`,
        link: `/interests/${interest.name}`,
      })
    })

    // Issues
    relatedIssues?.forEach((issue: GiftIssue) => {
      events.push({
        type: 'issued',
        date: issue.date || issue.creation || '',
        title: t('timeline.issued'),
        description: `Issued to ${issue.owner_full_name || 'recipient'}`,
        link: `/issues/${issue.name}`,
      })
      if (issue.status === 'Delivered' && issue.delivery_date) {
        events.push({
          type: 'delivered',
          date: issue.delivery_date,
          title: t('timeline.delivered'),
          description: `Delivered to ${issue.owner_full_name || 'recipient'}`,
          link: `/issues/${issue.name}`,
        })
      }
    })

    // Dispatches
    relatedDispatches?.forEach((dispatch: GiftDispatch) => {
      events.push({
        type: 'dispatched',
        date: dispatch.dispatch_date || dispatch.creation || '',
        title: t('timeline.dispatched'),
        description: `${dispatch.dispatch_type || 'Dispatch'} - ${dispatch.dispatch_status || 'Pending'}`,
        link: `/dispatch/${dispatch.name}`,
      })
      if (dispatch.actual_delivery_date) {
        events.push({
          type: 'delivered',
          date: dispatch.actual_delivery_date,
          title: t('timeline.delivered'),
          description: `Received by ${dispatch.received_by_name || 'recipient'}`,
          link: `/dispatch/${dispatch.name}`,
        })
      }
    })

    // Maintenance
    relatedMaintenance?.forEach((maint: GiftMaintenance) => {
      events.push({
        type: 'maintenance',
        date: maint.maintenance_date || maint.creation || '',
        title: t('timeline.maintenance'),
        description: `${maint.maintenance_type || 'Maintenance'} by ${maint.performed_by || 'staff'}`,
        link: `/maintenance/${maint.name}`,
      })
    })

    // Events
    relatedEvents?.forEach((event: Event) => {
      events.push({
        type: 'event',
        date: event.starts_on || event.creation || '',
        title: t('timeline.event'),
        description: event.subject || 'Event',
        link: `/events/${event.name}`,
      })
    })

    // Location history
    gift?.gift_location_history?.forEach((loc: GiftStore) => {
      events.push({
        type: 'location',
        date: loc.transfer_date || '',
        title: t('timeline.locationChange'),
        description: `${loc.reason || 'Movement'}: ${loc.from_warehouse || loc.from_location || 'Origin'} → ${loc.to_warehouse || loc.to_location || 'Destination'}`,
      })
    })

    // Sort by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>
  if (error || !gift) return (
    <div className="p-8 text-center">
      <p className="text-destructive">Failed to load gift</p>
      <Button variant="link" onClick={() => navigate('/gifts')}>{t('common.back')} to gifts</Button>
    </div>
  )

  const hasImages = gift.gift_images && gift.gift_images.length > 0
  const hasBarcode = gift.barcode || gift.barcode_value
  const hasQRCode = gift.qr_code_image
  const timeline = buildTimeline()

  // Check statuses for conditional actions
  const isDelivered = relatedIssues?.some((issue: GiftIssue) => issue.status === 'Delivered')
  const hasActiveDispatch = relatedDispatches?.some((d: GiftDispatch) => d.dispatch_status === 'In Transit')
  const latestIssue = relatedIssues?.[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gifts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{gift.gift_name}</h1>
              <Badge className={statusColors[gift.status || 'Available']}>
                {gift.status || 'Available'}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm">{gift.gift_id || gift.name}</p>
          </div>
        </div>
        
        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/gifts/${id}/edit`}><Edit className="h-4 w-4 mr-2" />{t('common.edit')}</Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />{t('common.delete')}
          </Button>
        </div>
        
        {/* Mobile dropdown */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem asChild>
                <Link to={`/gifts/${id}/edit`} className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />{t('common.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />{t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Section - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images & Codes Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t('gifts.imagesAndCodes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Gift Images */}
                {hasImages ? (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t('gifts.photos')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {gift.gift_images!.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                          <img 
                            src={getImageUrl(image.image)} 
                            alt={`Gift photo ${index + 1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(getImageUrl(image.image), '_blank')}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mr-2 opacity-50" />
                    <span>No images available</span>
                  </div>
                )}

                {/* Barcode & QR Code side by side */}
                {(hasBarcode || hasQRCode) && (
                  <div className="flex flex-wrap gap-6 pt-2">
                    {hasBarcode && (
                      <div className="flex-1 min-w-[150px]">
                        <p className="text-sm font-medium text-muted-foreground mb-2">{t('gifts.barcode')}</p>
                        <div className="bg-white p-3 rounded-lg border inline-block">
                          {gift.barcode && (
                            <img 
                              src={getImageUrl(gift.barcode)} 
                              alt="Barcode" 
                              className="max-h-16 w-auto"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          )}
                          {gift.barcode_value && (
                            <p className="font-mono text-xs text-center mt-1 text-gray-600">{gift.barcode_value}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {hasQRCode && (
                      <div className="flex-1 min-w-[150px]">
                        <p className="text-sm font-medium text-muted-foreground mb-2">{t('gifts.qrCode')}</p>
                        <div className="bg-white p-3 rounded-lg border inline-block">
                          <img 
                            src={getImageUrl(gift.qr_code_image!)} 
                            alt="QR Code" 
                            className="w-24 h-24"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg'
                            }}
                          />
                          {gift.qr_code_value && (
                            <p className="font-mono text-xs text-center mt-1 text-gray-600 max-w-[100px] truncate">{gift.qr_code_value}</p>
                          )}
                          {gift.scan_count !== undefined && gift.scan_count > 0 && (
                            <p className="text-xs text-center text-muted-foreground mt-1">
                              Scanned {gift.scan_count}x
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gift Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('gifts.giftDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.category')}</p>
                  <p className="font-medium">{gift.category || '-'}</p>
                </div>
                {gift.item_condition && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('gifts.condition')}</p>
                    <p className="font-medium">{gift.item_condition}</p>
                  </div>
                )}
                {gift.health_status && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('gifts.healthStatus')}</p>
                    <Badge variant="outline">{gift.health_status}</Badge>
                  </div>
                )}
                {gift.warehouse && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t('gifts.location')}</p>
                    <p className="font-medium">{gift.warehouse}</p>
                    {gift.storage_location && (
                      <p className="text-xs text-muted-foreground">{gift.storage_location}</p>
                    )}
                  </div>
                )}
              </div>

              {gift.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('common.description')}</p>
                    <p className="text-sm">{gift.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Attributes */}
          {gift.gift_details && gift.gift_details.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('gifts.additionalAttributes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {gift.gift_details.map((detail, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{detail.attribute_name}</p>
                      <p className="font-medium text-sm">{detail.default_value || '-'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Records Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Related Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="issues">Issued ({relatedIssues?.length || 0})</TabsTrigger>
                  <TabsTrigger value="dispatches">Dispatch ({relatedDispatches?.length || 0})</TabsTrigger>
                  <TabsTrigger value="events">Events ({relatedEvents?.length || 0})</TabsTrigger>
                  <TabsTrigger value="maintenance">Maint. ({relatedMaintenance?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="mt-4">
                  {relatedIssues?.length ? (
                    <div className="space-y-2">
                      {relatedIssues.map((issue: GiftIssue) => (
                        <Link key={issue.name} to={`/issues/${issue.name}`} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{issue.owner_full_name}</p>
                              <p className="text-sm text-muted-foreground">{issue.date}</p>
                            </div>
                            <Badge variant={issue.status === 'Delivered' ? 'default' : 'secondary'}>
                              {issue.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No issues found</p>
                  )}
                </TabsContent>

                <TabsContent value="dispatches" className="mt-4">
                  {relatedDispatches?.length ? (
                    <div className="space-y-2">
                      {relatedDispatches.map((dispatch: GiftDispatch) => (
                        <Link key={dispatch.name} to={`/dispatch/${dispatch.name}`} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{dispatch.dispatch_type}</p>
                              <p className="text-sm text-muted-foreground">{dispatch.dispatch_date}</p>
                            </div>
                            <Badge variant="outline">{dispatch.dispatch_status}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No dispatches found</p>
                  )}
                </TabsContent>

                <TabsContent value="events" className="mt-4">
                  {relatedEvents?.length ? (
                    <div className="space-y-2">
                      {relatedEvents.map((event: Event) => (
                        <Link key={event.name} to={`/events/${event.name}`} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{event.subject}</p>
                              <p className="text-sm text-muted-foreground">{event.starts_on}</p>
                            </div>
                            <Badge variant="outline">{event.status}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No events found</p>
                  )}
                </TabsContent>

                <TabsContent value="maintenance" className="mt-4">
                  {relatedMaintenance?.length ? (
                    <div className="space-y-2">
                      {relatedMaintenance.map((maint: GiftMaintenance) => (
                        <Link key={maint.name} to={`/maintenance/${maint.name}`} className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{maint.maintenance_type}</p>
                              <p className="text-sm text-muted-foreground">{maint.maintenance_date}</p>
                            </div>
                            <Badge variant="outline">{maint.health_status}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No maintenance records found</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('gifts.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Issue button - only for Available gifts */}
              {gift.status === 'Available' && (
                <Button variant="default" className="w-full" asChild>
                  <Link to={`/issues/new?gift=${gift.name}`}>
                    <Send className="h-4 w-4 mr-2" />{t('gifts.issueThisGift')}
                  </Link>
                </Button>
              )}
              
              {/* View issue details - for Issued gifts */}
              {gift.status === 'Issued' && latestIssue && (
                <Button variant="default" className="w-full" asChild>
                  <Link to={`/issues/${latestIssue.name}`}>
                    <FileText className="h-4 w-4 mr-2" />{t('gifts.viewIssueDetails')}
                  </Link>
                </Button>
              )}
              
              {/* Record Interest - only for Available gifts */}
              {gift.status === 'Available' && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/interests/new?gift=${gift.name}`}>
                    <Heart className="h-4 w-4 mr-2" />{t('gifts.recordInterest')}
                  </Link>
                </Button>
              )}
              
              {/* Maintenance - always available */}
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/maintenance/new?gift=${gift.name}`}>
                  <Wrench className="h-4 w-4 mr-2" />{t('gifts.scheduleMaintenance')}
                </Link>
              </Button>
              
              {/* Dispatch - only for Issued gifts that are not yet delivered */}
              {gift.status === 'Issued' && !isDelivered && !hasActiveDispatch && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/dispatch/new?gift=${gift.name}`}>
                    <Truck className="h-4 w-4 mr-2" />{t('gifts.createDispatch')}
                  </Link>
                </Button>
              )}
              
              {/* Show delivered badge */}
              {isDelivered && (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">{t('gifts.delivered')}</span>
                </div>
              )}
              
              {/* In Transit badge */}
              {hasActiveDispatch && (
                <div className="flex items-center justify-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-700 dark:text-orange-300">In Transit</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipient Info (if issued) */}
          {gift.gift_recipient && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('gifts.recipient')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.name')}</p>
                  <p className="font-medium">{gift.owner_full_name || gift.gift_recipient}</p>
                </div>
                {gift.mobile_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{gift.mobile_number}</p>
                  </div>
                )}
                {gift.emirates_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Emirates ID</p>
                    <p className="font-mono text-sm">{gift.emirates_id}</p>
                  </div>
                )}
                {gift.issued_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Issued Date</p>
                    <p className="font-medium">{format(new Date(gift.issued_date), 'dd MMM yyyy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('gifts.activityTimeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-visible pr-2 pl-1">
                  {timeline.map((event, index) => {
                    const cfg = timelineConfig[event.type]
                    const Icon = cfg.icon
                    return (
                      <div key={index} className="relative pl-7 pb-4 border-l-2 border-muted last:pb-0 ml-3">
                        <div className={`absolute -left-[15px] top-0 w-7 h-7 rounded-full ${cfg.color} flex items-center justify-center shadow-sm`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{event.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {event.date ? format(new Date(event.date), 'dd MMM yyyy') : '-'}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                          {event.link && (
                            <Link to={event.link} className="text-xs text-primary hover:underline flex items-center gap-1">
                              View details <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-6">{t('gifts.noMovementHistory')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
