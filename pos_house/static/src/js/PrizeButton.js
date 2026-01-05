/** @odoo-module */

import { Component } from "@odoo/owl";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

export class PrizeButton extends Component {

    static template = "PrizeButton";

    setup() {
        this.pos = usePos();
        this.popup = useService("popup");
    }
    is_available() {
        const order = this.pos.get_order();
        return order ? order.get_prize_balance() > 0 : false;
    }
    async onClick() {
        //let order = this.env.pos.get_order();
        this.claim_prize();
    }
    async claim_prize() {
        var order    = this.pos.get_order();
        var lines    = order.get_orderlines();
        var product  = this.pos.db.get_product_by_id(this.pos.config.prize_product_id[0]);
        if (product === undefined) {
            await this.popup.add(ErrorPopup, {
                title : _t("No Prize product found"),
                body  : _t("The prize product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
            });
            return;
        }

        // Remove existing prize lines
        var i = 0;
        while ( i < lines.length ) {
            if (lines[i].get_product() === product) {
                order.removeOrderline(lines[i]);
            } else {
                i++;
            }
        }

        i = 0;
        var order_total = 0;
        var used = 0;

        while ( i < lines.length ) {
            if(!lines[i].exclude_from_prize()) {
                order_total += lines[i].get_price_with_tax();
            }
            i++;
        }
        // Add discount
        // We add the price as manually set to avoid recomputation when changing customer.
        var balance = order.get_prize_balance();
        used = (balance > order_total) ? -order_total : -balance;


        if( used < 0 ){
            order.add_product(product, {
                price: used,
                lst_price: used,
            });
        }
    }
}

ProductScreen.addControlButton({
    component: PrizeButton,
    condition: function() {
        return this.pos.config.module_pos_house;
    },
});
