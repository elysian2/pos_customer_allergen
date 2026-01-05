odoo.define('pos_house.ProductItem', function(require) {
    "use strict";

    const ProductItem = require('point_of_sale.ProductItem');
    const Registries = require('point_of_sale.Registries');
    var core = require('web.core');
    var _t = core._t;


    const HouseProductItem = ProductItem => class extends ProductItem {
        get price() {
            const formattedUnitPrice = this.env.pos.format_currency(
                this.props.product.get_price(this.pricelist, 1),
                'Sale Price'
            );
            if (this.props.product.to_weight) {
                return `${formattedUnitPrice}/${
                    this.env.pos.units_by_id[this.props.product.uom_id[0]].name
                }`;
            } else {
                return formattedUnitPrice;
            }
            return super.price();
        }
    };
    Registries.Component.extend(ProductItem, HouseProductItem);

    return HouseProductItem;

});