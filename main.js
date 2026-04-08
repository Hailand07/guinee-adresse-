import { renderBoutique } from './BoutiqueScreen.js';

// Initialisation
const supabaseUrl = 'https://plisyaquijijmwbbuegy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Ta clé anon complète

// Utilisation de l'objet global chargé via le script CDN dans le HTML
const { createClient } = supabase;
window.supabase = createClient(supabaseUrl, supabaseKey);

async function chargerBoutique() {
    console.log("Connexion à Supabase...");
    let { data: products, error } = await window.supabase
        .from('products')
        .select('*');

    if (error) {
        console.error("Erreur de chargement:", error);
    } else {
        // C'est ici qu'on appelle la fonction de ton BoutiqueScreen.js
        renderBoutique(products); 
    }
}

// Lancer au chargement de la page
window.addEventListener('DOMContentLoaded', chargerBoutique);
