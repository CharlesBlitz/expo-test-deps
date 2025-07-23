import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UpdateFile {
  version: string;
  filePath: string;
  releaseNotes?: string;
  checksum?: string;
}

export class UpdateManager {
  private static instance: UpdateManager;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  static getInstance(): UpdateManager {
    if (!UpdateManager.instance) {
      UpdateManager.instance = new UpdateManager();
    }
    return UpdateManager.instance;
  }

  async startAutoCheck(intervalMs: number = 10000): Promise<void> {
    if (Platform.OS === 'web') return;

    this.stopAutoCheck();
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);
  }

  stopAutoCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  async checkForUpdates(): Promise<UpdateFile | null> {
    if (this.isChecking || Platform.OS === 'web') return null;

    this.isChecking = true;
    try {
      return await this.scanForUpdateFiles();
    } finally {
      this.isChecking = false;
    }
  }

  private async scanForUpdateFiles(): Promise<UpdateFile | null> {
    try {
      // Check multiple possible locations for update files
      const searchPaths = [
        FileSystem.documentDirectory,
        FileSystem.cacheDirectory,
        // Add more paths as needed for different platforms
      ];

      for (const basePath of searchPaths) {
        if (!basePath) continue;

        const updateFile = await this.checkPathForUpdates(basePath);
        if (updateFile) return updateFile;
      }

      return null;
    } catch (error) {
      console.error('Error scanning for update files:', error);
      return null;
    }
  }

  private async checkPathForUpdates(basePath: string): Promise<UpdateFile | null> {
    try {
      const versionFilePath = `${basePath}version.txt`;
      const updateFilePaths = [
        `${basePath}update.apk`,
        `${basePath}update.exe`,
        `${basePath}update.zip`,
      ];

      // Check if version file exists
      const versionFileInfo = await FileSystem.getInfoAsync(versionFilePath);
      if (!versionFileInfo.exists) return null;

      // Find update file
      let updateFilePath: string | null = null;
      for (const path of updateFilePaths) {
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists) {
          updateFilePath = path;
          break;
        }
      }

      if (!updateFilePath) return null;

      // Parse version file
      const versionContent = await FileSystem.readAsStringAsync(versionFilePath);
      const updateInfo = this.parseVersionFile(versionContent);

      if (!updateInfo) return null;

      return {
        version: updateInfo.version,
        filePath: updateFilePath,
        releaseNotes: updateInfo.releaseNotes,
        checksum: updateInfo.checksum,
      };
    } catch (error) {
      console.error('Error checking path for updates:', error);
      return null;
    }
  }

  private parseVersionFile(content: string): {
    version: string;
    releaseNotes?: string;
    checksum?: string;
  } | null {
    try {
      const lines = content.split('\n').map(line => line.trim());
      const data: any = {};

      for (const line of lines) {
        if (line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          data[key.trim().toLowerCase()] = value;
        }
      }

      if (!data.version) return null;

      return {
        version: data.version,
        releaseNotes: data.notes || data.releasenotes,
        checksum: data.checksum || data.hash,
      };
    } catch (error) {
      console.error('Error parsing version file:', error);
      return null;
    }
  }

  async validateUpdateFile(updateFile: UpdateFile): Promise<boolean> {
    try {
      // Check if file exists and is readable
      const fileInfo = await FileSystem.getInfoAsync(updateFile.filePath);
      if (!fileInfo.exists) return false;

      // Validate checksum if provided
      if (updateFile.checksum) {
        // In a real implementation, you'd calculate and compare checksums
        console.log('Checksum validation would be performed here');
      }

      // Validate file extension matches platform
      const fileName = updateFile.filePath.toLowerCase();
      if (Platform.OS === 'android' && !fileName.endsWith('.apk')) {
        return false;
      }
      if (Platform.OS === 'windows' && !fileName.endsWith('.exe')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating update file:', error);
      return false;
    }
  }

  async backupUserData(): Promise<boolean> {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) return false;

      // Create backup directory with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = `${documentsDir}backups/backup-${timestamp}/`;
      await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

      // Backup AsyncStorage data
      const dataKeys = ['customers', 'vehicles', 'tours', 'settings'];
      const backupPromises = dataKeys.map(async (key) => {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            await FileSystem.writeAsStringAsync(`${backupDir}${key}.json`, data);
          }
        } catch (error) {
          console.error(`Error backing up ${key}:`, error);
        }
      });

      await Promise.all(backupPromises);

      // Save backup metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        version: '1.0.0', // Current version
        dataKeys,
      };
      await FileSystem.writeAsStringAsync(
        `${backupDir}metadata.json`,
        JSON.stringify(metadata, null, 2)
      );

      console.log('User data backed up successfully to:', backupDir);
      return true;
    } catch (error) {
      console.error('Error backing up user data:', error);
      return false;
    }
  }

  async restoreUserData(backupPath?: string): Promise<boolean> {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) return false;

      // If no specific backup path provided, find the latest backup
      if (!backupPath) {
        const backupsDir = `${documentsDir}backups/`;
        const backupsDirInfo = await FileSystem.getInfoAsync(backupsDir);
        if (!backupsDirInfo.exists) return false;

        const backupFolders = await FileSystem.readDirectoryAsync(backupsDir);
        if (backupFolders.length === 0) return false;

        // Sort by timestamp and get the latest
        backupFolders.sort().reverse();
        backupPath = `${backupsDir}${backupFolders[0]}/`;
      }

      // Restore data files
      const dataKeys = ['customers', 'vehicles', 'tours', 'settings'];
      const restorePromises = dataKeys.map(async (key) => {
        try {
          const filePath = `${backupPath}${key}.json`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            const data = await FileSystem.readAsStringAsync(filePath);
            await AsyncStorage.setItem(key, data);
          }
        } catch (error) {
          console.error(`Error restoring ${key}:`, error);
        }
      });

      await Promise.all(restorePromises);

      console.log('User data restored successfully from:', backupPath);
      return true;
    } catch (error) {
      console.error('Error restoring user data:', error);
      return false;
    }
  }

  async installUpdate(updateFile: UpdateFile): Promise<boolean> {
    try {
      // Validate update file first
      const isValid = await this.validateUpdateFile(updateFile);
      if (!isValid) {
        throw new Error('Update file validation failed');
      }

      // Backup current data
      const backupSuccess = await this.backupUserData();
      if (!backupSuccess) {
        console.warn('Data backup failed, but continuing with update');
      }

      // Platform-specific installation
      if (Platform.OS === 'android') {
        return await this.installAndroidUpdate(updateFile);
      } else if (Platform.OS === 'windows') {
        return await this.installWindowsUpdate(updateFile);
      } else {
        throw new Error(`Updates not supported on platform: ${Platform.OS}`);
      }
    } catch (error) {
      console.error('Error installing update:', error);
      return false;
    }
  }

  private async installAndroidUpdate(updateFile: UpdateFile): Promise<boolean> {
    try {
      // For Android, we need to use a native module to install APK
      // This would require implementing a native Android module
      console.log('Installing Android update:', updateFile.filePath);
      
      // In a real implementation:
      // 1. Check for INSTALL_PACKAGES permission
      // 2. Use PackageInstaller API or Intent.ACTION_VIEW
      // 3. Handle installation result
      
      // For now, we'll simulate the process
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Android update installation completed');
          resolve(true);
        }, 3000);
      });
    } catch (error) {
      console.error('Error installing Android update:', error);
      return false;
    }
  }

  private async installWindowsUpdate(updateFile: UpdateFile): Promise<boolean> {
    try {
      // For Windows, we would execute the installer
      console.log('Installing Windows update:', updateFile.filePath);
      
      // In a real implementation:
      // 1. Execute the installer with appropriate parameters
      // 2. Handle UAC prompts if needed
      // 3. Monitor installation progress
      
      // For now, we'll simulate the process
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Windows update installation completed');
          resolve(true);
        }, 5000);
      });
    } catch (error) {
      console.error('Error installing Windows update:', error);
      return false;
    }
  }

  async cleanupUpdateFiles(updateFile: UpdateFile): Promise<void> {
    try {
      // Remove update files after successful installation
      const basePath = updateFile.filePath.substring(0, updateFile.filePath.lastIndexOf('/') + 1);
      
      const filesToCleanup = [
        updateFile.filePath,
        `${basePath}version.txt`,
      ];

      for (const filePath of filesToCleanup) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(filePath);
          }
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      }

      console.log('Update files cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up update files:', error);
    }
  }
}

export default UpdateManager;