import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useData } from '@/hooks/useData';
import { useAutoOptimization } from '@/hooks/useAutoOptimization';
import { Tour, Order } from '@/types';
import { Route, Play, Pause, CircleCheck as CheckCircle, CreditCard as Edit3, Download, Zap, Plus, X, RefreshCw, Calendar, Clock } from 'lucide-react-native';
import { generateOptimizedTours, calculateTourStatistics } from '@/utils/tourOptimizer';
import { useLanguage } from '@/hooks/useLanguage';

const TOUR_COLORS = [
  '#2563EB', '#DC2626', '#059669', '#F59E0B', '#7C3AED', 
  '#EC4899', '#10B981', '#F97316', '#6366F1', '#EF4444'
];

export default function Tours() {
  const { customers, orders, vehicles, tours, settings, saveTours, saveOrders, loading } = useData();
  const { t } = useLanguage();
  const { isOptimizing, lastOptimization, triggerOptimization } = useAutoOptimization();
  const [generatingTours, setGeneratingTours] = useState(false);
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  
  // Filter tours by selected date and orders by delivery date
  const toursForDate = tours.filter(tour => tour.date === selectedDate);
  const ordersForDate = pendingOrders.filter(order => order.deliveryDate === selectedDate);

  const handleGenerateTours = async () => {
    const ordersToProcess = selectedOrders.length > 0 
      ? orders.filter(order => selectedOrders.includes(order.id))
      : ordersForDate;
      
    if (ordersToProcess.length === 0) {
      Alert.alert(t('common.error'), 'Keine Bestellungen für die Tourenplanung verfügbar.');
      return;
    }

    if (availableVehicles.length === 0) {
      Alert.alert(t('common.error'), 'Bitte stellen Sie mindestens ein verfügbares Fahrzeug bereit.');
      return;
    }

    setGeneratingTours(true);
    console.log('Starting tour generation...');
    
    try {
      console.log('Processing orders:', ordersToProcess.length);
      console.log('Available vehicles:', availableVehicles.length);
      
      const optimizedTours = generateOptimizedTours({
        orders: ordersToProcess,
        vehicles: availableVehicles,
        settings,
      });

      console.log('Generated tours:', optimizedTours.length);

      // Assign colors and calculate statistics
      const toursWithStats = optimizedTours.map((tour, index) => {
        const stats = calculateTourStatistics(tour, settings.depot, settings);
        return {
          ...tour,
          color: TOUR_COLORS[index % TOUR_COLORS.length],
          date: selectedDate,
          totalDistance: stats.totalDistance,
          estimatedDuration: stats.estimatedDuration,
        };
      });

      // Remove existing planned tours for the same date
      const existingTours = tours.filter(t => 
        t.date !== selectedDate || t.status !== 'planned'
      );
      
      console.log('Saving tours...');
      await saveTours([...existingTours, ...toursWithStats]);
      
      // Mark selected orders as assigned
      const updatedOrders = orders.map(order => 
        ordersToProcess.some(o => o.id === order.id)
          ? { ...order, status: 'assigned' as const }
          : order
      );
      
      console.log('Updating order status...');
      await saveOrders(updatedOrders);
      
      console.log('Tour generation completed successfully');
      Alert.alert(t('common.success'), `${optimizedTours.length} optimierte Touren wurden erstellt.`);
      
      if (selectedOrders.length > 0) {
        setShowOrderSelection(false);
        setSelectedOrders([]);
      }
    } catch (error) {
      console.error('Error generating tours:', error);
      Alert.alert(t('common.error'), 'Beim Erstellen der Touren ist ein Fehler aufgetreten.');
    } finally {
      setGeneratingTours(false);
    }
  };

  const handleUpdateTourStatus = async (tourId: string, newStatus: Tour['status']) => {
    try {
      const updatedTours = tours.map(tour =>
        tour.id === tourId ? { ...tour, status: newStatus } : tour
      );
      await saveTours(updatedTours);
      
      // If tour is completed, mark all orders as completed
      if (newStatus === 'completed') {
        const tour = tours.find(t => t.id === tourId);
        if (tour) {
          const updatedOrders = orders.map(order => 
            tour.stops.some(stop => stop.orderId === order.id)
              ? { ...order, status: 'completed' as const }
              : order
          );
          await saveOrders(updatedOrders);
        }
      }
      
      Alert.alert(t('common.success'), 'Tour-Status wurde aktualisiert.');
    } catch (error) {
      Alert.alert(t('common.error'), 'Tour-Status konnte nicht aktualisiert werden.');
    }
  };

  const handleDeleteTour = (tour: Tour) => {
    Alert.alert(
      t('common.delete'),
      `Möchten Sie die Tour "${tour.vehicle.name}" wirklich löschen?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTours = tours.filter(t => t.id !== tour.id);
              await saveTours(updatedTours);
              
              // Reset order status to pending
              const updatedOrders = orders.map(order => 
                tour.stops.some(stop => stop.orderId === order.id)
                  ? { ...order, status: 'pending' as const }
                  : order
              );
              await saveOrders(updatedOrders);
              
              Alert.alert(t('common.success'), 'Tour wurde gelöscht.');
            } catch (error) {
              Alert.alert(t('common.error'), 'Tour konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#F59E0B';
      case 'in-progress': return '#2563EB';
      case 'completed': return '#059669';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return t('status.planned');
      case 'in-progress': return t('status.inProgress');
      case 'completed': return t('status.completed');
      default: return 'Unbekannt';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Route;
      case 'in-progress': return Play;
      case 'completed': return CheckCircle;
      default: return Route;
    }
  };

  const formatLastOptimization = () => {
    if (!lastOptimization) return 'Nie';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastOptimization.getTime()) / 1000);
    
    if (diff < 60) return `vor ${diff}s`;
    if (diff < 3600) return `vor ${Math.floor(diff / 60)}m`;
    return `vor ${Math.floor(diff / 3600)}h`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Touren werden geladen...</Text>
        <Text style={styles.loadingText}>{t('common.loading') || 'Lade Touren...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.tours')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[
              styles.optimizeButton, 
              isOptimizing && styles.optimizeButtonActive,
              (ordersForDate.length === 0 || availableVehicles.length === 0) && styles.optimizeButtonDisabled
            ]} 
            onPress={triggerOptimization}
            disabled={isOptimizing || ordersForDate.length === 0 || availableVehicles.length === 0}
          >
            <RefreshCw 
              size={16} 
              color="#FFFFFF" 
            />
            <Text style={styles.optimizeButtonText}>
              {isOptimizing ? 'Optimiert...' : 'Optimieren'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.generateButton, (ordersForDate.length === 0 || availableVehicles.length === 0) && styles.generateButtonDisabled]} 
            onPress={() => setShowOrderSelection(true)}
            disabled={ordersForDate.length === 0 || availableVehicles.length === 0}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>{t('tours.newTour') || 'Neue Tour'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Tour Generation for Selected Date */}
      {ordersForDate.length > 0 && availableVehicles.length > 0 && (
        <View style={styles.quickGenerateContainer}>
          <Text style={styles.quickGenerateText}>
            {ordersForDate.length} Bestellungen für {new Date(selectedDate).toLocaleDateString('de-DE')} verfügbar
          </Text>
          <TouchableOpacity 
            style={styles.quickGenerateButton}
            onPress={handleGenerateTours}
            disabled={generatingTours}
          >
            <Text style={styles.quickGenerateButtonText}>
              {generatingTours ? 'Erstelle...' : 'Alle Touren für dieses Datum erstellen'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Optimization Status */}
      <View style={styles.optimizationStatus}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Auto-Optimierung:</Text>
            <View style={[styles.statusIndicator, { backgroundColor: settings.autoOptimization ? '#10B981' : '#6B7280' }]} />
            <Text style={styles.statusText}>
              {settings.autoOptimization ? 'Aktiv' : 'Inaktiv'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.statusText}>Letzte Optimierung: {formatLastOptimization()}</Text>
          </View>
        </View>
        
        {isOptimizing && (
          <View style={styles.optimizingIndicator}>
            <RefreshCw size={16} color="#2563EB" style={styles.spinning} />
            <Text style={styles.optimizingText}>System optimiert Touren...</Text>
          </View>
        )}
      </View>

      {/* Date Selection */}
      <View style={styles.dateSelection}>
        <Calendar size={20} color="#374151" />
        <Text style={styles.dateLabel}>Datum:</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>{new Date(selectedDate).toLocaleDateString('de-DE')}</Text>
        </TouchableOpacity>
        <View style={styles.dateNavigation}>
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() - 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
          >
            <Text style={styles.dateNavText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => {
              const date = new Date(selectedDate);
              date.setDate(date.getDate() + 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
          >
            <Text style={styles.dateNavText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(ordersForDate.length === 0 || availableVehicles.length === 0) && (
        <View style={styles.warningContainer}>
          {ordersForDate.length === 0 && (
            <Text style={styles.warningText}>
              Keine ausstehenden Bestellungen für {new Date(selectedDate).toLocaleDateString('de-DE')} vorhanden.
            </Text>
          )}
          {availableVehicles.length === 0 && (
            <Text style={styles.warningText}>
              Keine verfügbaren Fahrzeuge für die Tourenplanung vorhanden.
            </Text>
          )}
        </View>
      )}

      <ScrollView style={styles.content}>
        {toursForDate.length === 0 ? (
          <View style={styles.emptyState}>
            <Route size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>{t('tours.noTours') || 'Keine Touren vorhanden'}</Text>
            <Text style={styles.emptyStateText}>
              Erstellen Sie automatisch optimierte Touren basierend auf Ihren Bestellungen und Fahrzeugen.
            </Text>
            {ordersForDate.length > 0 && availableVehicles.length > 0 && (
              <TouchableOpacity 
                style={styles.emptyStateButton} 
                onPress={() => setShowOrderSelection(true)}
              >
                <Text style={styles.emptyStateButtonText}>{t('tours.createFirstTour') || 'Erste Tour erstellen'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          toursForDate.map((tour) => {
            const StatusIcon = getStatusIcon(tour.status);
            const totalContainers = tour.stops.reduce((sum, stop) => sum + stop.order.containerCount, 0);
            const capacityUsage = (totalContainers / tour.vehicle.capacity) * 100;
            const isOverCapacity = capacityUsage > 100;
            const isNearCapacity = capacityUsage > 80 && capacityUsage <= 100;

            return (
              <View key={tour.id} style={styles.tourCard}>
                <View style={styles.tourHeader}>
                  <View style={styles.tourInfo}>
                    <View style={styles.tourTitleRow}>
                      <View style={[styles.colorIndicator, { backgroundColor: tour.color }]} />
                      <Text style={styles.tourTitle}>{tour.vehicle.name}</Text>
                      <View style={[styles.vehicleStatus, { 
                        backgroundColor: tour.vehicle.status === 'available' ? '#10B981' : 
                                       tour.vehicle.status === 'out-of-service' ? '#F59E0B' : 
                                       tour.vehicle.status === 'in-repair' ? '#DC2626' : '#6B7280'
                      }]}>
                        <Text style={styles.vehicleStatusText}>
                          {tour.vehicle.status === 'available' ? 'Verfügbar' : 
                           tour.vehicle.status === 'out-of-service' ? 'Im Einsatz' : 
                           tour.vehicle.status === 'in-repair' ? 'Wartung' : 'Unbekannt'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.tourDate}>{new Date(tour.date).toLocaleDateString('de-DE')}</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tour.status) + '20' }]}>
                      <StatusIcon size={12} color={getStatusColor(tour.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(tour.status) }]}>
                        {getStatusText(tour.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tourStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Stopps</Text>
                    <Text style={styles.statValue}>{tour.stops.length}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Container</Text>
                    <Text style={[
                      styles.statValue,
                      isOverCapacity && styles.statValueError,
                      isNearCapacity && styles.statValueWarning,
                    ]}>
                      {totalContainers}/{tour.vehicle.capacity}
                    </Text>
                  </View>
                  {tour.totalDistance && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Entfernung</Text>
                      <Text style={styles.statValue}>{tour.totalDistance} km</Text>
                    </View>
                  )}
                  {tour.estimatedDuration && (
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Dauer</Text>
                      <Text style={[
                        styles.statValue,
                        tour.estimatedDuration > settings.maxTourDuration && styles.statValueWarning,
                      ]}>
                        {tour.estimatedDuration.toFixed(1)}h
                      </Text>
                    </View>
                  )}
                </View>

                {(isOverCapacity || (tour.estimatedDuration && tour.estimatedDuration > settings.maxTourDuration)) && (
                  <View style={styles.warningContainer}>
                    {isOverCapacity && (
                      <Text style={styles.warningText}>⚠️ Kapazität überschritten</Text>
                    )}
                    {tour.estimatedDuration && tour.estimatedDuration > settings.maxTourDuration && (
                      <Text style={styles.warningText}>⚠️ Maximale Tourenlänge überschritten</Text>
                    )}
                  </View>
                )}

                <View style={styles.stopsContainer}>
                  <Text style={styles.stopsTitle}>Stopps:</Text>
                  {tour.stops.slice(0, 3).map((stop, index) => (
                    <View key={stop.orderId} style={styles.stopItem}>
                      <Text style={styles.stopOrder}>{stop.sequence}.</Text>
                      <Text style={styles.stopCustomer}>{stop.order.customer.name}</Text>
                      <Text style={styles.stopContainers}>{stop.order.containerCount} Container</Text>
                    </View>
                  ))}
                  {tour.stops.length > 3 && (
                    <Text style={styles.moreStops}>... und {tour.stops.length - 3} weitere</Text>
                  )}
                </View>

                <View style={styles.tourActions}>
                  {tour.status === 'planned' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUpdateTourStatus(tour.id, 'in-progress')}
                    >
                      <Play size={16} color="#2563EB" />
                      <Text style={styles.actionButtonText}>{t('action.start')}</Text>
                    </TouchableOpacity>
                  )}
                  
                  {tour.status === 'in-progress' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUpdateTourStatus(tour.id, 'completed')}
                    >
                      <CheckCircle size={16} color="#059669" />
                      <Text style={styles.actionButtonText}>{t('action.complete')}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteTour(tour)}
                  >
                    <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Order Selection Modal */}
      <Modal visible={showOrderSelection} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowOrderSelection(false);
              setSelectedOrders([]);
            }}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('tours.selectOrders') || 'Bestellungen auswählen'}</Text>
            <TouchableOpacity 
              onPress={handleGenerateTours}
              disabled={selectedOrders.length === 0 || generatingTours}
            >
              <Text style={[
                styles.modalSave,
                (selectedOrders.length === 0 || generatingTours) && styles.modalSaveDisabled
              ]}>
                {generatingTours ? (t('tours.creating') || 'Erstelle...') : (t('tours.createTour') || 'Tour erstellen')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
             {selectedOrders.length} von {ordersForDate.length} Bestellungen ausgewählt
            </Text>
            <Text style={styles.selectionSubtext}>
              {selectedOrders.reduce((sum, orderId) => {
               const order = ordersForDate.find(o => o.id === orderId);
                return sum + (order?.containerCount || 0);
              }, 0)} Container gesamt
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
           {ordersForDate.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderOption,
                  selectedOrders.includes(order.id) && styles.orderOptionSelected
                ]}
                onPress={() => toggleOrderSelection(order.id)}
              >
                <View style={styles.orderOptionInfo}>
                  <Text style={styles.orderOptionCustomer}>{order.customer.name}</Text>
                  <Text style={styles.orderOptionAddress}>{order.customer.address}</Text>
                  <Text style={styles.orderOptionDelivery}>
                    🚚 Lieferung: {new Date(order.deliveryDate).toLocaleDateString('de-DE')}
                  </Text>
                  <Text style={styles.orderOptionDetails}>
                    {order.containerCount} Container • Priorität: {order.priority}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedOrders.includes(order.id) && styles.checkboxSelected
                ]}>
                  {selectedOrders.includes(order.id) && (
                    <CheckCircle size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  generateButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  quickGenerateContainer: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickGenerateText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    marginBottom: 8,
  },
  quickGenerateButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  quickGenerateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  optimizeButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  optimizeButtonActive: {
    backgroundColor: '#059669',
  },
  optimizeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  optimizeButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  spinning: {
    // Removed spinning animation for Expo Go compatibility
  },
  optimizationStatus: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  optimizingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 6,
    gap: 8,
  },
  optimizingText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  dateSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  dateButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dateNavigation: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 'auto',
  },
  dateNavButton: {
    backgroundColor: '#F3F4F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tourInfo: {
    flex: 1,
  },
  tourTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  vehicleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vehicleStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tourDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tourStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statValueWarning: {
    color: '#F59E0B',
  },
  statValueError: {
    color: '#DC2626',
  },
  stopsContainer: {
    marginBottom: 16,
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stopOrder: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 24,
  },
  stopCustomer: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  stopContainers: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreStops: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 32,
  },
  tourActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveDisabled: {
    color: '#9CA3AF',
  },
  selectionInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  selectionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  orderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF8FF',
  },
  orderOptionInfo: {
    flex: 1,
  },
  orderOptionCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  orderOptionAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderOptionDelivery: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
    fontWeight: '500',
  },
  orderOptionDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
});