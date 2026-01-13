# Copyright (c) 2025, Bhavesh and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _


class GiftIssue(Document):
	def validate(self):
		"""Validate gift availability before issuing"""
		# self.validate_gift_availability()
		#self.set_required_fields()
		self.set_default_status()
	
	def set_default_status(self):
		"""Set default status if not set"""
		if not self.status:
			self.status = "Dispatched"
	
	def validate_gift_availability(self):
		"""Check if gift is available for issuing"""
		if self.gift:
			gift_doc = frappe.get_doc("Gift", self.gift)
			if gift_doc.status == "Issued":
				frappe.throw(_("Gift {0} has already been issued and cannot be issued again").format(self.gift))
	
	def set_required_fields(self):
		"""Set required fields for person details"""
		if not self.gift_recipient:
			frappe.throw(_("Gift Recipient is required"))
		if not self.owner_full_name:
			frappe.throw(_("Owner Full Name is required"))
		if not self.coordinator_full_name:
			frappe.throw(_("Coordinator Full Name is required"))
	
	def after_insert(self):
		"""Update gift status after inserting gift issue record"""
		self.update_gift_status()
	
	def update_gift_status(self):
		"""Update the gift status to Issued"""
		if self.gift:
			gift_doc = frappe.get_doc("Gift", self.gift)
			
			# Double check gift is still available
			if gift_doc.status == "Issued":
				frappe.throw(_("Gift {0} has already been issued by someone else").format(self.gift))
			
			# Update gift status and issue details
			gift_doc.status = "Issued"
			gift_doc.address = self.address
			gift_doc.emirates_id = self.emirates_id
			gift_doc.mobile_number = self.mobile_number
			gift_doc.issued_date = self.date or frappe.utils.today()
			gift_doc.person_photo = self.person_photo
			gift_doc.owner_full_name = self.owner_full_name
			gift_doc.coordinator_full_name = self.coordinator_full_name

			
			gift_doc.save(ignore_permissions=True)
			frappe.db.commit()
	
	def on_trash(self):
		"""Revert gift status when gift issue is deleted"""
		if self.gift:
			gift_doc = frappe.get_doc("Gift", self.gift)
			gift_doc.status = "Available"
			
			# Clear issue details
			gift_doc.gift_recipient = None
			gift_doc.owner_full_name = None
			gift_doc.coordinator_full_name = None
			gift_doc.address = None
			gift_doc.emirates_id = None
			gift_doc.mobile_number = None
			gift_doc.issued_date = None
			gift_doc.person_photo = None
			
			gift_doc.save(ignore_permissions=True)