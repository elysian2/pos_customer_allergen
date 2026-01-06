
from odoo import models, fields

class ResPartner(models.Model):
    _inherit = "res.partner"

    allergen_ids = fields.Many2many("pos.allergen", string="Allergens")
    allergen_notes = fields.Text(string="Allergy Notes (Displayed to Kitchen)")

    allergen_names = fields.Text(string="Allergen Names",compute='_allergen_names')

    def _allergen_names(self):
        allergens = ""
        for partner in self:
            allergen_names = ", ".join(allergen.name for allergen in partner.allergen_ids if allergen.name)
            partner.allergen_names = allergen_names

        #return allergens

