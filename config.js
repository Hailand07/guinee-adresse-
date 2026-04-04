    // --- CONFIGURATION SUPABASE ---
        const supabaseUrl = 'https://plisyaquijijmwbbuegy.supabase.co';
        const supabaseKey = 'sb_publishable_nfKDb7KXudkpzLPa-nTMtQ_FRW6sQj_'; 
        const _supabase = supabase.createClient(supabaseUrl, supabaseKey);



        // --- CONFIGURATION GPS ---
        let clientGPS = { lat: null, lon: null };
        let watchId = null; 
        let missionWatchId = null;

        let userProfiles = { client: false, fournisseur: false, livreur: false };
        let html5QrCode; // Instance globale du scanner

        window.onload = async () => {
            const userPhone = localStorage.getItem('userPhone');
            const lastRole = localStorage.getItem('userRole');

            if (userPhone) {
                await verifierTousLesProfils(userPhone);

                if (lastRole && userProfiles[lastRole === 'fournisseur' ? 'fournisseur' : lastRole]) {
                    if (lastRole === 'client') afficherCatalogueClient();
                    else if (lastRole === 'fournisseur') afficherDashboardFournisseur();
                    else if (lastRole === 'livreur') afficherDashboardLivreur();
                } else {
                    dirigerVersPremierProfilDisponible();
                }
            } else {
                afficherAccueil();
            }
            updateMenuUI();
        };

 

        async function verifierTousLesProfils(phone) {
            const [resC, resV, resL] = await Promise.all([
                _supabase.from('clients').select('nom, zone').eq('telephone', phone).maybeSingle(),
                _supabase.from('vendeurs').select('nom').eq('telephone', phone).maybeSingle(),
                _supabase.from('livreurs').select('nom, zone').eq('telephone', phone).maybeSingle()
            ]);

            userProfiles.client = !!resC.data;
            userProfiles.fournisseur = !!resV.data;
            userProfiles.livreur = !!resL.data;

            const nomTrouve = resC.data?.nom || resV.data?.nom || resL.data?.nom;
            if (nomTrouve) localStorage.setItem('userName', nomTrouve);
            
            // Stocker la zone si disponible
            const zoneTrouvee = resC.data?.zone || resL.data?.zone;
            if (zoneTrouvee) localStorage.setItem('userAddress', zoneTrouvee);
        }

        function dirigerVersPremierProfilDisponible() {
            if (userProfiles.client) { localStorage.setItem('userRole', 'client'); afficherCatalogueClient(); }
            else if (userProfiles.fournisseur) { localStorage.setItem('userRole', 'fournisseur'); afficherDashboardFournisseur(); }
            else if (userProfiles.livreur) { localStorage.setItem('userRole', 'livreur'); afficherDashboardLivreur(); }
            else { afficherAccueil(); }
        }

        function stopperGPS() {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                console.log("GPS stoppé pour économiser la batterie.");
            }
            if (missionWatchId !== null) {
                navigator.geolocation.clearWatch(missionWatchId);
                missionWatchId = null;
            }
        }
