import { createProductCard } from './index.js';
import { processSale } from './CartLogic.js';

// Le panier est stocké dans une variable globale pour cette session
let cart = [];

/**
 * Affiche la grille des produits dans le conteneur HTML.
 * @param {Array} products - La liste des produits venant de Supabase.
 */
export const renderBoutique = (products) => {
    const gridContainer = document.getElementById('grid-container');
    
    // Générer le HTML pour chaque produit
    gridContainer.innerHTML = products.map(item => createProductCard(item)).join('');
};

/**
 * Gère l'ajout d'un produit au panier (appelée par onclick dans index.js)
 */
window.handleAddToCart = (productId) => {
    // Note : On récupère les infos du produit (simplifié ici)
    cart.push({ id: productId, quantity: 1 });
    
    // Faire vibrer légèrement pour confirmer l'ajout
    if (navigator.vibrate) navigator.vibrate(50);
    
    updateSellButton();
    console.log("Panier actuel:", cart);
};

/**
 * Gère l'appui long (menu contextuel)
 */
window.handleLongPress = (productId) => {
    const qty = prompt("Quantité souhaitée ?", "1");
    if (qty) {
        cart.push({ id: productId, quantity: parseInt(qty) });
        updateSellButton();
    }
};

/**
 * Affiche ou cache le bouton VENDRE selon le contenu du panier
 */
const updateSellButton = () => {
    const btnVendre = document.getElementById('btn-vendre');
    if (cart.length > 0) {
        btnVendre.style.display = 'block';
        btnVendre.innerHTML = `VENDRE (${cart.length} articles)`;
    } else {
        btnVendre.style.display = 'none';
    }
};

/**
 * Finalise la vente
 */
window.finalizeSale = () => {
    if (cart.length === 0) return;

    // Appel à la logique de vibration et de voix que nous avons créée
    // Note : Dans un cas réel, on passerait les vrais prix ici
    processSale(cart);

    // Vider le panier et mettre à jour l'interface
    cart = [];
    updateSellButton();
    alert("Vente enregistrée !");
};
