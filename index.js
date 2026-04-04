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
                _supabase.from('clients').select('nom').eq('telephone', phone).maybeSingle(),
                _supabase.from('vendeurs').select('nom').eq('telephone', phone).maybeSingle(),
                _supabase.from('livreurs').select('nom').eq('telephone', phone).maybeSingle()
            ]);

            userProfiles.client = !!resC.data;
            userProfiles.fournisseur = !!resV.data;
            userProfiles.livreur = !!resL.data;

            const nomTrouve = resC.data?.nom || resV.data?.nom || resL.data?.nom;
            if (nomTrouve) localStorage.setItem('userName', nomTrouve);
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

        function afficherAccueil() {
            const userPhone = localStorage.getItem('userPhone');
            const currentRole = localStorage.getItem('userRole');

            if (userPhone && currentRole) {
                if (currentRole === 'client') return afficherCatalogueClient();
                if (currentRole === 'fournisseur') return afficherDashboardFournisseur();
                if (currentRole === 'livreur') return afficherDashboardLivreur();
            }

            stopperGPS();
            const container = document.getElementById('main-content');
            
            container.style.maxWidth = "100%";
            container.style.padding = "0";

            container.innerHTML = `
                <section class="hero">
                    <h1>HailandX : L'économie de demain, aujourd'hui.</h1>
                    <p>La plateforme tout-en-un qui connecte les Guinéens. Que vous soyez acheteur, commerçant ou partenaire logistique, nous créons les opportunités qui font grandir votre quotidien.</p>
                    <div class="scroll-indicator">↓</div>
                </section>

                <section class="roles-section">
                    <div class="section-title">
                        <h2>Comment souhaitez-vous utiliser HailandX ?</h2>
                        <p>Choisissez le profil qui correspond à vos ambitions.</p>
                    </div>

                    <div class="role-detail-card">
                        <div class="role-image">🛒</div>
                        <div class="role-text">
                            <h3>Espace Client</h3>
                            <p>Accédez au plus grand catalogue local. Trouvez les meilleurs prix dans votre commune (Ratoma, Matoto, Dixinn...) et faites-vous livrer à votre porte grâce à notre système de géolocalisation ultra-précis.</p>
                            <button class="btn-choose" onclick="selectRole('client')">Commencer mes achats</button>
                        </div>
                    </div>

                    <div class="role-detail-card" style="border-left: 8px solid var(--secondary-color);">
                        <div class="role-image">🏪</div>
                        <div class="role-text">
                            <h3 style="color:var(--secondary-color)">Espace Fournisseur</h3>
                            <p>Digitalisez votre boutique en 2 minutes. Gérez vos stocks, recevez des commandes en temps réel et touchez des milliers de clients sans quitter votre magasin. Nous nous occupons de la logistique pour vous.</p>
                            <button class="btn-choose" style="background:var(--secondary-color)" onclick="selectRole('fournisseur')">Ouvrir ma boutique</button>
                        </div>
                    </div>

                    <div class="role-detail-card" style="border-left: 8px solid #f1c40f;">
                        <div class="role-image">🏍️</div>
                        <div class="role-text">
                            <h3 style="color:#f39c12">Espace Livreur</h3>
                            <p>Devenez un partenaire clé de la livraison en Guinée. Recevez des missions optimisées selon votre position, suivez vos gains en toute transparence et travaillez selon votre propre emploi du temps.</p>
                            <button class="btn-choose" style="background:#f39c12" onclick="selectRole('livreur')">Rejoindre la flotte</button>
                        </div>
                    </div>

                    <footer style="margin-top:100px; padding:40px; color:var(--text-light); font-size:0.9rem; text-align:center;">
                        <p>© 2026 HailandX - Conakry, Guinée. <br> Technologie au service de la communauté.</p>
                    </footer>
                </section>
            `;
            window.scrollTo(0,0);
        }

        async function afficherDashboardFournisseur() {
            const container = document.getElementById('main-content');
            const nomBoutique = localStorage.getItem('userName') || "Ma Boutique";
            
            container.style.maxWidth = "1100px";
            container.style.margin = "0 auto";
            container.style.padding = "20px";

            container.innerHTML = `
                <div class="client-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2>Gestionnaire Boutique</h2>
                        <div class="zone-badge">🏪 ${nomBoutique}</div>
                    </div>
                    <button onclick="actualiserStock()" class="btn-choose" style="padding:10px 15px; font-size:0.8rem; background:var(--secondary-color)">🔄 Actualiser</button>
                </div>

                <div class="stat-card-container">
                    <div class="stat-card">
                        <h4>Produits en ligne</h4>
                        <span id="stat-count">...</span>
                    </div>
                    <div class="stat-card" style="border-bottom-color: var(--secondary-color)">
                        <h4>Zone de vente</h4>
                        <span style="font-size:1.1rem">${localStorage.getItem('userAddress') || 'Guinée'}</span>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="form-panel">
                        <h3 style="margin-top:0; color:var(--primary-color)">➕ Nouveau Produit</h3>
                        
                        <button class="btn-scan-trigger" onclick="toggleScanner()">📷 SCANNER CODE-BARRES</button>
                        <div id="reader"></div>
                        <div id="status-msg-scan"></div>

                        <label>Nom du produit</label>
                        <input type="text" id="p-nom" placeholder="Ex: Sac de Riz 50kg">
                        
                        <label>Prix (GNF)</label>
                        <input type="number" id="p-prix" placeholder="Ex: 350000">
                        
                        <label>Commune de stockage</label>
                        <select id="p-zone">
                            <option value="Kaloum">Kaloum</option>
                            <option value="Dixinn">Dixinn</option>
                            <option value="Ratoma">Ratoma</option>
                            <option value="Matam">Matam</option>
                            <option value="Matoto">Matoto</option>
                        </select>
                        
                        <button onclick="ajouterProduitReal(event)" id="btn-publier" class="btn-choose" style="width:100%; margin-top:15px; padding:15px;">
                            PUBLIER LE PRODUIT
                        </button>
                    </div>

                    <div class="inventory-panel">
                        <h3 style="margin-top:0;">📦 Inventaire Actuel</h3>
                        <div id="liste-produits-container">
                            <p class="empty-state">Chargement de votre stock...</p>
                        </div>
                    </div>
                </div>
            `;
            actualiserStock();
        }

        // --- NOUVELLES FONCTIONS DE SCAN POUR LE FOURNISSEUR ---

        async function toggleScanner() {
            const readerDiv = document.getElementById('reader');
            if (readerDiv.style.display === 'block') {
                if(html5QrCode) await html5QrCode.stop();
                readerDiv.style.display = 'none';
                document.getElementById('status-msg-scan').innerText = "";
            } else {
                readerDiv.style.display = 'block';
                initFournisseurScanner();
            }
        }

        async function initFournisseurScanner() {
            const statusMsg = document.getElementById('status-msg-scan');
            statusMsg.innerText = "Accès caméra...";

            html5QrCode = new Html5Qrcode("reader", { 
                verbose: false,
                formatsToSupport: [ 
                    Html5QrcodeSupportedFormats.EAN_13, 
                    Html5QrcodeSupportedFormats.EAN_8, 
                    Html5QrcodeSupportedFormats.UPC_A, 
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.QR_CODE 
                ]
            });

            const config = { 
                fps: 15, 
                qrbox: { width: 250, height: 150 }, 
                aspectRatio: 1.0 
            };

            try {
                await html5QrCode.start(
                    { facingMode: "environment" }, 
                    config, 
                    async (text) => {
                        if(navigator.vibrate) navigator.vibrate(100);
                        statusMsg.innerHTML = "🔍 Recherche du produit...";
                        await chercherInfosWeb(text);
                        toggleScanner(); // Fermer après détection
                    }
                );
                statusMsg.innerText = "Visez un code-barres";
            } catch (err) {
                statusMsg.innerHTML = "<span style='color:red'>Erreur Caméra.</span>";
            }
        }

        async function chercherInfosWeb(barcode) {
            const statusMsg = document.getElementById('status-msg-scan');
            const nameInput = document.getElementById('p-nom');
            
            try {
                const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
                const result = await response.json();

                if (result.status === 1) {
                    const nomTrouve = result.product.product_name_fr || result.product.product_name || "Produit Web";
                    nameInput.value = nomTrouve;
                    alert("✨ Produit reconnu : " + nomTrouve);
                } else {
                    const searchUrl = `https://www.jumia.com.gn/catalog/?q=${barcode}`;
                    statusMsg.innerHTML = `<a href="${searchUrl}" target="_blank" style="color:blue; font-size:0.8rem;">Non trouvé. Chercher sur Jumia Guinée ↗️</a>`;
                }
            } catch (e) {
                statusMsg.innerText = "Erreur réseau.";
            }
        }

        // --- FIN DES NOUVELLES FONCTIONS DE SCAN ---

        async function actualiserStock() {
            const monTel = localStorage.getItem('userPhone');
            const container = document.getElementById('liste-produits-container');
            const statCount = document.getElementById('stat-count');

            const { data: mesProduits, error } = await _supabase
                .from('produits')
                .select('*')
                .eq('vendeur_contact', monTel)
                .order('created_at', { ascending: false });

            if (error) {
                container.innerHTML = `<p style="color:red">Erreur : ${error.message}</p>`;
                return;
            }

            if (!mesProduits || mesProduits.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size:3rem">📭</div>
                        <p>Vous n'avez pas encore de produits en ligne.</p>
                    </div>`;
                if(statCount) statCount.innerText = "0";
                return;
            }

            if(statCount) statCount.innerText = mesProduits.length;

            container.innerHTML = "";
            mesProduits.forEach(p => {
                container.innerHTML += `
                    <div class="inventory-item">
                        <div class="item-info">
                            <h4>${p.nom_produit}</h4>
                            <p>${p.prix.toLocaleString()} GNF <span style="color:#cbd5e1; font-weight:normal; margin:0 5px;">|</span> <small style="color:var(--text-light)">${p.zone}</small></p>
                        </div>
                        <button class="btn-delete" onclick="supprimerProduit('${p.id}')">Supprimer</button>
                    </div>
                `;
            });
        }

        async function ajouterProduitReal(event) {
            if (event) event.preventDefault();
            const btn = document.getElementById('btn-publier');
            const nom = document.getElementById('p-nom').value.trim();
            const prix = parseInt(document.getElementById('p-prix').value);
            const zone = document.getElementById('p-zone').value;
            const monTel = localStorage.getItem('userPhone');

            if (!nom || isNaN(prix)) return alert("Infos manquantes !");

            btn.disabled = true;
            btn.innerText = "⏳ Publication...";

            const { error } = await _supabase.from('produits').insert([{ 
                nom_produit: nom, 
                prix: prix, 
                zone: zone, 
                vendeur_contact: monTel 
            }]);

            if (!error) {
                document.getElementById('p-nom').value = "";
                document.getElementById('p-prix').value = "";
                alert("Produit ajouté avec succès !");
                actualiserStock();
            } else {
                alert("Erreur : " + error.message);
            }
            btn.disabled = false;
            btn.innerText = "PUBLIER LE PRODUIT";
        }

        async function supprimerProduit(id) {
            if (confirm("Voulez-vous vraiment retirer ce produit de la vente ?")) {
                const { error } = await _supabase.from('produits').delete().eq('id', id);
                if (!error) {
                    actualiserStock();
                } else {
                    alert("Erreur lors de la suppression.");
                }
            }
        }

        async function afficherCatalogueClient() {
            let maZone = localStorage.getItem('userAddress');
            const container = document.getElementById('main-content');
            
            container.style.maxWidth = "1000px";
            container.style.margin = "0 auto";
            container.style.padding = "20px";
            
            container.innerHTML = `
                <div class="client-header">
                    <h2>Produits disponibles</h2>
                    <div class="zone-badge" onclick="editAddress()" style="cursor:pointer">📍 Zone : ${maZone || 'Toute la ville'} (Modifier)</div>
                </div>
                <div class="search-bar-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="search-input" placeholder="Rechercher un article..." onkeyup="filtrerProduits()">
                </div>
                <div id="grille-produits" class="product-grid">
                    <p>Chargement des articles...</p>
                </div>
            `;

            let query = _supabase.from('produits').select('*');
            if (maZone) {
                query = query.eq('zone', maZone);
            }

            const { data: produits, error } = await query.order('created_at', { ascending: false });
            const grille = document.getElementById('grille-produits');
            
            if (error || !produits || produits.length === 0) {
                grille.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 40px; color: #a0aec0; text-align:center;">
                        <div style="font-size: 3rem;">📦</div>
                        <p>Aucun produit trouvé à ${maZone || 'cet endroit'}.</p>
                        <button onclick="editAddress()" class="btn-choose" style="font-size:0.8rem">Changer de commune</button>
                    </div>`;
                return;
            }

            grille.innerHTML = "";
            produits.forEach(p => {
                grille.innerHTML += `
                    <div class="product-card">
                        <div class="product-image-placeholder">📦</div>
                        <div class="product-info">
                            <span class="product-name">${p.nom_produit}</span>
                            <span class="product-vendor">📍 ${p.zone}</span>
                            <div class="product-price">${p.prix.toLocaleString()} GNF</div>
                        </div>
                        <button class="btn-order" onclick="calculerEtCommander('${p.id}', '${p.vendeur_contact}')">
                            Commander
                        </button>
                    </div>`;
            });
        }

        function filtrerProduits() {
            let input = document.getElementById('search-input').value.toLowerCase();
            let cards = document.getElementsByClassName('product-card');
            
            for (let card of cards) {
                let name = card.querySelector('.product-name').innerText.toLowerCase();
                if (name.includes(input)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            }
        }

        function afficherFormulaireConnexion(roleCible) {
            const container = document.getElementById('main-content');
            container.innerHTML = `
                <div style="background:white; padding:30px; border-radius:20px; text-align:left; box-shadow: 0 10px 20px rgba(0,0,0,0.1); max-width: 500px; margin: 40px auto;">
                    <h2 style="color:#2ecc71; text-align:center;">Connexion ${roleCible}</h2>
                    <p style="text-align:center; color:#7f8c8d;">Entrez votre numéro pour retrouver votre compte.</p>
                    
                    <label>Numéro de téléphone</label>
                    <input type="tel" id="login-tel" placeholder="Ex: 622 00 00 00">
                    
                    <button onclick="verifierEtConnecter('${roleCible}')" style="width:100%; padding:15px; background:#2ecc71; color:white; border:none; border-radius:10px; font-weight:bold; margin-top:10px; cursor:pointer;">
                        SE CONNECTER
                    </button>
                    <p onclick="selectRole('${roleCible}')" style="text-align:center; color:#3498db; cursor:pointer; margin-top:20px;">Pas encore de compte ? S'inscrire</p>
                    <p onclick="afficherAccueil()" style="text-align:center; color:#e74c3c; cursor:pointer; margin-top:10px; font-weight:bold;">Annuler</p>
                </div>
            `;
        }

        async function verifierEtConnecter(role) {
            const tel = document.getElementById('login-tel').value;
            if (!tel) return alert("Entrez votre numéro.");

            const table = role === 'client' ? 'clients' : (role === 'fournisseur' ? 'vendeurs' : 'livreurs');
            const { data, error } = await _supabase.from(table).select('*').eq('telephone', tel).maybeSingle();

            if (data) {
                localStorage.setItem('userPhone', data.telephone);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userName', data.nom);
                if(data.zone) localStorage.setItem('userAddress', data.zone);
                if(data.latitude) localStorage.setItem('userLat', data.latitude);
                if(data.longitude) localStorage.setItem('userLon', data.longitude);

                alert("Heureux de vous revoir, " + data.nom + " !");
                
                await verifierTousLesProfils(data.telephone);

                if (role === 'client') afficherCatalogueClient();
                else if (role === 'fournisseur') afficherDashboardFournisseur();
                else if (role === 'livreur') afficherDashboardLivreur();
                
                updateMenuUI();
            } else {
                alert("Aucun compte trouvé avec ce numéro pour le rôle " + role);
            }
        }

        async function selectRole(roleCible) {
            const userPhone = localStorage.getItem('userPhone');

            if (!userPhone) {
                const choix = confirm("Avez-vous déjà un compte " + roleCible + " ?\n\nOK pour se Connecter\nAnnuler pour s'Inscrire");
                
                if (choix) {
                    afficherFormulaireConnexion(roleCible);
                } else {
                    roleCible === 'client' ? afficherInscriptionClient() : afficherFormulaireInscription(roleCible);
                }
                return;
            }

            const table = roleCible === 'client' ? 'clients' : (roleCible === 'fournisseur' ? 'vendeurs' : 'livreurs');
            const { data, error } = await _supabase.from(table).select('telephone').eq('telephone', userPhone).maybeSingle();

            if (data) {
                localStorage.setItem('userRole', roleCible);
                if (roleCible === 'client') afficherCatalogueClient();
                else if (roleCible === 'fournisseur') afficherDashboardFournisseur();
                else if (roleCible === 'livreur') afficherDashboardLivreur();
            } else {
                alert(`Vous n'avez pas encore de compte ${roleCible}. Créons-le ensemble !`);
                roleCible === 'client' ? afficherInscriptionClient() : afficherFormulaireInscription(roleCible);
            }
            updateMenuUI();
        }

        function afficherInscriptionClient() {
            const container = document.getElementById('main-content');
            container.innerHTML = `
                <div style="max-width:500px; margin:40px auto; text-align:left; padding:20px;">
                    <h2 style="color:#2ecc71; text-align:center; font-size:2rem;">Compte Client 🇬🇳</h2>
                    <p style="text-align:center; color:#7f8c8d; margin-bottom:20px;">Inscrivez-vous pour commander au meilleur prix.</p>

                    <div id="form-client" style="background:white; padding:25px; border-radius:25px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <label>Nom complet</label>
                        <input type="text" id="c-nom" placeholder="Ex: Alpha Oumar Diallo">

                        <label>Numéro WhatsApp (Identifiant unique)</label>
                        <input type="tel" id="c-tel" placeholder="Ex: 622 00 00 00">

                        <label>Zone (Commune)</label>
                        <select id="c-zone">
                            <option value="Kaloum">Kaloum</option>
                            <option value="Dixinn">Dixinn</option>
                            <option value="Ratoma">Ratoma</option>
                            <option value="Matam">Matam</option>
                            <option value="Matoto">Matoto</option>
                        </select>

                        <div id="gps-box" style="margin-top:20px; text-align:center; padding:20px; background:#f8fafc; border-radius:20px; border:2px dashed #cbd5e1;">
                            <div id="gps-status-icon" style="font-size:2rem;">📡</div>
                            <div id="gps-text" style="font-weight:bold; margin:10px 0; color:#64748b;">Précision GPS : En attente...</div>
                            
                            <button type="button" onclick="activerGPS('client')" id="btn-gps" style="background:#2c3e50; color:white; padding:10px 20px; border-radius:50px; border:none; font-weight:bold; cursor:pointer;">
                                CAPTER MA POSITION PRÉCISE
                            </button>
                        </div>

                        <button onclick="enregistrerClientReal()" id="btn-save-client" style="width:100%; padding:18px; background:#2ecc71; color:white; border:none; border-radius:15px; font-weight:bold; font-size:1.1rem; margin-top:25px; cursor:not-allowed; opacity:0.5;" disabled>
                            CRÉER MON COMPTE
                        </button>
                        
                        <p onclick="afficherAccueil()" style="text-align:center; color:#e74c3c; cursor:pointer; margin-top:15px; font-weight:bold;">Annuler</p>
                    </div>
                </div>
            `;
        }

        function activerGPS(targetRole) {
            const btn = document.getElementById('btn-gps');
            if(btn) btn.innerText = "Recherche en cours...";
            
            watchId = navigator.geolocation.watchPosition((pos) => {
                const box = document.getElementById('gps-box');
                if (!box) return; 

                const acc = Math.round(pos.coords.accuracy);
                clientGPS.lat = pos.coords.latitude;
                clientGPS.lon = pos.coords.longitude;

                const txt = document.getElementById('gps-text');
                const icon = document.getElementById('gps-status-icon');
                const btnSave = targetRole === 'client' ? document.getElementById('btn-save-client') : document.getElementById('btn-save-vendor');

                if (acc <= 30) { 
                    box.style.background = "#f0fff4";
                    box.style.borderColor = "#2ecc71";
                    txt.innerText = "Position parfaite (" + acc + "m)";
                    txt.style.color = "#27ae60";
                    icon.innerText = "✅";
                    if(btnSave) {
                        btnSave.disabled = false;
                        btnSave.style.opacity = "1";
                        btnSave.style.cursor = "pointer";
                    }
                } else { 
                    box.style.background = "#fffbeb";
                    box.style.borderColor = "#f1c40f";
                    txt.innerText = "Signal moyen (" + acc + "m)... patientez";
                    txt.style.color = "#d35400";
                    icon.innerText = "⚠️";
                }
            }, (err) => {
                alert("Erreur GPS : Veuillez autoriser la localisation.");
            }, { enableHighAccuracy: true });
        }

        async function enregistrerClientReal() {
            const nom = document.getElementById('c-nom').value;
            const tel = document.getElementById('c-tel').value;
            const zone = document.getElementById('c-zone').value;

            if (!nom || !tel) return alert("Veuillez remplir tous les champs.");

            const { error } = await _supabase.from('clients').insert([{ 
                nom, 
                telephone: tel, 
                zone, 
                latitude: clientGPS.lat, 
                longitude: clientGPS.lon 
            }]);

            if (!error) {
                stopperGPS();
                localStorage.setItem('userRole', 'client');
                localStorage.setItem('userPhone', tel);
                localStorage.setItem('userName', nom);
                localStorage.setItem('userAddress', zone); 
                localStorage.setItem('userLat', clientGPS.lat);
                localStorage.setItem('userLon', clientGPS.lon);
                
                alert("Bienvenue " + nom + " ! Votre compte est créé.");
                await verifierTousLesProfils(tel);
                afficherCatalogueClient();
                updateMenuUI();
            } else {
                alert("Erreur : " + error.message);
            }
        }

        function afficherFormulaireInscription(role) {
            const container = document.getElementById('main-content');
            container.innerHTML = `
                <div style="background:white; padding:30px; border-radius:20px; text-align:left; box-shadow: 0 10px 20px rgba(0,0,0,0.1); max-width: 500px; margin: 40px auto;">
                    <h2 style="color:#2ecc71; text-align:center;">Inscription ${role}</h2>
                    <label>Nom complet</label>
                    <input type="text" id="nom" placeholder="Ex: Mamadou Barry">
                    <label>Téléphone</label>
                    <input type="tel" id="tel" placeholder="Ex: 622 00 00 00">
                    ${role === 'fournisseur' ? '<label>Nom de boutique</label><input type="text" id="shop" placeholder="Nom de votre boutique">' : ''}
                    
                    ${role === 'fournisseur' ? `
                        <div id="gps-box" style="margin-top:15px; text-align:center; padding:15px; background:#f8fafc; border-radius:15px; border:2px dashed #cbd5e1;">
                            <div id="gps-status-icon">📡</div>
                            <div id="gps-text" style="font-size:0.9rem;">Localisation boutique requise</div>
                            <button type="button" onclick="activerGPS('fournisseur')" id="btn-gps" style="margin-top:10px; padding:5px 15px; font-size:0.8rem; cursor:pointer;">CAPTER POSITION BOUTIQUE</button>
                        </div>
                    ` : ''}

                    <button onclick="validerInscription('${role}')" id="${role === 'fournisseur' ? 'btn-save-vendor' : 'btn-simple'}" 
                        ${role === 'fournisseur' ? 'disabled style="opacity:0.5; width:100%; padding:15px; background:#2ecc71; color:white; border:none; border-radius:10px; font-weight:bold; margin-top:10px;"' : 'style="width:100%; padding:15px; background:#2ecc71; color:white; border:none; border-radius:10px; font-weight:bold; margin-top:10px; cursor:pointer;"'}>
                        S'enregistrer
                    </button>
                    <p onclick="afficherAccueil()" style="text-align:center; color:#e74c3c; cursor:pointer; margin-top:20px; font-weight:bold;">Annuler</p>
                </div>
            `;
        }

        async function validerInscription(role) {
            const nom = document.getElementById('nom').value;
            const tel = document.getElementById('tel').value;
            const shop = role === 'fournisseur' ? document.getElementById('shop').value : null;

            if (!nom || !tel) return alert("Veuillez remplir tous les champs !");

            const tableCible = role === 'fournisseur' ? 'vendeurs' : 'livreurs'; 
            const { data: existeDeja } = await _supabase.from(tableCible).select('telephone').eq('telephone', tel).maybeSingle();

            if (existeDeja) {
                alert("Ce numéro est déjà lié à un compte " + role + ". Connexion automatique...");
                sauvegarderSession(role, tel, nom);
                return;
            }

            const objetInscription = { nom, telephone: tel };
            if (role === 'fournisseur') {
                objetInscription.nom_boutique = shop;
                objetInscription.latitude = clientGPS.lat;
                objetInscription.longitude = clientGPS.lon;
            }

            const { error } = await _supabase.from(tableCible).insert([objetInscription]);

            if (!error) {
                alert("Compte " + role + " créé !");
                sauvegarderSession(role, tel, nom);
            } else { alert("Erreur : " + error.message); }
        }

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

        async function afficherDashboardLivreur() {
            const container = document.getElementById('main-content');
            const maZone = localStorage.getItem('userAddress') || "Conakry";
            
            container.style.maxWidth = "600px"; 
            container.style.margin = "0 auto";
            container.style.padding = "15px";

            container.innerHTML = `
                <div class="client-header">
                    <h2>Espace Coursier</h2>
                    <div class="zone-badge" style="background:#ebf5fb; color:#3498db;">📍 Zone active : ${maZone}</div>
                </div>

                <div class="delivery-status-bar">
                    <div>
                        <span class="status-dot"></span>
                        <span id="gps-status-text" style="font-weight:bold; color:#2ecc71;">GPS Actif</span>
                    </div>
                    <button onclick="chercherMission()" class="btn-choose" style="padding:8px 12px; font-size:0.75rem; background:#34495e;">🔄 Actualiser</button>
                </div>

                <div id="mission-display-area">
                    <div style="text-align:center; padding:40px; color:#94a3b8;">
                        <div style="font-size:4rem; margin-bottom:15px;">🏍️</div>
                        <h3>Prêt pour la route ?</h3>
                        <p>Cliquez sur le bouton pour voir les commandes disponibles autour de vous.</p>
                        <button onclick="chercherMission()" class="btn-action-delivery btn-accept" style="margin-top:20px;">
                            Voir les missions
                        </button>
                    </div>
                </div>
            `;
            
            verifierMissionEnCours();
        }

        async function verifierMissionEnCours() {
            const tel = localStorage.getItem('userPhone');
            const { data: mission } = await _supabase
                .from('missions')
                .select('*, vendeurs(nom_boutique, latitude, longitude), clients(nom, zone)')
                .eq('livreur_id', tel)
                .eq('statut', 'en_cours')
                .maybeSingle();

            if (mission) {
                afficherTrackingMission(mission);
            }
        }

        async function chercherMission() {
            const area = document.getElementById('mission-display-area');
            const zoneLivreur = localStorage.getItem('userAddress'); 
            
            if (!zoneLivreur) {
                area.innerHTML = `<p style="text-align:center; color:orange;">⚠️ Veuillez définir votre zone dans le menu pour voir les missions.</p>`;
                return;
            }

            area.innerHTML = `<p style="text-align:center;">🔍 Recherche de colis à ${zoneLivreur}...</p>`;

            const { data: missions, error } = await _supabase
                .from('missions')
                .select(`
                    id, 
                    frais_livraison, 
                    vendeurs (nom_boutique, zone),
                    clients (nom, zone)
                `)
                .eq('statut', 'en_attente');

            if (error) {
                area.innerHTML = `<p style="color:red; text-align:center;">Erreur : ${error.message}</p>`;
                return;
            }

            const missionsLocales = missions ? missions.filter(m => 
                m.clients && m.clients.zone === zoneLivreur
            ) : [];

            if (missionsLocales.length === 0) {
                area.innerHTML = `
                    <div style="text-align:center; padding:40px; background:#f8fafc; border-radius:20px;">
                        <p>Pas de livraison disponible à <strong>${zoneLivreur}</strong> pour le moment.</p>
                        <button onclick="editAddress()" class="btn-choose" style="background:var(--secondary-color); margin-top:10px">Changer ma zone de travail</button>
                    </div>`;
                return;
            }

            area.innerHTML = `<h3 style="margin-bottom:15px;">Colis à proximité (${missionsLocales.length})</h3>`;
            missionsLocales.forEach(m => {
                area.innerHTML += `
                    <div class="delivery-card">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div>
                                <h4 style="margin:0;">📦 Boutique: ${m.vendeurs?.nom_boutique || 'Inconnue'}</h4>
                                <p style="color:#718096; margin:5px 0;">📍 Client: ${m.clients?.nom || 'Anonyme'} à <strong>${m.clients?.zone}</strong></p>
                            </div>
                            <div class="price-tag">${m.frais_livraison.toLocaleString()} GNF</div>
                        </div>
                        <button class="btn-action-delivery btn-accept" onclick="accepterMission('${m.id}')">
                            Accepter la course
                        </button>
                    </div>
                `;
            });
        }

        async function accepterMission(missionId) {
            const telLivreur = localStorage.getItem('userPhone');
            const { error } = await _supabase.from('missions').update({ livreur_id: telLivreur, statut: 'en_cours' }).eq('id', missionId);

            if (!error) {
                alert("Mission acceptée !");
                verifierMissionEnCours();
            }
        }

        function afficherTrackingMission(m) {
            const area = document.getElementById('mission-display-area');
            area.innerHTML = `
                <div class="delivery-card" style="border-left-color:#2ecc71; background:#f0fff4;">
                    <h3 style="color:#27ae60; margin-top:0;">✅ Mission en cours</h3>
                    
                    <div style="background:white; padding:15px; border-radius:12px; margin:10px 0;">
                        <p><strong>Étape 1 :</strong> Allez chez <strong>${m.vendeurs.nom_boutique}</strong></p>
                        <p><strong>Étape 2 :</strong> Livrez à <strong>${m.clients.nom}</strong> (${m.clients.zone})</p>
                    </div>

                    <div class="price-tag" style="background:#dcfce7; color:#15803d;">
                        Gain prévu : ${m.frais_livraison.toLocaleString()} GNF
                    </div>

                    <button class="btn-action-delivery btn-complete" style="margin-top:15px;" onclick="terminerMission('${m.id}')">
                        Confirmer la livraison
                    </button>
                </div>
            `;
            demarrerTrackingLivreur(m.id);
        }

        async function terminerMission(missionId) {
            if(confirm("Confirmez-vous la livraison ?")) {
                const { error } = await _supabase.from('missions').update({ statut: 'termine' }).eq('id', missionId);
                if(!error) {
                    stopperGPS();
                    alert("Mission terminée !");
                    afficherDashboardLivreur();
                }
            }
        }

        function demarrerTrackingLivreur(missionId) {
            missionWatchId = navigator.geolocation.watchPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                await _supabase.from('livreurs').update({ latitude, longitude }).eq('telephone', localStorage.getItem('userPhone'));
            }, (err) => console.error(err), { enableHighAccuracy: true });
        }

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

        async function enregistrerMission(vendeurTel, frais) {
            const monTel = localStorage.getItem('userPhone');
            const { error } = await _supabase.from('missions').insert([{
                vendeur_id: vendeurTel,
                client_id: monTel,
                frais_livraison: frais,
                statut: 'en_attente',
                created_at: new Date()
            }]);

            if (!error) { 
                alert("Commande envoyée !"); 
                afficherCatalogueClient(); 
            } else {
                alert("Erreur commande : " + error.message);
            }
        }

        function openNav() { document.getElementById("sideNav").style.width = "280px"; }
        function closeNav() { document.getElementById("sideNav").style.width = "0"; }
        
        async function updateMenuUI() {
            const userPhone = localStorage.getItem('userPhone');
            const currentRole = localStorage.getItem('userRole');
            const menuOptions = document.getElementById('special-options');
            const roleDisplay = document.getElementById('display-role');

            menuOptions.innerHTML = "";

            if (!userPhone) {
                roleDisplay.innerHTML = "HailandX<br><small style='color:#718096; font-weight:normal;'>Bienvenue en Guinée</small>";
                menuOptions.innerHTML = `
                    <div class="menu-section-title">Navigation</div>
                    <a onclick="afficherAccueil(); closeNav();">🏠 Accueil / Inscription</a>
                    <a onclick="closeNav();">ℹ️ À propos</a>
                `;
                return;
            }

            const userName = localStorage.getItem('userName') || "Utilisateur";
            roleDisplay.innerHTML = `${userName}<br><small style="color:#2ecc71; font-weight:normal;">Mode ${currentRole.toUpperCase()}</small>`;
            
            let htmlMenu = "";

            let aBasculer = [];
            if (userProfiles.client && currentRole !== 'client') aBasculer.push({r:'client', t:'Mode Client', i:'🛒'});
            if (userProfiles.fournisseur && currentRole !== 'fournisseur') aBasculer.push({r:'fournisseur', t:'Mode Magasin', i:'🏪'});
            if (userProfiles.livreur && currentRole !== 'livreur') aBasculer.push({r:'livreur', t:'Mode Livreur', i:'🏍️'});

            if (aBasculer.length > 0) {
                htmlMenu += `<div class="menu-section-title">Mes Espaces</div>`;
                aBasculer.forEach(item => {
                    htmlMenu += `<a onclick="changerInterfaceDirectement('${item.r}')">${item.i} ${item.t}</a>`;
                });
            }

            let aCreer = [];
            if (!userProfiles.client) aCreer.push({r:'client', t:'Devenir Client', i:'✨'});
            if (!userProfiles.fournisseur) aCreer.push({r:'fournisseur', t:'Ouvrir Boutique', i:'✨'});
            if (!userProfiles.livreur) aCreer.push({r:'livreur', t:'Devenir Livreur', i:'✨'});

            if (aCreer.length > 0) {
                htmlMenu += `<div class="menu-section-title">Opportunités</div>`;
                aCreer.forEach(item => {
                    htmlMenu += `<a onclick="selectRole('${item.r}'); closeNav();" style="color:#f1c40f;">${item.i} ${item.t}</a>`;
                });
            }

            htmlMenu += `
                <div class="menu-section-title">Paramètres</div>
                <a onclick="editAddress()">📍 Modifier zone</a>
                <a onclick="deconnexion()" style="color: #e74c3c; font-weight: bold; margin-top:10px;">🔴 Se déconnecter</a>
            `;

            menuOptions.innerHTML = htmlMenu;
        }

        function changerInterfaceDirectement(role) {
            localStorage.setItem('userRole', role);
            if (role === 'client') afficherCatalogueClient();
            else if (role === 'fournisseur') afficherDashboardFournisseur();
            else if (role === 'livreur') afficherDashboardLivreur();
            updateMenuUI();
            closeNav();
        }

        function deconnexion() {
            if(confirm("Voulez-vous vraiment vous déconnecter ?")) { 
                stopperGPS(); 
                localStorage.clear(); 
                userProfiles = { client: false, fournisseur: false, livreur: false };
                closeNav();
                afficherAccueil(); 
                updateMenuUI();
            }
        }

        function editAddress() {
            const n = prompt("Votre commune ?");
            if (n) { localStorage.setItem('userAddress', n); alert("Mis à jour."); location.reload(); }
        }

        let startY = 0;
        const ptr = document.getElementById('ptr-indicator');
        const ptrIcon = ptr.querySelector('.ptr-icon');

        window.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) startY = e.touches[0].pageY;
        }, {passive: true});

        window.addEventListener('touchmove', (e) => {
            const y = e.touches[0].pageY;
            const dist = y - startY;

            if (window.scrollY === 0 && dist > 0 && dist < 150) {
                ptr.style.top = (dist - 50) + 'px';
                ptrIcon.style.transform = `rotate(${dist * 3}deg)`;
            }
        }, {passive: true});

        window.addEventListener('touchend', async () => {
            const currentTop = parseInt(ptr.style.top);
            if (currentTop > 20) {
                ptr.style.top = '20px';
                ptrIcon.classList.add('ptr-spinning');
                
                const role = localStorage.getItem('userRole');
                if (role === 'client') await afficherCatalogueClient();
                else if (role === 'fournisseur') await actualiserStock();
                else if (role === 'livreur') await chercherMission();
                
                await updateMenuUI(); 

                setTimeout(() => {
                    ptr.style.top = '-60px';
                    ptrIcon.classList.remove('ptr-spinning');
                }, 1000);
            } else {
                ptr.style.top = '-60px';
            }
        });
