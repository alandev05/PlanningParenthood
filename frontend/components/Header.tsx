import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SunCloud } from './Doodles';

const PrimaryColor = 'rgba(255,79,97,1)';

export default function Header({ title, subtitle, doodle = true, onBack }:{
  title?: string;
  subtitle?: string;
  doodle?: boolean;
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <View style={styles.textWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {doodle ? <SunCloud style={styles.doodle} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 28,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: PrimaryColor,
    fontWeight: '600',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PrimaryColor,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
  doodle: {
    marginLeft: 12,
  },
});
