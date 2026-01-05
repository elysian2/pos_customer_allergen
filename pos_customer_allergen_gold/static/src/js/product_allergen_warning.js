/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Orderline } from "@point_of_sale/app/store/models";

patch(Orderline.prototype, {
    get hasAllergenConflict() {
        const partner = this.order?.get_partner();
        if (!partner) return false;

        const customerAllergens = partner.pos_allergen_note || "";
        const productAllergens = this.product.pos_allergen_tags || "";

        return productAllergens
            .toLowerCase()
            .split(",")
            .some(a =>
                customerAllergens.toLowerCase().includes(a.trim())
            );
    },
});
