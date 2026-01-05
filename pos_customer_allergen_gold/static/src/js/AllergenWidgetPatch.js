/** @odoo-module **/

import { OrderWidget } from 'point_of_sale.OrderWidget';
import { Registries } from 'point_of_sale.Registries';
import { AllergenWidget } from './AllergenWidget';

export const OrderWidgetWithAllergen = (OrderWidget) =>
    class extends OrderWidget {
        // You can pass the customer allergen info and image here
        get customerAllergenInfo() {
            const partner = this.props.order?.get_partner();
            return partner ? {
                allergenNote: partner.pos_allergen_note,
                allergenImage: partner.image_url, // You can also add image_url field
            } : null;
        }

        mounted() {
            super.mounted();
            // Check if allergen data is available, and render the widget
            if (this.customerAllergenInfo) {
                this.renderAllergenWidget(this.customerAllergenInfo);
            }
        }

        renderAllergenWidget(allergenInfo) {
            this.env.pos.allergenWidget = new AllergenWidget(this, {
                allergenNote: allergenInfo.allergenNote,
                allergenImage: allergenInfo.allergenImage
            });
            this.env.pos.allergenWidget.mount(this.el);
        }
    };

Registries.Component.extend(OrderWidget, OrderWidgetWithAllergen);
