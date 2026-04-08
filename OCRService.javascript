/**
 * Fonction de Fuzzy Matching (Recherche approximative)
 */
export const matchProduct = (textDetected, productList) => {
  const normalizedInput = textDetected.toLowerCase().trim();
  
  if (normalizedInput.length < 2) return null; // Éviter les faux positifs sur des lettres isolées

  return productList.find(product => {
    const productName = product.name.toLowerCase();
    // On vérifie si le texte reconnu est dans le nom du produit (ex: "riz" dans "Sac de Riz")
    return productName.includes(normalizedInput) || normalizedInput.includes(productName);
  });
};

/**
 * Analyse une image (photo du carnet) pour détecter les produits
 */
export const scanNotePad = async (imageElement, allProducts) => {
  console.log("Analyse du carnet en cours...");
  
  // Utilisation de Tesseract.js (Version Web de l'OCR)
  const worker = await Tesseract.createWorker('fra'); // On utilise le français
  const { data: { lines } } = await worker.recognize(imageElement);
  
  const detectedSales = [];

  // On parcourt chaque ligne de texte détectée sur le papier
  lines.forEach(line => {
      const matched = matchProduct(line.text, allProducts);
      if (matched) {
          detectedSales.push({
              ...matched,
              quantity: 1, // Par défaut
              detectedText: line.text // Pour vérification visuelle
          });
      }
  });

  await worker.terminate(); // Libérer la mémoire
  return detectedSales;
};
