
{
    "name": "POS Allergen Alert (AU Compliance)",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "summary": "AU-compliant POS allergen alerts with restaurant, KDS and QR ordering support",
    "depends": ["point_of_sale", "pos_restaurant"],
    "data": [
        "security/ir.model.access.csv",
        "views/res_partner_view.xml",
        "views/product_template_view.xml",
        "views/pos_allergen_view.xml"
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_allergen_alert_au/static/src/js/**/*.js",
            "pos_allergen_alert_au/static/src/xml/**/*.xml"
        ]
    },
    "installable": True,
    "application": False
}
