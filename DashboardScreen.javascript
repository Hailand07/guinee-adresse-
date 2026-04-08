/**
 * Affiche le Dashboard des ventes avec des barres graphiques et des icônes.
 * @param {Array} rotationStats - Les données triées venant de AnalyticsService.
 */
export const renderDashboard = (rotationStats) => {
    const container = document.getElementById('grid-container'); // On réutilise le conteneur principal
    const topProducts = rotationStats.slice(0, 5); // On prend les 5 meilleurs
    
    // Calculer la valeur maximale pour l'échelle du graphique
    const maxSales = Math.max(...topProducts.map(p => p.count), 1);

    let html = `
        <div class="dashboard-container" style="padding: 20px; background-color: #000;">
            <h2 style="color: #FFF; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
                Mes Meilleures Ventes
            </h2>
            
            <div class="chart-area" style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; padding-bottom: 10px; border-bottom: 1px solid #333;">
                ${topProducts.map(product => {
                    const barHeight = (product.count / maxSales) * 100;
                    return `
                        <div class="bar-group" style="display: flex; flex-direction: column; align-items: center; width: 50px;">
                            <span style="color: #4CD964; font-size: 12px; font-weight: bold; margin-bottom: 5px;">${product.count}</span>
                            <div class="bar" style="width: 30px; height: ${barHeight}%; background-color: #4CD964; border-radius: 5px 5px 0 0; transition: height 1s ease-out;"></div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="icon-legend" style="display: flex; justify-content: space-around; margin-top: 15px;">
                ${topProducts.map(product => `
                    <div style="width: 50px; display: flex; justify-content: center;">
                        <img src="${product.image}" 
                             style="width: 40px; height: 40px; border-radius: 8px; border: 1px solid #444; object-fit: cover;" 
                             alt="${product.name}">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
};
