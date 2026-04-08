import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

export const ValidationScreen = ({ detectedItems, onConfirm, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Est-ce bien ça ?</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {detectedItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <FastImage style={styles.icon} source={{ uri: item.image_url }} />
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.checkMark}>✅</View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.btnText}>Refaire</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.btnText}>Valider les ventes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 10, borderRadius: 15, marginBottom: 10 },
  icon: { width: 50, height: 50, borderRadius: 10 },
  itemName: { color: '#FFF', flex: 1, marginLeft: 15, fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  confirmBtn: { backgroundColor: '#4CD964', padding: 20, borderRadius: 15, flex: 1, marginLeft: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#FF3B30', padding: 20, borderRadius: 15, flex: 1, marginRight: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

