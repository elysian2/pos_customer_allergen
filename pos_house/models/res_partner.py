# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models
from odoo.exceptions import UserError
import pytz


class ResPartner(models.Model):
    _inherit = 'res.partner'

    house_balance = fields.Float(compute='_compute_house_balance', help='The House Balance of the customer')
    prize_balance = fields.Float(compute='_compute_prize_balance', help='The Prize Account Balance of the customer')
    cash_balance = fields.Float(string='Subscription Balance', compute='_compute_cash_balance', help='The Subscription Account Balance of the member')
    bucket_count = fields.Integer(compute='_compute_bucket_count', string='Daily bucket count')
    house_account_house_id = fields.Many2one('account.account', company_dependent=True, string="Account House",
                                                     domain="[('deprecated', '=', False), ('company_id', '=', current_company_id)]",
                                                     help="This account will be used instead of the default one as the house account for the current partner",
                                                     required=False)
    prize_account_prize_id = fields.Many2one('account.account', company_dependent=True, string="Account Prize winnings",
                                             domain="[('deprecated', '=', False), ('company_id', '=', current_company_id)]",
                                             help="his account will be used as the default prize winning for the current partner",
                                             required=False)

    def _compute_bucket_count(self):
        totalorders = 0
        items = self.env['product.product'].sudo().search([('pos_bucket', '=', True)])
        user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz or 'UTC')
        today = user_tz.localize(fields.Datetime.from_string(fields.Date.context_today(self)))
        date_start = today.astimezone(pytz.timezone('UTC'))

        for partner in self:
            totalorders = 0
            for item in items:
                orders = self.env['pos.order.line'].sudo().search(['&', ('product_id', '=', item.id),
                                                  ('order_id.date_order','>=',fields.Datetime.to_string(date_start)),
                                                            ('order_id.partner_id', '=', partner.id)])
                for order in orders:
                    totalorders += order.qty;#ordercount.append(orders)
            partner.bucket_count = totalorders
        #totalOrders = len(ordercount)

    def _compute_house_balance(self):
        account_type = self.env['account.type'].get_house_type()
        if account_type:
            for record in self:
                account = self.env['member.account'].sudo().search(
                                    [('partner', '=', record.id),
                                    ('account_type','=', account_type.id)
                                    ],limit=1)
                if account:
                    record.house_balance = account.balance
                else:
                    record.house_balance = 0
        else:
            self.house_balance = 0

    def _compute_prize_balance(self):
        account_type = self.env['account.type'].get_prize_type()
        if account_type:
            for record in self:
                account = self.env['member.account'].sudo().search(
                                    [('partner', '=', record.id),
                                    ('account_type','=', account_type.id)
                                    ],limit=1)
                if account:
                    record.prize_balance = account.balance
                else:
                    record.prize_balance = 0
        else:
            self.prize_balance = 0

    def _compute_cash_balance(self):
        account_type = self.env['account.type'].sudo().search(
            [('account_type', '=', '99')]
        )
        if account_type:
            for record in self:
                account = self.env['member.account'].sudo().search(
                                    [('partner', '=', record.id),
                                    ('account_type','=', account_type.id)
                                    ],limit=1)
                if account:
                    record.cash_balance = account.balance
                else:
                    record.cash_balance = 0
        else:
            self.cash_balance = 0

    def house_account_id(self):
        account_type = self.env['account.type'].get_house_type()
        account = self.env['member.account'].sudo().search(
                            [('partner', '=', self.id),
                            ('account_type','=', account_type.id)
                            ],limit=1)
        return account.account_id

    def prize_account_id(self):
        account_type = self.env['account.type'].get_prize_type()
        account = self.env['member.account'].sudo().search(
                            [('partner', '=', self.id),
                            ('account_type','=', account_type.id)
                            ],limit=1)
        return account.account_id

    def cash_account_id(self):
        account_type = self.env['account.type'].sudo().search(
            [('account_type', '=', '99')])
        account = self.env['member.account'].sudo().search(
                            [('partner', '=', self.id),
                            ('account_type','=', account_type.id)
                            ],limit=1)
        return account.account_id

    def update_house_balance(self, amount):
        account_type = self.env['account.type'].get_house_type()
        if account_type:
            account = self.env['member.account'].sudo().search(
                                    [('partner', '=', self.id),
                                    ('account_type','=', account_type.id)
                                    ],limit=1)
            if account:
                account.write(({'balance' : self.house_balance + amount}))

    def update_prize_balance(self, amount):
        account_type = self.env['account.type'].get_prize_type()
        if account_type:
            account = self.env['member.account'].sudo().search(
                                    [('partner', '=', self.id),
                                    ('account_type','=', account_type.id)],limit=1)
            if account:
                account.write(({'balance' : self.prize_balance + amount}))


class MemberAccount(models.Model):
    _name = 'member.account'
    _description = 'Member Accounts'

    account_id = fields.Char(company_dependent=True, help='ID of account for this balance')
    account_type = fields.Many2one('account.type', company_dependent=True,
                              help="Type of account for this balance", required=True)
    account_type_id = fields.Char(related='account_type.account_type')
    account_name = fields.Char(company_dependent=True, help='Name of account for this balance')
    partner = fields.Many2one('res.partner',  company_dependent=True, string="Partner",
                              #domain="[('deprecated', '=', False), ('company_id', '=', current_company_id)]",
                              help="The party this account belongs to", required=True)
    balance = fields.Float(company_dependent=True, help='The monitary balance of the account')

class AccountType(models.Model):
    _name = 'account.type'
    _description = 'Account Type'
    _rec_name = 'account_name'

    account_type = fields.Char(company_dependent=True, help='Id of account type')
    account_name = fields.Char(company_dependent=True, help='Name of account type')
    house = fields.Boolean(help='Account type marked as house')
    prize = fields.Boolean(help='Account type marked as prize')

    def get_house_type(self):
        account_type = self.env['account.type'].sudo().search([('house', '=', 'True')])
        if account_type:
            return account_type
        else:
            raise UserError('House account type has not been configured!')

    def get_prize_type(self):
        account_type = self.env['account.type'].sudo().search([('prize', '=', 'True')])
        if account_type:
            return account_type
        else:
            raise UserError('Prize account type has not been configured!')
    
class AccountRule(models.Model):
    _name = 'account.rule'
    _description = 'Account Rule'

    account_type = fields.Many2one('account.type', company_dependent=True, help="Type of account for this rule set", required=True)
    account_type_name = fields.Char(related='account_type.account_name')
    #account_name = fields.Char(related='account_type.account_name')
    pos_config = fields.Many2one('pos.config', company_dependent=True, help="POS related to this rule set", required=True)
    use_for_purchase = fields.Boolean(company_dependent=True, help='Can be used to make purchases by customer')
    top_up = fields.Boolean(company_dependent=True, help='Can be topped up by customer')
    subscription_payment = fields.Boolean(company_dependent=True, help='Can be used to pay for subscription')
