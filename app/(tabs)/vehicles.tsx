import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, Truck, CreditCard as Edit3, Trash2, X, Save } from 'lucide-react-native';
import { useData } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { Vehicle } from '@/types';

export default function Vehicles() {
  const { vehicles, saveVehicles, loading } = useData();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    licensePlate: '',
    driverName: '',
    notes: '',
    status: 'available' as Vehicle['status'],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      licensePlate: '',
      driverName: '',
      notes: '',
      status: 'available',
    });
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      capacity: vehicle.capacity.toString(),
      licensePlate: vehicle.licensePlate || '',
      driverName: vehicle.driverName || '',
      notes: vehicle.notes || '',
      status: vehicle.status,
    });
    setShowAddModal(true);
  };

  const handleSaveVehicle = async () => {
    if (!formData.name.trim() || !formData.capacity.trim()) {
      Alert.alert(t('common.error'), 'Name und Kapazität sind Pflichtfelder.');
      return;
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      Alert.alert(t('common.error'), 'Kapazität muss eine positive Zahl sein.');
      return;
    }

    try {
      let updatedVehicles: Vehicle[];

      if (editingVehicle) {
        // Update existing vehicle
        updatedVehicles = vehicles.map(vehicle =>
          vehicle.id === editingVehicle.id
            ? {
                ...vehicle,
                name: formData.name.trim(),
                capacity,
                licensePlate: formData.licensePlate.trim(),
                driverName: formData.driverName.trim(),
                notes: formData.notes.trim(),
                status: formData.status,
              }
            : vehicle
        );
      } else {
        // Add new vehicle
        const newVehicle: Vehicle = {
          id: `vehicle-${Date.now()}`,
          name: formData.name.trim(),
          capacity,
          licensePlate: formData.licensePlate.trim(),
          driverName: formData.driverName.trim(),
          notes: formData.notes.trim(),
          status: formData.status,
        };
        updatedVehicles = [...vehicles, newVehicle];
      }

      await saveVehicles(updatedVehicles);
      setShowAddModal(false);
      resetForm();
      setEditingVehicle(null);
      
      Alert.alert(
        t('common.success'), 
        editingVehicle ? 'Fahrzeug wurde aktualisiert.' : 'Fahrzeug wurde hinzugefügt.'
      );
    } catch (error) {
      Alert.alert(t('common.error'), 'Fahrzeug konnte nicht gespeichert werden.');
    }
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      t('common.delete'),
      `Möchten Sie das Fahrzeug "${vehicle.name}" wirklich löschen?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedVehicles = vehicles.filter(v => v.id !== vehicle.id);
              await saveVehicles(updatedVehicles);
              Alert.alert(t('common.success'), 'Fahrzeug wurde gelöscht.');
            } catch (error) {
              Alert.alert(t('common.error'), 'Fahrzeug konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#059669';
      case 'out-of-service': return '#F59E0B';
      case 'in-repair': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return t('status.available');
      case 'out-of-service': return t('status.outOfService');
      case 'in-repair': return t('status.inRepair');
      default: return 'Unbekannt';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Fahrzeugdaten werden geladen...</Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('vehicles.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {vehicles.map((vehicle) => (
          <View key={vehicle.id} style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleIcon}>
                <Truck size={24} color={getStatusColor(vehicle.status)} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                {vehicle.licensePlate && (
                  <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
                )}
                {vehicle.driverName && (
                  <Text style={styles.driverName}>Fahrer: {vehicle.driverName}</Text>
                )}
                {vehicle.notes && (
                  <Text style={styles.vehicleNotes}>💬 {vehicle.notes}</Text>
                )}
              </View>
              <View style={styles.vehicleActions}>
                <TouchableOpacity onPress={() => handleEditVehicle(vehicle)}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteVehicle(vehicle)}>
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kapazität:</Text>
                <Text style={styles.detailValue}>{vehicle.capacity} Container</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
                    {getStatusText(vehicle.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {vehicles.length === 0 && (
          <View style={styles.emptyState}>
            <Truck size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>{t('vehicles.noVehicles')}</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddVehicle}>
              <Text style={styles.emptyStateButtonText}>{t('vehicles.addFirst')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Vehicle Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              resetForm();
              setEditingVehicle(null);
            }}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingVehicle ? t('vehicles.edit') : t('vehicles.new')}
            </Text>
            <TouchableOpacity onPress={handleSaveVehicle}>
              <Save size={24} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.name')} *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="z.B. LKW-001"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.capacity')} (Container) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                placeholder="z.B. 10"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Kennzeichen</Text>
              <TextInput
                style={styles.formInput}
                value={formData.licensePlate}
                onChangeText={(text) => setFormData({ ...formData, licensePlate: text })}
                placeholder="z.B. B-AB 1234"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fahrer</Text>
              <TextInput
                style={styles.formInput}
                value={formData.driverName}
                onChangeText={(text) => setFormData({ ...formData, driverName: text })}
                placeholder="Name des Fahrers"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.status')}</Text>
              <View style={styles.statusSelector}>
                {[
                  { value: 'available', label: t('status.available') },
                  { value: 'out-of-service', label: t('status.outOfService') },
                  { value: 'in-repair', label: t('status.inRepair') },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusOption,
                      formData.status === status.value && styles.statusOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, status: status.value as Vehicle['status'] })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      formData.status === status.value && styles.statusOptionTextSelected
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.notes')}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  vehicleCard: {
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
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  driverName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  vehicleNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleDetails: {
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
    marginTop: 16,
    marginBottom: 16,
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
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  statusOptionSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
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