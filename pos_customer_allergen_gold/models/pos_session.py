from odoo import models

class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        params = super()._loader_params_res_partner()
        params["search_params"]["fields"].append("pos_allergen_note")
        return params

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        params["search_params"]["fields"].append("pos_allergen_tags")
        return params
