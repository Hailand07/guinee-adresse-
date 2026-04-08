/**
 * Calcule la vitesse de rotation des stocks.
 * Identifie quels produits se vendent le plus vite.
 * @param {Array} salesItems - Liste des articles vendus récupérée de Supabase.
 * @returns {Array} - Liste triée des produits les plus vendus.
 */
export const calculateRotation = (salesItems) => {
  const stats = {};
  
  salesItems.forEach(item => {
    // Si le produit n'est pas encore dans nos stats, on l'initialise
    if (!stats[item.product_id]) {
      stats[item.product_id] = { 
        id: item.product_id, 
        count: 0, 
        name: item.name,
        image: item.image_url // On garde l'image pour le Dashboard plus tard
      };
    }
    // On additionne les quantités vendues
    stats[item.product_id].count += item.quantity;
  });

  // On transforme l'objet en liste et on trie du plus vendu au moins vendu
  return Object.values(stats).sort((a, b) => b.count - a.count);
};

/**
 * Vérifie quels produits sont en dessous du seuil de sécurité.
 * @param {Array} inventory - Ton stock actuel (Table boutique_inventory).
 * @returns {Array} - Liste des produits à racheter en priorité.
 */
export const checkStockAlerts = (inventory) => {
  return inventory.filter(item => {
    // On s'assure que les valeurs sont bien des nombres avant de comparer
    const currentStock = Number(item.stock_quantity);
    const threshold = Number(item.min_threshold);
    return currentStock <= threshold;
  });
};
