from odoo import models, fields

class ResConfigSettings(models.TransientModel):
   _inherit = 'res.config.settings'

   pos_show_customer_allergens = fields.Boolean(related='pos_config_id.show_customer_allergen_warn', readonly=False)
