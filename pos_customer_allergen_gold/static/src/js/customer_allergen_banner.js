/** @odoo-module alias=pos_customer_allergen_gold.js.customer_allergen_banner **/

import { Registries } from '@point_of_sale/Registries';
import { useListener } from '@web/core/utils/hooks';
import { OrderSummary } from '@point_of_sale/app/screens/order_summary/order_summary';

// Patch OrderSummary to show customer allergen info
const patchOrderSummary = (OrderSummary) => {
    class OrderSummaryAllergen extends OrderSummary {
        mounted() {
            super.mounted();
            console.warn("✅ OrderSummaryAllergen mounted");
        }

        get customerAllergen() {
            const order = this.env.pos.get_order();
            const partner = order?.get_partner();
            return partner?.pos_allergen_note || '';
        }
    }

    Registries.Component.extend(OrderSummary, OrderSummaryAllergen);
};

patchOrderSummary(OrderSummary);
