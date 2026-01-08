
# GIFT MODULE - FRAPPE BACKEND SYNC PROMPT

## Context

You are updating a Vue.js 3 (Composition API) frontend application that connects to a Frappe backend. The backend has been updated with new fields and DocTypes. Your task is to update the existing Vue.js codebase to match the current backend structure.

## Project Structure

frontend/
├── src/
│ ├── components/ # Reusable Vue components
│ ├── composables/ # Vue composition API hooks
│ ├── views/ # Page-level components
│ ├── router/ # Vue Router configuration
│ ├── stores/ # Pinia/Vuex stores
│ ├── services/ # API service layer
│ ├── utils/ # Utility functions
│ └── App.vue

text

## Backend DocTypes & Fields

{
  "Gift": {
    "fields": [
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "gift_id",
        "label": "Gift Code",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "category",
        "label": "Category",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Gift Category"
      },
      {
        "name": "status",
        "label": "Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "",
          "Available",
          "Issued"
        ]
      },
      {
        "name": "import_barcode",
        "label": "Import Barcode",
        "type": "Check",
        "required": false,
        "readonly": false
      },
      {
        "name": "barcode",
        "label": "Barcode",
        "type": "Attach",
        "required": false,
        "readonly": true
      },
      {
        "name": "barcode_value",
        "label": "Barcode ID",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "gift_details",
        "label": "Gift Additional Attributes",
        "type": "Table",
        "required": false,
        "readonly": false,
        "child_doctype": "Gift Details"
      },
      {
        "name": "gift_images",
        "label": "Gift Images",
        "type": "Table",
        "required": false,
        "readonly": false,
        "child_doctype": "Gift Images"
      },
      {
        "name": "gift_recipient",
        "label": "Gift Recipient",
        "type": "Link",
        "required": false,
        "readonly": true,
        "links_to": "Gift Recipient"
      },
      {
        "name": "owner_full_name",
        "label": "Owner Full Name",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "coordinator_full_name",
        "label": "Coordinator Full Name",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "mobile_number",
        "label": "Mobile Number",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "emirates_id",
        "label": "Emirates ID",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "address",
        "label": "Address",
        "type": "Small Text",
        "required": false,
        "readonly": true
      },
      {
        "name": "issued_date",
        "label": "Issued Date",
        "type": "Date",
        "required": false,
        "readonly": true
      },
      {
        "name": "person_photo",
        "label": "Person Photo",
        "type": "Attach",
        "required": false,
        "readonly": true
      },
      {
        "name": "item_condition",
        "label": "Item Condition",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "New",
          "Excellent",
          "Good",
          "Fair",
          "Needs Repair",
          "Living (Healthy)",
          "Living (Sick)",
          "Living (Needs Doctor)",
          "Living (In Care)",
          "Sent to Zoo",
          "Deceased"
        ]
      },
      {
        "name": "health_status",
        "label": "Health Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Healthy",
          "Needs Checkup",
          "Under Treatment",
          "Recovering",
          "Critical",
          "Quarantine"
        ]
      },
      {
        "name": "current_location_type",
        "label": "Current Location Type",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Warehouse",
          "Farm",
          "Event",
          "In Transit",
          "With Recipient",
          "Maintenance Center",
          "Other"
        ]
      },
      {
        "name": "warehouse",
        "label": "Warehouse",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Warehouse"
      },
      {
        "name": "storage_location",
        "label": "Storage Location/Section",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "storage_date",
        "label": "Stored Since",
        "type": "Date",
        "required": false,
        "readonly": false
      },
      {
        "name": "location_contact_person",
        "label": "Location Contact Person",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "location_contact_number",
        "label": "Contact Number",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "location_address",
        "label": "Location Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "gift_location_history",
        "label": "Location Movement History",
        "type": "Table",
        "required": false,
        "readonly": true,
        "child_doctype": "Gift Store"
      },
      {
        "name": "qr_code_enabled",
        "label": "Enable QR Code Interest",
        "type": "Check",
        "required": false,
        "readonly": false
      },
      {
        "name": "qr_code_value",
        "label": "QR Code Value",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "qr_code_image",
        "label": "QR Code Image",
        "type": "Attach Image",
        "required": false,
        "readonly": true
      },
      {
        "name": "scan_count",
        "label": "Total Scans",
        "type": "Int",
        "required": false,
        "readonly": true
      }
    ],
    "child_tables": [
      "Gift Details",
      "Gift Images",
      "Gift Store"
    ],
    "is_submittable": false,
    "naming": ".#######"
  },
  "Gift Category": {
    "fields": [
      {
        "name": "category_name",
        "label": "Category Name",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "category_attributes",
        "label": "Default Attributes for this Category",
        "type": "Table",
        "required": false,
        "readonly": false,
        "child_doctype": "Gift Category Details"
      },
      {
        "name": "category_type",
        "label": "Category Type",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Physical Item",
          "Livestock/Animal",
          "Vehicle",
          "Electronics",
          "Jewelry",
          "Artwork",
          "Real Estate",
          "Other"
        ]
      },
      {
        "name": "requires_maintenance",
        "label": "Requires Regular Maintenance",
        "type": "Check",
        "required": false,
        "readonly": false
      }
    ],
    "child_tables": [
      "Gift Category Details"
    ],
    "is_submittable": false,
    "naming": "field:category_name"
  },
  "Gift Recipient": {
    "fields": [
      {
        "name": "owner_full_name",
        "label": "Owner Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "coordinator_full_name",
        "label": "Coordinator Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "coordinator_mobile_no",
        "label": "Coordinator Mobile No",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "coordinator_emirates_id",
        "label": "Coordinator Emirates ID",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "address",
        "label": "Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "person_photo",
        "label": "Person Photo",
        "type": "Attach",
        "required": false,
        "readonly": false
      }
    ],
    "child_tables": [],
    "is_submittable": false,
    "naming": "format:GIFT-RCP-{#####}"
  },
  "Gift Issue": {
    "fields": [
      {
        "name": "gift",
        "label": "Gift",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift"
      },
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Read Only",
        "required": false,
        "readonly": false
      },
      {
        "name": "date",
        "label": "Date",
        "type": "Date",
        "required": false,
        "readonly": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "Select",
        "required": true,
        "readonly": false,
        "options": [
          "Dispatched",
          "Delivered"
        ]
      },
      {
        "name": "category",
        "label": "Category",
        "type": "Read Only",
        "required": false,
        "readonly": false
      },
      {
        "name": "gift_recipient",
        "label": "Gift Recipient",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift Recipient"
      },
      {
        "name": "owner_full_name",
        "label": "Owner Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "coordinator_full_name",
        "label": "Coordinator Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "mobile_number",
        "label": "Mobile Number",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "emirates_id",
        "label": "Emirates ID",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "address",
        "label": "Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "person_photo",
        "label": "Person Photo",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "delivery_note",
        "label": "Delivery Note",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "delivery_description",
        "label": "Delivery Description",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "delivery_date",
        "label": "Delivery Date",
        "type": "Date",
        "required": false,
        "readonly": false
      },
      {
        "name": "documents",
        "label": "Documents",
        "type": "Table",
        "required": false,
        "readonly": false,
        "child_doctype": "Gift Issue Documents"
      }
    ],
    "child_tables": [
      "Gift Issue Documents"
    ],
    "is_submittable": false,
    "naming": "format:GIFT-ISSUE-{#####}"
  },
  "Gift Interest": {
    "fields": [
      {
        "name": "gift",
        "label": "Gift",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift"
      },
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Read Only",
        "required": false,
        "readonly": false
      },
      {
        "name": "date",
        "label": "Date",
        "type": "Date",
        "required": false,
        "readonly": false
      },
      {
        "name": "category",
        "label": "Category",
        "type": "Read Only",
        "required": false,
        "readonly": false
      },
      {
        "name": "gift_recipient",
        "label": "Gift Recipient",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift Recipient"
      },
      {
        "name": "owner_full_name",
        "label": "Owner Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "coordinator_full_name",
        "label": "Coordinator Full Name",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "mobile_number",
        "label": "Mobile Number",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "emirates_id",
        "label": "Emirates ID",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "address",
        "label": "Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "interest_source",
        "label": "Interest Source",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "QR Code Scan",
          "Manual Entry",
          "Event Registration",
          "Website",
          "Phone Call",
          "Other"
        ]
      },
      {
        "name": "event",
        "label": "Event",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Event"
      },
      {
        "name": "interest_level",
        "label": "Interest Level",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Very Interested",
          "Interested",
          "Just Browsing",
          "Reserved"
        ]
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "follow_up_status",
        "label": "Follow-up Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "New",
          "Contacted",
          "Converted to Issue",
          "Not Interested",
          "Lost"
        ]
      }
    ],
    "child_tables": [],
    "is_submittable": false,
    "naming": "format:GIFT-INT-{#####}"
  },
  "Gift Dispatch": {
    "fields": [
      {
        "name": "dispatch_date",
        "label": "Dispatch Date",
        "type": "Datetime",
        "required": true,
        "readonly": false
      },
      {
        "name": "gift",
        "label": "Gift",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift"
      },
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "current_warehouse",
        "label": "Current Warehouse",
        "type": "Link",
        "required": false,
        "readonly": true,
        "links_to": "Warehouse"
      },
      {
        "name": "dispatch_type",
        "label": "Dispatch Type",
        "type": "Select",
        "required": true,
        "readonly": false,
        "options": [
          "Gift Issue",
          "Warehouse Transfer",
          "Event Display",
          "Maintenance",
          "Return",
          "Other"
        ]
      },
      {
        "name": "dispatch_status",
        "label": "Dispatch Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Prepared",
          "In Transit",
          "Delivered",
          "Cancelled"
        ]
      },
      {
        "name": "related_gift_issue",
        "label": "Related Gift Issue",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Gift Issue"
      },
      {
        "name": "related_event",
        "label": "Related Event",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Event"
      },
      {
        "name": "to_warehouse",
        "label": "To Warehouse",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Warehouse"
      },
      {
        "name": "recipient_name",
        "label": "Recipient Name",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "recipient_contact",
        "label": "Recipient Contact",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "destination_address",
        "label": "Destination Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "transport_mode",
        "label": "Transport Mode",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Company Vehicle",
          "Third Party Truck",
          "Air Transport",
          "Sea Transport",
          "Self Pickup",
          "Courier"
        ]
      },
      {
        "name": "vehicle_number",
        "label": "Vehicle Number",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "driver_name",
        "label": "Driver/Handler Name",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "driver_contact",
        "label": "Driver Contact",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "estimated_arrival",
        "label": "Estimated Arrival",
        "type": "Datetime",
        "required": false,
        "readonly": false
      },
      {
        "name": "actual_delivery_date",
        "label": "Actual Delivery Date",
        "type": "Datetime",
        "required": false,
        "readonly": false
      },
      {
        "name": "health_certificate",
        "label": "Health Certificate",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "transport_permit",
        "label": "Transport Permit",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "delivery_note",
        "label": "Delivery Note",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "other_documents",
        "label": "Other Documents",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "received_by_name",
        "label": "Received By Name",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "receiver_id",
        "label": "Receiver ID/Emirates ID",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "delivery_remarks",
        "label": "Delivery Remarks",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "amended_from",
        "label": "Amended From",
        "type": "Link",
        "required": false,
        "readonly": true,
        "links_to": "Gift Dispatch"
      }
    ],
    "child_tables": [],
    "is_submittable": true,
    "naming": "format:GD-{YYYY}-{#####}"
  },
  "Gift Maintenance": {
    "fields": [
      {
        "name": "maintenance_date",
        "label": "Maintenance Date",
        "type": "Date",
        "required": true,
        "readonly": false
      },
      {
        "name": "maintenance_type",
        "label": "Maintenance Type",
        "type": "Select",
        "required": true,
        "readonly": false,
        "options": [
          "Health Checkup",
          "Feeding",
          "Grooming",
          "Medical Treatment",
          "Vaccination",
          "Repair",
          "Cleaning",
          "Other"
        ]
      },
      {
        "name": "gift",
        "label": "Gift",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Gift"
      },
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "current_warehouse",
        "label": "Current Warehouse",
        "type": "Link",
        "required": false,
        "readonly": true,
        "links_to": "Warehouse"
      },
      {
        "name": "current_location",
        "label": "Current Location",
        "type": "Data",
        "required": false,
        "readonly": true
      },
      {
        "name": "performed_by",
        "label": "Performed By",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "provider_type",
        "label": "Provider Type",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Veterinarian",
          "Caretaker",
          "Technician",
          "Specialist",
          "Internal Staff",
          "External Agency"
        ]
      },
      {
        "name": "contact_number",
        "label": "Contact Number",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "license_number",
        "label": "License/ID Number",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "health_status",
        "label": "Health Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Excellent",
          "Good",
          "Fair",
          "Poor",
          "Critical",
          "N/A"
        ]
      },
      {
        "name": "weight",
        "label": "Weight",
        "type": "Float",
        "required": false,
        "readonly": false
      },
      {
        "name": "temperature",
        "label": "Temperature",
        "type": "Float",
        "required": false,
        "readonly": false
      },
      {
        "name": "vital_signs",
        "label": "Other Vital Signs",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "observations",
        "label": "Observations",
        "type": "Text Editor",
        "required": false,
        "readonly": false
      },
      {
        "name": "diagnosis",
        "label": "Diagnosis",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "treatment_given",
        "label": "Treatment Given",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "recommendations",
        "label": "Recommendations",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "medications",
        "label": "Medications",
        "type": "Table",
        "required": false,
        "readonly": false,
        "child_doctype": "Gift Maintenance Medication"
      },
      {
        "name": "follow_up_required",
        "label": "Follow-up Required",
        "type": "Check",
        "required": false,
        "readonly": false
      },
      {
        "name": "next_checkup_date",
        "label": "Next Checkup Date",
        "type": "Date",
        "required": false,
        "readonly": false
      },
      {
        "name": "follow_up_notes",
        "label": "Follow-up Notes",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "maintenance_photos",
        "label": "Photos",
        "type": "Attach Image",
        "required": false,
        "readonly": false
      },
      {
        "name": "reports",
        "label": "Reports/Test Results",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "sop_reference",
        "label": "SOP Reference",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "certificate",
        "label": "Certificate (if any)",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "maintenance_cost",
        "label": "Maintenance Cost",
        "type": "Currency",
        "required": false,
        "readonly": false
      },
      {
        "name": "paid_by",
        "label": "Paid By",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Owner",
          "Organization",
          "Insurance",
          "Other"
        ]
      },
      {
        "name": "payment_status",
        "label": "Payment Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Paid",
          "Pending",
          "Waived",
          "N/A"
        ]
      },
      {
        "name": "invoice_number",
        "label": "Invoice Number",
        "type": "Data",
        "required": false,
        "readonly": false
      }
    ],
    "child_tables": [
      "Gift Maintenance Medication"
    ],
    "is_submittable": false,
    "naming": "format:GM-{YYYY}-{#####}"
  },
  "Gift Receipt": {
    "fields": [
      {
        "name": "receipt_date",
        "label": "Receipt Date",
        "type": "Datetime",
        "required": true,
        "readonly": false
      },
      {
        "name": "received_from",
        "label": "Received From",
        "type": "Data",
        "required": true,
        "readonly": false
      },
      {
        "name": "received_by",
        "label": "Received By",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "User"
      },
      {
        "name": "receipt_status",
        "label": "Receipt Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Pending Inspection",
          "Approved",
          "Quarantine",
          "Rejected"
        ]
      },
      {
        "name": "source_location",
        "label": "Source Location/Address",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "source_contact",
        "label": "Source Contact Number",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "create_new_gift",
        "label": "Create New Gift Record",
        "type": "Check",
        "required": false,
        "readonly": false
      },
      {
        "name": "gift",
        "label": "Existing Gift",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Gift"
      },
      {
        "name": "gift_name",
        "label": "Gift Name",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "category",
        "label": "Category",
        "type": "Link",
        "required": false,
        "readonly": false,
        "links_to": "Gift Category"
      },
      {
        "name": "breed",
        "label": "Breed/Model",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "gender",
        "label": "Gender",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "",
          "Male",
          "Female",
          "N/A"
        ]
      },
      {
        "name": "weight",
        "label": "Weight",
        "type": "Float",
        "required": false,
        "readonly": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "item_condition",
        "label": "Item Condition",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "New",
          "Excellent",
          "Good",
          "Fair",
          "Needs Repair",
          "Living (Healthy)",
          "Living (Sick)",
          "Living (Needs Doctor)"
        ]
      },
      {
        "name": "health_status",
        "label": "Health Status",
        "type": "Select",
        "required": false,
        "readonly": false,
        "options": [
          "Healthy",
          "Needs Checkup",
          "Under Treatment",
          "Quarantine"
        ]
      },
      {
        "name": "inspection_notes",
        "label": "Inspection Notes",
        "type": "Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "assign_to_warehouse",
        "label": "Assign to Warehouse",
        "type": "Link",
        "required": true,
        "readonly": false,
        "links_to": "Warehouse"
      },
      {
        "name": "storage_location",
        "label": "Storage Location/Section",
        "type": "Data",
        "required": false,
        "readonly": false
      },
      {
        "name": "health_certificate",
        "label": "Health Certificate",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "transport_documents",
        "label": "Transport Documents",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "purchase_invoice",
        "label": "Purchase Invoice",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "other_documents",
        "label": "Other Documents",
        "type": "Attach",
        "required": false,
        "readonly": false
      },
      {
        "name": "receipt_photos",
        "label": "Photos",
        "type": "Small Text",
        "required": false,
        "readonly": false
      },
      {
        "name": "amended_from",
        "label": "Amended From",
        "type": "Link",
        "required": false,
        "readonly": true,
        "links_to": "Gift Receipt"
      }
    ],
    "child_tables": [],
    "is_submittable": true,
    "naming": "format:GR-{YYYY}-{#####}"
  }
}

## API Endpoints

All endpoints follow Frappe REST API structure:

- List: GET `/api/resource/{DocType}`
- Get: GET `/api/resource/{DocType}/{name}`
- Create: POST `/api/resource/{DocType}`
- Update: PUT `/api/resource/{DocType}/{name}`
- Delete: DELETE `/api/resource/{DocType}/{name}`

Use `encodeURIComponent(doctype)` for DocTypes with spaces.

## Authentication

- Use session-based auth with CSRF token
- Include header: `'X-Frappe-CSRF-Token': window.csrf_token`
- Set `withCredentials: true` in axios

## Tasks to Complete

### 1. Update API Service Layer

Check `services/` directory and ensure all DocType endpoints are present:

- Gift, Gift Category, Gift Recipient, Gift Issue, Gift Interest
- Gift Dispatch, Gift Maintenance, Gift Receipt, Entity Master

### 2. Update/Create Composables

For each DocType, create/update composable in `composables/`:

- `useGift.js`, `useGiftIssue.js`, `useGiftRecipient.js`, etc.
- Include: fetchList, fetchSingle, create, update, delete methods
- Add computed properties for filtering (e.g., availableGifts, issuedGifts)

### 3. Update Views

Check existing views and add missing fields:

- **Gift Form**: Add `qr_code_enabled`, `health_status`, `current_location_type`
- **Gift Issue Form**: Add `documents` child table
- **Gift Maintenance Form**: Add `medications` child table, `follow_up_required`
- Create new views for: Gift Dispatch, Gift Receipt, Gift Interest

### 4. Update Components

- Add/update child table components for:
  - Gift Details (dynamic attributes)
  - Gift Images (image gallery)
  - Gift Location History
  - Gift Issue Documents
  - Gift Maintenance Medication
- Add QR Code display component for Gift
- Add document upload component

### 5. Update Router

Add routes for:
{
path: '/gifts',
name: 'GiftList',
component: () => import('@/views/Gift/GiftList.vue')
},
{
path: '/gifts/new',
name: 'GiftNew',
component: () => import('@/views/Gift/GiftForm.vue')
},
{
path: '/gifts/:id',
name: 'GiftDetail',
component: () => import('@/views/Gift/GiftDetail.vue')
},
{
path: '/gift-issues',
name: 'GiftIssueList',
component: () => import('@/views/GiftIssue/GiftIssueList.vue')
}
// Add similar routes for all DocTypes

text

### 6. Form Validation Rules

Implement validation for required fields:

- Gift: gift_name (required)
- Gift Issue: gift, date, status, gift_recipient, owner_full_name, coordinator_full_name, mobile_number (all required)
- Gift Recipient: owner_full_name, coordinator_full_name, coordinator_mobile_no (required)

### 7. Special Field Handling

**Select Fields** - Use exact options from backend:
// Gift.status
['Available', 'Issued']

// Gift.item_condition
['New', 'Excellent', 'Good', 'Fair', 'Needs Repair',
'Living (Healthy)', 'Living (Sick)', 'Living (Needs Doctor)',
'Living (In Care)', 'Sent to Zoo', 'Deceased']

// Gift Issue.status
['Dispatched', 'Delivered']

// Gift Interest.interest_level
['Very Interested', 'Interested', 'Just Browsing', 'Reserved']

text

**Link Fields** - Implement autocomplete:

- Gift → Gift Category (searchable dropdown)
- Gift Issue → Gift (show available gifts only)
- Gift Issue → Gift Recipient (searchable by name/Emirates ID)

**Child Tables** - Implement add/edit/delete rows:

- Gift Details: Dynamic attribute rows
- Gift Images: Multiple image upload with preview
- Gift Issue Documents: Document type selector + file upload
- Gift Maintenance Medication: Medication details rows

**Date/DateTime Fields**:

- Use date picker for Date fields
- Use datetime picker for Datetime fields
- Format: YYYY-MM-DD for dates, YYYY-MM-DD HH:mm:ss for datetime

### 8. Error Handling

Implement proper error handling:
try {
await createGift(formData)
// Show success message
showToast('Gift created successfully', 'success')
} catch (error) {
// Show error message
showToast(error.response?.data?.message || 'Failed to create gift', 'error')
}

text

### 9. Loading States

Add loading indicators for:

- List views (skeleton loaders)
- Form submissions (disabled button + spinner)
- Data fetching (loading overlay)

### 10. Permissions

Check if views need permission-based rendering:

- Read-only fields should be disabled for non-authorized users
- Hide delete buttons if user lacks delete permission

## Code Style Guidelines

- Use Vue 3 Composition API with `<script setup>`
- Use Tailwind CSS for styling
- Follow existing component patterns
- Use TypeScript if project uses it
- Add JSDoc comments for functions
- Use async/await instead of promises

## Testing Checklist

After updates, verify:

1. ✅ All API calls work (no 404s)
2. ✅ Forms validate correctly
3. ✅ Child tables can add/edit/delete rows
4. ✅ File uploads work for Attach/Attach Image fields
5. ✅ Link fields show proper autocomplete
6. ✅ Select fields show correct options
7. ✅ Required field validation works
8. ✅ Success/error messages display
9. ✅ Navigation between views works
10. ✅ Data refreshes after create/update/delete

## Example Usage

When I share a file (e.g., `GiftForm.vue`), analyze it and:

1. Check for missing backend fields
2. Verify API endpoint usage is correct
3. Ensure child tables are properly implemented
4. Check if validation rules match backend
5. Suggest improvements for UX/error handling
6. Update code to match current backend structure

## Response Format

When analyzing/updating files:

1. List what's missing or outdated
2. Provide complete updated code
3. Explain key changes made
4. Note any potential issues or considerations

Ready to analyze and update files!
