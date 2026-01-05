from odoo import models, fields


class ResPartner(models.Model):
  _inherit = "res.partner"

  pos_allergen_note = fields.Text("POS Allergen / Notes")

