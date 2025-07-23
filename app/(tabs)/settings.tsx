import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Modal, Alert, Dimensions, Platform } from 'react-native';
import { Settings as SettingsIcon, MapPin, Clock, Truck, Download, Save, CreditCard as Edit3, Bell, Shield, Palette, Globe, Database, RefreshCw, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '@/hooks/useData';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage, Language } from '@/hooks/useLanguage';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function Settings() {
  const { settings, saveSettings, customers, vehicles, orders, tours, saveCustomers, saveVehicles, saveOrders, saveTours, resetAllData } = useData();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  
  const [depotName, setDepotName] = useState(settings.depot.name);
  const [depotAddress, setDepotAddress] = useState(settings.depot.address);
  const [workStart, setWorkStart] = useState(settings.workingHours.start);
  const [workEnd, setWorkEnd] = useState(settings.workingHours.end);
  const [maxTourDuration, setMaxTourDuration] = useState(settings.maxTourDuration.toString());
  const [stopDuration, setStopDuration] = useState(settings.stopDuration.toString());
  const [containerHandlingTime, setContainerHandlingTime] = useState(settings.containerHandlingTime.toString());
  const [optimizationInterval, setOptimizationInterval] = useState(settings.optimizationInterval.toString());
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const handleToggleAutoOptimization = async (value: boolean) => {
    try {
      const updatedSettings = { ...settings, autoOptimization: value };
      await saveSettings(updatedSettings);
      
      if (value) {
        Alert.alert(
          'Auto-Optimierung aktiviert',
          `Das System wird nun alle ${settings.optimizationInterval} Sekunden automatisch Touren optimieren.`
        );
      } else {
        Alert.alert(
          'Auto-Optimierung deaktiviert',
          'Das System wird keine automatischen Optimierungen mehr durchführen.'
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Einstellung konnte nicht gespeichert werden.');
    }
  };

  // Update local state when settings change
  useEffect(() => {
    setDepotName(settings.depot.name);
    setDepotAddress(settings.depot.address);
    setWorkStart(settings.workingHours.start);
    setWorkEnd(settings.workingHours.end);
    setMaxTourDuration(settings.maxTourDuration.toString());
    setStopDuration(settings.stopDuration.toString());
    setContainerHandlingTime(settings.containerHandlingTime.toString());
    setOptimizationInterval(settings.optimizationInterval.toString());
    setDistanceUnit(settings.distanceUnit);
  }, [settings]);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const units = [
    { value: 'km', label: 'Kilometer (km)' },
    { value: 'miles', label: 'Meilen (mi)' },
  ];

  const handleSave = async () => {
    try {
      const maxDuration = parseInt(maxTourDuration);
      const stopDur = parseInt(stopDuration);
      const containerTime = parseInt(containerHandlingTime);
      const optInterval = parseInt(optimizationInterval);
      
      if (isNaN(maxDuration) || maxDuration <= 0) {
        Alert.alert(t('common.error'), 'Maximale Tourenlänge muss eine positive Zahl sein.');
        return;
      }
      
      if (isNaN(stopDur) || stopDur <= 0) {
        Alert.alert(t('common.error'), 'Stopp-Dauer muss eine positive Zahl sein.');
        return;
      }
      
      if (isNaN(containerTime) || containerTime <= 0) {
        Alert.alert(t('common.error'), 'Container-Bearbeitungszeit muss eine positive Zahl sein.');
        return;
      }
      
      if (isNaN(optInterval) || optInterval < 10) {
        Alert.alert(t('common.error'), 'Optimierungs-Intervall muss mindestens 10 Sekunden betragen.');
        return;
      }

      const updatedSettings = {
        ...settings,
        depot: {
          ...settings.depot,
          name: depotName.trim(),
          address: depotAddress.trim(),
        },
        workingHours: {
          start: workStart,
          end: workEnd,
        },
        maxTourDuration: maxDuration,
        stopDuration: stopDur,
        containerHandlingTime: containerTime,
        optimizationInterval: optInterval,
        distanceUnit,
      };

      await saveSettings(updatedSettings);
      setEditingField(null);
      Alert.alert(t('common.success'), 'Einstellungen wurden gespeichert.');
    } catch (error) {
      Alert.alert(t('common.error'), 'Einstellungen konnten nicht gespeichert werden.');
    }
  };

  const handleLanguageChange = async (language: Language) => {
    try {
      await changeLanguage(language);
      setShowLanguageModal(false);
      Alert.alert(t('common.success'), t('settings.languageChanged'));
    } catch (error) {
      Alert.alert(t('common.error'), 'Language could not be changed.');
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      t('settings.resetApp'),
      t('settings.resetConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              Alert.alert(t('common.success'), t('settings.resetSuccess'));
            } catch (error) {
              Alert.alert(t('common.error'), 'App could not be reset.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        customers,
        vehicles,
        orders,
        tours,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `tourenplaner-export-${new Date().toISOString().split('T')[0]}.json`;
      
      if (Platform.OS === 'web') {
        // For web platform, create a download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert(t('common.success'), t('message.dataExported'));
      } else {
        // For mobile platforms
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: t('action.export'),
          });
        } else {
          Alert.alert(t('common.success'), `Daten wurden exportiert nach: ${fileUri}`);
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Daten konnten nicht exportiert werden.');
    }
  };

  const handleImportData = async () => {
    try {
      let fileContent: string;
      
      if (Platform.OS === 'web') {
        // For web platform, use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        return new Promise((resolve) => {
          input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                const content = event.target?.result as string;
                await processImportData(content);
                resolve(true);
              } catch (error) {
                Alert.alert(t('common.error'), 'Datei konnte nicht gelesen werden.');
                resolve(false);
              }
            };
            reader.readAsText(file);
          };
          input.click();
        });
      } else {
        // For mobile platforms
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        await processImportData(fileContent);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Datei konnte nicht gelesen werden. Stellen Sie sicher, dass es sich um eine gültige JSON-Datei handelt.');
    }
  };

  const processImportData = async (fileContent: string) => {
    const importData = JSON.parse(fileContent);

    // Validate import data structure
    if (!importData.customers || !importData.vehicles || !importData.orders || !importData.tours) {
      Alert.alert(t('common.error'), 'Ungültiges Datenformat.');
      return;
    }

    Alert.alert(
      t('action.import'),
      'Möchten Sie die importierten Daten mit den vorhandenen Daten zusammenführen oder alle vorhandenen Daten ersetzen?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Zusammenführen',
          onPress: async () => {
            try {
              // Merge data
              const mergedCustomers = [...customers, ...importData.customers.filter((c: any) => 
                !customers.some(existing => existing.id === c.id)
              )];
              const mergedVehicles = [...vehicles, ...importData.vehicles.filter((v: any) => 
                !vehicles.some(existing => existing.id === v.id)
              )];
              const mergedOrders = [...orders, ...importData.orders.filter((o: any) => 
                !orders.some(existing => existing.id === o.id)
              )];
              const mergedTours = [...tours, ...importData.tours.filter((t: any) => 
                !tours.some(existing => existing.id === t.id)
              )];

              await Promise.all([
                saveCustomers(mergedCustomers),
                saveVehicles(mergedVehicles),
                saveOrders(mergedOrders),
                saveTours(mergedTours),
              ]);

              Alert.alert(t('common.success'), t('message.dataImported'));
            } catch (error) {
              Alert.alert(t('common.error'), 'Daten konnten nicht zusammengeführt werden.');
            }
          },
        },
        {
          text: 'Ersetzen',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all([
                saveCustomers(importData.customers),
                saveVehicles(importData.vehicles),
                saveOrders(importData.orders),
                saveTours(importData.tours),
              ]);

              if (importData.settings) {
                await saveSettings(importData.settings);
                // Update local state
                setDepotName(importData.settings.depot.name);
                setDepotAddress(importData.settings.depot.address);
                setWorkStart(importData.settings.workingHours.start);
                setWorkEnd(importData.settings.workingHours.end);
                setMaxTourDuration(importData.settings.maxTourDuration.toString());
                setDistanceUnit(importData.settings.distanceUnit);
              }

              Alert.alert(t('common.success'), 'Alle Daten wurden erfolgreich ersetzt.');
            } catch (error) {
              Alert.alert(t('common.error'), 'Daten konnten nicht ersetzt werden.');
            }
          },
        },
      ]
    );
  };

  const renderEditableField = (label: string, value: string, setValue: (value: string) => void, fieldKey: string, placeholder?: string) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      {editingField === fieldKey ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            autoFocus
          />
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={16} color="#10B981" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.editableValue}
          onPress={() => setEditingField(fieldKey)}
        >
          <Text style={styles.settingValue}>{value}</Text>
          <Edit3 size={16} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>App-Konfiguration verwalten</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Depot Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={24} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Depot-Einstellungen</Text>
          </View>
          
          {renderEditableField('Depot-Name', depotName, setDepotName, 'depotName', 'Name des Hauptlagers')}
          {renderEditableField('Depot-Adresse', depotAddress, setDepotAddress, 'depotAddress', 'Vollständige Adresse')}
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={24} color="#10B981" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Arbeitszeiten</Text>
          </View>
          
          {renderEditableField('Arbeitsbeginn', workStart, setWorkStart, 'workStart', 'HH:MM')}
          {renderEditableField('Arbeitsende', workEnd, setWorkEnd, 'workEnd', 'HH:MM')}
        </View>

        {/* Tour Planning */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Truck size={24} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Tourenplanung</Text>
          </View>
          
          {renderEditableField('Maximale Tourenlänge (Stunden)', maxTourDuration, setMaxTourDuration, 'maxTourDuration', 'Stunden')}
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Stopp-Dauer (Minuten)</Text>
            {editingField === 'stopDuration' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={stopDuration}
                  onChangeText={setStopDuration}
                  placeholder="Minuten pro Stopp"
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Save size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editableValue}
                onPress={() => setEditingField('stopDuration')}
              >
                <Text style={styles.settingValue}>{settings.stopDuration} Min</Text>
                <Edit3 size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Container-Bearbeitungszeit (Min/Container)</Text>
            {editingField === 'containerHandlingTime' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={containerHandlingTime}
                  onChangeText={setContainerHandlingTime}
                  placeholder="Minuten pro Container"
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Save size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editableValue}
                onPress={() => setEditingField('containerHandlingTime')}
              >
                <Text style={styles.settingValue}>{settings.containerHandlingTime} Min</Text>
                <Edit3 size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Automatische Optimierung</Text>
            <Switch
              value={settings.autoOptimization}
              onValueChange={(value) => {
                handleToggleAutoOptimization(value);
              }}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={settings.autoOptimization ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Optimierungs-Intervall (Sekunden)</Text>
            {editingField === 'optimizationInterval' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={optimizationInterval}
                  onChangeText={setOptimizationInterval}
                  placeholder="Sekunden (min. 10)"
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Save size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editableValue}
                onPress={() => setEditingField('optimizationInterval')}
              >
                <Text style={styles.settingValue}>{settings.optimizationInterval}s</Text>
                <Edit3 size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.optimizationInfo}>
            <Text style={styles.optimizationInfoTitle}>ℹ️ Optimierungs-Hinweise</Text>
            <Text style={styles.optimizationInfoText}>
              • Auto-Optimierung plant Touren für heute und morgen automatisch
            </Text>
            <Text style={styles.optimizationInfoText}>
              • Manuelle Optimierung kann jederzeit ausgelöst werden
            </Text>
            <Text style={styles.optimizationInfoText}>
              • Fahrzeuge werden automatisch als "Im Einsatz" markiert
            </Text>
            <Text style={styles.optimizationInfoText}>
              • Minimales Intervall: 10 Sekunden
            </Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Entfernungseinheit</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowUnitModal(true)}
            >
              <Text style={styles.settingValue}>
                {units.find(u => u.value === distanceUnit)?.label}
              </Text>
              <Edit3 size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={24} color="#8B5CF6" strokeWidth={2} />
            <Text style={styles.sectionTitle}>App-Einstellungen</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('settings.language')}</Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.settingValue}>
                {languages.find(l => l.code === currentLanguage)?.flag} {languages.find(l => l.code === currentLanguage)?.name}
              </Text>
              <Edit3 size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Benachrichtigungen</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Automatisches Backup</Text>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: '#E5E7EB', true: '#10B981' }}
              thumbColor={autoBackup ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dunkler Modus</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E7EB', true: '#6B7280' }}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={24} color="#EF4444" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Datenverwaltung</Text>
          </View>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Download size={20} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.actionButtonText}>{t('action.export')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleImportData}>
            <Upload size={20} color="#10B981" strokeWidth={2} />
            <Text style={styles.actionButtonText}>{t('action.import')}</Text>
          </TouchableOpacity>

          <View style={styles.dataStats}>
            <Text style={styles.dataStatsTitle}>Aktuelle Daten:</Text>
            <Text style={styles.dataStatsText}>• {customers.length} Kunden</Text>
            <Text style={styles.dataStatsText}>• {vehicles.length} Fahrzeuge</Text>
            <Text style={styles.dataStatsText}>• {orders.length} Bestellungen</Text>
            <Text style={styles.dataStatsText}>• {tours.length} Touren</Text>
          </View>
        </View>

        {/* Reset App */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RefreshCw size={24} color="#DC2626" strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t('settings.resetApp')}</Text>
          </View>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleResetApp}>
            <RefreshCw size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.resetButtonText}>{t('settings.resetApp')}</Text>
          </TouchableOpacity>
          
          <Text style={styles.resetDescription}>
            Alle lokalen Daten (Kunden, Fahrzeuge, Touren, Einstellungen) werden gelöscht 
            und die App wird auf den Ausgangszustand zurückgesetzt.
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={24} color="#6B7280" strokeWidth={2} />
            <Text style={styles.sectionTitle}>App-Informationen</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tourenplaner für Container-Lieferungen</Text>
            <Text style={styles.infoText}>
              Entwickelt für die Optimierung von Container-Lieferrouten mit automatischer Tourenplanung 
              und manueller Nachbearbeitung. Unterstützt Offline-Betrieb und USB-Updates.
            </Text>
            <View style={styles.infoFooter}>
              <Text style={styles.infoVersion}>Version 1.0.0</Text>
              <Text style={styles.infoBuild}>Build 2024.01.15</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.modalOption, currentLanguage === lang.code && styles.modalOptionSelected]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.modalOptionText}>{lang.flag} {lang.name}</Text>
                {currentLanguage === lang.code && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unit Selection Modal */}
      <Modal visible={showUnitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entfernungseinheit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={[styles.modalOption, distanceUnit === unit.value && styles.modalOptionSelected]}
                onPress={() => {
                  setDistanceUnit(unit.value);
                  setShowUnitModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{unit.label}</Text>
                {distanceUnit === unit.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowUnitModal(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
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
  content: {
    padding: 20,
    marginTop: -15,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 16,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dataStats: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  dataStatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dataStatsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resetButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resetDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoBuild: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  modalOptionSelected: {
    backgroundColor: '#EBF8FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  checkmark: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: '700',
  },
  modalCloseButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  optimizationInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  optimizationInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  optimizationInfoText: {
    fontSize: 13,
    color: '#0369A1',
    marginBottom: 4,
    lineHeight: 18,
  },
});