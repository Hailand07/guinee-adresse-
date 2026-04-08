/**
 * Finalise la transaction en gérant le mode en ligne/hors-ligne.
 * @param {Object} saleData - Les données complètes de la vente.
 * @param {boolean} isOnline - État de la connexion détecté.
 */
export const finalizeTransaction = async (saleData, isOnline) => {
  if (isOnline) {
    try {
      // 1. Tentative d'envoi immédiat à Supabase
      // Note : 'supabase' doit être initialisé dans ton main.js
      const { error } = await window.supabase
        .from('sales')
        .insert([saleData]);

      if (error) throw error;
      
      console.log("✅ Vente synchronisée sur le Cloud Supabase.");
      return { success: true, status: 'synced' };
      
    } catch (error) {
      console.error("❌ Échec synchro, bascule en mode local :", error);
      return saveLocally(saleData);
    }
  } else {
    // 2. Pas d'internet : Sauvegarde locale immédiate
    return saveLocally(saleData);
  }
};

/**
 * Sauvegarde la vente dans le localStorage du navigateur.
 */
const saveLocally = (saleData) => {
  try {
    // On récupère les ventes déjà en attente
    const pendingSales = JSON.parse(localStorage.getItem('hailandx_pending_sales') || '[]');
    
    // On ajoute la nouvelle vente avec un marqueur temporel
    pendingSales.push({
      ...saleData,
      offline_at: new Date().toISOString()
    });
    
    // On réenregistre le tout
    localStorage.setItem('hailandx_pending_sales', JSON.stringify(pendingSales));
    
    console.log("💾 Vente sauvegardée localement (localStorage).");
    return { success: true, status: 'offline_saved' };
  } catch (e) {
    console.error("Erreur critique de stockage local :", e);
    return { success: false, error: e };
  }
};

/**
 * Tente de synchroniser toutes les ventes en attente dès que le réseau revient.
 */
export const syncPendingSales = async () => {
  const pendingSales = JSON.parse(localStorage.getItem('hailandx_pending_sales') || '[]');
  
  if (pendingSales.length === 0) return;

  console.log(`🔄 Tentative de synchronisation de ${pendingSales.length} ventes...`);
  
  const { error } = await window.supabase
    .from('sales')
    .insert(pendingSales);

  if (!error) {
    localStorage.removeItem('hailandx_pending_sales'); // On vide le stock local
    console.log("✨ Toutes les ventes locales ont été envoyées !");
  }
};
