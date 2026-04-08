import RNHTMLtoPDF from 'react-native-html-to-pdf';

export const generateReceiptPDF = async (saleData, cartItems) => {
  // Structure HTML du reçu
  const htmlContent = `
    <html>
      <body style="font-family: 'Helvetica'; padding: 20px; text-align: center;">
        <h1 style="color: #4CD964;">HAILANDX</h1>
        <p>Merci de votre achat !</p>
        <hr/>
        <table style="width: 100%; border-collapse: collapse;">
          ${cartItems.map(item => `
            <tr>
              <td style="text-align: left; padding: 10px;">${item.name} x${item.quantity}</td>
              <td style="text-align: right; padding: 10px;">${item.selling_price * item.quantity} FG</td>
            </tr>
          `).join('')}
        </table>
        <hr/>
        <h2 style="background: #000; color: #FFF; padding: 10px;">TOTAL : ${saleData.total_amount} FG</h2>
        <div style="margin-top: 20px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${saleData.id}" />
          <p style="font-size: 10px;">ID Transaction: ${saleData.id}</p>
        </div>
      </body>
    </html>
  `;

  const results = await RNHTMLtoPDF.convert({
    html: htmlContent,
    fileName: `Recu_${saleData.id}`,
    directory: 'Documents',
  });

  return results.filePath;
};
