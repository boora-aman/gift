# gift/api/reports.py

import frappe
from frappe import _
from frappe.utils import cint, get_url
import csv
from io import StringIO
from frappe.utils import now_datetime

# ============================================================================
# 1. GIFT INTEREST REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_interest_report(
    page=1,
    limit=100,
    gift=None,
    gift_name=None,
    recipient_name=None,
    interest_source=None,
    interest_level=None,
    follow_up_status=None,
    event=None,
    from_date=None,
    to_date=None,
    order_by="creation",
    sort_order="desc",
):
    """Gift Interest Report - Track all gift interests with recipient details"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["gi.docstatus != 2"]
        params = {}

        if gift:
            conditions.append("gi.gift = %(gift)s")
            params["gift"] = gift

        if gift_name:
            conditions.append("gi.gift_name LIKE %(gift_name)s")
            params["gift_name"] = f"%{gift_name}%"

        if recipient_name:
            conditions.append("(gi.owner_full_name LIKE %(recipient_name)s OR gi.coordinator_full_name LIKE %(recipient_name)s)")
            params["recipient_name"] = f"%{recipient_name}%"

        if interest_source:
            conditions.append("gi.interest_source = %(interest_source)s")
            params["interest_source"] = interest_source

        if interest_level:
            conditions.append("gi.interest_level = %(interest_level)s")
            params["interest_level"] = interest_level

        if follow_up_status:
            conditions.append("gi.follow_up_status = %(follow_up_status)s")
            params["follow_up_status"] = follow_up_status

        if event:
            conditions.append("gi.event = %(event)s")
            params["event"] = event

        if from_date:
            conditions.append("gi.date >= %(from_date)s")
            params["from_date"] = from_date

        if to_date:
            conditions.append("gi.date <= %(to_date)s")
            params["to_date"] = to_date

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Interest` gi
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        
        data_query = f"""
            SELECT
                gi.name as interest_id,
                gi.date as interest_date,
                gi.gift,
                gi.gift_name,
                gi.category,
                gi.gift_recipient,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.mobile_number,
                gi.emirates_id,
                gi.address,
                gi.interest_source,
                gi.interest_level,
                gi.follow_up_status,
                gi.event,
                ge.subject as event_name,
                gi.remarks,
                gi.creation,
                gi.owner,
                u.full_name as created_by_name
            FROM `tabGift Interest` gi
            LEFT JOIN `tabGift Event` ge ON gi.event = ge.name
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE {where_clause}
            ORDER BY gi.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        interests = frappe.db.sql(data_query, params, as_dict=True)

        for interest in interests:
            for field in ["interest_date", "creation"]:
                if interest.get(field):
                    interest[field] = str(interest[field])

        return {
            "data": interests,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_gift_interest_report: {str(e)}")
        frappe.throw(_("Failed to fetch gift interest report: {0}").format(str(e)))


# ============================================================================
# 2. GIFT ISSUE REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_issue_report(
    page=1,
    limit=100,
    gift=None,
    gift_name=None,
    recipient_name=None,
    status=None,
    from_date=None,
    to_date=None,
    order_by="creation",
    sort_order="desc",
):
    """Gift Issue Report - All issued gifts with recipient and delivery status"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["gi.docstatus != 2"]
        params = {}

        if gift:
            conditions.append("gi.gift = %(gift)s")
            params["gift"] = gift

        if gift_name:
            conditions.append("gi.gift_name LIKE %(gift_name)s")
            params["gift_name"] = f"%{gift_name}%"

        if recipient_name:
            conditions.append("(gi.owner_full_name LIKE %(recipient_name)s OR gi.coordinator_full_name LIKE %(recipient_name)s)")
            params["recipient_name"] = f"%{recipient_name}%"

        if status:
            conditions.append("gi.status = %(status)s")
            params["status"] = status

        if from_date:
            conditions.append("gi.date >= %(from_date)s")
            params["from_date"] = from_date

        if to_date:
            conditions.append("gi.date <= %(to_date)s")
            params["to_date"] = to_date

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Issue` gi
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                gi.name as issue_id,
                gi.date as issue_date,
                gi.gift,
                gi.gift_name,
                gi.category,
                gi.gift_recipient,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.mobile_number,
                gi.emirates_id,
                gi.address,
                gi.status,
                gi.delivery_date,
                gi.delivery_description,
                gi.docstatus,
                gi.creation,
                gi.owner,
                u.full_name as created_by_name
            FROM `tabGift Issue` gi
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE {where_clause}
            ORDER BY gi.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        issues = frappe.db.sql(data_query, params, as_dict=True)

        for issue in issues:
            for field in ["issue_date", "delivery_date", "creation"]:
                if issue.get(field):
                    issue[field] = str(issue[field])
            
            issue["status_label"] = issue.get("status") or "Pending"

        return {
            "data": issues,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_gift_issue_report: {str(e)}")
        frappe.throw(_("Failed to fetch gift issue report: {0}").format(str(e)))


# ============================================================================
# 3. GIFT DISPATCH REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_dispatch_report(
    page=1,
    limit=100,
    gift=None,
    dispatch_type=None,
    dispatch_status=None,
    related_gift_issue=None,
    related_event=None,
    from_date=None,
    to_date=None,
    order_by="dispatch_date",
    sort_order="desc",
):
    """Gift Dispatch Report - Track physical movement/logistics"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["gd.docstatus != 2"]
        params = {}

        if gift:
            conditions.append("gd.gift = %(gift)s")
            params["gift"] = gift

        if dispatch_type:
            conditions.append("gd.dispatch_type = %(dispatch_type)s")
            params["dispatch_type"] = dispatch_type

        if dispatch_status:
            conditions.append("gd.dispatch_status = %(dispatch_status)s")
            params["dispatch_status"] = dispatch_status

        if related_gift_issue:
            conditions.append("gd.related_gift_issue = %(related_gift_issue)s")
            params["related_gift_issue"] = related_gift_issue

        if related_event:
            conditions.append("gd.related_event = %(related_event)s")
            params["related_event"] = related_event

        if from_date:
            conditions.append("gd.dispatch_date >= %(from_date)s")
            params["from_date"] = from_date

        if to_date:
            conditions.append("gd.dispatch_date <= %(to_date)s")
            params["to_date"] = to_date

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Dispatch` gd
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                gd.name as dispatch_id,
                gd.dispatch_date,
                gd.gift,
                gd.gift_name,
                gd.dispatch_type,
                gd.dispatch_status,
                gd.related_gift_issue,
                gd.related_event,
                ge.subject as event_name,
                gd.to_warehouse,
                w.warehouse_name as warehouse_name,
                gd.recipient_name,
                gd.recipient_contact,
                gd.destination_address,
                gd.transport_mode,
                gd.vehicle_number,
                gd.driver_name,
                gd.driver_contact,
                gd.estimated_arrival,
                gd.actual_delivery_date,
                gd.received_by_name,
                gd.receiver_id,
                gd.delivery_remarks,
                gd.docstatus,
                gd.creation,
                u.full_name as created_by_name
            FROM `tabGift Dispatch` gd
            LEFT JOIN `tabGift Event` ge ON gd.related_event = ge.name
            LEFT JOIN `tabWarehouse` w ON gd.to_warehouse = w.name
            LEFT JOIN `tabUser` u ON gd.owner = u.name
            WHERE {where_clause}
            ORDER BY gd.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        dispatches = frappe.db.sql(data_query, params, as_dict=True)

        for dispatch in dispatches:
            for field in ["dispatch_date", "estimated_arrival", "actual_delivery_date", "creation"]:
                if dispatch.get(field):
                    dispatch[field] = str(dispatch[field])

            if dispatch.get("actual_delivery_date") and dispatch.get("estimated_arrival"):
                from datetime import datetime
                try:
                    actual = datetime.fromisoformat(str(dispatch["actual_delivery_date"]))
                    estimated = datetime.fromisoformat(str(dispatch["estimated_arrival"]))
                    delay_days = (actual - estimated).days
                    dispatch["delay_days"] = delay_days
                except:
                    dispatch["delay_days"] = None
            else:
                dispatch["delay_days"] = None

        return {
            "data": dispatches,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_gift_dispatch_report: {str(e)}")
        frappe.throw(_("Failed to fetch gift dispatch report: {0}").format(str(e)))


# ============================================================================
# 4. PENDING DELIVERY REPORT
# ============================================================================

@frappe.whitelist()
def get_pending_delivery_report(
    page=1,
    limit=100,
    gift=None,
    dispatch_type=None,
    urgency=None,
    order_by="dispatch_date",
    sort_order="asc",
):
    """Pending Delivery Report - Dispatches not yet delivered"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = [
            "gd.docstatus = 1",
            "(gd.dispatch_status IN ('Prepared', 'In Transit') OR gd.actual_delivery_date IS NULL)"
        ]
        params = {}

        if gift:
            conditions.append("gd.gift = %(gift)s")
            params["gift"] = gift

        if dispatch_type:
            conditions.append("gd.dispatch_type = %(dispatch_type)s")
            params["dispatch_type"] = dispatch_type

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Dispatch` gd
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                gd.name as dispatch_id,
                gd.dispatch_date,
                gd.gift,
                gd.gift_name,
                gd.dispatch_type,
                gd.dispatch_status,
                gd.related_gift_issue,
                gd.recipient_name,
                gd.recipient_contact,
                gd.destination_address,
                gd.transport_mode,
                gd.vehicle_number,
                gd.driver_name,
                gd.driver_contact,
                gd.estimated_arrival,
                DATEDIFF(CURDATE(), gd.dispatch_date) as days_since_dispatch,
                DATEDIFF(CURDATE(), gd.estimated_arrival) as days_overdue,
                gd.creation,
                u.full_name as created_by_name
            FROM `tabGift Dispatch` gd
            LEFT JOIN `tabUser` u ON gd.owner = u.name
            WHERE {where_clause}
            ORDER BY gd.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        pending = frappe.db.sql(data_query, params, as_dict=True)

        for item in pending:
            for field in ["dispatch_date", "estimated_arrival", "creation"]:
                if item.get(field):
                    item[field] = str(item[field])

            days_since = item.get("days_since_dispatch", 0) or 0
            days_overdue = item.get("days_overdue", 0) or 0

            if days_overdue > 0:
                item["urgency"] = "High"
            elif days_since > 7:
                item["urgency"] = "Medium"
            else:
                item["urgency"] = "Low"

        if urgency:
            pending = [p for p in pending if p.get("urgency") == urgency]
            total = len(pending)

        return {
            "data": pending,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 0,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_pending_delivery_report: {str(e)}")
        frappe.throw(_("Failed to fetch pending delivery report: {0}").format(str(e)))


# ============================================================================
# 5. GIFT MAINTENANCE REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_maintenance_report(
    page=1,
    limit=100,
    gift=None,
    maintenance_type=None,
    health_status=None,
    follow_up_required=None,
    from_date=None,
    to_date=None,
    order_by="maintenance_date",
    sort_order="desc",
):
    """Gift Maintenance Report - Healthcare & servicing records"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["gm.docstatus != 2"]
        params = {}

        if gift:
            conditions.append("gm.gift = %(gift)s")
            params["gift"] = gift

        if maintenance_type:
            conditions.append("gm.maintenance_type = %(maintenance_type)s")
            params["maintenance_type"] = maintenance_type

        if health_status:
            conditions.append("gm.health_status = %(health_status)s")
            params["health_status"] = health_status

        if follow_up_required is not None:
            conditions.append("gm.follow_up_required = %(follow_up_required)s")
            params["follow_up_required"] = cint(follow_up_required)

        if from_date:
            conditions.append("gm.maintenance_date >= %(from_date)s")
            params["from_date"] = from_date

        if to_date:
            conditions.append("gm.maintenance_date <= %(to_date)s")
            params["to_date"] = to_date

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Maintenance` gm
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                gm.name as maintenance_id,
                gm.maintenance_date,
                gm.maintenance_type,
                gm.gift,
                gm.gift_name,
                gm.current_warehouse,
                gm.current_location,
                gm.performed_by,
                gm.provider_type,
                gm.contact_number,
                gm.health_status,
                gm.weight,
                gm.temperature,
                gm.diagnosis,
                gm.treatment_given,
                gm.follow_up_required,
                gm.next_checkup_date,
                gm.maintenance_cost,
                gm.payment_status,
                gm.creation,
                u.full_name as created_by_name
            FROM `tabGift Maintenance` gm
            LEFT JOIN `tabUser` u ON gm.owner = u.name
            WHERE {where_clause}
            ORDER BY gm.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        maintenance = frappe.db.sql(data_query, params, as_dict=True)

        for item in maintenance:
            for field in ["maintenance_date", "next_checkup_date", "creation"]:
                if item.get(field):
                    item[field] = str(item[field])

            # Fetch medications
            meds = frappe.db.get_all(
                "Gift Maintenance Medication",
                filters={"parent": item["maintenance_id"]},
                fields=["medication_name", "dosage", "frequency", "duration"],
            )
            item["medications"] = meds

        return {
            "data": maintenance,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_gift_maintenance_report: {str(e)}")
        frappe.throw(_("Failed to fetch gift maintenance report: {0}").format(str(e)))


# ============================================================================
# 6. EVENT GIFTS REPORT
# ============================================================================

@frappe.whitelist()
def get_event_gifts_report(
    page=1,
    limit=100,
    event=None,
    event_type=None,
    display_status=None,
    from_date=None,
    to_date=None,
    order_by="starts_on",
    sort_order="desc",
):
    """Event Gifts Report - Which gifts were shown at which events"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["ge.docstatus != 2"]
        params = {}

        if event:
            conditions.append("eg.parent = %(event)s")
            params["event"] = event

        if event_type:
            conditions.append("ge.event_type = %(event_type)s")
            params["event_type"] = event_type

        if display_status:
            conditions.append("eg.display_status = %(display_status)s")
            params["display_status"] = display_status

        if from_date:
            conditions.append("ge.starts_on >= %(from_date)s")
            params["from_date"] = from_date

        if to_date:
            conditions.append("ge.starts_on <= %(to_date)s")
            params["to_date"] = to_date

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Event Gifts` eg
            INNER JOIN `tabGift Event` ge ON eg.parent = ge.name
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                ge.name as event_id,
                ge.subject as event_name,
                ge.event_type,
                ge.description as venue,
                ge.starts_on,
                ge.ends_on,
                ge.status as event_status,
                eg.gift,
                eg.gift_name,
                eg.category,
                eg.display_status,
                eg.remarks,
                (SELECT COUNT(*) FROM `tabGift Interest` WHERE gift = eg.gift AND event = ge.name) as interest_count
            FROM `tabGift Event Gifts` eg
            INNER JOIN `tabGift Event` ge ON eg.parent = ge.name
            WHERE {where_clause}
            ORDER BY ge.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        event_gifts = frappe.db.sql(data_query, params, as_dict=True)

        for item in event_gifts:
            for field in ["starts_on", "ends_on"]:
                if item.get(field):
                    item[field] = str(item[field])

        return {
            "data": event_gifts,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_event_gifts_report: {str(e)}")
        frappe.throw(_("Failed to fetch event gifts report: {0}").format(str(e)))


# ============================================================================
# 7. BARCODE PRINT REPORT
# ============================================================================

@frappe.whitelist()
def get_barcode_print_report(
    page=1,
    limit=100,
    gift_id=None,
    barcode_value=None,
    category=None,
    status=None,
    order_by="creation",
    sort_order="desc",
):
    """Barcode Print Report - Generate printable barcode sheets"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["g.docstatus != 2"]
        params = {}

        if gift_id:
            conditions.append("(g.name LIKE %(gift_id)s OR g.gift_id LIKE %(gift_id)s)")
            params["gift_id"] = f"%{gift_id}%"

        if barcode_value:
            conditions.append("g.barcode_value LIKE %(barcode_value)s")
            params["barcode_value"] = f"%{barcode_value}%"

        if category:
            conditions.append("g.category = %(category)s")
            params["category"] = category

        if status:
            conditions.append("g.status = %(status)s")
            params["status"] = status

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift` g
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                g.name as gift_id,
                g.gift_id as gift_code,
                g.gift_name,
                g.category,
                g.status,
                g.barcode_value,
                g.barcode,
                g.qr_code_image,
                g.creation,
                g.modified
            FROM `tabGift` g
            WHERE {where_clause}
            ORDER BY g.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        gifts = frappe.db.sql(data_query, params, as_dict=True)

        def get_full_url(file_path):
            if not file_path:
                return ""
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path
            if file_path.startswith("/private/"):
                return get_url(f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}")
            elif file_path.startswith("/files/"):
                return get_url(file_path)
            else:
                return get_url(f"/files/{file_path}")

        for gift in gifts:
            for field in ["creation", "modified"]:
                if gift.get(field):
                    gift[field] = str(gift[field])

            gift["barcode_image"] = get_full_url(gift.get("barcode"))
            gift["qr_code_image_url"] = get_full_url(gift.get("qr_code_image"))

        return {
            "data": gifts,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_barcode_print_report: {str(e)}")
        frappe.throw(_("Failed to fetch barcode print report: {0}").format(str(e)))


# ============================================================================
# 8. GIFT LOCATION TIMELINE REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_location_timeline(gift):
    """Gift Location Timeline - Show complete movement history of a gift"""
    try:
        if not gift:
            frappe.throw(_("Gift ID is required"))

        timeline = frappe.db.get_all(
            "Gift Store",
            filters={"gift": gift},
            fields=[
                "name",
                "transaction_date",
                "from_warehouse",
                "to_warehouse",
                "from_location",
                "to_location",
                "reason",
                "remarks",
                "reference_document_type",
                "reference_document_name",
                "creation",
            ],
            order_by="transaction_date desc, creation desc",
        )

        for entry in timeline:
            for field in ["transaction_date", "creation"]:
                if entry.get(field):
                    entry[field] = str(entry[field])

        return {"data": timeline}

    except Exception as e:
        frappe.log_error(f"Error in get_gift_location_timeline: {str(e)}")
        frappe.throw(_("Failed to fetch gift location timeline: {0}").format(str(e)))


# ============================================================================
# 9. GIFT RECIPIENT REPORT
# ============================================================================

@frappe.whitelist()
def get_gift_recipient_report(
    page=1,
    limit=100,
    recipient_name=None,
    emirates_id=None,
    mobile_number=None,
    order_by="creation",
    sort_order="desc",
):
    """Gift Recipient Report - Master list of all recipients"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        conditions = ["gr.docstatus != 2"]
        params = {}

        if recipient_name:
            conditions.append("(gr.owner_full_name LIKE %(recipient_name)s OR gr.coordinator_full_name LIKE %(recipient_name)s)")
            params["recipient_name"] = f"%{recipient_name}%"

        if emirates_id:
            conditions.append("gr.coordinator_emirates_id = %(emirates_id)s")
            params["emirates_id"] = emirates_id

        if mobile_number:
            conditions.append("gr.coordinator_mobile_no LIKE %(mobile_number)s")
            params["mobile_number"] = f"%{mobile_number}%"

        where_clause = " AND ".join(conditions)

        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Recipient` gr
            WHERE {where_clause}
        """

        total = frappe.db.sql(count_query, params, as_dict=True)[0]["total"]

        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"

        data_query = f"""
            SELECT
                gr.name as recipient_id,
                gr.owner_full_name,
                gr.coordinator_full_name,
                gr.coordinator_emirates_id,
                gr.coordinator_mobile_no,
                gr.address,
                gr.person_photo,
                (SELECT COUNT(*) FROM `tabGift Issue` WHERE gift_recipient = gr.name) as total_gifts_issued,
                (SELECT COUNT(*) FROM `tabGift Interest` WHERE gift_recipient = gr.name) as total_interests,
                gr.creation,
                gr.modified
            FROM `tabGift Recipient` gr
            WHERE {where_clause}
            ORDER BY gr.{order_by} {order_direction}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        recipients = frappe.db.sql(data_query, params, as_dict=True)

        for recipient in recipients:
            for field in ["creation", "modified"]:
                if recipient.get(field):
                    recipient[field] = str(recipient[field])

            if recipient.get("person_photo"):
                recipient["photo_url"] = get_url(recipient["person_photo"])
            else:
                recipient["photo_url"] = None

        return {
            "data": recipients,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_gift_recipient_report: {str(e)}")
        frappe.throw(_("Failed to fetch gift recipient report: {0}").format(str(e)))

# ============================================================================
# CSV EXPORT UTILITIES
# ============================================================================


def clean_filters(filters: dict) -> dict:
    """Remove frappe-injected and invalid RPC params"""
    blocked_keys = {
        "cmd",
        "_",
        "doctype",
        "name",
        "owner",
        "creation",
        "modified",
        "modified_by",
    }
    return {k: v for k, v in filters.items() if k not in blocked_keys}

def flatten_dict(data, parent_key='', sep='_'):
    """Flatten nested dictionaries for CSV export"""
    items = []
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list) and v and isinstance(v[0], dict):
            # For child tables, create comma-separated strings
            items.append((new_key, "; ".join([str(item) for item in v])))
        else:
            items.append((new_key, v))
    return dict(items)

@frappe.whitelist()
def export_gift_interest_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        result = get_gift_interest_report(**filters)
        data = result.get("data", [])

        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"gift_interest_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
            "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Gift Interest CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))


@frappe.whitelist()
def export_gift_issue_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        data = get_gift_issue_report(**filters).get("data", [])
        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"gift_issue_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Gift Issue CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))


@frappe.whitelist()
def export_gift_dispatch_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        data = get_gift_dispatch_report(**filters).get("data", [])
        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"gift_dispatch_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Gift Dispatch CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))


@frappe.whitelist()
def export_gift_maintenance_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        data = get_gift_maintenance_report(**filters).get("data", [])
        if not data:
            frappe.throw(_("No data to export"))

        rows = []
        for row in data:
            r = row.copy()
            meds = r.pop("medications", [])
            r["medications"] = "; ".join(
                f"{m['medication_name']} ({m['dosage']}, {m['frequency']})"
                for m in meds
            )
            rows.append(r)

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

        frappe.response.update({
            "filename": f"gift_maintenance_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Gift Maintenance CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))


@frappe.whitelist()
def export_gift_recipient_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        result = get_gift_recipient_report(**filters)
        data = result.get("data", [])

        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"gift_recipient_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Gift Recipient CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))

@frappe.whitelist()
def export_barcode_print_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        result = get_barcode_print_report(**filters)
        data = result.get("data", [])

        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"barcode_print_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 
        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Barcode Print CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))


@frappe.whitelist()
def export_pending_delivery_to_csv(**filters):
    try:
        filters = clean_filters(filters)
        filters.update({"page": 1, "limit": 999999})

        result = get_pending_delivery_report(**filters)
        data = result.get("data", [])

        if not data:
            frappe.throw(_("No data to export"))

        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        frappe.response.update({
            "filename": f"pending_delivery_report_{now_datetime().strftime('%Y%m%d_%H%M%S')}.csv",
            "filecontent": output.getvalue(),
            "type": "csv",
            "doctype": "Report",
             "result": output.getvalue(), 

        })

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Pending Delivery CSV Export")
        frappe.throw(_("Failed to export CSV: {0}").format(e))

