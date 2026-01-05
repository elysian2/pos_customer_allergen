/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Product } from "@point_of_sale/app/store/models";

patch(Product.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos_allergen_tags = this.pos_allergen_tags || "";
    }
});
