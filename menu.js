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
