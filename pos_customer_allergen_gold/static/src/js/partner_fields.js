/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { registry } from "@web/core/registry";

const posModels = registry.category("pos_models");
const Partner = posModels.get("res.partner");

patch(Partner.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos_allergen_note = this.pos_allergen_note || "";
    },
});
