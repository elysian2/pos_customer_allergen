from odoo import models, fields

class ProductTemplate(models.Model):
    _inherit ='product.template'

    pos_allergen_tags = fields.Char('POS Allergen Tags')
