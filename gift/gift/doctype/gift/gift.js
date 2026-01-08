frappe.ui.form.on("Gift", {
    onload(frm) {
        frm._category_attrs_loaded = false;
        toggle_barcode_fields(frm);
    },

    refresh(frm) {
        toggle_barcode_fields(frm);
    },

    import_barcode(frm) {
        toggle_barcode_fields(frm);
        
        // Clear barcode value if unchecked
        if (!frm.doc.import_barcode) {
            frm.set_value("barcode_value", "");
        }
    },

    category(frm) {
        if (!frm.is_new()) return;
        if (frm._category_attrs_loaded) return;
        if (!frm.doc.category) return;

        frm._category_attrs_loaded = true;

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Gift Category",
                name: frm.doc.category
            }
        }).then(r => {
            const attrs = r.message?.category_attributes || [];
            if (!attrs.length) return;

            frm.clear_table("gift_details");

            attrs.forEach(a => {
                frm.add_child("gift_details", {
                    attribute_name: a.attribute_name,
                    attribute_type: a.attribute_type || "Text",
                    is_mandatory: a.is_mandatory || 0,
                    select_options: a.select_options || "",
                    default_value: a.default_value || "",
                    display_order: a.display_order || 0
                });
            });

            frm.refresh_field("gift_details");
        });
    },

    validate(frm) {
        validate_mandatory_attributes(frm);
    }
});


function toggle_barcode_fields(frm) {
    const importing = cint(frm.doc.import_barcode);
    const isNew = frm.is_new();
    
    // Barcode image (Attach) - ALWAYS visible after save, hidden on new unless importing
    if (frm.fields_dict.barcode) {
        // Show if: (saved doc) OR (new doc AND importing)
        const showBarcode = !isNew || importing;
        frm.set_df_property("barcode", "hidden", !showBarcode);
        frm.set_df_property("barcode", "reqd", 0); // Never required, auto-generated
        frm.refresh_field("barcode");
    }

    // Barcode value (Data)
    if (frm.fields_dict.barcode_value) {
        // Show if: (saved doc AND has value) OR (new doc AND importing)
        const showValue = (!isNew && frm.doc.barcode_value) || importing;
        frm.set_df_property("barcode_value", "hidden", !showValue);
        
        // Required only when importing
        frm.set_df_property("barcode_value", "reqd", importing);
        
        // Read-only if NOT importing (auto-generated)
        frm.set_df_property("barcode_value", "read_only", !importing);
        
        frm.refresh_field("barcode_value");
    }
}

function validate_mandatory_attributes(frm) {
    if (!frm.doc.gift_details || !frm.doc.gift_details.length) return;

    const missing = frm.doc.gift_details
        .filter(r => r.is_mandatory && !r.default_value)
        .map(r => r.attribute_name);

    if (missing.length) {
        frappe.throw(
            `Please fill mandatory attributes: ${missing.join(", ")}`
        );
    }
}
