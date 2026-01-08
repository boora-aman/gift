import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Heart, Send, Truck, AlertCircle, Wrench, 
  Users, QrCode, FileBarChart 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReportConfig, FilterConfig } from '@/types/report'

// Report configurations with filters
// 7 Working Reports as per API documentation
export const reportConfigs: ReportConfig[] = [
  {
    id: 'gift-interest',
    name: 'Gift Interest Report',
    nameAr: 'تقرير الاهتمام بالهدايا',
    description: 'Track all gift interests with recipient details and follow-up status',
    descriptionAr: 'تتبع جميع الاهتمامات بالهدايا مع تفاصيل المستلمين وحالة المتابعة',
    apiMethod: 'get_gift_interest_report',
    icon: Heart,
    filters: [
      { key: 'from_date', label: 'From Date', type: 'date' },
      { key: 'to_date', label: 'To Date', type: 'date' },
      { key: 'gift', label: 'Gift', type: 'text', placeholder: 'Enter gift name...' },
      { key: 'recipient_name', label: 'Recipient', type: 'text', placeholder: 'Enter recipient name...' },
      { key: 'interest_source', label: 'Interest Source', type: 'select', options: [
        { value: 'Direct Request', label: 'Direct Request' },
        { value: 'Event', label: 'Event' },
        { value: 'Referral', label: 'Referral' },
        { value: 'Other', label: 'Other' }
      ]},
      { key: 'interest_level', label: 'Interest Level', type: 'select', options: [
        { value: 'Interested', label: 'Interested' },
        { value: 'Highly Interested', label: 'Highly Interested' },
        { value: 'Not Interested', label: 'Not Interested' }
      ]},
      { key: 'follow_up_status', label: 'Follow-up Status', type: 'select', options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' }
      ]},
      { key: 'event', label: 'Event', type: 'text', placeholder: 'Enter event name...' }
    ]
  },
  {
    id: 'gift-issue',
    name: 'Gift Issue Report',
    nameAr: 'تقرير إصدار الهدايا',
    description: 'View issued gifts with delivery status and recipient information',
    descriptionAr: 'عرض الهدايا المصدرة مع حالة التسليم ومعلومات المستلم',
    apiMethod: 'get_gift_issue_report',
    icon: Send,
    filters: [
      { key: 'from_date', label: 'From Date', type: 'date' },
      { key: 'to_date', label: 'To Date', type: 'date' },
      { key: 'gift', label: 'Gift', type: 'text', placeholder: 'Enter gift name...' },
      { key: 'recipient_name', label: 'Recipient', type: 'text', placeholder: 'Enter recipient name...' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'Delivered', label: 'Delivered' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]}
    ]
  },
  {
    id: 'gift-recipient',
    name: 'Gift Recipient Report',
    nameAr: 'تقرير مستلمي الهدايا',
    description: 'Master list of all gift recipients with contact details',
    descriptionAr: 'قائمة رئيسية بجميع مستلمي الهدايا مع تفاصيل الاتصال',
    apiMethod: 'get_gift_recipient_report',
    icon: Users,
    filters: [
      { key: 'recipient_name', label: 'Recipient Name', type: 'text', placeholder: 'Search by name...' },
      { key: 'emirates_id', label: 'Emirates ID', type: 'text', placeholder: 'e.g., 784-1995-1234567-1' },
      { key: 'mobile_number', label: 'Mobile Number', type: 'text', placeholder: 'Enter mobile number...' }
    ]
  },
  {
    id: 'barcode-print',
    name: 'Barcode Print Report',
    nameAr: 'تقرير طباعة الباركود',
    description: 'Generate and print barcodes/QR codes for gifts',
    descriptionAr: 'إنشاء وطباعة الباركود ورموز QR للهدايا',
    apiMethod: 'get_barcode_print_report',
    icon: QrCode,
    filters: [
      { key: 'gift_id', label: 'Gift No', type: 'text', placeholder: 'Enter gift ID...' },
      { key: 'barcode_value', label: 'Ring Number', type: 'text', placeholder: 'Enter ring number...' },
      { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g., Livestock - Camel' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'Available', label: 'Available' },
        { value: 'Issued', label: 'Issued' },
        { value: 'Maintenance', label: 'Maintenance' }
      ]}
    ]
  },
  {
    id: 'gift-maintenance',
    name: 'Gift Maintenance Report',
    nameAr: 'تقرير صيانة الهدايا',
    description: 'Healthcare and maintenance records for animals',
    descriptionAr: 'سجلات الرعاية الصحية والصيانة للحيوانات',
    apiMethod: 'get_gift_maintenance_report',
    icon: Wrench,
    filters: [
      { key: 'from_date', label: 'From Date', type: 'date' },
      { key: 'to_date', label: 'To Date', type: 'date' },
      { key: 'gift', label: 'Gift', type: 'text', placeholder: 'Enter gift name...' },
      { key: 'maintenance_type', label: 'Maintenance Type', type: 'select', options: [
        { value: 'Routine Check', label: 'Routine Check' },
        { value: 'Vaccination', label: 'Vaccination' },
        { value: 'Treatment', label: 'Treatment' },
        { value: 'Emergency', label: 'Emergency' }
      ]},
      { key: 'health_status', label: 'Health Status', type: 'select', options: [
        { value: 'Healthy', label: 'Healthy' },
        { value: 'Sick', label: 'Sick' },
        { value: 'Recovering', label: 'Recovering' }
      ]},
      { key: 'follow_up_required', label: 'Follow-up Required', type: 'select', options: [
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' }
      ]}
    ]
  },
  {
    id: 'gift-dispatch',
    name: 'Gift Dispatch Report',
    nameAr: 'تقرير إرسال الهدايا',
    description: 'Track logistics and movement of gifts',
    descriptionAr: 'تتبع لوجستيات وحركة الهدايا',
    apiMethod: 'get_gift_dispatch_report',
    icon: Truck,
    filters: [
      { key: 'from_date', label: 'From Date', type: 'date' },
      { key: 'to_date', label: 'To Date', type: 'date' },
      { key: 'gift', label: 'Gift', type: 'text', placeholder: 'Enter gift name...' },
      { key: 'dispatch_type', label: 'Dispatch Type', type: 'select', options: [
        { value: 'Delivery', label: 'Delivery' },
        { value: 'Return', label: 'Return' },
        { value: 'Transfer', label: 'Transfer' }
      ]},
      { key: 'dispatch_status', label: 'Status', type: 'select', options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'In Transit', label: 'In Transit' },
        { value: 'Completed', label: 'Completed' }
      ]},
      { key: 'related_gift_issue', label: 'Related Issue', type: 'text', placeholder: 'Enter issue ID...' },
      { key: 'related_event', label: 'Related Event', type: 'text', placeholder: 'Enter event name...' }
    ]
  },
  {
    id: 'pending-delivery',
    name: 'Pending Delivery Report',
    nameAr: 'تقرير التسليمات المعلقة',
    description: 'Track urgent pending deliveries',
    descriptionAr: 'تتبع التسليمات المعلقة العاجلة',
    apiMethod: 'get_pending_delivery_report',
    icon: AlertCircle,
    filters: [
      { key: 'gift', label: 'Gift', type: 'text', placeholder: 'Enter gift name...' },
      { key: 'dispatch_type', label: 'Dispatch Type', type: 'select', options: [
        { value: 'Delivery', label: 'Delivery' },
        { value: 'Return', label: 'Return' },
        { value: 'Transfer', label: 'Transfer' }
      ]},
      { key: 'urgency', label: 'Urgency', type: 'select', options: [
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]}
    ]
  }
]

export default function ReportList() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileBarChart className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
          <p className="text-muted-foreground">{t('reports.description')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportConfigs.map((report) => {
          const Icon = report.icon
          return (
            <Card 
              key={report.id} 
              className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
              onClick={() => navigate(`/reports/${report.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    {isArabic ? report.nameAr : report.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {isArabic ? report.descriptionAr : report.description}
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-1">
                  {report.filters.slice(0, 3).map((filter) => (
                    <span 
                      key={filter.key} 
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {filter.label}
                    </span>
                  ))}
                  {report.filters.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{report.filters.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
