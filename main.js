// Initialisation de Supabase
const supabaseUrl = 'https://plisyaquijijmwbbuegy.supabase.co';
const supabaseKey = 'sb_publishable_nfKDb7KXudkpzLPa-nTMtQ_FRW6sQj_';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Importation logique des fonctions (si tu utilises des modules)
// Dans une version HTML simple, on s'assure que tous les scripts sont chargés dans le fichier index.html

async function chargerBoutique() {
    // Récupérer les produits depuis Supabase
    let { data: products, error } = await supabase
        .from('products')
        .select('*');

    if (error) console.log("Erreur de chargement:", error);
    else afficherProduits(products); // Cette fonction sera dans ton BoutiqueScreen
}

// Lancer au chargement de la page
window.onload = chargerBoutique;
