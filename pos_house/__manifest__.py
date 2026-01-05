# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.


{
    'name': 'BWG House Accounts',
    'version': '17.0.0.1',
    'category': 'Sales/Point of Sale',
    'sequence': 12,
    'summary': 'House Accounts for the Point of Sale ',
    'author': 'Ksolves India Ltd.',
    'description': """

This module allows you to define a house account in
the point of sale, where customers can top up their accounts.

""",
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_house_views.xml',
        'views/pos_config_views.xml',
        'security/ir.model.access.csv',
        'views/product_views.xml',
        'views/view_product_template.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            '/pos_house/static/src/css/pos.css',
            '/pos_house/static/src/xml/OrderReceipt.xml',
            '/pos_house/static/src/xml/HouseButton.xml',
            '/pos_house/static/src/xml/PrizeButton.xml',
            '/pos_house/static/src/xml/HouseCounter.xml',
            '/pos_house/static/src/xml/House.xml',
            '/pos_house/static/src/xml/PrizeCounter.xml',
            '/pos_house/static/src/js/House.js',
            '/pos_house/static/src/js/HouseButton.js',
            '/pos_house/static/src/js/HouseCounter.js',
            '/pos_house/static/src/js/PrizeButton.js',
            # '/pos_house/static/src/js/ClientDetailsEdit.js',
            '/pos_house/static/src/js/PrizeCounter.js',
            # '/pos_house/static/src/js/ProductItem.js',
            '/pos_house/static/src/js/ClosePosPopup.js',
            '/pos_house/static/src/js/Chrome.js',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': True,
}
