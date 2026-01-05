{
    "name": "POS Customer Allergen Gold",
    "version": "17.0.0.1",
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
        'point_of_sale._assets_pos': [
            "pos_customer_allergen_gold/static/src/css/allergen.css",
            #"pos_customer_allergen_gold/static/src/js/allergen_helpers.js",
            "pos_customer_allergen_gold/static/src/js/OrderAllergenInfo.js",
            "pos_customer_allergen_gold/static/src/js/AllergenWidget.js",
            #"pos_customer_allergen_gold/static/src/js/AllergenWidgetPatch.js",
            "pos_customer_allergen_gold/static/src/js/pos_loaders.js",
            #"pos_customer_allergen_gold/static/src/js/partner_fields.js",
            #"pos_customer_allergen_gold/static/src/js/product_fields.js",
            #"pos_customer_allergen_gold/static/src/js/product_allergen_warning.js",
            #"pos_customer_allergen_gold/static/src/xml/order_allergen.xml",
            #"pos_customer_allergen_gold/static/src/xml/product_allergen_warning.xml",
            #"pos_customer_allergen_gold/static/src/js/customer_allergen_banner.js",
            #"pos_customer_allergen_gold/static/src/js/product_allergen_badge.js",
            "pos_customer_allergen_gold/static/src/xml/order_allergen.xml",
            "pos_customer_allergen_gold/static/src/xml/product_allergen_warning.xml",
            "pos_customer_allergen_gold/static/src/xml/AllergenWidget.xml"#,
            #"pos_customer_allergen_gold/static/src/xml/allergen_widget.xml"
        #],
        #"point_of_sale.qweb": [
        #    "pos_customer_allergen_gold/static/src/xml/order_allergen.xml",
        #    "pos_customer_allergen_gold/static/src/xml/product_allergen_warning.xml"
        ]
    },
    "installable": True,
}
