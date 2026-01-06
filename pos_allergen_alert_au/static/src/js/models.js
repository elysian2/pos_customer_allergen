/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

patch(Order.prototype, {
    add_product(product, options) {
        const res = super.add_product(...arguments);

        const partner = this.get_partner();
        if (partner && product.allergen_ids && partner.allergen_ids) {
            const conflict = product.allergen_ids.some(a =>
                partner.allergen_ids.includes(a)
            );

            if (conflict) {
                this.pos.popup.add({
                    title: "⚠ Food Allergy Warning (AU FSANZ)",
                    body: "This item contains a declared allergen for this customer. Confirm before proceeding."
                });
            }
        }
        return res;
    }
});
