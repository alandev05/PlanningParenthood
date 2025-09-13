import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

export default function FABChat({ onPress }:{onPress: ()=>void}){
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity style={styles.fab} onPress={onPress}>
        <Text style={styles.icon}>💬</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 20, bottom: 28 },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,79,97,1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  icon: { fontSize: 22, color: '#fff' },
});