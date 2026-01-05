/** @odoo-module **/

import { Orderline } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";

patch(Orderline.prototype, {
    get hasAllergenConflict() {
        const order = this.order;
        if (!order || !order.get_partner()) {
            return false;
        }

        const customer = order.get_partner();
        const customerAllergens = customer.pos_allergen_info || "";
        const productAllergens = this.product.pos_allergen_tags || "";

        if (!customerAllergens || !productAllergens) {
            return false;
        }

        return productAllergens
            .toLowerCase()
            .split(",")
            .some(a => customerAllergens.toLowerCase().includes(a.trim()));
    }
});
