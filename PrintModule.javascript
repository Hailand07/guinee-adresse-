/**
 * Lance l'impression du reçu via l'interface du navigateur.
 * Compatible avec les imprimantes thermiques Bluetooth/USB connectées au smartphone.
 * @param {Object} saleData - Infos de la vente (ID, total).
 * @param {Array} cartItems - Articles vendus.
 */
export const printToThermal = (saleData, cartItems) => {
  // 1. Créer le contenu du ticket en HTML ultra-léger
  const receiptHTML = `
    <html>
      <head>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body { 
            width: 58mm; font-family: 'Courier New', Courier, monospace; 
            font-size: 12px; padding: 5px; margin: 0; background: white; color: black;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed black; margin: 5px 0; }
          table { width: 100%; }
          .right { text-align: right; }
          .qr { margin: 10px auto; display: block; width: 100px; }
        </style>
      </head>
      <body>
        <div class="center bold">HAILANDX Inc.</div>
        <div class="center">Boutique Moderne</div>
        <div class="line"></div>
        
        <table>
          ${cartItems.map(item => `
            <tr>
              <td>${item.name} x${item.quantity}</td>
              <td class="right">${(item.selling_price * item.quantity).toLocaleString()} FG</td>
            </tr>
          `).join('')}
        </table>
        
        <div class="line"></div>
        <div class="bold" style="font-size: 14px; display: flex; justify-content: space-between;">
          <span>TOTAL:</span>
          <span>${saleData.total_amount.toLocaleString()} FG</span>
        </div>
        
        <div class="center" style="margin-top: 10px;">
          <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${saleData.id}" />
          <div style="font-size: 8px;">ID: ${saleData.id}</div>
        </div>
        
        <div class="center" style="margin-top: 15px;">Merci de votre confiance !</div>
        <br/><br/> </body>
    </html>
  `;

  // 2. Ouvrir une fenêtre invisible pour l'impression
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();

  // 3. Déclencher l'impression après un court délai pour charger le QR Code
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
};
