import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Tour, Settings, Customer } from '@/types';

interface OpenStreetMapProps {
  tours: Tour[];
  customers: Customer[];
  settings: Settings;
  selectedTour?: string;
}

export default function OpenStreetMap({ tours, customers, settings, selectedTour }: OpenStreetMapProps) {
  const { width, height } = Dimensions.get('window');
  const mapHeight = Math.min(height * 0.6, 400);

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderTitle}>🗺️ Karten-Vorschau</Text>
        <Text style={styles.depotText}>🏢 Depot: {settings.depot.name}</Text>
        
        {customers.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>📍 {customers.length} Kunden</Text>
          </View>
        )}
        
        {tours.map((tour, index) => (
          <View key={tour.id} style={styles.tourInfo}>
            <View style={[styles.colorIndicator, { backgroundColor: tour.color }]} />
            <Text style={[
              styles.tourText,
              { color: selectedTour === tour.id ? '#2563EB' : '#374151' }
            ]}>
              {tour.vehicle.name}: {tour.stops.length} Stopps
              {tour.totalDistance && ` • ${tour.totalDistance} km`}
            </Text>
          </View>
        ))}
        
        <Text style={styles.noteText}>
          📱 Expo Go Version - Vereinfachte Kartenansicht
        </Text>
        <Text style={styles.noteSubtext}>
          Vollständige Karten im Web-Browser verfügbar
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E5E7EB',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  depotText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 20,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  tourInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 6,
    minWidth: 200,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  tourText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  noteText: {
    fontSize: 13,
    color: '#059669',
    marginTop: 20,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
  },
  noteSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 280,
  },
});