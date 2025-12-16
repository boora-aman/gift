# Copyright (c) 2025, Bhavesh and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class GiftRecipient(Document):
	def validate(self):
		"""Validate gift recipient document"""
		self.validate_required_fields()
		self.validate_mobile_number()
	
	def validate_required_fields(self):
		"""Validate required fields"""
		if not self.owner_full_name or not self.owner_full_name.strip():
			frappe.throw(_("Owner Full Name is required"))
		if not self.coordinator_full_name or not self.coordinator_full_name.strip():
			frappe.throw(_("Coordinator Full Name is required"))
		if not self.coordinator_mobile_no or not self.coordinator_mobile_no.strip():
			frappe.throw(_("Coordinator Mobile No is required"))
	
	def validate_mobile_number(self):
		"""Basic mobile number validation"""
		if self.coordinator_mobile_no:
			# Remove any spaces or special characters
			mobile = self.coordinator_mobile_no.replace(" ", "").replace("-", "").replace("+", "")
			if not mobile.isdigit():
				frappe.throw(_("Mobile number should contain only digits"))
			if len(mobile) < 10:
				frappe.throw(_("Mobile number should be at least 10 digits"))
	
	def before_save(self):
		"""Format names before saving"""
		if self.owner_full_name:
			self.owner_full_name = self.owner_full_name.strip().title()
		if self.coordinator_full_name:
			self.coordinator_full_name = self.coordinator_full_name.strip().title()


@frappe.whitelist()
def search_recipients(query=None, limit=20):
	"""Search gift recipients for autocomplete"""
	filters = []
	if query:
		filters = [
			["owner_full_name", "like", f"%{query}%"],
			["coordinator_full_name", "like", f"%{query}%"],
			["coordinator_mobile_no", "like", f"%{query}%"]
		]
	
	recipients = frappe.get_list(
		"Gift Recipient",
		fields=["name", "owner_full_name", "coordinator_full_name", "coordinator_mobile_no", "coordinator_emirates_id", "address"],
		or_filters=filters if filters else None,
		limit=limit,
		order_by="modified desc"
	)
	
	return recipients


@frappe.whitelist()
def get_recipient_details(name):
	"""Get complete recipient details"""
	try:
		recipient = frappe.get_doc("Gift Recipient", name)
		return {
			"name": recipient.name,
			"owner_full_name": recipient.owner_full_name,
			"coordinator_full_name": recipient.coordinator_full_name,
			"coordinator_mobile_no": recipient.coordinator_mobile_no,
			"coordinator_emirates_id": recipient.coordinator_emirates_id,
			"address": recipient.address,
			"person_photo": recipient.person_photo
		}
	except frappe.DoesNotExistError:
		frappe.throw(_("Gift Recipient not found"))