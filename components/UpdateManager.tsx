import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useUSBUpdateDetection } from '@/hooks/useUSBUpdateDetection';
import { Download, RefreshCw, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function UpdateManager() {
  const { isChecking, updateAvailable, checkForUpdates, installUpdate, dismissUpdate } = useUSBUpdateDetection();
  const [showManualCheck, setShowManualCheck] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleManualCheck = async () => {
    setShowManualCheck(true);
    await checkForUpdates();
    setTimeout(() => setShowManualCheck(false), 2000);
  };

  const handleInstallUpdate = async () => {
    if (!updateAvailable) return;
    
    setIsInstalling(true);
    try {
      await installUpdate(updateAvailable);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <>
      {/* Manual Update Check Button */}
      <TouchableOpacity 
        style={styles.checkButton} 
        onPress={handleManualCheck}
        disabled={isChecking}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <RefreshCw size={16} color="#FFFFFF" />
        )}
        <Text style={styles.checkButtonText}>
          {isChecking ? 'Prüfe...' : 'Nach Updates suchen'}
        </Text>
      </TouchableOpacity>

      {/* Manual Check Result Modal */}
      <Modal visible={showManualCheck} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.checkResultModal}>
            <CheckCircle size={24} color="#059669" />
            <Text style={styles.checkResultText}>
              {updateAvailable ? 'Update gefunden!' : 'Keine Updates verfügbar'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Update Available Modal */}
      <Modal visible={!!updateAvailable && !isInstalling} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.updateModal}>
            <View style={styles.updateHeader}>
              <View style={styles.updateIcon}>
                <Download size={24} color="#2563EB" />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={dismissUpdate}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.updateTitle}>Neue Version verfügbar</Text>
            <Text style={styles.updateVersion}>Version {updateAvailable?.version}</Text>

            <View style={styles.warningContainer}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Alle lokalen Daten bleiben erhalten
              </Text>
            </View>

            {updateAvailable?.releaseNotes && (
              <View style={styles.releaseNotesContainer}>
                <Text style={styles.releaseNotesTitle}>Versionshinweise:</Text>
                <ScrollView style={styles.releaseNotesScroll}>
                  <Text style={styles.releaseNotesText}>
                    {updateAvailable.releaseNotes}
                  </Text>
                </ScrollView>
              </View>
            )}

            <View style={styles.updateActions}>
              <TouchableOpacity 
                style={styles.laterButton} 
                onPress={dismissUpdate}
              >
                <Text style={styles.laterButtonText}>Später</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.installButton} 
                onPress={handleInstallUpdate}
              >
                <Download size={16} color="#FFFFFF" />
                <Text style={styles.installButtonText}>Jetzt aktualisieren</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Installing Modal */}
      <Modal visible={isInstalling} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.installingModal}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.installingTitle}>Update wird installiert</Text>
            <Text style={styles.installingText}>
              Bitte warten Sie, während die App aktualisiert wird...
            </Text>
            <View style={styles.installingWarning}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.installingWarningText}>
                Schließen Sie die App nicht während des Updates
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  checkButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  checkResultModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  checkResultText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  updateModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  updateVersion: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  releaseNotesContainer: {
    marginBottom: 24,
  },
  releaseNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  releaseNotesScroll: {
    maxHeight: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  releaseNotesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  updateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  laterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  installButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  installButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  installingModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  installingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  installingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  installingWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  installingWarningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
    textAlign: 'center',
  },
});