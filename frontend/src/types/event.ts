import type { FrappeDoc, FrappeChildDoc } from './gift'

// Event Gift (child table)
export interface EventGift extends FrappeChildDoc {
  gift?: string
  gift_name?: string
  category?: string
  display_status?: 'On Display' | 'Reserved' | 'Distributed' | 'In Storage'
  remarks?: string
}

// Event Resource (child table)
export interface EventResource extends FrappeChildDoc {
  resource_type?: 'Coordinator' | 'Manager' | 'Veterinarian' | 'Security' | 'Driver' | 'Staff' | 'Other'
  employee_name?: string
  contact_number?: string
  email?: string
  role_description?: string
}

// Gift Event - matches Frappe Gift Event doctype
export interface Event extends FrappeDoc {
  subject: string  // Event name
  starts_on?: string
  ends_on?: string
  event_type_gift?: 'Exhibition' | 'Auction' | 'Distribution' | 'Showcase'
  status?: 'Open' | 'Completed' | 'Closed' | 'Cancelled'
  venue_name?: string
  venue_address?: string
  hosted_by_entity?: string
  description?: string
  max_guests?: number
  registration_required?: boolean
  event_gifts?: EventGift[]
  event_resources?: EventResource[]
  notes?: string
}
