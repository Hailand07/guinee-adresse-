function afficherFormulaireInscription(role) {
            const container = document.getElementById('main-content');
            
            let supplementForm = '';
            if (role === 'fournisseur') {
                supplementForm = '<label>Nom de boutique</label><input type="text" id="shop" placeholder="Nom de votre boutique">';
            } else if (role === 'livreur') {
                supplementForm = `
                    <label>Votre zone de travail principale</label>
                    <select id="l-zone">
                        <option value="Kaloum">Kaloum</option>
                        <option value="Dixinn">Dixinn</option>
                        <option value="Ratoma">Ratoma</option>
                        <option value="Matam">Matam</option>
                        <option value="Matoto">Matoto</option>
                    </select>
                `;
            }

            container.innerHTML = `
                <div style="background:white; padding:30px; border-radius:20px; text-align:left; box-shadow: 0 10px 20px rgba(0,0,0,0.1); max-width: 500px; margin: 40px auto;">
                    <h2 style="color:#2ecc71; text-align:center;">Inscription ${role}</h2>
                    <label>Nom complet</label>
                    <input type="text" id="nom" placeholder="Ex: Mamadou Barry">
                    <label>Téléphone</label>
                    <input type="tel" id="tel" placeholder="Ex: 622 00 00 00">
                    
                    ${supplementForm}
                    
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
                objetInscription.nom_boutique = document.getElementById('shop').value;
                objetInscription.latitude = clientGPS.lat;
                objetInscription.longitude = clientGPS.lon;
            } else if (role === 'livreur') {
                objetInscription.zone = document.getElementById('l-zone').value;
            }

            const { error } = await _supabase.from(tableCible).insert([objetInscription]);

            if (!error) {
                alert("Compte " + role + " créé !");
                if(role === 'livreur') localStorage.setItem('userAddress', objetInscription.zone);
                sauvegarderSession(role, tel, nom);
            } else { alert("Erreur : " + error.message); }
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
                        <p>Cliquez sur le bouton pour voir les commandes disponibles dans votre zone.</p>
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
                area.innerHTML = `<p style="text-align:center; color:orange;">⚠️ Veuillez définir votre zone de travail.</p>`;
                return;
            }

            // Récupération de toutes les missions en attente avec infos clients
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
                area.innerHTML = `<p style="color:red; text-align:center;">Erreur de chargement.</p>`;
                return;
            }

            // --- FILTRAGE LIVREUR STRICT ---
            // On ne garde que les missions dont la zone de livraison (zone du client) correspond à la zone du livreur.
            const missionsLocales = (missions || []).filter(m => {
                return m.clients && m.clients.zone.trim().toLowerCase() === zoneLivreur.trim().toLowerCase();
            });

            if (missionsLocales.length === 0) {
                area.innerHTML = `
                    <div style="text-align:center; padding:40px;">
                        <p>Aucun colis à livrer à <strong>${zoneLivreur}</strong> pour l'instant.</p>
                    </div>`;
                return;
            }

            area.innerHTML = `<h3 style="margin-bottom:15px;">Missions à ${zoneLivreur}</h3>`;
            missionsLocales.forEach(m => {
                area.innerHTML += `
                    <div class="delivery-card">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div>
                                <h4 style="margin:0;">📦 Boutique: ${m.vendeurs?.nom_boutique || 'Inconnue'}</h4>
                                <p style="color:#718096; margin:5px 0;">📍 Livraison pour: ${m.clients?.nom || 'Anonyme'}</p>
                                <p style="font-size:0.8rem; color:var(--primary-color);">🏁 Destination: ${m.clients?.zone}</p>
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
