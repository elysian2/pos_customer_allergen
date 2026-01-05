/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { Component } from "@odoo/owl";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class HouseCounter extends Component {

    static template = "HouseCounter";

    setup() {
        super.setup();
        this.pos = usePos();
    }
    get_house_won() {
         if(!this.pos.get_order())
            return 0;
        let wonHouse = this.pos.get_order().get_won_house();
        return Number(wonHouse).toFixed(this.pos.currency.decimal_places);//, this.env.pos.currency.rounding);
    }
    get_house_spent() {
         if(!this.pos.get_order())
            return 0;
        let spendHouse = this.pos.get_order().get_spent_house();
        return Number(spendHouse).toFixed(this.pos.currency.decimal_places);//, this.env.pos.currency.decimals);
    }
    get_house_total() {
         if(!this.pos.get_order())
            return 0;
        let totalHouse = this.pos.get_order().get_new_total_house();
        return Number(totalHouse).toFixed(this.pos.currency.decimal_places);//, this.env.pos.currency.decimals);
    }
    get_house_current() {
        if(!this.pos.get_order())
            return 0;
        let currentHouse = this.pos.get_order().get_current_house();
        return Number(currentHouse).toFixed(this.pos.currency.decimal_places);//round_pr(currentHouse.toFixed(2), this.env.pos.currency.rounding);
    }
    get order() {
        return this.pos.get_order();
    }
}

patch(OrderWidget, {
    components: {
        ...OrderWidget.components,
        HouseCounter,
    },
});
