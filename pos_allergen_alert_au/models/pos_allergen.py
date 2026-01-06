
from odoo import models, fields

class PosAllergen(models.Model):
    _name = "pos.allergen"
    _description = "Food Allergen (FSANZ AU)"

    name = fields.Char(required=True)
    fsanz_code = fields.Char(string="FSANZ Code")
    description = fields.Text()
