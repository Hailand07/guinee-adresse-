import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

export const ProductCard = ({ item, onAdd, onLongPress }) => {
  // Vert si stock suffisant, Rouge si alerte rupture
  const stockColor = item.stock_quantity > item.min_threshold ? '#4CD964' : '#FF3B30';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onAdd(item)} 
      onLongPress={() => onLongPress(item)}
    >
      <FastImage
        style={styles.image}
        source={{ 
          uri: item.image_url,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      {/* Badge de Stock Visuel */}
      <View style={[styles.stockBadge, { backgroundColor: stockColor }]} />
      
      <View style={styles.priceTag}>
        <Text style={styles.priceText}>{item.selling_price} FG</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: '45%', margin: '2.5%', borderRadius: 15, backgroundColor: '#1A1A1A', overflow: 'hidden' },
  image: { width: '100%', height: 150 },
  stockBadge: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFF' },
  priceTag: { backgroundColor: '#000', padding: 8, alignItems: 'center' },
  priceText: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 }
});
