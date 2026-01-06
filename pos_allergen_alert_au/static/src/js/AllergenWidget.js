/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { Component } from "@odoo/owl";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class AllergenWidget extends Component {

    static template = "AllergenWidget";

    setup() {
        super.setup();
        this.pos = usePos();
    }
    getCustomerAllergenInfo() {
        const order = this.pos.get_order();
        const partner = order.get_partner();
        let note = partner.allergen_names;

        return note;//order?.get_partner()?.pos_allergen_note || "";
    }
     getCustomerAllergenNote() {
        const order = this.pos.get_order();
        const partner = order.get_partner();
        let note = partner.allergen_notes;

        return note;//order?.get_partner()?.pos_allergen_note || "";
    }
    getCustomerImage(){
        const order = this.pos.get_order();
        const partner = order.get_partner();

        let image = partner?.image_1920;

        return image;
    }
    get order() {
        return this.pos.get_order();
    }
}

patch(OrderWidget, {
    components: {
        ...OrderWidget.components,
        AllergenWidget,
    },
});
