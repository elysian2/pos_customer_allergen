# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, models, fields, _
from odoo.exceptions import ValidationError


class ProductProduct(models.Model):
    _inherit = 'product.product'

    def write(self, vals):
        if 'active' in vals and not vals['active']:
            product_in_house = self.env['house.reward'].sudo().search(['|', ('gift_product_id', 'in', self.ids), ('discount_product_id', 'in', self.ids)], limit=1)
            if product_in_house:
                raise ValidationError(_("The product cannot be archived because it's used for Point Of Sale House Accounts."))
        super().write(vals)


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_fee_item = fields.Boolean(string="Hidden in POS",
                    help="Check this box if the product should be hidden from the POS products.")
    pos_exclude_prize = fields.Boolean(string="Exclude from Prize Payments",
                    help="Check this box if the product can not be purchased with the prize account.")
    pos_bucket = fields.Boolean(string="Is Bucket", help="Free bucket of balls for members")