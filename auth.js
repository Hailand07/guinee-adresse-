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

Sélection Rôle (connexion ou inscription) 

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
