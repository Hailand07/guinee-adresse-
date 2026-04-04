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

Les "bras" manquants pour ce fichier (shop.js) :
Si tu mets cette fonction dans shop.js, tu dois impérativement y ajouter les fonctions suivantes, sinon tes boutons ne serviront à rien :
 * actualiserStock() : Appelée à la fin de ta fonction pour remplir l'inventaire.
 * ajouterProduitReal(event) : Pour envoyer les données vers Supabase quand on clique sur "PUBLIER".
 * toggleScanner() : Pour ouvrir la caméra quand on clique sur le bouton "SCANNER".



- function toggleScanner()

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

- function initFournisseurScanner()

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
