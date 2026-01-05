# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from itertools import chain

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_repr
from odoo.tools.misc import get_lang


class PricelistItem(models.Model):
    _inherit = 'product.pricelist.item'

    daily_limit = fields.Integer(default=0)

    def _calc_daily_orders(self, partner, date=False):
        ordercount = []
        for pricelist in self:
            for item in pricelist:
                orders = self.env['pos.order.line'].sudo().search(['|', ('product_id', 'in', item.product_id), ('order_id.partner_id', 'in', partner.ids)])
                ordercount.append(orders)
        totalOrders = len(ordercount)
        return totalOrders

    def _compute_price_rule(self, products_qty_partner, date=False, uom_id=False):
        pricerule = super(PricelistItem, self)._compute_price_rule(products_qty_partner,date,uom_id)
        return pricerule
