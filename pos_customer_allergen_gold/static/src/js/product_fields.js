/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { registry } from "@web/core/registry";

const posModels = registry.category("pos_models");
const Product = posModels.get("product.product");

patch(Product.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos_allergen_tags = this.pos_allergen_tags || "";
    },
});
