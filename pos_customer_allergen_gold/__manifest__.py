{
    "name": "POS Customer Allergen Gold",
    "version": "17.0.5.0.0",
    "category": "Point of Sale",
    "summary": "Full allergen safety system for Odoo POS",
    "depends": ["point_of_sale"],
    "data": [
        "security/ir.model.access.csv",
        "views/res_partner_views.xml",
        "views/product_views.xml",
        "views/pos_config_views.xml"
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_customer_allergen_gold/static/src/css/allergen.css",
            "pos_customer_allergen_gold/static/src/js/pos_loaders.js",
            "pos_customer_allergen_gold/static/src/xml/order_allergen.xml",
            "pos_customer_allergen_gold/static/src/xml/product_allergen_warning.xml"
        ]
    },
    "installable": True,
}
