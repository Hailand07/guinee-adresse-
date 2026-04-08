/**
 * Gère la logique de validation de la vente pour le Web.
 * @param {Array} cartItems - Liste des produits dans le panier.
 * @returns {number} - Le montant total de la vente.
 */
export const processSale = (cartItems) => {
  // 1. Calculer le total
  const total = cartItems.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  // 2. Feedback Physique (Vibration du téléphone)
  // Fonctionne sur Android (Chrome) et certains navigateurs mobiles.
  if ("vibrate" in navigator) {
    // Schéma de vibration : 100ms de vibration, 50ms pause, 100ms vibration
    navigator.vibrate([100, 50, 100]);
  }

  // 3. Synthèse Vocale (Le navigateur parle)
  if ('speechSynthesis' in window) {
    const message = new SpeechSynthesisUtterance();
    message.text = `Le total est de ${total} Francs Guinéens`;
    message.lang = 'fr-FR';
    message.rate = 1; // Vitesse normale
    
    // On lance la voix
    window.speechSynthesis.speak(message);
  } else {
    console.log("La synthèse vocale n'est pas supportée par ce navigateur.");
  }

  return total;
};
