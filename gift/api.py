import frappe
from frappe import _
from frappe.utils import nowdate, nowtime, cint, flt, get_datetime, format_date
import json

# =============================================================================
# Permission Helper Functions
# =============================================================================

def check_user_can_modify_gifts():
    """Check if current user has permission to create or modify gifts"""
    try:
        current_user = frappe.session.user
        if not current_user or current_user == "Guest":
            frappe.throw(_("User not authenticated"))

        # Get user's role from location field
        user_role = frappe.db.get_value("User", current_user, "location")

        # Only Admin and Event Manager can create/modify gifts
        if user_role not in ["Admin", "Event Manager"]:
            frappe.throw(_("Access Denied: You do not have permission to create or modify gifts. Only Admin and Event Manager roles can perform this action."))

        return True

    except Exception as e:
        if "Access Denied" in str(e):
            raise
        frappe.log_error(
            message=f"Error in check_user_can_modify_gifts: {str(e)}",
            title="Permission Check Error",
        )
        frappe.throw(_("Failed to verify user permissions: {0}").format(str(e)))

# =============================================================================
# Gift Dispatch API Methods
# =============================================================================


@frappe.whitelist()
def get_gift_issues(
    page=1,
    limit=20,
    search=None,
    status=None,
    category=None,
    emirates_id=None,
    order_by=None,
    sort_order="desc",
):
    """Get list of gift dispatches with pagination and filters"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build filters
        filters = {}

        # Build search conditions
        search_conditions = ""
        if search:
            search_conditions = """
                AND (
                    gi.owner_full_name LIKE %(search)s OR
                    gi.owner_full_name LIKE %(search)s OR
                    gi.coordinator_full_name LIKE %(search)s OR
                    gi.coordinator_full_name LIKE %(search)s OR
                    gi.emirates_id LIKE %(search)s OR
                    gi.mobile_number LIKE %(search)s OR
                    g.gift_name LIKE %(search)s OR
                    g.category LIKE %(search)s
                )
            """

        # Build filter conditions
        filter_conditions = ""
        if category:
            filter_conditions += " AND g.category = %(category)s"
            filters["category"] = category

        if emirates_id:
            filter_conditions += " AND gi.emirates_id = %(emirates_id)s"
            filters["emirates_id"] = emirates_id

        # Build order by clause
        order_clause = "ORDER BY gi.creation DESC"
        if order_by:
            order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
            if order_by == "creation":
                order_clause = f"ORDER BY gi.creation {order_direction}"
            elif order_by == "date":
                order_clause = f"ORDER BY gi.date {order_direction}"
            elif order_by == "recipient":
                order_clause = f"ORDER BY gi.owner_full_name {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {filter_conditions}
        """

        search_param = f"%{search}%" if search else None
        params = {"search": search_param}
        params.update(filters)

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                gi.name,
                gi.gift,
                gi.gift_name,
                gi.date,
                gi.category,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.person_photo,
                gi.creation,
                gi.modified,
                g.status as gift_status,
                g.barcode_value,
                g.description as gift_description
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {filter_conditions}
            {order_clause}
            LIMIT {start}, {limit}
        """

        issues = frappe.db.sql(data_query, params, as_dict=True)

        # Get full URLs for person photos
        def get_full_url(file_path):
            if not file_path:
                return ""
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path

            # Check if it's a private file
            if file_path.startswith("/private/"):
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                )
            elif file_path.startswith("/files/"):
                return frappe.utils.get_url(file_path)
            else:
                if file_path.startswith("files/"):
                    return frappe.utils.get_url(f"/{file_path}")
                elif file_path.startswith("private/"):
                    return frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                    )
                else:
                    return frappe.utils.get_url(f"/files/{file_path}")

        # Update image URLs and format dates
        for issue in issues:
            if issue.get("person_photo"):
                issue["person_photo"] = get_full_url(issue["person_photo"])

            # Format dates as strings
            for field in ["date", "creation", "modified"]:
                if issue.get(field):
                    issue[field] = str(issue[field])

        return {
            "data": issues,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_issues: {str(e)}",
            title="Gift API - Get Gift Issues Error",
        )
        frappe.throw(_("Failed to fetch gift issues: {0}").format(str(e)))


@frappe.whitelist()
def get_gift_issue(name):
    """Get single gift issue by name"""
    try:
        if not name:
            frappe.throw(_("Gift Issue ID is required"))

        issue = frappe.get_doc("Gift Issue", name)

        if not issue:
            frappe.throw(_("Gift Issue not found"))

        # Convert to dict and format dates
        issue_data = issue.as_dict()

        # Format dates as strings
        for field in ["date", "creation", "modified"]:
            if issue_data.get(field):
                issue_data[field] = str(issue_data[field])

        # Get full URL for person photo
        def get_full_url(file_path):
            if not file_path:
                return ""
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path

            if file_path.startswith("/private/"):
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                )
            elif file_path.startswith("/files/"):
                return frappe.utils.get_url(file_path)
            else:
                if file_path.startswith("files/"):
                    return frappe.utils.get_url(f"/{file_path}")
                elif file_path.startswith("private/"):
                    return frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                    )
                else:
                    return frappe.utils.get_url(f"/files/{file_path}")

        if issue_data.get("person_photo"):
            issue_data["person_photo"] = get_full_url(issue_data["person_photo"])

        # Get gift details
        if issue_data.get("gift"):
            gift_data = frappe.get_doc("Gift", issue_data["gift"]).as_dict()
            issue_data["gift_details"] = {
                "name": gift_data["name"],
                "gift_name": gift_data["gift_name"],
                "category": gift_data["category"],
                "description": gift_data["description"],
                "barcode_value": gift_data["barcode_value"],
            }

            # Get first gift image if available
            if gift_data.get("gift_images") and len(gift_data["gift_images"]) > 0:
                first_image = gift_data["gift_images"][0].get("image")
                if first_image:
                    issue_data["gift_details"]["first_image"] = get_full_url(
                        first_image
                    )

        return issue_data

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_issue: {str(e)}",
            title="Gift API - Get Gift Issue Error",
        )
        frappe.throw(_("Failed to fetch gift issue: {0}").format(str(e)))


@frappe.whitelist()
def validate_emirates_id(emirates_id):
    """Validate Emirates ID format - Emirates ID is now optional"""
    try:
        # If no Emirates ID provided, that's okay now
        if not emirates_id or not emirates_id.strip():
            return {
                "valid": True,
                "formatted_id": "",
                "message": _("Emirates ID is optional"),
            }

        # Remove any formatting characters
        cleaned_id = emirates_id.replace("-", "").replace(" ", "")

        # Check if the Emirates ID follows the correct format (15 digits)
        if not cleaned_id.isdigit() or len(cleaned_id) != 15:
            frappe.throw(_("Emirates ID must be 15 digits long"))

        # Check if it starts with 784 (UAE country code)
        if not cleaned_id.startswith("784"):
            frappe.throw(_("Emirates ID must start with 784"))

        # Format the Emirates ID properly
        formatted_id = (
            f"{cleaned_id[:3]}-{cleaned_id[3:7]}-{cleaned_id[7:14]}-{cleaned_id[14:]}"
        )

        # Note: Removed validation that prevented one Emirates ID from having multiple gifts
        # as per business requirement - one Emirates ID can have multiple gifts

        return {
            "valid": True,
            "formatted_id": formatted_id,
            "message": _("Emirates ID is valid"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in validate_emirates_id: {str(e)}",
            title="Gift API - Validate Emirates ID Error",
        )
        return {"valid": False, "error": str(e)}


@frappe.whitelist()
def create_gift_issue(
    gift,
    gift_recipient=None,
    owner_full_name=None,
    coordinator_full_name=None,
    mobile_number=None,
    emirates_id=None,
    person_photo=None,
    date=None,
    address=None,
    documents=None,
):
    """Create new gift issue with updated field requirements"""
    try:
        # Check user permissions for gift modification
        check_user_can_modify_gifts()

        # Validate required fields
        if not gift:
            frappe.throw(_("Gift is required"))

        # If gift_recipient is provided, use it; otherwise create a new one
        if gift_recipient:
            # Fetch recipient details
            recipient_doc = frappe.get_doc("Gift Recipient", gift_recipient)
            owner_full_name = recipient_doc.owner_full_name
            coordinator_full_name = recipient_doc.coordinator_full_name
            mobile_number = recipient_doc.coordinator_mobile_no
            emirates_id = recipient_doc.coordinator_emirates_id
            address = recipient_doc.address
            person_photo = recipient_doc.person_photo
        else:
            # Create new recipient if details are provided
            if not owner_full_name or not owner_full_name.strip():
                frappe.throw(_("Owner full name is required"))
            if not coordinator_full_name or not coordinator_full_name.strip():
                frappe.throw(_("Coordinator full name is required"))
            if not mobile_number or not mobile_number.strip():
                frappe.throw(_("Mobile number is required"))

            # Create new Gift Recipient
            recipient_doc = frappe.get_doc({
                "doctype": "Gift Recipient",
                "owner_full_name": owner_full_name.strip(),
                "coordinator_full_name": coordinator_full_name.strip(),
                "coordinator_mobile_no": mobile_number.strip(),
                "coordinator_emirates_id": emirates_id.strip() if emirates_id else "",
                "address": address.strip() if address else "",
                "person_photo": person_photo
            })
            recipient_doc.insert()
            gift_recipient = recipient_doc.name

        # Validate mobile number format (basic validation)
        cleaned_mobile = mobile_number.replace(" ", "").replace("-", "").replace("+", "")
        if not cleaned_mobile.isdigit() or len(cleaned_mobile) < 8:
            frappe.throw(_("Please enter a valid mobile number"))

        # Validate Emirates ID if provided (optional)
        formatted_emirates_id = ""
        if emirates_id and emirates_id.strip():
            validation_result = validate_emirates_id(emirates_id)
            if not validation_result.get("valid"):
                frappe.throw(validation_result.get("error", "Invalid Emirates ID"))
            formatted_emirates_id = validation_result.get("formatted_id")

        # Create new gift issue document
        issue = frappe.new_doc("Gift Issue")
        issue.update(
            {
                "gift": gift,
                # Required new fields
                "gift_recipient": gift_recipient,
                "owner_full_name": owner_full_name.strip(),
                "coordinator_full_name": coordinator_full_name.strip(),
                "mobile_number": mobile_number.strip(),
                # Optional fields
                "emirates_id": formatted_emirates_id,
                "address": address.strip() if address else "",
                "person_photo": person_photo,
                "date": date or frappe.utils.today(),
            }
        )

        # Add documents if provided
        if documents:
            if isinstance(documents, str):
                documents = json.loads(documents)

            for doc in documents:
                if doc.get("document_type") and doc.get("document_attachment"):
                    issue.append(
                        "documents",
                        {
                            "document_type": doc.get("document_type"),
                            "document_attachment": doc.get("document_attachment"),
                            "description": doc.get("description", ""),
                        },
                    )

        issue.insert()

        return {"name": issue.name, "message": _("Gift dispatched successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in create_gift_issue: {str(e)}",
            title="Gift API - Create Gift Issue Error",
        )
        frappe.throw(_("Failed to create gift issue: {0}").format(str(e)))


@frappe.whitelist()
def update_gift_issue(
    name,
    owner_full_name=None,
    coordinator_full_name=None,
    emirates_id=None,
    mobile_number=None,
    person_photo=None,
    date=None,
    address=None,
    documents=None,
):
    """Update existing gift issue"""
    try:
        if not name:
            frappe.throw(_("Gift Issue ID is required"))

        issue = frappe.get_doc("Gift Issue", name)

        # Update fields if provided
        if owner_full_name is not None:
            issue.owner_full_name = owner_full_name
        if owner_full_name is not None:
            issue.owner_full_name = owner_full_name
        if coordinator_full_name is not None:
            issue.coordinator_full_name = coordinator_full_name
        if coordinator_full_name is not None:
            issue.coordinator_full_name = coordinator_full_name
        if address is not None:
            issue.address = address
        if emirates_id is not None:
            issue.emirates_id = emirates_id
        if mobile_number is not None:
            issue.mobile_number = mobile_number
        if person_photo is not None:
            issue.person_photo = person_photo
        if date is not None:
            issue.date = date

        # Update documents if provided
        if documents is not None:
            if isinstance(documents, str):
                documents = json.loads(documents)

            # Clear existing documents
            issue.documents = []

            # Add new documents
            for doc in documents:
                if doc.get("document_type") and doc.get("document_attachment"):
                    issue.append(
                        "documents",
                        {
                            "document_type": doc.get("document_type"),
                            "document_attachment": doc.get("document_attachment"),
                            "description": doc.get("description", ""),
                        },
                    )

        issue.save()

        return {"name": issue.name, "message": _("Gift issue updated successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_gift_issue: {str(e)}",
            title="Gift API - Update Gift Issue Error",
        )
        frappe.throw(_("Failed to update gift issue: {0}").format(str(e)))


@frappe.whitelist()
def delete_gift_issue(name):
    """Delete gift issue (this will also revert gift status)"""
    try:
        if not name:
            frappe.throw(_("Gift Issue ID is required"))

        issue = frappe.get_doc("Gift Issue", name)

        # Delete the document (this will trigger on_trash method to revert gift status)
        issue.delete()

        return {"message": _("Gift issue deleted successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in delete_gift_issue: {str(e)}",
            title="Gift API - Delete Gift Issue Error",
        )
        frappe.throw(_("Failed to delete gift issue: {0}").format(str(e)))


@frappe.whitelist()
def get_gift_dispatch_history(gift_id):
    """Get dispatch history for a specific gift by gift ID"""
    try:
        if not gift_id:
            frappe.throw(_("Gift ID is required"))

        # Fetch all Gift Issue records for this gift
        dispatch_history = frappe.db.sql(
            """
            SELECT
                gi.name,
                gi.date,
                gi.status,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.person_photo,
                gi.delivery_note,
                gi.delivery_description,
                gi.delivery_date,
                gi.creation,
                gi.modified
            FROM `tabGift Issue` gi
            WHERE gi.gift = %(gift_id)s AND gi.docstatus != 2
            ORDER BY gi.creation DESC
        """,
            {"gift_id": gift_id},
            as_dict=True,
        )

        # Get full URLs for person photos
        def get_full_url(file_path):
            if not file_path:
                return ""

            # If it's already a full URL, return as is
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path

            # Handle different file path formats
            if file_path.startswith("/files/"):
                return frappe.utils.get_url(file_path)
            elif file_path.startswith("files/"):
                return frappe.utils.get_url(f"/{file_path}")
            elif file_path.startswith("/private/"):
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                )
            elif file_path.startswith("private/"):
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                )
            else:
                return frappe.utils.get_url(f"/files/{file_path}")

        # Update image URLs and format dates
        for issue in dispatch_history:
            if issue.get("person_photo"):
                issue["person_photo"] = get_full_url(issue["person_photo"])

            # Format dates as strings
            for field in ["date", "delivery_date", "creation", "modified"]:
                if issue.get(field):
                    issue[field] = str(issue[field])

        return {"dispatch_history": dispatch_history, "total": len(dispatch_history)}

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_dispatch_history: {str(e)}",
            title="Gift API - Get Gift Dispatch History Error",
        )
        frappe.throw(_("Failed to fetch gift dispatch history: {0}").format(str(e)))


@frappe.whitelist()
def update_gift_delivery_status(
    issue_name,
    status,
    delivery_note=None,
    delivery_description=None,
    delivery_date=None,
):
    """Update delivery status and information for a gift issue"""
    try:
        if not issue_name:
            frappe.throw(_("Gift Issue ID is required"))

        if not status:
            frappe.throw(_("Status is required"))

        if status not in ["Dispatched", "Delivered"]:
            frappe.throw(_("Invalid status. Must be 'Dispatched' or 'Delivered'"))

        issue = frappe.get_doc("Gift Issue", issue_name)

        # Update status
        issue.status = status

        # Update delivery information if status is Delivered
        if status == "Delivered":
            if delivery_note:
                issue.delivery_note = delivery_note
            if delivery_description:
                issue.delivery_description = delivery_description
            if delivery_date:
                issue.delivery_date = delivery_date
            else:
                issue.delivery_date = nowdate()

        issue.save()

        return {
            "name": issue.name,
            "status": issue.status,
            "message": _("Delivery status updated successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_gift_delivery_status: {str(e)}",
            title="Gift API - Update Gift Delivery Status Error",
        )
        frappe.throw(_("Failed to update delivery status: {0}").format(str(e)))


# =============================================================================
# Gift API Methods
# =============================================================================


@frappe.whitelist()
def get_gifts(
    page=1,
    limit=20,
    search=None,
    status=None,
    category=None,
    order_by=None,
    sort_order="desc",
):
    """Get list of gifts with pagination and filters"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build filters
        filters = {}
        if status:
            filters["status"] = status
        if category:
            filters["category"] = category

        # Build search conditions
        search_conditions = ""
        if search:
            search_conditions = """
                AND (
                    gift_name LIKE %(search)s OR
                    barcode_value LIKE %(search)s OR
                    description LIKE %(search)s OR
                    category LIKE %(search)s
                )
            """

        # Build filter conditions
        filter_conditions = ""
        for key, value in filters.items():
            filter_conditions += f" AND {key} = %({key})s"

        # Build order by clause
        order_clause = "ORDER BY creation DESC"
        if order_by:
            order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
            order_clause = f"ORDER BY {order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift`
            WHERE docstatus != 2
            {search_conditions}
            {filter_conditions}
        """

        search_param = f"%{search}%" if search else None
        params = {"search": search_param}
        params.update(filters)

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                name,
                gift_name,
                gift_id,
                description,
                category,
                status,
                barcode_value,
                barcode,
                import_barcode,
                owner_full_name,
                emirates_id,
                mobile_number,
                issued_date,
                person_photo,
                gender,
                breed,
                weight,
                farm_name,
                creation,
                modified,
                owner
            FROM `tabGift`
            WHERE docstatus != 2
            {search_conditions}
            {filter_conditions}
            {order_clause}
            LIMIT {start}, {limit}
        """

        gifts = frappe.db.sql(data_query, params, as_dict=True)

        # Get images for each gift
        for gift in gifts:
            # Get gift images from child table
            gift_images = frappe.db.sql(
                """
                SELECT image
                FROM `tabGift Images`
                WHERE parent = %(gift_name)s AND parenttype = 'Gift'
                ORDER BY idx
            """,
                {"gift_name": gift.name},
                as_dict=True,
            )

            # Add full URLs for images
            def get_full_url(file_path):
                if not file_path:
                    return ""
                if file_path.startswith("http://") or file_path.startswith("https://"):
                    return file_path

                # Check if it's a private file
                if file_path.startswith("/private/"):
                    # For private files, use the download API endpoint
                    return frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                    )
                elif file_path.startswith("/files/"):
                    return frappe.utils.get_url(file_path)
                else:
                    # Handle both private and public files
                    if file_path.startswith("files/"):
                        return frappe.utils.get_url(f"/{file_path}")
                    elif file_path.startswith("private/"):
                        return frappe.utils.get_url(
                            f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                        )
                    else:
                        # Default to files directory
                        return frappe.utils.get_url(f"/files/{file_path}")

            # Update image URLs
            for image in gift_images:
                if image.get("image"):
                    image["image"] = get_full_url(image["image"])

            # Add images to gift data
            gift["images"] = gift_images

        # Format data
        for gift in gifts:
            if gift.get("issued_date"):
                gift["issued_date"] = str(gift["issued_date"])
            if gift.get("creation"):
                gift["creation"] = str(gift["creation"])
            if gift.get("modified"):
                gift["modified"] = str(gift["modified"])

        return {
            "data": gifts,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gifts: {str(e)}", title="Gift API - Get Gifts Error"
        )
        frappe.throw(_("Failed to fetch gifts: {0}").format(str(e)))


@frappe.whitelist()
def get_gift(name):
    """Get single gift by name"""
    try:
        if not name:
            frappe.throw(_("Gift Code is required"))

        gift = frappe.get_doc("Gift", name)

        if not gift:
            frappe.throw(_("Gift not found"))

        # Convert to dict and format dates
        gift_data = gift.as_dict()

        # Format dates as strings
        for field in ["issued_date", "creation", "modified"]:
            if gift_data.get(field):
                gift_data[field] = str(gift_data[field])

        # Add full URLs for images
        def get_full_url(file_path):
            if not file_path:
                return ""
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path

            # Check if it's a private file
            if file_path.startswith("/private/"):
                # For private files, use the download API endpoint
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                )
            elif file_path.startswith("/files/"):
                return frappe.utils.get_url(file_path)
            else:
                # Handle both private and public files
                if file_path.startswith("files/"):
                    return frappe.utils.get_url(f"/{file_path}")
                elif file_path.startswith("private/"):
                    return frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                    )
                else:
                    # Default to files directory
                    return frappe.utils.get_url(f"/files/{file_path}")

        # Update image URLs in gift_images
        if gift_data.get("gift_images"):
            for image in gift_data["gift_images"]:
                if image.get("image"):
                    image["image"] = get_full_url(image["image"])

        return gift_data

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift: {str(e)}", title="Gift API - Get Gift Error"
        )
        frappe.throw(_("Failed to fetch gift: {0}").format(str(e)))


@frappe.whitelist()
def create_gift(
    gift_name,
    gift_id=None,
    category=None,
    gender=None,
    breed=None,
    weight=None,
    farm_name=None,
    gift_images=[],
    gift_additional_attributes=[],
    description=None,
    import_barcode=False,
    barcode_value=None,
):
    """Create new gift"""
    try:
        # Check user permissions first
        check_user_can_modify_gifts()

        if not gift_name:
            frappe.throw(_("Gift Name is required"))

        # Validate import_barcode requirements
        if import_barcode and not barcode_value:
            frappe.throw(_("Barcode ID is required when Import Barcode is checked"))

        # Parse JSON strings if they are received as strings
        if isinstance(gift_additional_attributes, str):
            try:
                gift_additional_attributes = json.loads(gift_additional_attributes)
            except (json.JSONDecodeError, TypeError):
                gift_additional_attributes = []

        if isinstance(gift_images, str):
            try:
                gift_images = json.loads(gift_images)
            except (json.JSONDecodeError, TypeError):
                gift_images = []

        # Create new gift document
        gift = frappe.new_doc("Gift")
        gift.update(
            {
                "gift_name": gift_name,
                "gift_id": gift_id,
                "category": category,
                "description": description or "",
                "status": "Available",
                "import_barcode": import_barcode,
                "barcode_value": barcode_value if import_barcode else None,
                "gender": gender,
                "breed": breed,
                "weight": weight,
                "farm_name": farm_name,
            }
        )

        # Add additional attributes if provided
        if gift_additional_attributes is not None:
            if isinstance(gift_additional_attributes, list):
                for attr in gift_additional_attributes:
                    if attr.get("attribute_name") and attr.get("attribute_value"):
                        gift.append(
                            "gift_additional_attributes",
                            {
                                "attribute_name": attr.get("attribute_name"),
                                "attribute_value": attr.get("attribute_value"),
                            },
                        )

        # Add images if provided
        if gift_images is not None:
            if isinstance(gift_images, list):
                for img in gift_images:
                    image_url = None
                    # Handle different image data structures
                    if isinstance(img, str):
                        image_url = img
                    elif isinstance(img, dict):
                        image_url = (
                            img.get("image") or img.get("file_url") or img.get("url")
                        )

                    if image_url:
                        gift.append("gift_images", {"image": image_url})

        gift.insert()

        return {
            "name": gift.name,
            "gift_id": gift.gift_id,
            "barcode_value": gift.barcode_value,
            "message": _("Gift created successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in create_gift: {str(e)}",
            title="Gift API - Create Gift Error",
        )
        frappe.throw(_("Failed to create gift: {0}").format(str(e)))


@frappe.whitelist()
def update_gift(
    name,
    gift_name=None,
    gift_id=None,
    category=None,
    description=None,
    gift_additional_attributes=None,
    gift_images=None,
    gender=None,
    breed=None,
    weight=None,
    farm_name=None,
):
    """Update existing gift"""
    try:
        # Check user permissions first
        check_user_can_modify_gifts()

        if not name:
            frappe.throw(_("Gift Code is required"))

        gift = frappe.get_doc("Gift", name)

        # Update fields if provided
        if gift_name is not None:
            gift.gift_name = gift_name
        if gift_id is not None:
            gift.gift_id = gift_id
        if category is not None:
            gift.category = category
        if description is not None:
            gift.description = description
        if gender is not None:
            gift.gender = gender
        if breed is not None:
            gift.breed = breed
        if weight is not None:
            gift.weight = weight
        if farm_name is not None:
            gift.farm_name = farm_name
        # Note: import_barcode and barcode_value are not updateable after creation

        # Update table fields if provided
        if gift_additional_attributes is not None:
            gift.set("gift_additional_attributes", [])
            if isinstance(gift_additional_attributes, list):
                for attr in gift_additional_attributes:
                    if attr.get("attribute_name") and attr.get("attribute_value"):
                        gift.append(
                            "gift_additional_attributes",
                            {
                                "attribute_name": attr.get("attribute_name"),
                                "attribute_value": attr.get("attribute_value"),
                            },
                        )

        if gift_images is not None:
            gift.set("gift_images", [])
            if isinstance(gift_images, list):
                for img in gift_images:
                    image_url = None
                    # Handle different image data structures
                    if isinstance(img, str):
                        image_url = img
                    elif isinstance(img, dict):
                        image_url = (
                            img.get("image") or img.get("file_url") or img.get("url")
                        )

                    if image_url:
                        gift.append("gift_images", {"image": image_url})

        gift.save()

        return {"name": gift.name, "message": _("Gift updated successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_gift: {str(e)}",
            title="Gift API - Update Gift Error",
        )
        frappe.throw(_("Failed to update gift: {0}").format(str(e)))


@frappe.whitelist()
def delete_gift(name):
    """Delete gift (cancel document)"""
    try:
        # Check user permissions first
        check_user_can_modify_gifts()

        if not name:
            frappe.throw(_("Gift Code is required"))

        gift = frappe.get_doc("Gift", name)

        # Check if gift is issued
        if gift.status == "Issued":
            frappe.throw(_("Cannot delete an issued gift"))

        # Cancel the document instead of deleting
        gift.cancel()

        return {"message": _("Gift deleted successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in delete_gift: {str(e)}",
            title="Gift API - Delete Gift Error",
        )
        frappe.throw(_("Failed to delete gift: {0}").format(str(e)))


@frappe.whitelist()
def get_gift_by_code(barcode_value):
    """Get gift by barcode value only"""
    try:
        if not barcode_value:
            frappe.throw(_("Barcode value is required"))

        # Search only by barcode_value
        gift = frappe.db.get_value(
            "Gift",
            {"barcode_value": barcode_value, "docstatus": ["!=", 2]},
            [
                "name",
                "gift_name",
                "category",
                "status",
                "barcode_value",
                "owner_full_name",
                "issued_date",
                "gender",
                "breed",
                "weight",
                "farm_name",
            ],
            as_dict=True,
        )

        if not gift:
            frappe.throw(_("No gift found with this code"))

        # Format dates
        for field in ["issued_date"]:
            if gift.get(field):
                gift[field] = str(gift[field])

        return gift

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_by_code: {str(e)}",
            title="Gift API - Get Gift By Code Error",
        )
        frappe.throw(_("Failed to fetch gift by code: {0}").format(str(e)))


@frappe.whitelist()
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Get counts by status
        total_gifts = frappe.db.count("Gift", {"docstatus": ["!=", 2]})
        available_gifts = frappe.db.count(
            "Gift", {"status": "Available", "docstatus": ["!=", 2]}
        )
        issued_gifts = frappe.db.count(
            "Gift", {"status": "Issued", "docstatus": ["!=", 2]}
        )

        total_value = 0

        issued_value = 0

        # Get recent activities (last 10 gift issues)
        recent_issues = frappe.db.sql(
            """
            SELECT
                name,
                gift_name,
                barcode_value,
                owner_full_name,
                owner_full_name,
                mobile_number,
                issued_date,
                creation
            FROM `tabGift`
            WHERE status = 'Issued' AND docstatus != 2
            ORDER BY creation DESC
            LIMIT 10
        """,
            as_dict=True,
        )

        # Format dates in recent issues
        for issue in recent_issues:
            if issue.get("issued_date"):
                issue["issued_date"] = str(issue["issued_date"])
            if issue.get("creation"):
                issue["creation"] = str(issue["creation"])

        return {
            "totals": {
                "total_gifts": total_gifts,
                "available_gifts": available_gifts,
                "issued_gifts": issued_gifts,
                "total_value": total_value,
                "issued_value": issued_value,
            },
            "recent_activities": recent_issues,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_dashboard_stats: {str(e)}",
            title="Gift API - Get Dashboard Stats Error",
        )
        frappe.throw(_("Failed to fetch dashboard statistics: {0}").format(str(e)))


@frappe.whitelist()
def get_user_stats():
    """Get user-specific statistics for profile"""
    try:
        current_user = frappe.session.user
        if not current_user or current_user == "Guest":
            frappe.throw(_("User not authenticated"))

        # Get gifts created by current user
        gifts_created = frappe.db.count(
            "Gift", {"owner": current_user, "docstatus": ["!=", 2]}
        )

        # Get gifts issued (from Gift Issue doctype)
        gifts_issued = frappe.db.count(
            "Gift Issue", {"owner": current_user, "docstatus": ["!=", 2]}
        )

        # Get user last login information
        user_doc = frappe.get_doc("User", current_user)
        last_login = user_doc.last_login

        # Format last login date
        formatted_last_login = None
        if last_login:
            formatted_last_login = str(last_login)

        return {
            "gifts_created": gifts_created,
            "gifts_issued": gifts_issued,
            "last_login": formatted_last_login,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_user_stats: {str(e)}",
            title="Gift API - Get User Stats Error",
        )
        frappe.throw(_("Failed to fetch user statistics: {0}").format(str(e)))


@frappe.whitelist()
def update_user_profile(full_name=None, phone=None, bio=None, birth_date=None):
    """Update user profile information"""
    try:
        current_user = frappe.session.user
        if not current_user or current_user == "Guest":
            frappe.throw(_("User not authenticated"))

        # Get the user document
        user_doc = frappe.get_doc("User", current_user)

        # Update fields if provided
        if full_name is not None:
            # Split full name into first and last name
            name_parts = full_name.strip().split(" ", 1)
            user_doc.first_name = name_parts[0] if name_parts else ""
            user_doc.last_name = name_parts[1] if len(name_parts) > 1 else ""
            user_doc.full_name = full_name

        if phone is not None:
            user_doc.phone = phone

        if bio is not None:
            user_doc.bio = bio

        if birth_date is not None:
            # Validate and format birth date
            if birth_date:
                from frappe.utils import getdate

                user_doc.birth_date = getdate(birth_date)
            else:
                user_doc.birth_date = None

        # Save the user document
        user_doc.save(ignore_permissions=True)

        return {
            "message": _("Profile updated successfully"),
            "user": {
                "full_name": user_doc.full_name,
                "first_name": user_doc.first_name,
                "last_name": user_doc.last_name,
                "email": user_doc.email,
                "phone": user_doc.phone,
                "bio": user_doc.bio,
                "birth_date": str(user_doc.birth_date) if user_doc.birth_date else None,
            },
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_user_profile: {str(e)}",
            title="Gift API - Update User Profile Error",
        )
        frappe.throw(_("Failed to update user profile: {0}").format(str(e)))


@frappe.whitelist()
def get_user_profile():
    """Get current user profile information"""
    try:
        current_user = frappe.session.user
        if not current_user or current_user == "Guest":
            frappe.throw(_("User not authenticated"))

        # Get the user document
        user_doc = frappe.get_doc("User", current_user)

        return {
            "user": {
                "full_name": user_doc.full_name,
                "first_name": user_doc.first_name,
                "last_name": user_doc.last_name,
                "email": user_doc.email,
                "phone": user_doc.phone,
                "bio": user_doc.bio,
                "birth_date": str(user_doc.birth_date) if user_doc.birth_date else None,
                "last_login": str(user_doc.last_login) if user_doc.last_login else None,
                "user_image": user_doc.user_image,
            }
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_user_profile: {str(e)}",
            title="Gift API - Get User Profile Error",
        )
        frappe.throw(_("Failed to fetch user profile: {0}").format(str(e)))


@frappe.whitelist()
def issue_gift(
    name,
    gift_recipient=None,
    owner_full_name=None,
    coordinator_full_name=None,
    emirates_id=None,
    mobile_number=None,
    person_photo=None,
    address=None,
):
    """Issue a gift to a person"""
    try:
        # Check user permissions for gift modification
        check_user_can_modify_gifts()

        # Check if gift exists and is available
        gift = frappe.get_doc("Gift", name)
        if gift.status != "Available":
            frappe.throw(_("Gift is not available for issuing"))

        # If gift_recipient is provided, use it; otherwise create a new one
        if gift_recipient:
            # Fetch recipient details
            recipient_doc = frappe.get_doc("Gift Recipient", gift_recipient)
            owner_full_name = recipient_doc.owner_full_name
            coordinator_full_name = recipient_doc.coordinator_full_name
            mobile_number = recipient_doc.coordinator_mobile_no
            emirates_id = recipient_doc.coordinator_emirates_id
            address = recipient_doc.address
            person_photo = recipient_doc.person_photo
        else:
            # Create new recipient if details are provided
            if not owner_full_name or not coordinator_full_name or not mobile_number:
                frappe.throw(_("Owner Full Name, Coordinator Full Name, and Mobile Number are required"))

            # Create new Gift Recipient
            recipient_doc = frappe.get_doc({
                "doctype": "Gift Recipient",
                "owner_full_name": owner_full_name.strip(),
                "coordinator_full_name": coordinator_full_name.strip(),
                "coordinator_mobile_no": mobile_number.strip(),
                "coordinator_emirates_id": emirates_id.strip() if emirates_id else "",
                "address": address.strip() if address else "",
                "person_photo": person_photo
            })
            recipient_doc.insert()
            gift_recipient = recipient_doc.name

        # Update gift with issue details
        gift.status = "Issued"
        gift.gift_recipient = gift_recipient
        gift.owner_full_name = owner_full_name
        gift.coordinator_full_name = coordinator_full_name
        gift.address = address
        gift.emirates_id = emirates_id
        gift.mobile_number = mobile_number
        gift.issued_date = nowdate()
        if person_photo:
            gift.person_photo = person_photo

        gift.save()

        return {
            "name": gift.name,
            "barcode_value": gift.barcode_value,
            "message": _("Gift dispatched successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in issue_gift: {str(e)}",
            title="Gift API - Dispatch Gift Error",
        )
        frappe.throw(_("Failed to dispatch gift: {0}").format(str(e)))


# =============================================================================
# Document Event Hooks
# =============================================================================


def generate_gift_code(doc, method):
    """Generate unique gift code before insert"""
    if not doc.barcode_value:
        import string
        import secrets

        # Generate a random 8-character code
        alphabet = string.ascii_uppercase + string.digits
        doc.barcode_value = "".join(secrets.choice(alphabet) for i in range(8))

        # Ensure uniqueness
        while frappe.db.exists("Gift", {"barcode_value": doc.barcode_value}):
            doc.barcode_value = "".join(secrets.choice(alphabet) for i in range(8))


def validate_gift(doc, method):
    """Validate gift document"""
    # Check if barcode value is unique
    if doc.barcode_value:
        existing = frappe.db.get_value(
            "Gift",
            {"barcode_value": doc.barcode_value, "name": ["!=", doc.name]},
            "name",
        )
        if existing:
            frappe.throw(_("Barcode ID {0} already exists").format(doc.barcode_value))


def update_expired_gifts():
    """Daily scheduled task to update expired gifts - not needed for this doctype"""
    pass


# =============================================================================
# Utility Methods
# =============================================================================


@frappe.whitelist()
def get_categories():
    """Get list of gift categories"""
    try:
        categories = frappe.db.sql(
            """
            SELECT name, category_name
            FROM `tabGift Category`
            WHERE docstatus != 2
            ORDER BY category_name
        """,
            as_list=True,
        )

        return [{"name": cat[0], "category_name": cat[1]} for cat in categories]

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_categories: {str(e)}",
            title="Gift API - Get Categories Error",
        )
        frappe.throw(_("Failed to fetch categories: {0}").format(str(e)))


@frappe.whitelist()
def get_currencies():
    """Get list of available currencies"""
    try:
        # Get enabled currencies from ERPNext
        currencies = frappe.db.sql(
            """
            SELECT currency_code, currency_name
            FROM `tabCurrency`
            WHERE enabled = 1
            ORDER BY currency_code
        """,
            as_dict=True,
        )

        return currencies

    except Exception as e:
        # Fallback to common currencies
        return [
            {"currency_code": "AED", "currency_name": "UAE Dirham"},
            {"currency_code": "USD", "currency_name": "US Dollar"},
            {"currency_code": "EUR", "currency_name": "Euro"},
            {"currency_code": "GBP", "currency_name": "British Pound"},
        ]


@frappe.whitelist()
def regenerate_gift_barcode(name):
    """Regenerate barcode for a gift"""
    try:
        if not name:
            frappe.throw(_("Gift Code is required"))

        gift = frappe.get_doc("Gift", name)

        if not gift:
            frappe.throw(_("Gift not found"))

        # Regenerate barcode using the existing barcode_value
        if gift.barcode_value:
            gift.create_barcode_image()
            gift.save()

            # Get full URL for barcode image
            barcode_url = gift.barcode
            if barcode_url and not barcode_url.startswith("http"):
                if barcode_url.startswith("/private/"):
                    barcode_url = frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url={barcode_url}"
                    )
                elif barcode_url.startswith("/files/"):
                    barcode_url = frappe.utils.get_url(barcode_url)
                else:
                    if barcode_url.startswith("files/"):
                        barcode_url = frappe.utils.get_url(f"/{barcode_url}")
                    elif barcode_url.startswith("private/"):
                        barcode_url = frappe.utils.get_url(
                            f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{barcode_url}"
                        )
                    else:
                        barcode_url = frappe.utils.get_url(f"/files/{barcode_url}")

            return {
                "name": gift.name,
                "barcode": barcode_url,
                "barcode_value": gift.barcode_value,
                "message": _("Barcode regenerated successfully"),
            }
        else:
            frappe.throw(_("No barcode value found for this gift"))

    except Exception as e:
        frappe.log_error(
            message=f"Error in regenerate_gift_barcode: {str(e)}",
            title="Gift API - Regenerate Barcode Error",
        )
        frappe.throw(_("Failed to regenerate barcode: {0}").format(str(e)))


@frappe.whitelist()
def update_gift_barcode(gift_id, update_type, new_barcode_value=None):
    """Update barcode value for a gift"""
    try:
        # Check user permissions first
        check_user_can_modify_gifts()

        if not gift_id:
            frappe.throw(_("Gift Code is required"))

        if not update_type or update_type not in ["auto", "manual"]:
            frappe.throw(_("Invalid update type. Must be 'auto' or 'manual'"))

        gift = frappe.get_doc("Gift", gift_id)

        if not gift:
            frappe.throw(_("Gift not found"))

        # Check if gift is available for barcode update
        if gift.status == "Issued":
            frappe.throw(_("Cannot update barcode for issued gifts"))

        old_barcode_value = gift.barcode_value

        if update_type == "manual":
            if not new_barcode_value or not new_barcode_value.strip():
                frappe.throw(_("New barcode value is required for manual update"))

            # Check if the new barcode value is unique
            existing = frappe.db.get_value(
                "Gift",
                {"barcode_value": new_barcode_value.strip(), "name": ["!=", gift.name]},
                "name",
            )
            if existing:
                frappe.throw(
                    _("Barcode ID '{0}' already exists in gift {1}").format(
                        new_barcode_value.strip(), existing
                    )
                )

            # Update with manual barcode value
            gift.barcode_value = new_barcode_value.strip()
            gift.import_barcode = 1

        elif update_type == "auto":
            # Generate new auto barcode value using gift name
            gift.barcode_value = str(gift.name)
            gift.import_barcode = 0

        # Regenerate barcode image with new value
        gift.create_barcode_image()
        gift.save()

        # Get full URL for barcode image
        barcode_url = gift.barcode
        if barcode_url and not barcode_url.startswith("http"):
            if barcode_url.startswith("/private/"):
                barcode_url = frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={barcode_url}"
                )
            elif barcode_url.startswith("/files/"):
                barcode_url = frappe.utils.get_url(barcode_url)
            else:
                if barcode_url.startswith("files/"):
                    barcode_url = frappe.utils.get_url(f"/{barcode_url}")
                elif barcode_url.startswith("private/"):
                    barcode_url = frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{barcode_url}"
                    )
                else:
                    barcode_url = frappe.utils.get_url(f"/files/{barcode_url}")

        return {
            "name": gift.name,
            "barcode": barcode_url,
            "barcode_value": gift.barcode_value,
            "old_barcode_value": old_barcode_value,
            "message": _("Barcode updated successfully from '{0}' to '{1}'").format(
                old_barcode_value, gift.barcode_value
            ),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_gift_barcode: {str(e)}",
            title="Gift API - Update Barcode Error",
        )
        frappe.throw(_("Failed to update barcode: {0}").format(str(e)))


# =============================================================================
# Gift Interest API Methods
# =============================================================================


@frappe.whitelist()
def get_gift_interests(
    gift=None, page=1, limit=20, search=None, order_by=None, sort_order="desc"
):
    """Get list of gift interests with pagination and filters"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build filters
        filters = {}

        # Build search conditions
        search_conditions = ""
        if search:
            search_conditions = """
                AND (
                    gi.owner_full_name LIKE %(search)s OR
                    gi.owner_full_name LIKE %(search)s OR
                    gi.coordinator_full_name LIKE %(search)s OR
                    gi.coordinator_full_name LIKE %(search)s OR
                    gi.emirates_id LIKE %(search)s OR
                    gi.mobile_number LIKE %(search)s OR
                    g.gift_name LIKE %(search)s OR
                    g.category LIKE %(search)s
                )
            """

        # Build filter conditions
        filter_conditions = ""
        if gift:
            filter_conditions += " AND gi.gift = %(gift)s"
            filters["gift"] = gift

        # Build order by clause
        order_clause = "ORDER BY gi.creation DESC"
        if order_by:
            order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
            if order_by == "creation":
                order_clause = f"ORDER BY gi.creation {order_direction}"
            elif order_by == "date":
                order_clause = f"ORDER BY gi.date {order_direction}"
            elif order_by == "name":
                order_clause = f"ORDER BY gi.owner_full_name {order_direction}, gi.owner_full_name {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Interest` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {filter_conditions}
        """

        search_param = f"%{search}%" if search else None
        params = {"search": search_param}
        params.update(filters)

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                gi.name,
                gi.gift,
                gi.gift_name,
                gi.date,
                gi.category,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.creation,
                gi.modified,
                gi.owner as created_by,
                u.full_name as created_by_name,
                g.status as gift_status,
                g.barcode_value,
                g.description as gift_description
            FROM `tabGift Interest` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {filter_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params["limit"] = limit
        params["start"] = start

        interests = frappe.db.sql(data_query, params, as_dict=True)

        # Format data
        for interest in interests:
            if interest.get("date"):
                interest["date"] = str(interest["date"])
            if interest.get("creation"):
                interest["creation"] = str(interest["creation"])
            if interest.get("modified"):
                interest["modified"] = str(interest["modified"])

        return {
            "data": interests,
            "total": total,
            "page": page,
            "total_pages": (total + limit - 1) // limit,
            "limit": limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_interests: {str(e)}",
            title="Gift Interest API - Get List Error",
        )
        frappe.throw(_("Failed to fetch gift interests: {0}").format(str(e)))


@frappe.whitelist()
def get_gift_interest(name):
    """Get single gift interest by name"""
    try:
        if not name:
            frappe.throw(_("Gift Interest ID is required"))

        interest = frappe.get_doc("Gift Interest", name)

        if not interest:
            frappe.throw(_("Gift Interest not found"))

        # Convert to dict and format dates
        interest_data = interest.as_dict()

        # Format dates as strings
        for field in ["date", "creation", "modified"]:
            if interest_data.get(field):
                interest_data[field] = str(interest_data[field])

        # Get gift details
        if interest_data.get("gift"):
            gift_data = frappe.get_doc("Gift", interest_data["gift"]).as_dict()
            interest_data["gift_details"] = {
                "name": gift_data["name"],
                "gift_name": gift_data["gift_name"],
                "category": gift_data["category"],
                "status": gift_data["status"],
                "barcode_value": gift_data["barcode_value"],
                "description": gift_data["description"],
            }

        return interest_data

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_gift_interest: {str(e)}",
            title="Gift Interest API - Get Single Error",
        )
        frappe.throw(_("Failed to fetch gift interest: {0}").format(str(e)))


@frappe.whitelist()
def create_gift_interest(
    gift,
    owner_full_name,
    coordinator_full_name,
    mobile_number,
    emirates_id=None,
    address=None,
    date=None,
):
    """Create new gift interest"""
    try:
        # Validate required fields
        if not gift:
            frappe.throw(_("Gift is required"))
        if not owner_full_name or not owner_full_name.strip():
            frappe.throw(_("Owner first name is required"))
        if not owner_full_name or not owner_full_name.strip():
            frappe.throw(_("Owner last name is required"))
        if not coordinator_full_name or not coordinator_full_name.strip():
            frappe.throw(_("Coordinator first name is required"))
        if not coordinator_full_name or not coordinator_full_name.strip():
            frappe.throw(_("Coordinator last name is required"))
        if not mobile_number or not mobile_number.strip():
            frappe.throw(_("Mobile number is required"))

        # Validate mobile number format (basic validation)
        cleaned_mobile = (
            mobile_number.replace(" ", "").replace("-", "").replace("+", "")
        )
        if not cleaned_mobile.isdigit() or len(cleaned_mobile) < 10:
            frappe.throw(_("Please enter a valid mobile number"))

        # Validate Emirates ID format if provided
        formatted_emirates_id = None
        if emirates_id and emirates_id.strip():
            cleaned_emirates_id = emirates_id.strip().replace("-", "").replace(" ", "")
            if not cleaned_emirates_id.isdigit() or len(cleaned_emirates_id) != 15:
                frappe.throw(_("Emirates ID must be exactly 15 digits"))
            formatted_emirates_id = cleaned_emirates_id

        # Check if gift exists
        if not frappe.db.exists("Gift", gift):
            frappe.throw(_("Gift {0} does not exist").format(gift))

        # Check for duplicate interest from same person for same gift
        existing_interest = frappe.db.exists(
            "Gift Interest",
            {
                "gift": gift,
                "owner_full_name": owner_full_name.strip(),
                "owner_full_name": owner_full_name.strip(),
                "mobile_number": mobile_number.strip(),
                "docstatus": ["!=", 2],
            },
        )

        if existing_interest:
            frappe.throw(
                _("Interest already exists from {0} {1} for this gift").format(
                    owner_full_name.strip(), owner_full_name.strip()
                )
            )

        # Create new gift interest document
        interest = frappe.new_doc("Gift Interest")
        interest.update(
            {
                "gift": gift,
                "owner_full_name": owner_full_name.strip(),
                "owner_full_name": owner_full_name.strip(),
                "coordinator_full_name": coordinator_full_name.strip(),
                "coordinator_full_name": coordinator_full_name.strip(),
                "mobile_number": mobile_number.strip(),
                # Optional fields
                "emirates_id": formatted_emirates_id,
                "address": address.strip() if address else "",
                "date": date or frappe.utils.today(),
            }
        )

        interest.insert()

        return {
            "name": interest.name,
            "message": _("Gift interest recorded successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in create_gift_interest: {str(e)}",
            title="Gift Interest API - Create Error",
        )
        frappe.throw(_("Failed to create gift interest: {0}").format(str(e)))


@frappe.whitelist()
def update_gift_interest(
    name,
    owner_full_name=None,
    coordinator_full_name=None,
    emirates_id=None,
    mobile_number=None,
    address=None,
    date=None,
):
    """Update existing gift interest"""
    try:
        if not name:
            frappe.throw(_("Gift Interest ID is required"))

        interest = frappe.get_doc("Gift Interest", name)

        if not interest:
            frappe.throw(_("Gift Interest not found"))

        # Update fields if provided
        if owner_full_name:
            interest.owner_full_name = owner_full_name.strip()
        if owner_full_name:
            interest.owner_full_name = owner_full_name.strip()
        if coordinator_full_name:
            interest.coordinator_full_name = coordinator_full_name.strip()
        if coordinator_full_name:
            interest.coordinator_full_name = coordinator_full_name.strip()
        if mobile_number:
            # Validate mobile number format
            cleaned_mobile = (
                mobile_number.replace(" ", "").replace("-", "").replace("+", "")
            )
            if not cleaned_mobile.isdigit() or len(cleaned_mobile) < 10:
                frappe.throw(_("Please enter a valid mobile number"))
            interest.mobile_number = mobile_number.strip()

        if (
            emirates_id is not None
        ):  # Allow clearing emirates_id by passing empty string
            if emirates_id.strip():
                # Validate Emirates ID format
                cleaned_emirates_id = (
                    emirates_id.strip().replace("-", "").replace(" ", "")
                )
                if not cleaned_emirates_id.isdigit() or len(cleaned_emirates_id) != 15:
                    frappe.throw(_("Emirates ID must be exactly 15 digits"))
                interest.emirates_id = cleaned_emirates_id
            else:
                interest.emirates_id = ""

        if address is not None:
            interest.address = address.strip()

        if date:
            interest.date = date

        interest.save()

        return {
            "name": interest.name,
            "message": _("Gift interest updated successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_gift_interest: {str(e)}",
            title="Gift Interest API - Update Error",
        )
        frappe.throw(_("Failed to update gift interest: {0}").format(str(e)))


@frappe.whitelist()
def delete_gift_interest(name):
    """Delete gift interest"""
    try:
        if not name:
            frappe.throw(_("Gift Interest ID is required"))

        interest = frappe.get_doc("Gift Interest", name)

        if not interest:
            frappe.throw(_("Gift Interest not found"))

        interest.delete()

        return {"message": _("Gift interest deleted successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in delete_gift_interest: {str(e)}",
            title="Gift Interest API - Delete Error",
        )
        frappe.throw(_("Failed to delete gift interest: {0}").format(str(e)))


# =============================================================================
# Settings API Methods
# =============================================================================


@frappe.whitelist()
def get_settings_categories(
    page=1, limit=20, search=None, order_by="category_name", sort_order="asc"
):
    """Get list of gift categories for settings management"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = ""
        params = {}

        if search:
            search_conditions = " AND category_name LIKE %(search)s"
            params["search"] = f"%{search}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        valid_columns = ["category_name", "creation", "modified"]
        if order_by not in valid_columns:
            order_by = "category_name"
        order_clause = f"ORDER BY {order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Category`
            WHERE docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                name,
                category_name,
                description,
                creation,
                modified,
                owner,
                modified_by
            FROM `tabGift Category`
            WHERE docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        categories = frappe.db.sql(data_query, params, as_dict=True)

        # Format dates and get user names
        for category in categories:
            for field in ["creation", "modified"]:
                if category.get(field):
                    category[field] = str(category[field])

            # Get creator and modifier names
            if category.get("owner"):
                category["creator_name"] = (
                    frappe.db.get_value("User", category["owner"], "full_name")
                    or category["owner"]
                )
            if category.get("modified_by"):
                category["modifier_name"] = (
                    frappe.db.get_value("User", category["modified_by"], "full_name")
                    or category["modified_by"]
                )

        return {
            "data": categories,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_settings_categories: {str(e)}",
            title="Settings API - Get Categories Error",
        )
        frappe.throw(_("Failed to fetch categories: {0}").format(str(e)))


@frappe.whitelist()
def create_category(category_name, description=None):
    """Create new gift category"""
    try:
        if not category_name or not category_name.strip():
            frappe.throw(_("Category Name is required"))

        # Check if category already exists
        if frappe.db.exists("Gift Category", {"category_name": category_name.strip()}):
            frappe.throw(
                _("Category '{0}' already exists").format(category_name.strip())
            )

        # Create new category
        category = frappe.new_doc("Gift Category")
        category.update(
            {
                "category_name": category_name.strip(),
                "description": description.strip() if description else "",
            }
        )

        category.insert()

        return {
            "name": category.name,
            "category_name": category.category_name,
            "message": _("Category created successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in create_category: {str(e)}",
            title="Settings API - Create Category Error",
        )
        frappe.throw(_("Failed to create category: {0}").format(str(e)))


@frappe.whitelist()
def update_category(name, category_name=None, description=None):
    """Update existing gift category"""
    try:
        if not name:
            frappe.throw(_("Category ID is required"))

        category = frappe.get_doc("Gift Category", name)

        if not category:
            frappe.throw(_("Category not found"))

        # Update fields if provided
        if category_name is not None and category_name.strip():
            # Check if new name already exists (excluding current category)
            existing = frappe.db.get_value(
                "Gift Category",
                {"category_name": category_name.strip(), "name": ["!=", name]},
                "name",
            )
            if existing:
                frappe.throw(
                    _("Category '{0}' already exists").format(category_name.strip())
                )

            category.category_name = category_name.strip()

        if description is not None:
            category.description = description.strip()

        category.save()

        return {
            "name": category.name,
            "category_name": category.category_name,
            "message": _("Category updated successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_category: {str(e)}",
            title="Settings API - Update Category Error",
        )
        frappe.throw(_("Failed to update category: {0}").format(str(e)))


@frappe.whitelist()
def delete_category(name):
    """Delete gift category"""
    try:
        if not name:
            frappe.throw(_("Category ID is required"))

        # Check if category is being used by any gifts
        gifts_using_category = frappe.db.count(
            "Gift", {"category": name, "docstatus": ["!=", 2]}
        )
        if gifts_using_category > 0:
            frappe.throw(
                _("Cannot delete category. It is being used by {0} gift(s)").format(
                    gifts_using_category
                )
            )

        category = frappe.get_doc("Gift Category", name)
        category.delete()

        return {"message": _("Category deleted successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in delete_category: {str(e)}",
            title="Settings API - Delete Category Error",
        )
        frappe.throw(_("Failed to delete category: {0}").format(str(e)))


@frappe.whitelist()
def get_settings_users(
    page=1, limit=20, search=None, order_by="full_name", sort_order="asc"
):
    """Get list of users for settings management"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = " AND enabled = 1 AND user_type = 'System User'"
        params = {}

        if search:
            search_conditions += """
                AND (
                    full_name LIKE %(search)s OR
                    email LIKE %(search)s OR
                    username LIKE %(search)s OR
                    first_name LIKE %(search)s OR
                    last_name LIKE %(search)s
                )
            """
            params["search"] = f"%{search}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        valid_columns = ["full_name", "email", "creation", "last_login"]
        if order_by not in valid_columns:
            order_by = "full_name"
        order_clause = f"ORDER BY {order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabUser`
            WHERE name != 'Administrator' AND name != 'Guest'
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                name,
                email,
                username,
                first_name,
                last_name,
                full_name,
                phone,
                mobile_no,
                location,
                enabled,
                user_type,
                last_login,
                last_active,
                creation,
                modified,
                user_image
            FROM `tabUser`
            WHERE name != 'Administrator' AND name != 'Guest'
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        users = frappe.db.sql(data_query, params, as_dict=True)

        # Get roles for each user and format data
        for user in users:
            # Format dates
            for field in ["last_login", "last_active", "creation", "modified"]:
                if user.get(field):
                    user[field] = str(user[field])

            # Get user roles
            roles = frappe.db.sql(
                """
                SELECT role
                FROM `tabHas Role`
                WHERE parent = %(user)s AND parenttype = 'User'
                ORDER BY role
            """,
                {"user": user["name"]},
                as_list=True,
            )

            user["roles"] = [role[0] for role in roles] if roles else []

            # Get user image URL
            if user.get("user_image"):
                user["user_image"] = frappe.utils.get_url(user["user_image"])

        return {
            "data": users,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_settings_users: {str(e)}",
            title="Settings API - Get Users Error",
        )
        frappe.throw(_("Failed to fetch users: {0}").format(str(e)))


@frappe.whitelist()
def create_user(
    email, first_name, last_name, password, phone=None, mobile_no=None, username=None, location=None
):
    """Create new user with all default roles"""
    try:
        if not email or not email.strip():
            frappe.throw(_("Email is required"))
        if not first_name or not first_name.strip():
            frappe.throw(_("First Name is required"))
        if not last_name or not last_name.strip():
            frappe.throw(_("Last Name is required"))
        if not password or len(password) < 6:
            frappe.throw(_("Password must be at least 6 characters long"))

        # Validate email format
        import re

        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, email.strip()):
            frappe.throw(_("Please enter a valid email address"))

        # Check if user already exists
        if frappe.db.exists("User", email.strip()):
            frappe.throw(
                _("User with email '{0}' already exists").format(email.strip())
            )

        # Create new user
        user = frappe.new_doc("User")
        user.update(
            {
                "email": email.strip(),
                "first_name": first_name.strip(),
                "last_name": last_name.strip(),
                "full_name": f"{first_name.strip()} {last_name.strip()}",
                "username": username.strip() if username else None,
                "phone": phone.strip() if phone else None,
                "mobile_no": mobile_no.strip() if mobile_no else None,
                "location": location.strip() if location else None,  # User Role
                "enabled": 1,
                "user_type": "System User",
                "send_welcome_email": 0,  # Don't send welcome email
                "new_password": password,
            }
        )

        # Insert user first
        user.insert(ignore_permissions=True)

        # Get all available roles (excluding Administrator and Guest)
        all_roles = frappe.db.sql(
            """
            SELECT name
            FROM `tabRole`
            WHERE name NOT IN ('Administrator', 'Guest', 'All')
            AND disabled = 0
            ORDER BY name
        """,
            as_list=True,
        )

        # Add all roles to the user
        for role in all_roles:
            user.append("roles", {"role": role[0]})

        # Save to apply roles
        user.save(ignore_permissions=True)

        return {
            "name": user.name,
            "email": user.email,
            "full_name": user.full_name,
            "message": _("User created successfully with all roles assigned"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in create_user: {str(e)}",
            title="Settings API - Create User Error",
        )
        frappe.throw(_("Failed to create user: {0}").format(str(e)))


@frappe.whitelist()
def update_user(
    name,
    first_name=None,
    last_name=None,
    phone=None,
    mobile_no=None,
    username=None,
    enabled=None,
    location=None,
):
    """Update existing user"""
    try:
        if not name:
            frappe.throw(_("User ID is required"))

        # Prevent updating Administrator
        if name == "Administrator":
            frappe.throw(_("Cannot update Administrator user"))

        user = frappe.get_doc("User", name)

        if not user:
            frappe.throw(_("User not found"))

        # Update fields if provided
        if first_name is not None and first_name.strip():
            user.first_name = first_name.strip()

        if last_name is not None and last_name.strip():
            user.last_name = last_name.strip()

        # Update full name if either first or last name changed
        if first_name is not None or last_name is not None:
            user.full_name = f"{user.first_name} {user.last_name}"

        if phone is not None:
            user.phone = phone.strip() if phone else None

        if mobile_no is not None:
            user.mobile_no = mobile_no.strip() if mobile_no else None

        if username is not None:
            user.username = username.strip() if username else None

        if location is not None:
            user.location = location.strip() if location else None  # User Role

        if enabled is not None:
            user.enabled = cint(enabled)

        user.save(ignore_permissions=True)

        return {
            "name": user.name,
            "email": user.email,
            "full_name": user.full_name,
            "message": _("User updated successfully"),
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_user: {str(e)}",
            title="Settings API - Update User Error",
        )
        frappe.throw(_("Failed to update user: {0}").format(str(e)))


@frappe.whitelist()
def update_user_password(name, new_password):
    """Update user password"""
    try:
        if not name:
            frappe.throw(_("User ID is required"))
        if not new_password or len(new_password) < 6:
            frappe.throw(_("Password must be at least 6 characters long"))

        # Prevent updating Administrator password
        if name == "Administrator":
            frappe.throw(_("Cannot update Administrator password"))

        user = frappe.get_doc("User", name)

        if not user:
            frappe.throw(_("User not found"))

        # Update password
        user.new_password = new_password
        user.save(ignore_permissions=True)

        return {"name": user.name, "message": _("Password updated successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in update_user_password: {str(e)}",
            title="Settings API - Update Password Error",
        )
        frappe.throw(_("Failed to update password: {0}").format(str(e)))


@frappe.whitelist()
def delete_user(name):
    """Delete user (disable instead of actual deletion)"""
    try:
        if not name:
            frappe.throw(_("User ID is required"))

        # Prevent deleting Administrator
        if name == "Administrator":
            frappe.throw(_("Cannot delete Administrator user"))

        user = frappe.get_doc("User", name)

        if not user:
            frappe.throw(_("User not found"))

        # Disable user instead of deleting
        user.enabled = 0
        user.save(ignore_permissions=True)

        return {"message": _("User disabled successfully")}

    except Exception as e:
        frappe.log_error(
            message=f"Error in delete_user: {str(e)}",
            title="Settings API - Delete User Error",
        )
        frappe.throw(_("Failed to delete user: {0}").format(str(e)))


@frappe.whitelist()
def get_available_roles():
    """Get list of available roles for user assignment"""
    try:
        roles = frappe.db.sql(
            """
            SELECT name, role_name
            FROM `tabRole`
            WHERE name NOT IN ('Administrator', 'Guest', 'All')
            AND disabled = 0
            ORDER BY name
        """,
            as_dict=True,
        )

        return roles

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_available_roles: {str(e)}",
            title="Settings API - Get Roles Error",
        )
        frappe.throw(_("Failed to fetch roles: {0}").format(str(e)))


# =============================================================================
# Gift Recipient Settings API Methods
# =============================================================================


@frappe.whitelist()
def get_settings_gift_recipients(
    page=1, limit=20, search=None, order_by="owner_full_name", sort_order="asc"
):
    """Get list of gift recipients for settings management"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 20
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = ""
        params = {}

        if search:
            search_conditions = """
                AND (
                    owner_full_name LIKE %(search)s OR
                    coordinator_full_name LIKE %(search)s OR
                    coordinator_mobile_no LIKE %(search)s OR
                    coordinator_emirates_id LIKE %(search)s OR
                    address LIKE %(search)s
                )
            """
            params["search"] = f"%{search}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        valid_columns = ["owner_full_name", "coordinator_full_name", "creation", "modified"]
        if order_by not in valid_columns:
            order_by = "owner_full_name"
        order_clause = f"ORDER BY {order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Recipient`
            WHERE docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                name,
                owner_full_name,
                coordinator_full_name,
                coordinator_mobile_no,
                coordinator_emirates_id,
                address,
                person_photo,
                creation,
                modified,
                owner,
                modified_by
            FROM `tabGift Recipient`
            WHERE docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        recipients = frappe.db.sql(data_query, params, as_dict=True)

        # Format dates and get user names
        for recipient in recipients:
            for field in ["creation", "modified"]:
                if recipient.get(field):
                    recipient[field] = str(recipient[field])

            # Get creator and modifier names
            if recipient.get("owner"):
                recipient["creator_name"] = (
                    frappe.db.get_value("User", recipient["owner"], "full_name")
                    or recipient["owner"]
                )
            if recipient.get("modified_by"):
                recipient["modifier_name"] = (
                    frappe.db.get_value("User", recipient["modified_by"], "full_name")
                    or recipient["modified_by"]
                )

        return {
            "data": recipients,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_settings_gift_recipients: {str(e)}",
            title="Settings API - Get Gift Recipients Error",
        )
        frappe.throw(_("Failed to fetch gift recipients: {0}").format(str(e)))


@frappe.whitelist()
def create_gift_recipient(
    owner_full_name,
    coordinator_full_name,
    coordinator_mobile_no,
    coordinator_emirates_id=None,
    address=None,
):
    """Create new gift recipient"""
    try:
        if not owner_full_name or not owner_full_name.strip():
            frappe.throw(_("Owner Full Name is required"))

        if not coordinator_full_name or not coordinator_full_name.strip():
            frappe.throw(_("Coordinator Full Name is required"))

        if not coordinator_mobile_no or not coordinator_mobile_no.strip():
            frappe.throw(_("Coordinator Mobile No is required"))

        # Handle file upload for person photo
        person_photo_url = None
        if frappe.form_dict.get("person_photo"):
            try:
                # Handle file upload
                file_doc = frappe.get_doc({
                    "doctype": "File",
                    "attached_to_doctype": "Gift Recipient",
                    "file_name": frappe.form_dict.person_photo.filename,
                    "content": frappe.form_dict.person_photo.file.read(),
                    "is_private": 0
                })
                file_doc.save()
                person_photo_url = file_doc.file_url
            except Exception as file_error:
                frappe.log_error(f"File upload error: {str(file_error)}")
                # Continue without photo if upload fails

        # Create gift recipient document
        recipient_doc = frappe.get_doc({
            "doctype": "Gift Recipient",
            "owner_full_name": owner_full_name.strip(),
            "coordinator_full_name": coordinator_full_name.strip(),
            "coordinator_mobile_no": coordinator_mobile_no.strip(),
            "coordinator_emirates_id": coordinator_emirates_id.strip() if coordinator_emirates_id else None,
            "address": address.strip() if address else None,
            "person_photo": person_photo_url,
        })

        recipient_doc.insert()
        frappe.db.commit()

        return {
            "name": recipient_doc.name,
            "message": "Gift recipient created successfully",
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error in create_gift_recipient: {str(e)}",
            title="Settings API - Create Gift Recipient Error",
        )
        frappe.throw(_("Failed to create gift recipient: {0}").format(str(e)))


@frappe.whitelist()
def update_gift_recipient(
    name,
    owner_full_name=None,
    coordinator_full_name=None,
    coordinator_mobile_no=None,
    coordinator_emirates_id=None,
    address=None,
):
    """Update existing gift recipient"""
    try:
        if not name:
            frappe.throw(_("Gift Recipient name is required"))

        # Get existing document
        recipient_doc = frappe.get_doc("Gift Recipient", name)

        # Update fields if provided
        if owner_full_name is not None:
            if not owner_full_name.strip():
                frappe.throw(_("Owner Full Name cannot be empty"))
            recipient_doc.owner_full_name = owner_full_name.strip()

        if coordinator_full_name is not None:
            if not coordinator_full_name.strip():
                frappe.throw(_("Coordinator Full Name cannot be empty"))
            recipient_doc.coordinator_full_name = coordinator_full_name.strip()

        if coordinator_mobile_no is not None:
            if not coordinator_mobile_no.strip():
                frappe.throw(_("Coordinator Mobile No cannot be empty"))
            recipient_doc.coordinator_mobile_no = coordinator_mobile_no.strip()

        if coordinator_emirates_id is not None:
            recipient_doc.coordinator_emirates_id = coordinator_emirates_id.strip() if coordinator_emirates_id else None

        if address is not None:
            recipient_doc.address = address.strip() if address else None

        # Handle file upload for person photo
        if frappe.form_dict.get("person_photo"):
            try:
                # Handle file upload
                file_doc = frappe.get_doc({
                    "doctype": "File",
                    "attached_to_doctype": "Gift Recipient",
                    "attached_to_name": name,
                    "file_name": frappe.form_dict.person_photo.filename,
                    "content": frappe.form_dict.person_photo.file.read(),
                    "is_private": 0
                })
                file_doc.save()
                recipient_doc.person_photo = file_doc.file_url
            except Exception as file_error:
                frappe.log_error(f"File upload error: {str(file_error)}")
                # Continue without updating photo if upload fails

        recipient_doc.save()
        frappe.db.commit()

        # Trigger update in related doctypes
        update_recipient_in_related_docs(name)

        return {
            "name": recipient_doc.name,
            "message": "Gift recipient updated successfully",
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error in update_gift_recipient: {str(e)}",
            title="Settings API - Update Gift Recipient Error",
        )
        frappe.throw(_("Failed to update gift recipient: {0}").format(str(e)))


@frappe.whitelist()
def delete_gift_recipient(name):
    """Delete gift recipient"""
    try:
        if not name:
            frappe.throw(_("Gift Recipient name is required"))

        # Check if recipient is being used in any Gift Interest or Gift Issue
        interest_count = frappe.db.count("Gift Interest", {"gift_recipient": name, "docstatus": ("!=", 2)})
        issue_count = frappe.db.count("Gift Issue", {"gift_recipient": name, "docstatus": ("!=", 2)})
        gift_count = frappe.db.count("Gift", {"gift_recipient": name, "docstatus": ("!=", 2)})

        if interest_count > 0 or issue_count > 0 or gift_count > 0:
            frappe.throw(
                _("Cannot delete gift recipient. It is being used in {0} gift interest(s), {1} gift issue(s), and {2} gift(s).")
                .format(interest_count, issue_count, gift_count)
            )

        # Get and delete the document
        recipient_doc = frappe.get_doc("Gift Recipient", name)
        recipient_doc.delete()
        frappe.db.commit()

        return {"message": "Gift recipient deleted successfully"}

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            message=f"Error in delete_gift_recipient: {str(e)}",
            title="Settings API - Delete Gift Recipient Error",
        )
        frappe.throw(_("Failed to delete gift recipient: {0}").format(str(e)))


def update_recipient_in_related_docs(recipient_name):
    """Update gift recipient information in all related documents"""
    try:
        # Get the updated recipient data
        recipient = frappe.get_doc("Gift Recipient", recipient_name)

        # Update Gift Interest documents
        gift_interests = frappe.get_all("Gift Interest",
            filters={"gift_recipient": recipient_name, "docstatus": ("!=", 2)},
            fields=["name"]
        )

        for gi in gift_interests:
            interest_doc = frappe.get_doc("Gift Interest", gi.name)
            interest_doc.owner_full_name = recipient.owner_full_name
            interest_doc.coordinator_full_name = recipient.coordinator_full_name
            interest_doc.coordinator_mobile_no = recipient.coordinator_mobile_no
            interest_doc.coordinator_emirates_id = recipient.coordinator_emirates_id
            interest_doc.address = recipient.address
            interest_doc.save()

        # Update Gift Issue documents
        gift_issues = frappe.get_all("Gift Issue",
            filters={"gift_recipient": recipient_name, "docstatus": ("!=", 2)},
            fields=["name"]
        )

        for gi in gift_issues:
            issue_doc = frappe.get_doc("Gift Issue", gi.name)
            issue_doc.owner_full_name = recipient.owner_full_name
            issue_doc.coordinator_full_name = recipient.coordinator_full_name
            issue_doc.coordinator_mobile_no = recipient.coordinator_mobile_no
            issue_doc.coordinator_emirates_id = recipient.coordinator_emirates_id
            issue_doc.address = recipient.address
            issue_doc.person_photo = recipient.person_photo
            issue_doc.save()

        # Update Gift documents that might reference the recipient
        gifts = frappe.get_all("Gift",
            filters={"gift_recipient": recipient_name, "docstatus": ("!=", 2)},
            fields=["name"]
        )

        for gift in gifts:
            gift_doc = frappe.get_doc("Gift", gift.name)
            # Gift doctype only has a link field, so no need to update other fields
            gift_doc.save()

        frappe.db.commit()

    except Exception as e:
        frappe.log_error(
            message=f"Error updating recipient in related docs: {str(e)}",
            title="Gift Recipient Update Propagation Error",
        )
        # Don't throw error here as the main update was successful


# =============================================================================
# Reports API Methods
# =============================================================================


@frappe.whitelist()
def get_interest_shows_report(
    page=1,
    limit=100,
    gift_id=None,
    gift_name=None,
    persona_details=None,
    order_by="creation",
    sort_order="desc",
):
    """Get Interest Shows report - Shows gifts with interest records"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = ""
        params = {}

        if gift_id:
            search_conditions += " AND g.name LIKE %(gift_id)s"
            params["gift_id"] = f"%{gift_id}%"

        if gift_name:
            search_conditions += " AND g.gift_name LIKE %(gift_name)s"
            params["gift_name"] = f"%{gift_name}%"

        if persona_details:
            search_conditions += """
                AND (
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.emirates_id LIKE %(persona_details)s OR
                    gi.mobile_number LIKE %(persona_details)s
                )
            """
            params["persona_details"] = f"%{persona_details}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        order_clause = f"ORDER BY gi.{order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Interest` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                gi.name as interest_id,
                gi.gift,
                g.gift_id,
                g.gift_name,
                g.category,
                g.status as gift_status,
                g.barcode_value,
                gi.date as interest_date,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.creation as created_date,
                gi.owner as created_by,
                u.full_name as creator_name
            FROM `tabGift Interest` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        interests = frappe.db.sql(data_query, params, as_dict=True)

        # Format data
        for interest in interests:
            # Format dates as strings
            for field in ["interest_date", "created_date"]:
                if interest.get(field):
                    interest[field] = str(interest[field])

            # Full name for owner
            interest["owner_full_name"] = (
                f"{interest['owner_full_name']} {interest['owner_full_name']}"
            )
            interest["coordinator_full_name"] = (
                f"{interest['coordinator_full_name']} {interest['coordinator_full_name']}"
            )

        return {
            "data": interests,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_interest_shows_report: {str(e)}",
            title="Reports API - Interest Shows Report Error",
        )
        frappe.throw(_("Failed to fetch interest shows report: {0}").format(str(e)))


@frappe.whitelist()
def get_dispatched_gifts_report(
    page=1,
    limit=100,
    gift_id=None,
    gift_name=None,
    persona_details=None,
    order_by="creation",
    sort_order="desc",
):
    """Get Dispatched Gifts report - Shows all dispatched gifts with details"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = ""
        params = {}

        if gift_id:
            search_conditions += " AND g.name LIKE %(gift_id)s"
            params["gift_id"] = f"%{gift_id}%"

        if gift_name:
            search_conditions += " AND g.gift_name LIKE %(gift_name)s"
            params["gift_name"] = f"%{gift_name}%"

        if persona_details:
            search_conditions += """
                AND (
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.emirates_id LIKE %(persona_details)s OR
                    gi.mobile_number LIKE %(persona_details)s
                )
            """
            params["persona_details"] = f"%{persona_details}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        order_clause = f"ORDER BY gi.{order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                gi.name as dispatch_id,
                gi.gift,
                g.gift_id,
                g.gift_name,
                g.category,
                g.barcode_value,
                gi.date as dispatch_date,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.status as delivery_status,
                gi.delivery_date,
                gi.delivery_note,
                gi.delivery_description,
                gi.creation as created_date,
                gi.owner as created_by,
                u.full_name as creator_name
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        dispatches = frappe.db.sql(data_query, params, as_dict=True)

        # Format data
        for dispatch in dispatches:
            # Format dates as strings
            for field in ["dispatch_date", "delivery_date", "created_date"]:
                if dispatch.get(field):
                    dispatch[field] = str(dispatch[field])

            # Full name for owner
            dispatch["owner_full_name"] = (
                f"{dispatch['owner_full_name']} {dispatch['owner_full_name']}"
            )
            dispatch["coordinator_full_name"] = (
                f"{dispatch['coordinator_full_name']} {dispatch['coordinator_full_name']}"
            )

        return {
            "data": dispatches,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_dispatched_gifts_report: {str(e)}",
            title="Reports API - Dispatched Gifts Report Error",
        )
        frappe.throw(_("Failed to fetch dispatched gifts report: {0}").format(str(e)))


@frappe.whitelist()
def get_pending_delivery_report(
    page=1,
    limit=100,
    gift_id=None,
    gift_name=None,
    persona_details=None,
    order_by="creation",
    sort_order="desc",
):
    """Get Pending Delivery report - Shows dispatched gifts that are yet to be delivered"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = " AND (gi.status IS NULL OR gi.status = 'Dispatched')"  # Only dispatched but not delivered
        params = {}

        if gift_id:
            search_conditions += " AND g.name LIKE %(gift_id)s"
            params["gift_id"] = f"%{gift_id}%"

        if gift_name:
            search_conditions += " AND g.gift_name LIKE %(gift_name)s"
            params["gift_name"] = f"%{gift_name}%"

        if persona_details:
            search_conditions += """
                AND (
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.owner_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.coordinator_full_name LIKE %(persona_details)s OR
                    gi.emirates_id LIKE %(persona_details)s OR
                    gi.mobile_number LIKE %(persona_details)s
                )
            """
            params["persona_details"] = f"%{persona_details}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        order_clause = f"ORDER BY gi.{order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data
        data_query = f"""
            SELECT
                gi.name as dispatch_id,
                gi.gift,
                g.gift_id,
                g.gift_name,
                g.category,
                g.barcode_value,
                gi.date as dispatch_date,
                gi.owner_full_name,
                gi.owner_full_name,
                gi.coordinator_full_name,
                gi.coordinator_full_name,
                gi.emirates_id,
                gi.mobile_number,
                gi.address,
                gi.status as delivery_status,
                gi.creation as created_date,
                gi.owner as created_by,
                u.full_name as creator_name,
                DATEDIFF(CURDATE(), gi.date) as days_since_dispatch
            FROM `tabGift Issue` gi
            INNER JOIN `tabGift` g ON gi.gift = g.name
            LEFT JOIN `tabUser` u ON gi.owner = u.name
            WHERE gi.docstatus != 2 AND g.docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        pending_deliveries = frappe.db.sql(data_query, params, as_dict=True)

        # Format data
        for delivery in pending_deliveries:
            # Format dates as strings
            for field in ["dispatch_date", "created_date"]:
                if delivery.get(field):
                    delivery[field] = str(delivery[field])

            # Full name for owner
            delivery["owner_full_name"] = (
                f"{delivery['owner_full_name']} {delivery['owner_full_name']}"
            )
            delivery["coordinator_full_name"] = (
                f"{delivery['coordinator_full_name']} {delivery['coordinator_full_name']}"
            )

            # Add urgency indicator based on days since dispatch
            days_since = delivery.get("days_since_dispatch", 0)
            if days_since > 7:
                delivery["urgency"] = "High"
            elif days_since > 3:
                delivery["urgency"] = "Medium"
            else:
                delivery["urgency"] = "Low"

        return {
            "data": pending_deliveries,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_pending_delivery_report: {str(e)}",
            title="Reports API - Pending Delivery Report Error",
        )
        frappe.throw(_("Failed to fetch pending delivery report: {0}").format(str(e)))


@frappe.whitelist()
def get_barcode_print_report(
    page=1,
    limit=100,
    gift_no=None,
    ring_number=None,
    status=None,
    owner_name=None,
    order_by="creation",
    sort_order="desc",
):
    """Get Barcode Print report - Shows gifts with barcode information for printing"""
    try:
        page = cint(page) or 1
        limit = cint(limit) or 100
        start = (page - 1) * limit

        # Build search conditions
        search_conditions = ""
        params = {}

        if gift_no:
            search_conditions += " AND (g.name LIKE %(gift_no)s OR g.gift_id LIKE %(gift_no)s)"
            params["gift_no"] = f"%{gift_no}%"

        if ring_number:
            search_conditions += " AND g.barcode_value LIKE %(ring_number)s"
            params["ring_number"] = f"%{ring_number}%"

        if status:
            search_conditions += " AND g.status = %(status)s"
            params["status"] = status

        if owner_name:
            search_conditions += " AND g.owner_full_name LIKE %(owner_name)s"
            params["owner_name"] = f"%{owner_name}%"

        # Build order by clause
        order_direction = "ASC" if sort_order.upper() == "ASC" else "DESC"
        valid_columns = ["creation", "gift_name", "barcode_value", "status", "owner_full_name"]
        if order_by not in valid_columns:
            order_by = "creation"
        order_clause = f"ORDER BY g.{order_by} {order_direction}"

        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabGift` g
            WHERE g.docstatus != 2
            {search_conditions}
        """

        total_result = frappe.db.sql(count_query, params, as_dict=True)
        total = total_result[0]["total"] if total_result else 0

        # Get data with barcode images
        data_query = f"""
            SELECT
                g.name as gift_id,
                g.gift_id as gift_no,
                g.gift_name,
                g.category,
                g.status,
                g.barcode_value,
                g.barcode,
                g.owner_full_name,
                g.creation as created_date,
                g.modified as modified_date,
                g.owner as created_by,
                u.full_name as creator_name
            FROM `tabGift` g
            LEFT JOIN `tabUser` u ON g.owner = u.name
            WHERE g.docstatus != 2
            {search_conditions}
            {order_clause}
            LIMIT %(limit)s OFFSET %(start)s
        """

        params.update({"limit": limit, "start": start})
        gifts = frappe.db.sql(data_query, params, as_dict=True)

        # Helper function to get full URLs for barcode images
        def get_full_url(file_path):
            if not file_path:
                return ""
            if file_path.startswith("http://") or file_path.startswith("https://"):
                return file_path

            # Check if it's a private file
            if file_path.startswith("/private/"):
                return frappe.utils.get_url(
                    f"/api/method/frappe.core.doctype.file.file.download_file?file_url={file_path}"
                )
            elif file_path.startswith("/files/"):
                return frappe.utils.get_url(file_path)
            else:
                if file_path.startswith("files/"):
                    return frappe.utils.get_url(f"/{file_path}")
                elif file_path.startswith("private/"):
                    return frappe.utils.get_url(
                        f"/api/method/frappe.core.doctype.file.file.download_file?file_url=/{file_path}"
                    )
                else:
                    return frappe.utils.get_url(f"/files/{file_path}")

        # Format data and add barcode images
        for gift in gifts:
            # Format dates as strings
            for field in ["created_date", "modified_date"]:
                if gift.get(field):
                    gift[field] = str(gift[field])

            # Get full URL for barcode image
            if gift.get("barcode"):
                gift["barcode_image"] = get_full_url(gift["barcode"])
            else:
                gift["barcode_image"] = None

            # Ensure we have owner_full_name (fallback to "Not Assigned" if empty)
            if not gift.get("owner_full_name"):
                gift["owner_full_name"] = "Not Assigned"

        return {
            "data": gifts,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_barcode_print_report: {str(e)}",
            title="Reports API - Barcode Print Report Error",
        )
        frappe.throw(_("Failed to fetch barcode print report: {0}").format(str(e)))


# =============================================================================
# Current User API Methods
# =============================================================================


@frappe.whitelist()
def get_current_user_role():
    """Get current user's role (location field) for authorization checks"""
    try:
        current_user = frappe.session.user
        if not current_user or current_user == "Guest":
            frappe.throw(_("User not authenticated"))

        # Get user's location field (which stores the User Role)
        user_role = frappe.db.get_value("User", current_user, "location")

        return {
            "user": current_user,
            "role": user_role or None,
            "is_admin": user_role == "Admin",
            "is_event_manager": user_role == "Event Manager",
            "is_event_coordinator": user_role == "Event Coordinator"
        }

    except Exception as e:
        frappe.log_error(
            message=f"Error in get_current_user_role: {str(e)}",
            title="User API - Get Current User Role Error",
        )
        frappe.throw(_("Failed to fetch current user role: {0}").format(str(e)))
