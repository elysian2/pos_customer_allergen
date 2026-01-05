/** @odoo-module */
import { patch } from "@web/core/utils/patch";
import { Component } from "@odoo/owl";
import { OrderWidget } from "@point_of_sale/app/generic_components/order_widget/order_widget";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class PrizeCounter extends Component {

    static template = "PrizeCounter";

    setup() {
        super.setup();
        this.pos = usePos();
    }
    get_spent_prize() {
        if(!this.pos.get_order())
            return 0;
        let spendHouse = this.pos.get_order().get_used_prize_balance();
        return spendHouse.toFixed(this.pos.currency.decimal_places);//, this.env.pos.currency.decimals);
    }
    get_prize_total() {
        if(!this.pos.get_order())
            return 0;
        let totalHouse = this.pos.get_order().get_new_total_prize();
        return totalHouse.toFixed(this.pos.currency.decimal_places);//, this.env.pos.currency.decimals);
    }

    get_prize_current() {
        if(!this.pos.get_order())
            return 0;
        let currentPrize = this.pos.get_order().get_prize_balance();
        return currentPrize.toFixed(this.pos.currency.decimal_places);//round_pr(currentHouse.toFixed(2), this.env.pos.currency.rounding);
    }

    get order() {
        return this.pos.get_order();
    }
}

patch(OrderWidget, {
    components: {
        ...OrderWidget.components,
        PrizeCounter,
    },
});
