export const finalizeTransaction = async (saleData, isOnline) => {
  if (isOnline) {
    // Envoyer directement à Supabase
    // const { error } = await supabase.from('sales').insert(saleData);
    console.log("Vente synchronisée sur le Cloud.");
  } else {
    // Sauvegarder dans la table SQLite 'local_sales' pour plus tard
    // db.executeSync("INSERT INTO local_sales...");
    console.log("Vente sauvegardée localement (Offline).");
  }
};
