/** @odoo-module */

import { roundPrecision as round_pr } from "@web/core/utils/numbers";
import { _t } from "@web/core/l10n/translation";
import { Order, Orderline, Product } from "@point_of_sale/app/store/models";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
const { DateTime } = luxon;
import {
    formatDate,
    formatDateTime,
    serializeDateTime,
    deserializeDate,
    deserializeDateTime,
} from "@web/core/l10n/dates";

patch(PosStore.prototype, {
    //@override
    async _processData(loadedData) {
        await super._processData(...arguments);
        this.houses = loadedData["house.accounts"];
        this.house_rule = loadedData["house.rule"];
        this.house_reward = loadedData["house.reward"];
        this.house = this.houses[0];
        if (this.house) {
            this.house.rules = this.house_rule || [];
            this.house.rewards = this.house_reward || [];
        }
    },
});

patch(Product.prototype, {
    get_price(pricelist, quantity, price_extra) {
        if(this.default_code === "MEMBER") {
            var curOrder = this.pos.get_order();
            if(curOrder)
                return curOrder.get_spendable_cash();//get_partner().cash_balance
        }
        return super.get_price(pricelist, quantity, price_extra);//pricelist,quantity,price_extra);
    },
});

patch(Orderline.prototype, {
    get_house() {
        var reward_id = this.product.id;
        return this.pos.house.rewards.find(function(reward){return reward.discount_product_id && reward.discount_product_id[0] === reward_id;});
    },
//    set_reward(reward) {
//        this.reward_id = reward.id;
//    },
    exclude_from_prize() {
        return this.product.pos_exclude_prize;
    },
    house_fee_type() {
        return this.product.pos_fee_item;
    },
    house_bucket() {
        return this.product.pos_bucket;
    },
    member_cash() {
        return this.product.default_code === "MEMBER";
    },
    set_line_house_balance(balance) {
        this.order.assert_editable();
        var parsed_price = !isNaN(balance) ?
            balance :
            isNaN(parseFloat(balance)) ? 0 : field_utils.parse.float('' + balance)
        this.house_balance = parsed_price.toFixed(2) || 0;
    },
    set_line_house_topup() {
        this.house_topup = true;
    },
    set_line_house_reward() {
        this.house_reward = true;
    },
    export_as_JSON() {
        var json = super.export_as_JSON();
//        json.house_id = this.get_house_id();
        json.house_balance = this.house_balance;
        json.prize_balance = this.prize_balance;
        json.cash_balance = this.cash_balance;
        json.house_topup = this.house_topup;
        json.house_reward = this.house_reward;
        return json;
    },
    init_from_JSON(json) {
        super.init_from_JSON(json);
//        this.house_id = this.set_house_id();
    },
    getDisplayData() {
        var displayData = super.getDisplayData();
        displayData.exclude_from_prize = this.exclude_from_prize();
        return displayData;
    },
});

patch(Order.prototype, {
    get_prize_balance() {
        return this.get_partner() ? this.get_partner().prize_balance : 0;
    },
    get_used_prize_balance() {
        var total_prize = 0;
        var product  = this.pos.db.get_product_by_id(this.pos.config.prize_product_id[0]);

        if(!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            for (var line of this.get_orderlines()) {
                if(line.get_product() === product){
                    total_prize += line.price;
                }
            }

        }
        return total_prize;
    },
    get_used_cash_balance() {
        var total_cash = 0;
        //var product  = this.pos.db.get_product_by_id(this.pos.config.prize_product_id[0]);

        if(!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            for (var line of this.get_orderlines()) {
                if(line.member_cash()){
                    total_cash += line.price;
                }
            }

        }
        return total_cash;
    },
    apply_prize() {
        if(this.get_prize_balance() > 0) {
            this.add_product(product, {
                price: 0,
                quantity: 1,
                merge: false,
                extras: {reward_id: reward.id},
            });
        }
    },
    /* The total of house won, excluding the house spent on rewards */
    get_won_house(){
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        }
        var total_house = 0;
        for (var line of this.get_orderlines()){
            if (line.get_house()) {  // Reward products are ignored
                continue;
            }

            var line_house = 0;
            this.pos.house.rules.forEach(function(rule) {
                 var rule_house = 0
                if(rule.valid_product_ids.find(function(product_id) {return product_id === line.get_product().id})) {
                    rule_house += rule.house_quantity * line.get_quantity();
                    rule_house += rule.house_currency * line.get_price_with_tax();
                    line.set_line_house_topup();
                }
                if(rule_house > line_house)
                    line_house = rule_house;
            });

            total_house += line_house;
        }
        total_house += this.get_total_with_tax() * this.pos.house.balance;
        return total_house.toFixed(2);
    },

    /* The total house $$ spent on rewards */
    get_spent_house() {
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            var house   = 0;

            for (var line of this.get_orderlines()){
                var reward = line.get_house();
                if(reward) {
                    //house += round_pr(line.get_quantity() * reward.balance_reduction, this.pos.currency.rounding);
                    house += -line.get_price_with_tax();
                }
            }
            return house.toFixed(2);
        }
    },

    /* The total number of house $$  spent or purchased after the order is validated */
    get_new_house() {
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            return this.get_won_house() - this.get_spent_house();
        }
    },

    get_new_bucket_count() {
        var newcount = 0;
        if(!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            for (var line of this.get_orderlines()) {
                if(line.house_bucket()){
                    newcount += line.quantity;//qty;
                }
            }

        }
        return newcount;
    },

    get_current_bucket_count(){
        return this.get_partner() ? this.get_partner().bucket_count : 0;
    },

    get_total_bucket_count(){
        return this.get_current_bucket_count() + this.get_new_bucket_count();
    },

    /* The total number of house $$ that the customer will have after this order is validated */
    get_new_total_house() {
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            if(this.state != 'paid'){
                return (this.get_partner().house_balance + this.get_new_house()).toFixed(2);
            }
            else{
                return this.get_partner().house_balance.toFixed(2);
            }
        }
    },

    /* The total number of prize $$ that the customer will have after this order is validated  */
    get_new_total_prize() {
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            if(this.state != 'paid'){
                return this.get_partner().prize_balance + this.get_used_prize_balance();
            }
            else{
                return this.get_partner().prize_balance;
            }
        }
    },

    /* The house balance currently against the customer */
    get_current_house(){
        return this.get_partner() ? this.get_partner().house_balance : 0;
    },

    /* The remaining house balance */
    get_spendable_house(){
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            return this.get_partner().house_balance - this.get_spent_house();
        }
    },

    /* The total house $$ spent on rewards */
    get_spent_cash() {
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            var cash   = 0;

            for (var line of this.get_orderlines()){
                if(line.member_cash()) {
                    //house += round_pr(line.get_quantity() * reward.balance_reduction, this.pos.currency.rounding);
                    cash += line.get_price_with_tax();
                }
            }
            return cash;
        }
    },
    get_spendable_cash(){
        if (!this.pos.house || !this.get_partner()) {
            return 0;
        } else {
            var balance = -this.get_partner().cash_balance;
            return balance - this.get_spent_cash();
        }
    },

    /* The list of rewards that the current customer can get */
    get_available_house(){
        var client = this.get_partner();
        if (!client) {
            return [];
        }

        var self = this;
        var rewards = [];
        for (var i = 0; i < this.pos.house.rewards.length; i++) {
            var reward = this.pos.house.rewards[i];
            if (reward.minimum_house > self.get_spendable_house()) {
                continue;
            } else if(reward.reduction_type === 'discount' && reward.balance_reduction > self.get_spendable_house()) {
                continue;
            } else if(reward.reduction_type === 'gift' && reward.balance_reduction > self.get_spendable_house()) {
                continue;
            } else if(reward.reduction_type === 'discount' && reward.discount_apply_on === 'specific_products' ) {
                var found = false;
                self.get_orderlines().forEach(function(line) {
                    found |= reward.discount_specific_product_ids.find(function(product_id){return product_id === line.get_product().id;});
                });
                if(!found)
                    continue;
            } else if(reward.reduction_type === 'discount' && reward.discount_type === 'fixed_amount' && self.get_total_with_tax() < reward.minimum_amount) {
                var product = this.pos.db.get_product_by_id(reward.discount_product_id[0]);
                var lines    = this.get_orderlines();
                var i = 0;
                var order_total = 0;

                while ( i < lines.length ) {
                    if (lines[i].get_product() === product) {
                        i++;
                    } else {
                        order_total += lines[i].get_price_with_tax();
                        i++;
                    }
                }
            }
            if(order_total < reward.minimum_amount) {
                continue;
            }

            rewards.push(reward);
        }
        return rewards;
    },

    apply_house(reward){
        var client = this.get_partner();
        var product, product_price, order_total, spendable, linebalance, lineamt;
        var crounding;

        if (!client) {
            return;
        } else if (reward.reduction_type === 'gift') {
            product = this.pos.db.get_product_by_id(reward.gift_product_id[0]);

            if (!product) {
                return;
            }

            this.add_product(product, {
                price: 0,
                quantity: 1,
                merge: false,
                house_id: reward.id,
            });

        } else if (reward.reduction_type === 'discount') {

            crounding = this.pos.currency.rounding;
            spendable = this.get_spendable_house();
            order_total = this.get_total_with_tax();
            var discount = 0;

            product = this.pos.db.get_product_by_id(reward.discount_product_id[0]);

            if (!product) {
                return;
            }

            if(reward.discount_type === "percentage") {
                if(reward.discount_apply_on === "on_order"){
                    discount += order_total * (reward.discount_percentage / 100);
                }

                if(reward.discount_apply_on === "specific_products") {
                    for (var prod of reward.discount_specific_product_ids){
                        var specific_products = this.pos.db.get_product_by_id(prod);

                        if (!specific_products)
                            return;

                        for (var line of this.get_orderlines()){
                            if(line.product.id === specific_products.id)
                                discount += line.get_price_with_tax() * (reward.discount_percentage / 100);
                        }
                    }
                }

                if(reward.discount_apply_on === "cheapest_product") {
                    var price;
                    for (var line of this.get_orderlines()){
                        if((!price || price > line.get_unit_price()) && line.product.id !== product.id) {
                            discount = line.get_price_with_tax() * (reward.discount_percentage / 100);
                            price = line.get_unit_price();
                        }
                    }
                }
            }

            var lines    = this.get_orderlines();
            var i = 0;
            order_total = 0;

            while ( i < lines.length ) {
                if (lines[i].get_product() === product) {
                    this.removeOrderline(lines[i]);
                } else {
                    
                    lineamt = lines[i].get_price_with_tax();
                    order_total += lines[i].get_price_with_tax();
                    linebalance = (spendable > order_total) ? lineamt : spendable;

                    lines[i].set_line_house_balance(linebalance)

                    i++;
                }
            }


            if(reward.discount_type === "fixed_amount" && discount === 0)
            {
                discount = (spendable > order_total) ? order_total : spendable;
            }

            if(reward.discount_max_amount !== 0 && discount > reward.discount_max_amount)
               discount = reward.discount_max_amount;


            this.add_product(product, {
                //price: (reward.discount_type === "percentage")? -discount: -reward.discount_fixed_amount,
                price : -discount,
                quantity: 1,
                merge: false,
                house_id: reward.id,
            });

            line = this.get_last_orderline();
            //line.set_line_house_balance(-line.get_price_with_tax());
            line.set_line_house_reward();

        }
    },

    add_product(product, options) {
        options = options || {};

        var date = DateTime.now();

        var category_ids = [];
        var category = product.categ;
        while (category) {
            category_ids.push(category.id);
            category = category.parent;
        }

        var pricelist = this.pricelist;
        if (pricelist && pricelist.items) {
            var pricelist_items = pricelist.items.filter((item) => {
                return (!item.product_tmpl_id || item.product_tmpl_id[0] === product.product_tmpl_id) &&
                       (!item.product_id || item.product_id[0] === product.id) &&
                       (!item.categ_id || category_ids.includes(item.categ_id[0])) &&
                       (!item.date_start || deserializeDate(item.date_start) <= date) &&
                       (!item.date_end || deserializeDate(item.date_end) >= date)
            });
            for(var item of pricelist_items){ //pricelist.items){
             if (item.product_tmpl_id[0] === product.id && item.compute_price === 'fixed') {
                 if (item.daily_limit > 0) {
                     var client = this.get_partner();
                     if (this.get_total_bucket_count() < item.daily_limit) {
                         options.discount = 100;
                     }
                     else if (this.get_current_bucket_count() < item.daily_limit && this.get_new_bucket_count()) {
                        options.discount = undefined;//round_pr(item.daily_limit / this.get_new_bucket_count(),this.pos.currency.rounding);
                     }
                 }
             }
             if(item.compute_price === 'percentage') {
                 var defpricelist = this.pos.default_pricelist;
                 var curprice = product.get_price(pricelist, options.quantity, options.price_extra);
                 var newprice = product.get_price(defpricelist, options.quantity, options.price_extra);

                 if(curprice < newprice) {
                     options.price = newprice;
                     options.price_extra = undefined
                     options.discount = item.percent_price;
                 }
             }
        }
        }
        if(product.default_code === "MEMBER") {
            var subprice = this.get_spendable_cash()

            options.price = subprice;
            options.lst_price = subprice;
            options.price_extra = undefined
            options.discount = 0
        }
        return super.add_product(product, options);//product,options);
    },

    set_partner(partner){
        if (partner != null){
            this.env.services.orm.call(
            "res.partner",
            "fetch_balance",
            [partner.id]).then(function (balances){
                if (balances != null) {
                    partner.house_balance = balances['house'];
                    partner.prize_balance = balances['prize'];
                    partner.cash_balance = balances['cash'];
                }
            });
        }
        super.set_partner(partner);
    },

//    _addNewOrder(){
//        var client = this.get_partner();
//        if ( client ) {
//            //client.house_balance = this.get_new_total_house();
//            //client.cash_balance = -this.get_spendable_cash();
//        }
//        super._addNewOrder();
//    },

    export_for_printing() {
        var json = super.export_for_printing();
        if (this.pos.house && this.get_partner()) {
            json.house = {
                name:         this.pos.house.name,
                client:       this.get_partner().name,
                house_won  : this.get_won_house(),
                house_spent: this.get_spent_house(),
                house_total: this.get_new_total_house(),
                cash_spent: this.get_spent_cash(),
                prize_spent: this.get_used_prize_balance(),
                prize_total: this.get_new_total_prize(),
                prize_name: 'Prize'
            };
            json.prize = {
                prize_spent: this.get_used_prize_balance(),
                prize_total: this.get_new_total_prize(),
                prize_name: 'Prize'
            };
        }
        return json;
    },

    export_as_JSON() {
        var json = super.export_as_JSON();
        json.house_balance = this.get_new_house();
        json.prize_balance = this.get_used_prize_balance();
        json.cash_balance = this.get_used_cash_balance();
        json.bucket_count = this.get_total_bucket_count();
        //json.to_invoice = true;
        return json;
    },

});
