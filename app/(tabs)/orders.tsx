import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, Package, Calendar, X, Save, Search, Users, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useData } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'expo-router';
import { Order, Customer } from '@/types';

export default function Orders() {
  const { orders, customers, saveOrders, loading } = useData();
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    containerCount: '',
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to tomorrow
    priority: 'medium' as Order['priority'],
    timeWindowStart: '',
    timeWindowEnd: '',
    notes: '',
  });

  const filteredOrders = orders.filter(order =>
    order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      customerId: '',
      containerCount: '',
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
      timeWindowStart: '',
      timeWindowEnd: '',
      notes: '',
    });
  };

  const handleAddOrder = () => {
    if (customers.length === 0) {
      Alert.alert(
        t('common.error'), 
        'Bitte fügen Sie zuerst Kunden hinzu, bevor Sie Bestellungen erstellen können.'
      );
      return;
    }
    setEditingOrder(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId,
      containerCount: order.containerCount.toString(),
      deliveryDate: order.deliveryDate,
      priority: order.priority,
      timeWindowStart: order.timeWindow?.start || '',
      timeWindowEnd: order.timeWindow?.end || '',
      notes: order.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveOrder = async () => {
    if (!formData.customerId || !formData.containerCount.trim() || !formData.deliveryDate) {
      Alert.alert(t('common.error'), 'Kunde, Container-Anzahl und Lieferdatum sind Pflichtfelder.');
      return;
    }

    const containerCount = parseInt(formData.containerCount);
    if (isNaN(containerCount) || containerCount <= 0) {
      Alert.alert(t('common.error'), 'Container-Anzahl muss eine positive Zahl sein.');
      return;
    }

    // Validate delivery date
    const deliveryDate = new Date(formData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deliveryDate < today) {
      Alert.alert(t('common.error'), 'Das Lieferdatum darf nicht in der Vergangenheit liegen.');
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) {
      Alert.alert(t('common.error'), 'Ausgewählter Kunde nicht gefunden.');
      return;
    }

    try {
      let updatedOrders: Order[];

      if (editingOrder) {
        // Update existing order
        updatedOrders = orders.map(order =>
          order.id === editingOrder.id
            ? {
                ...order,
                customerId: formData.customerId,
                customer,
                containerCount,
                deliveryDate: formData.deliveryDate,
                priority: formData.priority,
                timeWindow: formData.timeWindowStart && formData.timeWindowEnd ? {
                  start: formData.timeWindowStart,
                  end: formData.timeWindowEnd,
                } : undefined,
                notes: formData.notes.trim(),
              }
            : order
        );
      } else {
        // Add new order
        const newOrder: Order = {
          id: `order-${Date.now()}`,
          customerId: formData.customerId,
          customer,
          containerCount,
         deliveryDate: formData.deliveryDate,
          priority: formData.priority,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          timeWindow: formData.timeWindowStart && formData.timeWindowEnd ? {
            start: formData.timeWindowStart,
            end: formData.timeWindowEnd,
          } : undefined,
          notes: formData.notes.trim(),
        };
        updatedOrders = [...orders, newOrder];
      }

      await saveOrders(updatedOrders);
      setShowAddModal(false);
      resetForm();
      setEditingOrder(null);
      
      Alert.alert(
        t('common.success'), 
        editingOrder ? 'Bestellung wurde aktualisiert.' : 'Bestellung wurde hinzugefügt.'
      );
    } catch (error) {
      Alert.alert(t('common.error'), 'Bestellung konnte nicht gespeichert werden.');
    }
  };

  const handleDeleteOrder = (order: Order) => {
    Alert.alert(
      t('common.delete'),
      `Möchten Sie die Bestellung für "${order.customer.name}" wirklich löschen?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedOrders = orders.filter(o => o.id !== order.id);
              await saveOrders(updatedOrders);
              Alert.alert(t('common.success'), 'Bestellung wurde gelöscht.');
            } catch (error) {
              Alert.alert(t('common.error'), 'Bestellung konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return 'Unbekannt';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#2563EB';
      case 'completed': return '#059669';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'assigned': return 'Zugewiesen';
      case 'completed': return 'Abgeschlossen';
      default: return 'Unbekannt';
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalContainers = orders.reduce((sum, o) => sum + o.containerCount, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Bestellungen werden geladen...</Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bestellungen verwalten</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingOrdersCount}</Text>
          <Text style={styles.statLabel}>Ausstehende Bestellungen</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalContainers}</Text>
          <Text style={styles.statLabel}>Container gesamt</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Bestellungen suchen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.customer.name}</Text>
                <Text style={styles.customerAddress}>{order.customer.address}</Text>
                <Text style={styles.orderDate}>
                  <Calendar size={14} color="#6B7280" /> {new Date(order.orderDate).toLocaleDateString('de-DE')}
                </Text>
                <Text style={styles.deliveryDate}>
                  🚚 Lieferung: {new Date(order.deliveryDate).toLocaleDateString('de-DE')}
                </Text>
                {order.timeWindow && (
                  <Text style={styles.timeWindow}>
                    🕒 {order.timeWindow.start} - {order.timeWindow.end}
                  </Text>
                )}
                {order.notes && (
                  <Text style={styles.orderNotes}>💬 {order.notes}</Text>
                )}
              </View>
              <View style={styles.orderActions}>
                <TouchableOpacity onPress={() => handleEditOrder(order)}>
                  <Text style={styles.editButton}>Bearbeiten</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteOrder(order)}>
                  <Text style={styles.deleteButton}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Container:</Text>
                <Text style={styles.detailValue}>{order.containerCount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Priorität:</Text>
                <Text style={[styles.detailValue, { color: getPriorityColor(order.priority) }]}>
                  {getPriorityText(order.priority)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#D1D5DB" />
            {searchQuery ? (
              <>
                <Text style={styles.emptyStateText}>Keine Bestellungen gefunden</Text>
                <Text style={styles.emptyStateSubtext}>
                  Versuchen Sie einen anderen Suchbegriff
                </Text>
              </>
            ) : customers.length === 0 ? (
              <>
                <Text style={styles.emptyStateText}>Keine Kunden vorhanden</Text>
                <Text style={styles.emptyStateSubtext}>
                  Sie müssen zuerst Kunden hinzufügen, bevor Sie Bestellungen erstellen können.
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyStateButton, styles.primaryButton]} 
                  onPress={() => router.push('/(tabs)/customers')}
                >
                  <Text style={styles.emptyStateButtonText}>Zu Kunden wechseln</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyStateText}>Noch keine Bestellungen vorhanden</Text>
                <Text style={styles.emptyStateSubtext}>
                  Erstellen Sie Ihre erste Bestellung für einen Kunden
                </Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddOrder}>
                  <Text style={styles.emptyStateButtonText}>Erste Bestellung hinzufügen</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Order Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              resetForm();
              setEditingOrder(null);
            }}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingOrder ? 'Bestellung bearbeiten' : 'Neue Bestellung'}
            </Text>
            <TouchableOpacity onPress={handleSaveOrder}>
              <Save size={24} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kunde *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.customerId}
                  onValueChange={(itemValue) => setFormData({ ...formData, customerId: itemValue })}
                  style={styles.customerSelect}
                >
                  <Picker.Item label="Kunde auswählen..." value="" />
                  {customers.map((customer) => (
                    <Picker.Item 
                      key={customer.id} 
                      label={`${customer.name} - ${customer.address}`} 
                      value={customer.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Gewünschtes Lieferdatum *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.deliveryDate}
                onChangeText={(text) => setFormData({ ...formData, deliveryDate: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Container-Anzahl *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.containerCount}
                onChangeText={(text) => setFormData({ ...formData, containerCount: text })}
                placeholder="z.B. 5"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priorität</Text>
              <View style={styles.prioritySelector}>
                {[
                  { value: 'low', label: 'Niedrig', color: '#059669' },
                  { value: 'medium', label: 'Mittel', color: '#F59E0B' },
                  { value: 'high', label: 'Hoch', color: '#DC2626' },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority.value && { 
                        backgroundColor: priority.color + '20',
                        borderColor: priority.color 
                      }
                    ]}
                    onPress={() => setFormData({ ...formData, priority: priority.value as Order['priority'] })}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      formData.priority === priority.value && { color: priority.color }
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Zeitfenster (optional)</Text>
              <View style={styles.timeWindowContainer}>
                <TextInput
                  style={[styles.formInput, styles.timeInput]}
                  value={formData.timeWindowStart}
                  onChangeText={(text) => setFormData({ ...formData, timeWindowStart: text })}
                  placeholder="08:00"
                />
                <Text style={styles.timeSeparator}>bis</Text>
                <TextInput
                  style={[styles.formInput, styles.timeInput]}
                  value={formData.timeWindowEnd}
                  onChangeText={(text) => setFormData({ ...formData, timeWindowEnd: text })}
                  placeholder="17:00"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notizen</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Zusätzliche Informationen..."
                multiline
                numberOfLines={4}
              />
            </View>
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
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
    fontWeight: '500',
  },
  timeWindow: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  orderNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#10B981',
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  customerSelect: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});