import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis } from 'victory-native';
import FastImage from 'react-native-fast-image';

export const DashboardScreen = ({ rotationStats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Mes Meilleures Ventes</Text>
      
      <VictoryChart 
        domainPadding={20} 
        width={Dimensions.get('window').width - 40}
        theme={{ axis: { style: { tickLabels: { fill: 'transparent' } } } }} // On cache le texte
      >
        <VictoryBar
          data={rotationStats.slice(0, 5)} // Top 5 produits
          x="name"
          y="count"
          style={{ data: { fill: "#4CD964" } }}
        />
        <VictoryAxis />
      </VictoryChart>

      {/* Légende avec Photos à la place du texte */}
      <View style={styles.iconLegend}>
        {rotationStats.slice(0, 5).map((product, index) => (
          <FastImage 
            key={index}
            source={{ uri: product.image_url }} 
            style={styles.legendIcon} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  headerText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  iconLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -20 },
  legendIcon: { width: 40, height: 40, borderRadius: 5, borderWay: 1, borderColor: '#444' }
});
