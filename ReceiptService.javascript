/**
 * Génère un reçu numérique et propose le partage ou le téléchargement.
 * @param {Object} saleData - Infos de la vente.
 * @param {Array} cartItems - Articles dans le panier.
 */
export const generateReceiptPDF = async (saleData, cartItems) => {
  // 1. On réutilise la structure HTML que tu as créée
  const htmlContent = `
    <div id="receipt-digital" style="font-family: Arial; padding: 20px; text-align: center; background: white; color: black;">
      <h1 style="color: #4CD964; margin-bottom: 5px;">HAILANDX</h1>
      <p style="margin-top: 0;">Merci de votre achat !</p>
      <hr border-top="1px dashed #ccc"/>
      <table style="width: 100%; border-collapse: collapse;">
        ${cartItems.map(item => `
          <tr>
            <td style="text-align: left; padding: 8px;">${item.name} x${item.quantity}</td>
            <td style="text-align: right; padding: 8px;">${(item.selling_price * item.quantity).toLocaleString()} FG</td>
          </tr>
        `).join('')}
      </table>
      <hr border-top="1px dashed #ccc"/>
      <h2 style="background: #000; color: #FFF; padding: 10px; border-radius: 8px;">TOTAL : ${saleData.total_amount.toLocaleString()} FG</h2>
      <div style="margin-top: 20px;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${saleData.id}" />
        <p style="font-size: 10px; color: #666;">ID Transaction: ${saleData.id}</p>
      </div>
    </div>
  `;

  // 2. Option Web : On utilise l'API de partage du mobile (Web Share API)
  // Si le navigateur le permet, on partage le texte ou un lien
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Reçu HailandX - ${saleData.id}`,
        text: `Merci de votre achat chez HailandX ! Total : ${saleData.total_amount} FG.`,
        url: window.location.href // Optionnel : lien vers une facture en ligne
      });
    } catch (err) {
      console.log("Partage annulé ou impossible");
    }
  } else {
    // 3. Fallback : On ouvre simplement le reçu dans un nouvel onglet pour impression/capture d'écran
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`<html><body>${htmlContent}</body></html>`);
    receiptWindow.document.close();
  }
};
