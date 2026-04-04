async function sauvegarderSession(role, tel, nom) {
            localStorage.setItem('userRole', role);
            localStorage.setItem('userPhone', tel);
            localStorage.setItem('userName', nom);
            if (role === 'fournisseur') {
                localStorage.setItem('userLat', clientGPS.lat);
                localStorage.setItem('userLon', clientGPS.lon);
                afficherDashboardFournisseur();
            }
            else if (role === 'livreur') afficherDashboardLivreur();
            else if (role === 'client') afficherCatalogueClient();
            
            await verifierTousLesProfils(tel);
            updateMenuUI();
        }
