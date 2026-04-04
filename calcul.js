function calculerDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; 
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }



function estimerFrais(distance) {
            const prixAuKm = 2000; 
            const fraisFixes = 5000; 
            return Math.round(fraisFixes + (distance * prixAuKm));
        }


async function calculerEtCommander(produitId, vendeurTel) {
            const { data: vendeur } = await _supabase.from('vendeurs').select('latitude, longitude').eq('telephone', vendeurTel).single();
            const clientLat = parseFloat(localStorage.getItem('userLat'));
            const clientLon = parseFloat(localStorage.getItem('userLon'));

            if (!vendeur || !clientLat) return alert("Position GPS manquante.");

            const distance = calculerDistance(vendeur.latitude, vendeur.longitude, clientLat, clientLon);
            const frais = estimerFrais(distance);

            if (confirm(`Distance : ${distance.toFixed(2)} km\nFrais : ${frais} GNF\nCommander ?`)) {
                enregistrerMission(vendeurTel, frais);
            }
        }
