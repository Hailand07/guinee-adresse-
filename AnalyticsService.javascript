// Calcule la vitesse de rotation (Ventes / Temps)
export const calculateRotation = (salesItems, days = 30) => {
  const stats = {};
  
  salesItems.forEach(item => {
    if (!stats[item.product_id]) {
      stats[item.product_id] = { id: item.product_id, count: 0, name: item.name };
    }
    stats[item.product_id].count += item.quantity;
  });

  // Trier pour trouver les "Top Ventes"
  return Object.values(stats).sort((a, b) => b.count - a.count);
};

// Vérifie les alertes de stock
export const checkStockAlerts = (inventory) => {
  return inventory.filter(item => item.stock_quantity <= item.min_threshold);
};
