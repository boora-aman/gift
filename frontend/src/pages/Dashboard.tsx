import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Gift, Users, FolderOpen, Send, Plus, ArrowRight, ScanBarcode, Calendar, Heart, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardAPI, GiftAPI, GiftIssueAPI, GiftSearchAPI } from '@/services/api'
import { BarcodeScanner } from '@/components/BarcodeScanner'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function Dashboard() {
  const navigate = useNavigate()
  const [showScanner, setShowScanner] = useState(false)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const result = await DashboardAPI.getStats()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.error)
    },
  })

  // Fetch recent gifts
  const { data: recentGifts } = useQuery({
    queryKey: ['recent-gifts'],
    queryFn: async () => {
      const result = await GiftAPI.list({}, 1, 5)
      return result.success ? result.data : []
    },
  })

  // Fetch recent issued gifts
  const { data: recentIssues } = useQuery({
    queryKey: ['recent-issues'],
    queryFn: async () => {
      const result = await GiftIssueAPI.list({})
      // Take only first 5
      return result.success ? (result.data || []).slice(0, 5) : []
    },
  })

  const statCards = [
    {
      title: 'Total Gifts',
      value: stats?.totalGifts ?? 0,
      icon: Gift,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/gifts',
    },
    {
      title: 'Available',
      value: stats?.availableGifts ?? 0,
      icon: Gift,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      href: '/gifts?status=Available',
    },
    {
      title: 'Issued',
      value: stats?.issuedGifts ?? 0,
      icon: Send,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/gifts?status=Issued',
    },
    {
      title: 'Recipients',
      value: stats?.totalRecipients ?? 0,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      href: '/recipients',
    },
  ]

  const quickActions = [
    { title: 'Add Gift', href: '/gifts/new', icon: Gift },
    { title: 'Issue Gift', href: '/issues/new', icon: Send },
    { title: 'Interest', href: '/interests/new', icon: Heart },
    { title: 'Event', href: '/events/new', icon: Calendar },
  ]

  const handleBarcodeScanned = async (barcode: string) => {
    setShowScanner(false)
    toast.info(`Searching for: ${barcode}`)
    
    const result = await GiftSearchAPI.findByBarcode(barcode)
    
    if (result.success && result.data) {
      toast.success(`Found: ${result.data.gift_name}`)
      navigate(`/gifts/${result.data.name}`)
    } else {
      toast.error('Gift not found with this barcode')
    }
  }

  const statusColors: Record<string, string> = {
    Available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Card - Mobile optimized */}
      <Card className="bg-gradient-to-r from-primary to-primary/80">
        <CardContent className="py-4 md:py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary-foreground">Welcome to Gift Manager</h2>
              <p className="text-primary-foreground/80 mt-1 text-sm md:text-base">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Mobile-first action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowScanner(true)}
              >
                <ScanBarcode className="h-4 w-4 mr-2" />
                Scan
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/issues/new">
                  <Send className="h-4 w-4 mr-2" />
                  Issue
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Mobile optimized - Clickable cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions - Mobile optimized grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors group text-center"
              >
                <div className="p-2 md:p-3 rounded-full bg-primary/10 group-hover:bg-primary/20">
                  <action.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <span className="font-medium text-xs md:text-sm">{action.title}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Mobile optimized */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Gifts</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/gifts">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentGifts && recentGifts.length > 0 ? (
              <div className="space-y-3">
                {recentGifts.map((gift) => (
                  <Link 
                    key={gift.name} 
                    to={`/gifts/${gift.name}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{gift.gift_name}</p>
                      <p className="text-xs text-muted-foreground">{gift.category || 'Uncategorized'}</p>
                    </div>
                    <Badge className={statusColors[gift.status || 'Available'] || 'bg-muted'}>
                      {gift.status || 'Available'}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent gifts</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/gifts/new">Add your first gift</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recently Issued</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/issues">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentIssues && recentIssues.length > 0 ? (
              <div className="space-y-3">
                {recentIssues.map((issue) => (
                  <Link 
                    key={issue.name} 
                    to={`/issues/${issue.name}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{issue.gift_name || issue.gift}</p>
                      <p className="text-xs text-muted-foreground">
                        To: {issue.owner_full_name || 'Unknown'}
                        {issue.date && ` • ${format(new Date(issue.date), 'MMM d')}`}
                      </p>
                    </div>
                    <Badge variant={issue.status === 'Delivered' ? 'default' : 'secondary'}>
                      {issue.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Send className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent issued gifts</p>
                <Button asChild variant="link" size="sm" className="mt-1">
                  <Link to="/issues/new">Issue a gift</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}