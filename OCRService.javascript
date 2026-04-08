import TextRecognition from '@react-native-ml-kit/text-recognition';

// Fonction de Fuzzy Matching simplifiée
// Elle compare ce qui est écrit avec les noms de ta base de données
export const matchProduct = (textDetected, productList) => {
  const normalizedInput = textDetected.toLowerCase().trim();
  
  return productList.find(product => {
    const productName = product.name.toLowerCase();
    // On vérifie si le texte écrit est contenu dans le nom du produit
    // ou si le nom du produit commence par ce texte
    return productName.includes(normalizedInput) || normalizedInput.includes(productName);
  });
};

export const scanNotePad = async (imageUri, allProducts) => {
  const result = await TextRecognition.recognize(imageUri);
  const detectedSales = [];

  for (let block of result.blocks) {
    const matched = matchProduct(block.text, allProducts);
    if (matched) {
      detectedSales.push({
        ...matched,
        quantity: 1, // Par défaut, on peut aussi chercher un chiffre dans le texte
        confidence: true
      });
    }
  }
  return detectedSales;
};
