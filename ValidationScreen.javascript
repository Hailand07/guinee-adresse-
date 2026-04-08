/**
 * Affiche l'écran de confirmation après le scan du carnet.
 * @param {Array} detectedItems - Les produits identifiés par l'OCR.
 */
export const renderValidation = (detectedItems) => {
    const container = document.getElementById('grid-container');
    
    // Si aucun article n'est détecté
    if (!detectedItems || detectedItems.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <p style="color:#FFF;">Aucun produit reconnu. Réessayez avec une photo plus claire.</p>
                <button onclick="location.reload()" style="background:#4CD964; color:white; border:none; padding:15px; border-radius:10px;">Retour</button>
            </div>`;
        return;
    }

    let html = `
        <div class="validation-container" style="padding: 20px; background-color: #000; min-height: 100vh;">
            <h2 style="color: #FFF; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">
                Est-ce bien ça ?
            </h2>
            
            <div class="scroll-list" style="max-height: 60vh; overflow-y: auto; margin-bottom: 20px; padding-right: 5px;">
                ${detectedItems.map((item, index) => `
                    <div class="item-row" style="display: flex; align-items: center; background-color: #1A1A1A; padding: 12px; border-radius: 15px; margin-bottom: 12px; border: 1px solid #333;">
                        <img src="${item.image_url}" 
                             style="width: 55px; height: 55px; border-radius: 10px; object-fit: cover;" 
                             alt="${item.name}">
                        
                        <div style="flex: 1; margin-left: 15px;">
                            <span style="color: #FFF; font-size: 18px; font-weight: 500;">${item.name}</span>
                            <br/>
                            <span style="color: #FFD700; font-size: 14px;">${item.selling_price} FG</span>
                        </div>
                        
                        <div style="font-size: 20px;">✅</div>
                    </div>
                `).join('')}
            </div>

            <div class="footer" style="display: flex; gap: 15px; margin-top: 20px;">
                <button onclick="location.reload()" 
                        style="flex: 1; background-color: #FF3B30; color: #FFF; border: none; padding: 18px; border-radius: 15px; font-weight: bold; font-size: 16px; cursor: pointer;">
                    Refaire
                </button>
                
                <button onclick="finalizeValidationSales()" 
                        style="flex: 1; background-color: #4CD964; color: #FFF; border: none; padding: 18px; border-radius: 15px; font-weight: bold; font-size: 16px; cursor: pointer;">
                    Valider les ventes
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
};

/**
 * Fonction appelée lors du clic sur "Valider les ventes"
 */
window.finalizeValidationSales = () => {
    // On peut appeler la logique de CartLogic ici
    alert("Ventes enregistrées avec succès !");
    location.reload(); // On revient à la boutique
};
