import { BluetoothEscposPrinter, BluetoothManager } from "react-native-bluetooth-escpos-printer";

export const printToThermal = async (saleData, cartItems) => {
  try {
    // 1. Vérifier si l'imprimante est connectée
    const isConnected = await BluetoothManager.isBluetoothEnabled();
    if (!isConnected) return console.log("Bluetooth désactivé");

    // 2. Formatage pour imprimante thermique (Largeur standard 58mm)
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("HAILANDX Inc.\n", { fontweight: 1 });
    await BluetoothEscposPrinter.printText("Boutique Moderne\n", {});
    await BluetoothEscposPrinter.printText("--------------------------------\n", {});

    for (const item of cartItems) {
      await BluetoothEscposPrinter.printColumn([24, 8], 
        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.RIGHT], 
        [`${item.name} x${item.quantity}`, `${item.selling_price * item.quantity}FG`], {});
    }

    await BluetoothEscposPrinter.printText("--------------------------------\n", {});
    await BluetoothEscposPrinter.printText(`TOTAL: ${saleData.total_amount} FG\n`, { fontweight: 1 });
    await BluetoothEscposPrinter.printQRCode(saleData.id, 280, BluetoothEscposPrinter.ERROR_CORRECTION.L);
    await BluetoothEscposPrinter.printText("\n\n\n", {}); // Espace pour la découpe
    
  } catch (error) {
    console.error("Erreur impression:", error);
  }
};
