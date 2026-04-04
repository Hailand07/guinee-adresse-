async function afficherCatalogueClient() {
            let maZone = localStorage.getItem('userAddress'); // Ex: "Kaloum"
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

            // On récupère TOUS les produits sans distinction de zone
            const { data: produits, error } = await _supabase
                .from('produits')
                .select('*')
                .order('created_at', { ascending: false });

            const grille = document.getElementById('grille-produits');

            if (error || !produits || produits.length === 0) {
                grille.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 40px; color: #a0aec0; text-align:center;">
                        <div style="font-size: 3rem;">📦</div>
                        <p>Aucun produit trouvé pour l'instant.</p>
                    </div>`;
                return;
            }

            // --- LOGIQUE DE PRIORITÉ ---
            // On trie : si le produit est de "maZone", il passe devant.
            const produitsTries = produits.sort((a, b) => {
                if (a.zone === maZone && b.zone !== maZone) return -1;
                if (a.zone !== maZone && b.zone === maZone) return 1;
                return 0;
            });

            grille.innerHTML = "";
            produitsTries.forEach(p => {
                const badgeProximite = (p.zone === maZone) ? 
                    `<span style="background:#2ecc71; color:white; padding:2px 6px; border-radius:5px; font-size:0.7rem; margin-left:5px;">Proche de vous</span>` : "";

                grille.innerHTML += `
                    <div class="product-card" style="${p.zone === maZone ? 'border: 1px solid #2ecc71;' : ''}">
                        <div class="product-image-placeholder">📦</div>
                        <div class="product-info">
                            <span class="product-name">${p.nom_produit} ${badgeProximite}</span>
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
