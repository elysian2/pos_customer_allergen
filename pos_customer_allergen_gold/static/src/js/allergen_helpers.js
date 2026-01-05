/** @odoo-module **/

console.warn("✅ POS Customer Allergen helpers loaded");

export function getCustomerAllergenInfo(env) {
    const order = env.services.pos.get_order();
    return order?.get_partner()?.pos_allergen_info || "";
}

export function hasProductAllergenConflict(orderline) {
    const partner = orderline.order?.get_partner();
    if (!partner) return false;

    const customerAllergens = partner.pos_allergen_info || "";
    const productAllergens = orderline.product.pos_allergen_tags || "";

    return productAllergens
        .toLowerCase()
        .split(",")
        .some(a =>
            customerAllergens.toLowerCase().includes(a.trim())
        );
}
