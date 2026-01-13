# Copyright (c) 2025, Bhavesh and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class GiftInterest(Document):
	def validate(self):
		"""Validate gift interest document"""
		self.set_required_fields()
		self.set_default_date()
	
	def set_default_date(self):
		"""Set default date if not set"""
		if not self.date:
			self.date = frappe.utils.today()
	
	def set_required_fields(self):
		"""Set required fields for person details"""
		if not self.gift_recipient:
			frappe.throw(_("Gift Recipient is required"))
		if not self.owner_full_name:
			frappe.throw(_("Owner Full Name is required"))
		if not self.coordinator_full_name:
			frappe.throw(_("Coordinator Full Name is required"))
		if not self.mobile_number:
			frappe.throw(_("Mobile Number is required"))
