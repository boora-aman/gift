#!/usr/bin/env python3
"""
Generate a VS Code AI prompt file for the GIFT module using Frappe meta.
Run this inside a bench/site environment where `frappe` is importable (e.g. `bench console` or a site script).
If `frappe` is not available, the script writes a prompt template with a placeholder for doctypes JSON.
"""
import os
import json
import argparse

OUTPUT_DEFAULT = os.path.join(os.path.dirname(__file__), '..', 'vscode_ai_prompt.md')

DOCTYPES = ['Gift', 'Gift Category', 'Gift Recipient', 'Gift Issue',
            'Gift Interest', 'Gift Dispatch', 'Gift Maintenance', 'Gift Receipt']

PROMPT_TEMPLATE = """
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

## Backend DocTypes & Fields

{doctypes_json}

## API Endpoints
All endpoints follow Frappe REST API structure:
- List: GET `/api/resource/{{DocType}}`
- Get: GET `/api/resource/{{DocType}}/{{name}}`
- Create: POST `/api/resource/{{DocType}}`
- Update: PUT `/api/resource/{{DocType}}/{{name}}`
- Delete: DELETE `/api/resource/{{DocType}}/{{name}}`

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
"""


def gather_doctypes_info():
    try:
        import frappe
    except Exception:
        return None

    doctypes_info = {}

    for dt in DOCTYPES:
        meta = frappe.get_meta(dt)
        fields_info = []
        child_tables = []

        for field in meta.fields:
            if field.fieldtype in ['Section Break', 'Column Break', 'Tab Break']:
                continue

            field_data = {
                'name': field.fieldname,
                'label': field.label,
                'type': field.fieldtype,
                'required': bool(field.reqd),
                'readonly': bool(getattr(field, 'read_only', False))
            }

            if field.fieldtype == 'Link':
                field_data['links_to'] = field.options
            elif field.fieldtype == 'Select':
                field_data['options'] = field.options.split('\n') if field.options else []
            elif field.fieldtype == 'Table':
                field_data['child_doctype'] = field.options
                child_tables.append(field.options)

            fields_info.append(field_data)

        doctypes_info[dt] = {
            'fields': fields_info,
            'child_tables': child_tables,
            'is_submittable': bool(getattr(meta, 'is_submittable', False)),
            'naming': getattr(meta, 'autoname', None)
        }

    return doctypes_info


def write_prompt(output_path, doctypes_info=None):
    if doctypes_info is None:
        doctypes_json = '*** DOCTYPES JSON NOT AVAILABLE — RUN THIS SCRIPT INSIDE A FRAPPE SITE TO POPULATE ***\n\nRun: `bench console` or a site-enabled Python environment and re-run this script.'
    else:
        doctypes_json = json.dumps(doctypes_info, indent=2)

    prompt = PROMPT_TEMPLATE.format(doctypes_json=doctypes_json)

    with open(output_path, 'w') as f:
        f.write(prompt)

    print(f"Prompt written to: {output_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', '-o', default=OUTPUT_DEFAULT, help='Output markdown file path')
    args = parser.parse_args()

    doctypes_info = gather_doctypes_info()
    if doctypes_info is None:
        print("Warning: frappe not importable. Writing template with placeholder. To populate, run this inside a bench/site environment.")

    write_prompt(os.path.abspath(args.output), doctypes_info)
    print("Done.")
