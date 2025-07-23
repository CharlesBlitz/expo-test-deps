import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, RotateCcw, Settings, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import OpenStreetMap from '@/components/OpenStreetMap';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function MapView() {
  const { customers, vehicles, tours, settings, loading } = useData();
  const { t } = useLanguage();
  const [selectedLayer, setSelectedLayer] = useState('tours');
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTour, setSelectedTour] = useState<string | undefined>(undefined);

  const mapLayers = [
    { id: 'tours', name: 'Touren', icon: Navigation, color: '#3B82F6' },
    { id: 'customers', name: 'Kunden', icon: MapPin, color: '#10B981' },
    { id: 'depot', name: 'Depot', icon: Settings, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Karte wird geladen...</Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t('map.title')}</Text>
            <Text style={styles.subtitle}>{t('map.subtitle')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.layerControls}>
          {mapLayers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              style={[
                styles.layerButton,
                selectedLayer === layer.id && styles.layerButtonActive
              ]}
              onPress={() => setSelectedLayer(layer.id)}
            >
              <layer.icon 
                size={16} 
                color={selectedLayer === layer.id ? '#FFFFFF' : layer.color} 
                strokeWidth={2}
              />
              <Text style={[
                styles.layerButtonText,
                selectedLayer === layer.id && styles.layerButtonTextActive
              ]}>
                {layer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setZoomLevel(Math.min(18, zoomLevel + 1))}
          >
            <ZoomIn size={20} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setZoomLevel(Math.max(8, zoomLevel - 1))}
          >
            <ZoomOut size={20} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton}
            onPress={() => setZoomLevel(12)}
          >
            <RotateCcw size={20} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Container */}
      <View style={[styles.mapContainer, isTablet && styles.mapContainerTablet]}>
        <OpenStreetMap 
          tours={tours}
          customers={customers}
          settings={settings}
          selectedTour={selectedTour}
        />
      </View>

      {/* Tour Legend */}
      {tours.length > 0 && (
        <ScrollView style={styles.legendContainer} horizontal showsHorizontalScrollIndicator={false}>
          {tours.map((tour) => (
            <TouchableOpacity 
              key={tour.id} 
              style={[
                styles.legendItem,
                selectedTour === tour.id && styles.legendItemSelected
              ]}
              onPress={() => setSelectedTour(selectedTour === tour.id ? undefined : tour.id)}
            >
              <View style={[styles.legendColor, { backgroundColor: tour.color }]} />
              <View style={styles.legendInfo}>
                <Text style={styles.legendTitle}>{tour.vehicle.name}</Text>
                <Text style={styles.legendSubtitle}>
                  {tour.stops.length} Stopps • {tour.status === 'in-progress' ? 'Aktiv' : tour.status === 'completed' ? 'Abgeschlossen' : 'Geplant'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Map Info Cards */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Navigation size={20} color="#10B981" strokeWidth={2} />
            <Text style={styles.infoTitle}>OpenStreetMap Integration</Text>
          </View>
          <Text style={styles.infoText}>
            Kostenlose Kartenintegration ohne API-Schlüssel. Unterstützt Offline-Karten 
            und GPS-Tracking für präzise Routenführung.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MapPin size={20} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.infoTitle}>Live-Tracking</Text>
          </View>
          <Text style={styles.infoText}>
            Verfolgen Sie Ihre Fahrzeuge in Echtzeit und optimieren Sie Routen 
            basierend auf aktuellen Verkehrsbedingungen.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tours.filter(t => t.status === 'in-progress').length}</Text>
            <Text style={styles.statLabel}>Aktive Touren</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tours.reduce((sum, t) => sum + t.stops.length, 0)}</Text>
            <Text style={styles.statLabel}>Geplante Stopps</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Effizienz</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.select({ web: 20, default: 60 }),
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  layerControls: {
    flex: 1,
    marginRight: 16,
  },
  layerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 6,
    marginRight: 8,
  },
  layerButtonActive: {
    backgroundColor: '#3B82F6',
  },
  layerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  layerButtonTextActive: {
    color: '#FFFFFF',
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 8,
  },
  zoomButton: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapContainer: {
    height: 400,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  mapContainerTablet: {
    height: 500,
  },
  legendContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  legendItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendInfo: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  legendSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
});