import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UpdateInfo {
  version: string;
  updateFile: string;
  releaseNotes?: string;
}

interface USBUpdateHook {
  isChecking: boolean;
  updateAvailable: UpdateInfo | null;
  checkForUpdates: () => Promise<void>;
  installUpdate: (updateInfo: UpdateInfo) => Promise<void>;
  dismissUpdate: () => void;
}

const CURRENT_VERSION = '1.0.0'; // This should be read from app.json or package.json
const UPDATE_CHECK_INTERVAL = 10000; // Check every 10 seconds

export function useUSBUpdateDetection(): USBUpdateHook {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);

  // Auto-check for updates periodically
  useEffect(() => {
    if (Platform.OS === 'web') return; // Skip on web platform

    const interval = setInterval(() => {
      checkForUpdates();
    }, UPDATE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async (): Promise<void> => {
    if (isChecking || Platform.OS === 'web') return;

    setIsChecking(true);
    
    try {
      // On mobile platforms, we'll simulate USB detection by checking for update files
      // In a real implementation, you'd use native modules to detect USB devices
      await checkForUpdateFiles();
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkForUpdateFiles = async (): Promise<void> => {
    try {
      // For demonstration, we'll check the Documents directory
      // In production, you'd check mounted USB drives
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) return;

      // Check for version.txt file
      const versionFilePath = `${documentsDir}version.txt`;
      const updateFilePath = `${documentsDir}update.apk`;
      
      const versionFileExists = await FileSystem.getInfoAsync(versionFilePath);
      const updateFileExists = await FileSystem.getInfoAsync(updateFilePath);

      if (versionFileExists.exists && updateFileExists.exists) {
        const versionContent = await FileSystem.readAsStringAsync(versionFilePath);
        const updateInfo = parseVersionFile(versionContent);
        
        if (updateInfo && isNewerVersion(updateInfo.version, CURRENT_VERSION)) {
          setUpdateAvailable({
            ...updateInfo,
            updateFile: updateFilePath,
          });
          
          // Show update prompt
          showUpdatePrompt(updateInfo);
        }
      }
    } catch (error) {
      console.error('Error checking update files:', error);
    }
  };

  const parseVersionFile = (content: string): UpdateInfo | null => {
    try {
      const lines = content.split('\n');
      const versionLine = lines.find(line => line.startsWith('VERSION='));
      const notesLine = lines.find(line => line.startsWith('NOTES='));
      
      if (!versionLine) return null;
      
      const version = versionLine.split('=')[1]?.trim();
      const releaseNotes = notesLine?.split('=')[1]?.trim();
      
      return {
        version,
        updateFile: '',
        releaseNotes,
      };
    } catch (error) {
      console.error('Error parsing version file:', error);
      return null;
    }
  };

  const isNewerVersion = (newVersion: string, currentVersion: string): boolean => {
    const parseVersion = (version: string) => 
      version.split('.').map(num => parseInt(num, 10));
    
    const newParts = parseVersion(newVersion);
    const currentParts = parseVersion(currentVersion);
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }
    
    return false;
  };

  const showUpdatePrompt = (updateInfo: UpdateInfo): void => {
    Alert.alert(
      'Neue Version erkannt',
      `Version ${updateInfo.version} ist verfügbar.\n\n${updateInfo.releaseNotes || 'Keine Versionshinweise verfügbar.'}\n\nMöchten Sie die App aktualisieren?\n\nHinweis: Alle lokalen Daten bleiben erhalten.`,
      [
        {
          text: 'Später',
          style: 'cancel',
          onPress: dismissUpdate,
        },
        {
          text: 'Aktualisieren',
          style: 'default',
          onPress: () => installUpdate(updateInfo),
        },
      ],
      { cancelable: false }
    );
  };

  const installUpdate = async (updateInfo: UpdateInfo): Promise<void> => {
    try {
      Alert.alert(
        'Update wird installiert',
        'Die App wird aktualisiert. Bitte warten Sie...',
        [],
        { cancelable: false }
      );

      // Backup current data before update
      await backupUserData();

      if (Platform.OS === 'android') {
        await installAndroidUpdate(updateInfo.updateFile);
      } else if (Platform.OS === 'ios') {
        // iOS updates would need to go through App Store or enterprise distribution
        Alert.alert(
          'iOS Update',
          'iOS-Updates müssen über den App Store oder Enterprise-Verteilung erfolgen.'
        );
      }
    } catch (error) {
      console.error('Error installing update:', error);
      Alert.alert(
        'Update-Fehler',
        'Das Update konnte nicht installiert werden. Bitte versuchen Sie es erneut.'
      );
    }
  };

  const backupUserData = async (): Promise<void> => {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) return;

      // Create backup directory
      const backupDir = `${documentsDir}backup/`;
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

      // Backup AsyncStorage data
      const customers = await AsyncStorage.getItem('customers');
      const vehicles = await AsyncStorage.getItem('vehicles');
      const tours = await AsyncStorage.getItem('tours');
      const settings = await AsyncStorage.getItem('settings');

      if (customers) {
        await FileSystem.writeAsStringAsync(`${backupDir}customers.json`, customers);
      }
      if (vehicles) {
        await FileSystem.writeAsStringAsync(`${backupDir}vehicles.json`, vehicles);
      }
      if (tours) {
        await FileSystem.writeAsStringAsync(`${backupDir}tours.json`, tours);
      }
      if (settings) {
        await FileSystem.writeAsStringAsync(`${backupDir}settings.json`, settings);
      }

      console.log('User data backed up successfully');
    } catch (error) {
      console.error('Error backing up user data:', error);
    }
  };

  const installAndroidUpdate = async (updateFilePath: string): Promise<void> => {
    try {
      // For Android, we would use a native module to install the APK
      // This is a simplified version - in production you'd need:
      // 1. REQUEST_INSTALL_PACKAGES permission
      // 2. Native module to handle APK installation
      // 3. Proper file URI handling
      
      Alert.alert(
        'Android Update',
        'Für Android-Updates ist ein natives Modul erforderlich, das APK-Installationen verwaltet. Die App wird nach der Installation automatisch neu gestartet.'
      );
      
      // In a real implementation:
      // await NativeModules.UpdateManager.installAPK(updateFilePath);
    } catch (error) {
      console.error('Error installing Android update:', error);
      throw error;
    }
  };

  const dismissUpdate = (): void => {
    setUpdateAvailable(null);
  };

  return {
    isChecking,
    updateAvailable,
    checkForUpdates,
    installUpdate,
    dismissUpdate,
  };
}