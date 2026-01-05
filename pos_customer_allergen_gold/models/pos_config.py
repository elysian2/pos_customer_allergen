from odoo import models, fields

class PosConfig(models.Model):
    _inherit = "pos.config"

    show_customer_allergen_warn = fields.Boolean(
        string="Show Customer Allergen Warning",
        default=True
    )
