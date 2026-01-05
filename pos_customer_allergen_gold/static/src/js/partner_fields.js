/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Partner } from "@point_of_sale/app/store/models";

patch(Partner.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos_allergen_info = this.pos_allergen_info || "";
    }
});
