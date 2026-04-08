import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { processSale } from './CartLogic';

export const BoutiqueScreen = ({ products }) => {
  const [cart, setCart] = useState([]);

  const handleAddToVente = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const finalizeSale = () => {
    const finalAmount = processSale(cart);
    // Ici on enverra vers Supabase plus tard
    setCart([]); // Vider le panier après vente
  };

  return (
    <View style={styles.container}>
      {/* Grille des produits */}
      <FlatList
        data={products}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard 
            item={item} 
            onAdd={handleAddToVente} 
            onLongPress={(item) => console.log("Menu quantité pour", item.name)} 
          />
        )}
        keyExtractor={item => item.id}
      />

      {/* Le gros bouton VENDRE en bas */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.sellButton} onPress={finalizeSale}>
          <Text style={styles.sellButtonText}>VENDRE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  sellButton: { backgroundColor: '#4CD964', padding: 25, margin: 20, borderRadius: 20, alignItems: 'center' },
  sellButtonText: { color: '#FFF', fontSize: 28, fontWeight: '900' }
});
