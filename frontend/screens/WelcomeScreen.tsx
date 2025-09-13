import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { SunCloud } from '../components/Doodles';

export default function WelcomeScreen(){
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Header title="Parenting, planned." subtitle="Discover local opportunities for your child. No account needed." doodle={false} />
      <SunCloud style={styles.sun} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.primary} onPress={()=>navigation.navigate('Intake')}>
          <Text style={styles.primaryText}>Plan my child's path</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={()=>navigation.navigate('Results', { zip: '02139', age: 9, demo: true })}>
          <Text style={styles.secondaryText}>Try demo (02139, age 9)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghost} onPress={()=>{ /* privacy - placeholder */ }}>
          <Text style={styles.ghostText}>Privacy</Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  sun: { position: 'absolute', right: 24, top: 12 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  primary: { backgroundColor: 'rgba(255,79,97,1)', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 18, width: '100%', alignItems: 'center', marginBottom: 12 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondary: { borderColor: '#eee', borderWidth: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 18, width: '100%', alignItems: 'center', marginBottom: 24 },
  secondaryText: { color: '#333', fontWeight: '700' },
  ghost: { marginTop: 8 },
  ghostText: { color: '#666' },
});