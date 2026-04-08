/**
 * Génère le code HTML d'une carte produit pour le Web.
 * @param {Object} item - Les données du produit (nom, prix, image, etc.)
 * @returns {string} - Le bloc HTML de la carte.
 */
export const createProductCard = (item) => {
    // Logique de couleur pour le stock (Vert si > seuil, sinon Rouge)
    const stockColor = item.stock_quantity > item.min_threshold ? '#4CD964' : '#FF3B30';

    return `
        <div class="product-card" 
             onclick="handleAddToCart('${item.id}')" 
             oncontextmenu="handleLongPress('${item.id}'); return false;"
             style="width: 45%; margin: 2.5%; border-radius: 15px; background-color: #1A1A1A; overflow: hidden; position: relative; cursor: pointer; display: inline-block; vertical-align: top;">
            
            <img src="${item.image_url}" 
                 alt="${item.name}" 
                 style="width: 100%; height: 150px; object-fit: cover; display: block;" 
                 loading="lazy">
            
            <div class="stock-badge" 
                 style="position: absolute; top: 10px; right: 10px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid #FFF; background-color: ${stockColor};">
            </div>
            
            <div class="price-tag" 
                 style="background-color: #000; padding: 8px; text-align: center;">
                <span class="price-text" 
                      style="color: #FFD700; font-weight: bold; font-size: 16px;">
                    ${item.selling_price} FG
                </span>
            </div>
        </div>
    `;
};
