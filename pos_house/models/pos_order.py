# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    house_balance = fields.Float(help='The Adjustment to the customer house balance on this order')
    prize_balance = fields.Float(string='Prize reduction', help='The Adjustment to the customer Prize account balance on this order')
    cash_balance = fields.Float(string='Member Subscription Amount', help='The Adjustment to the customer membership balance on this order')
    bucket_count = fields.Integer(help="Updated bucket count from this order")

    @api.model
    def _process_order(self, order, draft, existing_order):
        partner = order.get('partner_id') is not False
        order_id = super(PosOrder, self)._process_order(order, draft, existing_order)
        pos_order = self.browse(order_id)
        if pos_order:
            pos_order.write({'to_invoice': partner})
        return order_id

    @api.model
    def _order_fields(self, ui_order):
        fields = super(PosOrder, self)._order_fields(ui_order)
        fields['house_balance'] = ui_order.get('house_balance', 0)
        fields['bucket_count'] = ui_order.get('bucket_count',0)
        fields['to_invoice'] = ui_order.get('partner_id') is not False
        if ui_order.get('statement_ids') and not ui_order.get('lines'):
            fields['to_invoice'] = False
        if 'prize_balance' in ui_order:
            fields['prize_balance'] = ui_order.get('prize_balance',0)
        if 'cash_balance' in ui_order:
            fields['cash_balance'] = ui_order.get('cash_balance',0)
        return fields

    @api.model
    def create_from_ui(self, orders, draft=False):
        order_ids = super(PosOrder, self).create_from_ui(orders, draft)
        for order in self.sudo().browse([o['id'] for o in order_ids]):
            if order.partner_id:
                if order.house_balance != 0:
                    order.partner_id.house_balance += order.house_balance
                if order.prize_balance != 0:
                    order.partner_id.prize_balance += order.prize_balance
                if order.cash_balance != 0:
                    order.partner_id.cash_balance += order.cash_balance
                order.partner_id.bucket_count += order.bucket_count
        return order_ids

    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        super(PosOrder, self)._onchange_partner_id()
        if self.partner_id:
            self.to_invoice = True

    def _create_invoice(self, move_vals):
        new_move = super(PosOrder, self)._create_invoice(move_vals)
        house_balance_change = -self.house_balance
        house_balance_2 = 0#self.house_balance
        house_account = self.partner_id.house_account_house_id.id
        pos_config = self.config_id

        if not house_account:
            house_account = pos_config.house_account_house_id.id
        if house_balance_2 and house_account and self.partner_id.property_account_receivable_id.id:
            self.env['account.move.line'].create([{
                'debit': house_balance_change < 0.0 and -house_balance_change or 0.0,
                'credit': house_balance_change > 0.0 and house_balance_change or 0.0,
                'quantity': 1.0,
                'amount_currency': house_balance_change,
                'partner_id': new_move.partner_id.id,
                'move_id': new_move.id,
                'currency_id': new_move.currency_id if new_move.currency_id != new_move.company_id.currency_id else False,
                'company_id': new_move.company_id.id,
                'company_currency_id': new_move.company_id.currency_id.id,
                'is_rounding_line': False,
                'sequence': 9999,
                'exclude_from_invoice_tab': True,
                'name': 'House Balance adjustment',
                'account_id': house_account #self.partner_id.house_account_house_id.id
            },
            {
                'debit': house_balance_2 < 0.0 and -house_balance_2 or 0.0,
                'credit': house_balance_2 > 0.0 and house_balance_2 or 0.0,
                'quantity': 1.0,
                'amount_currency': house_balance_2,
                'partner_id': new_move.partner_id.id,
                'move_id': new_move.id,
                'currency_id': new_move.currency_id if new_move.currency_id != new_move.company_id.currency_id else False,
                'company_id': new_move.company_id.id,
                'company_currency_id': new_move.company_id.currency_id.id,
                'is_rounding_line': False,
                'sequence': 9999,
                'exclude_from_invoice_tab': True,
                'name': 'House Balance adjustment',
                'account_id': self.partner_id.property_account_receivable_id.id
            }])

        lines = self.lines.filtered(lambda l: l.house_reward == False and l.house_topup == False and l.discount > 0)
        discount = 0
        for line in lines:
            lineprice = line.price_unit * line.qty
            discountprice = (line.price_unit * (1 - (line.discount or 0.0) / 100.0)) * line.qty
            discount += lineprice - discountprice

        if discount:
            product = pos_config.discount_product_id
            if product and product.property_account_income_id:
                house_account = product.property_account_income_id.id
                offset_account = product.property_account_creditor_price_difference.id
                analytic_account_id = False

                rec = self.env['account.analytic.default'].account_get(
                    product_id=product.id,
                    partner_id=self.partner_id.commercial_partner_id.id,
                    account_id=house_account,
                    user_id=self.env.uid,
                    date=new_move.date,
                    company_id=new_move.company_id.id
                )
                if rec:
                    analytic_account_id = rec.analytic_id.id

                #self.partner_id.property_account_receivable_id.id
                if house_account and offset_account:
                    self.env['account.move.line'].create([{
                        'debit': discount < 0.0 and -discount or 0.0,
                        'credit': discount > 0.0 and discount or 0.0,
                        'quantity': 1.0,
                        'amount_currency': discount,
                        'partner_id': new_move.partner_id.id,
                        'move_id': new_move.id,
                        'currency_id': new_move.currency_id if new_move.currency_id != new_move.company_id.currency_id else False,
                        'company_id': new_move.company_id.id,
                        'company_currency_id': new_move.company_id.currency_id.id,
                        'is_rounding_line': False,
                        'sequence': 9999,
                        'name': 'Discounted Value',
                        'account_id': offset_account,
                        'exclude_from_invoice_tab': True,
                        'analytic_account_id': analytic_account_id if analytic_account_id else False
                        },
                        {
                            'debit': -discount < 0.0 and discount or 0.0,
                            'credit': -discount > 0.0 and -discount or 0.0,
                            'quantity': 1.0,
                            'amount_currency': -discount,
                            'partner_id': new_move.partner_id.id,
                            'move_id': new_move.id,
                            'currency_id': new_move.currency_id if new_move.currency_id != new_move.company_id.currency_id else False,
                            'company_id': new_move.company_id.id,
                            'company_currency_id': new_move.company_id.currency_id.id,
                            'is_rounding_line': False,
                            'sequence': 9999,
                            'name': 'Discount on Sale',
                            'account_id': house_account,
                            'exclude_from_invoice_tab': True,
                            'analytic_account_id': analytic_account_id if analytic_account_id else False
                        }])
        return new_move


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    house_balance = fields.Float(string='House balance used', help='The Adjustment to the customer house balance on this line')
    prize_balance = fields.Float(string='Prize reduction', help='The Adjustment to the customer Prize account balance on this line')
    cash_balance = fields.Float(string='Member Subscription Amount', help='The Adjustment to the customer membership balance on this order')
    house_topup = fields.Boolean(string="Top Up Item")
    house_reward = fields.Boolean(string="House reward Item")

    @api.model
    def _export_for_ui(self, orderline):
        export = super(PosOrderLine, self)._export_for_ui(orderline)
        #export['house_balance'] = orderline.get('house_balance',0)
        return export




