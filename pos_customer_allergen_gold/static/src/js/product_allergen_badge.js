/** @odoo-module **/

import { Registries } from '@point_of_sale/Registries';
import { ProductScreen } from '@point_of_sale/app/screens/product_screen/product_screen';

// Patch ProductScreen to show product-level allergen conflicts
const patchProductScreen = (ProductScreen) => {
    class ProductScreenAllergen extends ProductScreen {
        mounted() {
            super.mounted();
            console.warn("✅ ProductScreenAllergen mounted");
        }

        get hasAllergenConflict() {
            const order = this.env.pos.get_order();
            const partnerAllergens = order?.get_partner()?.pos_allergen_note || '';
            const productAllergens = this.selectedProduct?.pos_allergen_tags || '';
            if (!partnerAllergens || !productAllergens) return false;

            return productAllergens
                .toLowerCase()
                .split(',')
                .some(tag => partnerAllergens.toLowerCase().includes(tag.trim()));
        }
    }

    Registries.Component.extend(ProductScreen, ProductScreenAllergen);
};

patchProductScreen(ProductScreen);
