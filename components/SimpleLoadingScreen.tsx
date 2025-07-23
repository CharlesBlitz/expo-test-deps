import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface SimpleLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function SimpleLoadingScreen({ 
  title = "App wird geladen...", 
  subtitle = "Bitte warten Sie einen Moment" 
}: SimpleLoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});