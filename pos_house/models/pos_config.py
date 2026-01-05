# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    def _default_house_program(self):
        return self.env['house.accounts'].search([], limit=1)

    module_pos_house = fields.Boolean(default=True)
    house_id = fields.Many2one('house.accounts', string='House Account', help='The House account setup used by this point of sale.', default=_default_house_program)
    house_account_house_id = fields.Many2one('account.account', company_dependent=True,
                                             string="Account House",
                                             domain="[('deprecated', '=', False), ('company_id', '=', current_company_id)]",
                                             help="This account will be used as the default house account for the current POS",
                                             required=False)
    prize_product_id = fields.Many2one('product.product', string='Prize Account Product', domain="[('sale_ok', '=', True)]", help='The product used for Prize claims.')
    account_rule = fields.One2many('account.rule','pos_config', string='Account Rules', readonly=True, copy=True)
    miclub_location_id = fields.Char(string='MiClub POS location ID', help='Location ID for POS in MiClub')                                

    @api.onchange('module_pos_house')
    def _onchange_module_pos_house(self):
        if self.module_pos_house:
            self.house_id = self._default_house_program()
        else:
            self.house_id = False

    @api.model
    def set_house_program_to_main_config(self):
        main_config = self.env.ref('point_of_sale.pos_config_main')
        default_house_program = self._default_house_program()
        main_config.write({'module_pos_house': bool(default_house_program), 'house_id': default_house_program.id})
