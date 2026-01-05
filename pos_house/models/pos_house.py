# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError
from odoo.osv import expression
from odoo.tools.safe_eval import safe_eval


class HouseProgram(models.Model):
    _name = 'house.accounts'
    _description = 'House Accounts'

    name = fields.Char(string='House Account Name', index=True, required=True, translate=True, help="An internal identification for the house accountconfiguration")
    balance = fields.Float(string='Increase in $ spent', help="How many house points are given to the customer by sold currency")
    rule_ids = fields.One2many('house.rule', 'house_program_id', string='Rules')
    balance_ids = fields.One2many('house.reward', 'house_program_id', string='Rewards')
    active = fields.Boolean(default=True)


class HouseRule(models.Model):
    _name = 'house.rule'
    _description = 'House Balance Rule'

    name = fields.Char(index=True, required=True, help="An internal identification for this House balance rule")
    house_program_id = fields.Many2one('house.accounts', string='House Account', help='The House Account Configuration')
    house_quantity = fields.Float(string="Points per Unit")
    house_currency = fields.Float(string="Points per $ spent")
    rule_domain = fields.Char()
    valid_product_ids = fields.One2many('product.product', compute='_compute_valid_product_ids')

    @api.depends('rule_domain')
    def _compute_valid_product_ids(self):
        for rule in self:
            if rule.rule_domain:
                domain = safe_eval(rule.rule_domain)
                domain = expression.AND([domain, [('available_in_pos', '=', True)]])
                rule.valid_product_ids = self.env['product.product'].search(domain)
            else:
                rule.valid_product_ids = self.env['product.product'].search([('available_in_pos', '=', True)])


class HouseReward(models.Model):
    _name = 'house.reward'
    _description = 'House Balance Usage'

    name = fields.Char(index=True, required=True, help='An internal identification for this house balance usage')
    house_program_id = fields.Many2one('house.accounts', string='House Account', help='The House Account this reward belongs to')
    minimum_house = fields.Float(help='The minimum amount of balance the customer must have to draw on balance', default=1)
    reduction_type = fields.Selection([('discount', 'Discount')], required=True, help='The type of the reward', default="discount")
    gift_product_id = fields.Many2one('product.product', string='Gift Product', help='The product given as a reward')
    balance_reduction = fields.Float(string='Balance Usage Cost', help="The amount to reduce house balance by $", default=1)
    discount_product_id = fields.Many2one('product.product', string='Discount Product', help='The product used to apply discounts')
    discount_type = fields.Selection([('fixed_amount', 'Fixed Amount')], default="fixed_amount")
    discount_percentage = fields.Float(string="Discount", default=10, help='The discount in percentage, between 1 and 100')
    discount_apply_on = fields.Selection([
        ('on_order', 'On Order'),
        ('specific_products', 'On Specific Products')], default="on_order",
        help="On Order - Discount on whole order\n" +
             "Specific products - Discount on selected specific products")
    discount_specific_product_ids = fields.Many2many('product.product', string="Products", help="Products that will be discounted if the discount is applied on specific products")
    discount_max_amount = fields.Float(default=0, help="Maximum amount of discount that can be provided")
    discount_fixed_amount = fields.Float(string="Fixed Amount", help='The discount in fixed amount', default=1)
    minimum_amount = fields.Float(string="Minimum Order Amount")

    @api.constrains('reduction_type', 'gift_product_id')
    def _check_gift_product(self):
        if self.filtered(lambda reward: reward.reduction_type == 'gift' and not reward.gift_product_id):
            raise ValidationError(_('The gift product field is mandatory for gift rewards'))

    @api.constrains('reduction_type', 'discount_product_id')
    def _check_discount_product(self):
        if self.filtered(lambda reward: reward.reduction_type == 'discount' and not reward.discount_product_id):
            raise ValidationError(_('The discount product field is mandatory for discount rewards'))
