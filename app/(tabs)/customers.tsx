import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Plus, Search, CreditCard as Edit3, Trash2, Users, X, Save } from 'lucide-react-native';
import { useData } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { Customer } from '@/types';

export default function Customers() {
  const { customers, saveCustomers, loading } = useData();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    notes: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      notes: '',
    });
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address,
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveCustomer = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      Alert.alert(t('common.error'), 'Name und Adresse sind Pflichtfelder.');
      return;
    }

    try {
      let updatedCustomers: Customer[];

      if (editingCustomer) {
        // Update existing customer
        updatedCustomers = customers.map(customer =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                notes: formData.notes.trim(),
              }
            : customer
        );
      } else {
        // Add new customer
        const newCustomer: Customer = {
          id: `customer-${Date.now()}`,
          name: formData.name.trim(),
          address: formData.address.trim(),
          latitude: 52.5200 + (Math.random() - 0.5) * 0.05, // Random coordinates around Berlin center
          longitude: 13.4050 + (Math.random() - 0.5) * 0.05,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          notes: formData.notes.trim(),
        };
        updatedCustomers = [...customers, newCustomer];
      }

      await saveCustomers(updatedCustomers);
      setShowAddModal(false);
      resetForm();
      setEditingCustomer(null);
      
      Alert.alert(
        t('common.success'), 
        editingCustomer ? 'Kunde wurde aktualisiert.' : 'Kunde wurde hinzugefügt.'
      );
    } catch (error) {
      Alert.alert(t('common.error'), 'Kunde konnte nicht gespeichert werden.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Kundendaten werden geladen...</Text>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }
  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      t('common.delete'),
      `Möchten Sie den Kunden "${customer.name}" wirklich löschen?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCustomers = customers.filter(c => c.id !== customer.id);
              await saveCustomers(updatedCustomers);
              Alert.alert(t('common.success'), 'Kunde wurde gelöscht.');
            } catch (error) {
              Alert.alert(t('common.error'), 'Kunde konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('customers.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCustomer}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('customers.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredCustomers.map((customer) => (
          <View key={customer.id} style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerAddress}>{customer.address}</Text>
                {customer.phone && (
                  <Text style={styles.customerContact}>📞 {customer.phone}</Text>
                )}
                {customer.email && (
                  <Text style={styles.customerContact}>✉️ {customer.email}</Text>
                )}
                {customer.notes && (
                  <Text style={styles.customerNotes}>💬 {customer.notes}</Text>
                )}
              </View>
              <View style={styles.customerActions}>
                <TouchableOpacity onPress={() => handleEditCustomer(customer)}>
                  <Edit3 size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCustomer(customer)}>
                  <Trash2 size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {filteredCustomers.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? t('message.noData') : t('customers.noCustomers')}
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddCustomer}>
              <Text style={styles.emptyStateButtonText}>{t('customers.addFirst')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Customer Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              resetForm();
              setEditingCustomer(null);
            }}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingCustomer ? t('customers.edit') : t('customers.new')}
            </Text>
            <TouchableOpacity onPress={handleSaveCustomer}>
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
                placeholder="Firmenname oder Kontaktperson"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.address')} *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Vollständige Lieferadresse"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.phone')}</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+49 30 12345678"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('form.email')}</Text>
              <TextInput
                style={styles.formInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="kontakt@beispiel.de"
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
  customerCard: {
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
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
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
  customerContact: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  customerNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 12,
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