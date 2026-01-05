# -*- coding: utf-8 -*-

from odoo import models


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        new_models_to_load = [model for model in ['house.accounts', 'house.rule', 'house.reward'] if model not in result]
        result.extend(new_models_to_load)
        return result

    def _loader_params_house_accounts(self):
        house_ids = self.config_id.house_id.ids
        return {
            'search_params': {
                'domain': [('id', 'in', house_ids)],
                'fields': ['name','balance'],
            },
        }

    def _get_pos_ui_house_accounts(self, params):
        return self.env['house.accounts'].search_read(**params['search_params'])

    def _loader_params_house_rule(self):
        return {
            'search_params': {
                'fields': ['name','valid_product_ids','house_quantity','house_currency','house_program_id'],
            },
        }

    def _get_pos_ui_house_rule(self, params):
        return self.env['house.rule'].search_read(**params['search_params'])

    def _loader_params_house_reward(self):
        return {
            'search_params': {
                'fields': ['name','reduction_type','minimum_house','gift_product_id','balance_reduction','discount_product_id',
                            'discount_percentage', 'discount_fixed_amount', 'discount_apply_on', 'discount_type', 'discount_apply_on',
                            'discount_specific_product_ids', 'discount_max_amount', 'minimum_amount', 'house_program_id'],
            },
        }

    def _get_pos_ui_house_reward(self, params):
        return self.env['house.reward'].search_read(**params['search_params'])

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result['search_params']['fields'].extend(['pos_exclude_prize', 'pos_fee_item', 'pos_bucket', 'default_code', 'qty_available'])
        return result

    def _loader_params_res_partner(self):
        result = super()._loader_params_res_partner()
        result['search_params']['fields'].extend(['house_balance', 'bucket_count', 'prize_balance', 'cash_balance'])
        if self.user_has_groups('account.group_account_invoice'):
            result['search_params']['fields'].extend(['credit_limit', 'total_due', 'use_partner_credit_limit'])
        return result

    def _loader_params_res_company(self):
        result = super()._loader_params_res_company()
        if self.user_has_groups('account.group_account_invoice'):
            result['search_params']['fields'].extend(['account_use_credit_limit'])
        return result

    def _get_pos_ui_res_partner(self, params):
        partners_list = super()._get_pos_ui_res_partner(params)
        if self.config_id.currency_id != self.env.company.currency_id and self.user_has_groups('account.group_account_invoice'):
            for partner in partners_list:
                partner['total_due'] = self.env.company.currency_id._convert(partner['total_due'], self.config_id.currency_id, self.env.company, fields.Date.today())
        return partners_list