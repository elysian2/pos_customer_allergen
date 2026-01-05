/** @odoo-module */

import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(Navbar.prototype, {
    get showCashMoveButton() {
        //return this.env.pos.config.cash_control && this.env.pos.pos_session.state == 'opening_control';
        if(this.pos) {
            let cashier = this.pos.get_cashier();
            if (cashier) {
                let lrole = cashier.role;
                if (lrole != 'manager') {
                    cashier.role = 'manager';
                    this.pos.set_cashier(cashier);
                }
            }
        }
        return super.showCashMoveButton;

        if(cashier && lrole) {
             cashier.role = lrole;
             this.pos.set_cashier(cashier);
            //this.env.pos.get('cashier').role = lrole;
        }
    },
});

patch(PosStore.prototype, {
    shouldShowCashControl() {
        return this.config.cash_control && this.pos_session.state == 'opening_control';
    },
});
