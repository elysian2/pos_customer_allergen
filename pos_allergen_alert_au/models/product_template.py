
from odoo import models, fields

class ProductTemplate(models.Model):
    _inherit = "product.template"

    allergen_ids = fields.Many2many("pos.allergen", string="Contains Allergens (FSANZ)")
