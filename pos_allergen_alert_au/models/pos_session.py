
from odoo import models

class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_pos_ui_models_to_load(self):
        res = super()._get_pos_ui_models_to_load()
        res.append("pos.allergen")
        return res

    def _loader_params_res_partner(self):
        params = super()._loader_params_res_partner()
        params["search_params"]["fields"].append("allergen_ids")
        params["search_params"]["fields"].append("allergen_notes")
        params["search_params"]["fields"].append("allergen_names")

        params["search_params"]["fields"].append("image_1920")
        return params

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        params["search_params"]["fields"].append("allergen_ids")
        return params
