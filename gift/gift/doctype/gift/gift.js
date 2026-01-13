// Copyright (c) 2025, Bhavesh and contributors
// For license information, please see license.txt

frappe.ui.form.on("Gift", {
	refresh(frm) {
		// Handle barcode field visibility and requirements
		//toggle_barcode_field(frm);
	},
	
	import_barcode(frm) {
		// Toggle barcode field when checkbox changes
		//toggle_barcode_field(frm);
		
		// Clear barcode_value when unchecked
		if (!frm.doc.import_barcode) {
			frm.set_value('barcode_value', '');
		}
	}
});

function toggle_barcode_field(frm) {
	if (frm.doc.import_barcode) {
		// Show and make barcode_value mandatory
		frm.set_df_property('barcode_value', 'reqd', 1);
		frm.set_df_property('barcode_value', 'hidden', 0);
		frm.set_df_property('barcode_value', 'read_only', 0);
	} else {
		// Hide and make barcode_value optional
		frm.set_df_property('barcode_value', 'reqd', 0);
		frm.set_df_property('barcode_value', 'hidden', 1);
		frm.set_df_property('barcode_value', 'read_only', 1);
	}
}
