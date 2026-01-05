/** @odoo-module */

import { PartnerDetailsEdit } from "@point_of_sale/app/screens/partner_list/partner_editor/partner_editor";
import { patch } from "@web/core/utils/patch";
import { Component, useState } from "@odoo/owl";

patch(PartnerDetailsEdit.prototype, {
    setup() {
        super.setup();
        const partner = this.props.partner;
        this.intFields.push("house_balance", "bucket_count");
        this.changes = useState({
            name: partner.name || "",
            street: partner.street || "",
            city: partner.city || "",
            zip: partner.zip || "",
            state_id: partner.state_id && partner.state_id[0],
            country_id: partner.country_id && partner.country_id[0],
            lang: partner.lang || "",
            email: partner.email || "",
            phone: partner.phone || "",
            mobile: partner.mobile || "",
            barcode: partner.barcode || "",
            vat: partner.vat || "",
            property_product_pricelist: this.setDefaultPricelist(partner),
            house_balance: partner.house_balance,
        });
    },
});
