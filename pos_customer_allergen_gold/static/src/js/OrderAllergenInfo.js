/** @odoo-module **/

// ✅ Add this line at the very top of the file
console.warn("✅ POS CUSTOMER ALLERGEN GOLD JS LOADED");

import { OrderWidget } from 'point_of_sale.OrderWidget';
import { Registries } from 'point_of_sale.Registries';

export const OrderAllergenInfo = (OrderWidget) =>
    class extends OrderWidget {

        get partner() {
            return this.props.order?.get_partner();
        }

        get allergenInfo() {
            return this.partner?.pos_allergen_info;
        }

        get showAllergen() {
            return (
                this.env.pos.config.show_customer_allergen &&
                this.allergenInfo
            );
        }
    };

Registries.Component.extend(OrderWidget, OrderAllergenInfo);
