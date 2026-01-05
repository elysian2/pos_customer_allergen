/** @odoo-module **/

//import { OrderSummary } from "@point_of_sale/app/screens/product_screen/order_summary/order_summary";
import { Order, Orderline, Product } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";

console.warn("✅ OrderAllergenInfo loaded");

patch(Order.prototype, {
    get allergenInfo() {
        const order = this.env.services.pos.get_order();
        const partner = order?.get_partner();
        return partner?.pos_allergen_note || "";
    },

    get showAllergen() {
        return Boolean(
            this.env.services.pos.config.show_customer_allergen &&
            this.allergenInfo
        );
    },
});
