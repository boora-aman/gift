# Copyright (c) 2025, Bhavesh and contributors
# For license information, please see license.txt

import frappe
from frappe import _
import io
import base64
from frappe.model.document import Document
from barcode import Code128
from barcode.writer import ImageWriter
from PIL import Image, ImageDraw, ImageFont
import uuid


class Gift(Document):
	def validate(self):
		"""Validate gift document"""

		# Check if gift_id is unique
		if self.gift_id:
			existing = frappe.db.get_value("Gift",
				{"gift_id": self.gift_id, "name": ["!=", self.name]},
				"name"
			)
			if existing:
				frappe.throw(_("Gift Code {0} already exists").format(self.gift_id))

		# Validate import barcode requirements
		if self.import_barcode and not self.barcode_value:
			frappe.throw(_("Barcode ID is required when Import Barcode is checked"))

		# Check if barcode value is unique if provided
		if self.barcode_value:
			existing = frappe.db.get_value("Gift",
				{"barcode_value": self.barcode_value, "name": ["!=", self.name]},
				"name"
			)
			if existing:
				frappe.throw(_("Barcode ID {0} already exists").format(self.barcode_value))

	def after_insert(self):
		"""Generate barcode before saving if not already generated"""
		self.generate_barcode()

	def generate_barcode(self):
		"""Generate unique 8-digit barcode value and create barcode image"""
		# Generate unique barcode value
		if self.import_barcode and self.barcode_value:
			# Use provided barcode value when importing
			self.barcode_value = str(self.barcode_value)
		elif not self.import_barcode:
			# Auto-generate 8-digit barcode value
			self.barcode_value = self.generate_8_digit_barcode()

		# Generate barcode image with specified dimensions
		if not self.barcode:
			self.create_barcode_image()
			self.save()

	def generate_8_digit_barcode(self):
		"""Generate unique 8-digit numeric barcode"""
		import random

		while True:
			# Generate 8-digit numeric barcode
			barcode = ''.join([str(random.randint(0, 9)) for _ in range(8)])

			# Check if this barcode already exists
			existing = frappe.db.get_value("Gift", {"barcode_value": barcode}, "name")
			if not existing:
				return barcode

	def create_barcode_image(self):
		"""Create barcode image with 25mm width and 10mm height"""
		if not self.barcode_value:
			return

		try:
			# Convert mm to pixels (assuming 300 DPI: 1mm = 11.811 pixels)
			width_pixels = int(25 * 11.811)  # 25mm width
			height_pixels = int(10 * 11.811)  # 10mm height

			# Create barcode without text first
			code128 = Code128(self.barcode_value, writer=ImageWriter())
			barcode_buffer = io.BytesIO()

			# Generate barcode without text
			barcode_image = code128.write(barcode_buffer, options={
				'module_width': 0.3,
				'module_height': 4.5,
				'quiet_zone': 1.0,
				'font_size': 0,  # No text on barcode itself
				'text_distance': 0,
				'background': 'white',
				'foreground': 'black',
				'write_text': False  # We'll add text separately
			})

			# Open the barcode image
			barcode_buffer.seek(0)
			barcode_img = Image.open(barcode_buffer)

			# Create a new image with the target dimensions
			final_img = Image.new('RGB', (width_pixels, height_pixels), 'white')

			# Calculate positioning
			barcode_height = int(height_pixels * 0.7)  # 70% for barcode
			text_height = height_pixels - barcode_height  # 30% for text

			# Resize barcode to fit the allocated space
			barcode_resized = barcode_img.resize((width_pixels, barcode_height), Image.Resampling.LANCZOS)

			# Paste barcode at the top
			final_img.paste(barcode_resized, (0, 0))

			# Add text at the bottom
			draw = ImageDraw.Draw(final_img)

			# Try to use a larger font, fall back to default if not available
			try:
				# Try to load a TrueType font with larger size
				import platform
				system = platform.system()

				if system == "Windows":
					font_path = "arial.ttf"
				elif system == "Darwin":  # macOS
					font_path = "/System/Library/Fonts/Arial.ttf"
				else:  # Linux
					font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

				# Calculate font size based on available space
				target_font_size = max(12, int(text_height * 0.6))  # At least 12px, or 60% of text height
				font = ImageFont.truetype(font_path, target_font_size)
			except:
				try:
					# Fallback to default font but try to make it larger
					font = ImageFont.load_default()
				except:
					font = None

			# Get text dimensions
			text_bbox = draw.textbbox((0, 0), self.barcode_value, font=font)
			text_width = text_bbox[2] - text_bbox[0]
			text_x = (width_pixels - text_width) // 2  # Center the text
			text_y = barcode_height + (text_height - (text_bbox[3] - text_bbox[1])) // 2

			# Draw the text with better contrast
			draw.text((text_x, text_y), self.barcode_value, fill='black', font=font)

			# Save to buffer
			final_buffer = io.BytesIO()
			final_img.save(final_buffer, format='PNG')
			final_buffer.seek(0)

			# Encode to base64 for storage
			barcode_data = base64.b64encode(final_buffer.getvalue()).decode()

			# Create file record
			file_doc = frappe.get_doc({
				'doctype': 'File',
				'file_name': f'barcode_{self.name}_{self.barcode_value}.png',
				'content': barcode_data,
				'decode': True,
				'is_private': 0,
				'folder': 'Home/Attachments'
			})
			file_doc.insert(ignore_permissions=True)

			# Set the barcode field to the file URL
			self.barcode = file_doc.file_url

		except Exception as e:
			frappe.log_error(message=f"Error generating barcode: {str(e)}", title="Gift Barcode Generation Error")


@frappe.whitelist()
def get_gift_details(gift_name):
	"""Get gift details with issue history, additional attributes, and images"""
	try:
		# Get gift document
		gift_doc = frappe.get_doc("Gift", gift_name)

		# Helper function to get full URL for images
		def get_full_url(file_path):
			if not file_path:
				return None
			if file_path.startswith('http'):
				return file_path
			return frappe.utils.get_url() + file_path

		# Get additional attributes
		additional_attributes = []
		for attr in gift_doc.gift_additional_attributes:
			additional_attributes.append({
				"attribute_name": attr.attribute_name,
				"attribute_value": attr.attribute_value
			})

		# Get gift images with full URLs
		gift_images = []
		for img in gift_doc.gift_images:
			gift_images.append({
				"image": get_full_url(img.image)
			})

		# Prepare gift data
		gift_data = {
			"name": gift_doc.name,
			"gift_name": gift_doc.gift_name,
			"gift_id": gift_doc.gift_id,
			"description": gift_doc.description,
			"category": gift_doc.category,
			"gender": gift_doc.gender,
			"breed": gift_doc.breed,
			"weight": gift_doc.weight,
			"farm_name": gift_doc.farm_name,
			"status": gift_doc.status,
			"import_barcode": gift_doc.import_barcode,
			"barcode": get_full_url(gift_doc.barcode),
			"barcode_value": gift_doc.barcode_value,
			"creation": gift_doc.creation,
			"modified": gift_doc.modified,
			"owner": gift_doc.owner,
			"docstatus": gift_doc.docstatus,
			"gift_recipient": gift_doc.gift_recipient,
			"owner_full_name": gift_doc.owner_full_name,
			"coordinator_full_name": gift_doc.coordinator_full_name,
			"emirates_id": gift_doc.emirates_id,
			"mobile_number": gift_doc.mobile_number,
			"issued_date": gift_doc.issued_date,
			"person_photo": get_full_url(gift_doc.person_photo),
			"additional_attributes": additional_attributes,
			"images": gift_images
		}

		# Get issue history (only if gift is issued)
		issue_history = {}
		if gift_doc.status == "Issued" and gift_doc.owner_full_name:
			issue_history = {
				"gift_recipient": gift_doc.gift_recipient,
				"owner_full_name": gift_doc.owner_full_name,
				"coordinator_full_name": gift_doc.coordinator_full_name,
				"emirates_id": gift_doc.emirates_id,
				"mobile_number": gift_doc.mobile_number,
				"issued_date": gift_doc.issued_date,
				"person_photo": get_full_url(gift_doc.person_photo)
			}

		return {
			"gift": gift_data,
			"issue_history": issue_history
		}

	except frappe.DoesNotExistError:
		frappe.throw("Gift not found", frappe.DoesNotExistError)
	except Exception as e:
		frappe.log_error(message=frappe.get_traceback(), title="Gift API - Get Gift Details Error")
		frappe.throw("Error retrieving gift details")
