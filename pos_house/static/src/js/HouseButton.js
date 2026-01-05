/** @odoo-module */

import { Component } from "@odoo/owl";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { _t } from "@web/core/l10n/translation";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { useService } from "@web/core/utils/hooks";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";

export class HouseButton extends Component {

    static template = "HouseButton";

    setup() {
        this.pos = usePos();
        this.popup = useService("popup");
    }

    is_available() {
        const order = this.pos.get_order();
        return order ? order.get_available_house().length > 0 : false;
    }

    async onClick() {
        let order = this.pos.get_order();
        let client = order.get_partner();
        if (!client) {
            // IMPROVEMENT: This code snippet is similar to selectClient of PaymentScreen.
            const {
                confirmed,
                payload: newClient,
            } = await this.pos.showTempScreen('PartnerListScreen', { client });
            if (confirmed) {
                order.set_client(newClient);
                order.updatePricelist(newClient);
            }
            return;
        }

        var rewards = order.get_available_house();
        if (rewards.length === 0) {
            await this.popup.add(ErrorPopup, {
                title: _t('No House Balance Available'),
                body: _t('There is no house balance against this customer'),
            });
            return;
        } else if (rewards.length === 1 && this.pos.house.rewards.length === 1) {
            order.apply_house(rewards[0]);
            return;
        } else {
            const rewardsList = rewards.map(reward => ({
                id: reward.id,
                label: reward.name,
                item: reward,
            }));

            const { confirmed, payload: selectedReward } = await this.popup.add(SelectionPopup,
                {
                    title: _t('Please select a House account'),
                    list: rewardsList,
                }
            );

            if(confirmed)
                order.apply_house(selectedReward);
            return;
        }
    }
}

ProductScreen.addControlButton({
    component: HouseButton,
    condition: function() {
        return this.pos.config.module_pos_house;
    },
});
