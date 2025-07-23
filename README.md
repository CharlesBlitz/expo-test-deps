# Tourenplaner App - Container Delivery Management

A comprehensive tour planning application for container delivery services, built with Expo and React Native.

## Features

### Core Functionality
- **Customer Management**: Add, edit, and manage customers with addresses, container counts, time windows, and priorities
- **Vehicle Management**: Manage fleet with capacity tracking and status monitoring
- **Tour Planning**: Automatic tour optimization with manual editing capabilities
- **Map Integration**: Visual tour representation with route planning
- **Data Import/Export**: Excel/CSV support for customers, vehicles, and tours

### USB Update System
The app includes an innovative offline update mechanism that allows updates via USB stick without internet connectivity:

#### How USB Updates Work
1. **Automatic Detection**: The app continuously monitors for update files on connected storage devices
2. **Version Comparison**: Uses `version.txt` file to determine if a newer version is available
3. **Data Preservation**: All local data (customers, vehicles, tours) is automatically backed up before updates
4. **Platform Support**: Supports Android (.apk) and Windows (.exe) update files
5. **User Confirmation**: Always asks for user permission before installing updates

#### Setting Up USB Updates

1. **Prepare Update Files**:
   - Place the update file (`update.apk` for Android or `update.exe` for Windows) on a USB stick
   - Create a `version.txt` file with the new version information

2. **Version File Format**:
   ```
   VERSION=1.1.0
   NOTES=New features and improvements
   CHECKSUM=optional_file_hash
   ```

3. **Installation Process**:
   - Insert USB stick into device
   - App automatically detects the update
   - User receives notification with update details
   - Upon confirmation, app backs up data and installs update
   - App restarts with new version, preserving all data

#### Technical Implementation

**Android Updates**:
- Requires `REQUEST_INSTALL_PACKAGES` permission
- Uses Android's PackageInstaller API
- Handles APK installation from external sources

**Windows Updates**:
- Executes installer with appropriate parameters
- Handles UAC prompts when necessary
- Monitors installation progress

**Data Safety**:
- Automatic backup before each update
- Timestamped backup folders
- Restoration capability in case of update failure
- AsyncStorage data preservation

## Installation

```bash
npm install
```

## Development

```bash
# Für Web-Entwicklung
npm run dev
```

### Expo Go Probleme beheben

Falls die App nicht richtig in Expo Go lädt:

1. **Cache leeren**: `npm run start` (verwendet automatisch --clear)
2. **Tunnel verwenden**: `npm run start-tunnel` bei Netzwerkproblemen
3. **Expo Go App neu starten**: App komplett schließen und neu öffnen
4. **Development Build erstellen**: Für komplexere Features

```bash
# Development Build erstellen (empfohlen für Produktion)
npx create-expo-app --template
eas build --profile development --platform ios
eas build --profile development --platform android
```

## Building

### Web
```bash
npm run build:web
```

### Mobile
Use Expo CLI to build for iOS and Android:
```bash
expo build:android
expo build:ios
```

## Project Structure

# Für mobile Entwicklung mit Expo Go
npm run start

# Für mobile Entwicklung mit Tunnel (bei Netzwerkproblemen)
npm run start-tunnel
```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Dashboard
│   ├── customers.tsx # Customer management
│   ├── vehicles.tsx  # Vehicle management
│   ├── tours.tsx     # Tour planning
│   ├── map.tsx       # Map view
│   └── settings.tsx  # Settings and updates
├── _layout.tsx       # Root layout
└── +not-found.tsx    # 404 page

components/
├── TourMap.tsx       # Map component
└── UpdateManager.tsx # USB update interface

hooks/
├── useData.ts                # Data management
├── useFrameworkReady.ts      # Framework initialization
└── useUSBUpdateDetection.ts  # Update detection

utils/
├── csvExport.ts      # Import/export utilities
├── tourOptimizer.ts  # Route optimization
└── updateManager.ts  # Update management
```

## Key Technologies

- **Expo SDK 52**: Cross-platform development framework
- **React Native**: Mobile app development
- **Expo Router**: File-based navigation
- **AsyncStorage**: Local data persistence
- **Lucide Icons**: Icon library
- **TypeScript**: Type safety

## Data Management

The app uses local storage (AsyncStorage) for all data persistence:
- **Customers**: Contact information, addresses, container requirements
- **Vehicles**: Fleet information, capacity, status
- **Tours**: Planned routes, assignments, status tracking
- **Settings**: App configuration, depot information

## Offline Capabilities

- **Full Offline Operation**: No internet required for core functionality
- **Local Data Storage**: All data stored locally on device
- **USB Updates**: Update app without internet connectivity
- **Data Backup**: Automatic backup system for data safety

## Security Considerations

- **Local Data Only**: No cloud dependencies or data transmission
- **Update Validation**: Checksum verification for update files
- **Permission Handling**: Proper Android permissions for APK installation
- **Data Integrity**: Backup and restore mechanisms

## Future Enhancements

- **GPS Tracking**: Real-time vehicle location tracking
- **RFID Integration**: Container scanning capabilities
- **Web Interface**: Browser-based management portal
- **Advanced Analytics**: Route optimization analytics
- **Multi-language Support**: Internationalization

## License

This project is proprietary software for container delivery services.