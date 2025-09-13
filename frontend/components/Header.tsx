import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunCloud } from './Doodles';

const PrimaryColor = 'rgba(255,79,97,1)';

export default function Header({ title, subtitle, doodle = true }:{title?: string; subtitle?: string; doodle?: boolean}) {
  return (
    <View style={styles.header}>
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