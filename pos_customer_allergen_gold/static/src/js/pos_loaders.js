/** @odoo-module **/

console.warn("✅ POS Customer Allergen loader loaded");

export function loadAllergenPatches(PosScreen) {
    // Defer execution until POS OWL is ready
    PosScreen.addMountedHook(function () {
        const Registries = window.Registries;
        if (!Registries) {
            console.error("❌ Registries not found. POS may not be initialized yet.");
            return;
        }

        console.log("✅ POS Allergen hook mounted");

        // --- Patch OrderSummary for customer allergen info ---
        const OrderSummary = Registries.Component.get('OrderSummary');
        if (OrderSummary) {
            Registries.Component.extend(OrderSummary, class extends OrderSummary {
                get customerAllergenInfo() {
                    const order = this.env.pos.get_order();
                    return order?.get_partner()?.pos_allergen_note || '';
                }
            });
        }

        // --- Patch ProductScreen for product allergen conflict badge ---
        const ProductScreen = Registries.Component.get('ProductScreen');
        if (ProductScreen) {
            Registries.Component.extend(ProductScreen, class extends ProductScreen {
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
            });
        }

        console.log("✅ POS Customer Allergen Gold JS fully applied");
    });
}

// Auto-run when the module is loaded
if (window.Registries && window.Registries.Component.get('PosScreen')) {
    const PosScreen = window.Registries.Component.get('PosScreen');
    loadAllergenPatches(PosScreen);
}
