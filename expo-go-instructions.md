# 📱 Expo Go Setup-Anleitung

## 🚀 Schnellstart für Expo Go

### 1. Terminal öffnen und starten:
```bash
npm run start-go
```

### 2. QR-Code scannen:
- **iOS**: Kamera-App öffnen und QR-Code scannen
- **Android**: Expo Go App öffnen und QR-Code scannen

## 🔧 Bei Problemen:

### Problem: App lädt nicht vollständig
```bash
# Cache komplett leeren
npm run reset

# Mit Tunnel starten (bei Netzwerkproblemen)
npm run start-tunnel
```

### Problem: "Metro bundler crashed"
```bash
# Node modules neu installieren
rm -rf node_modules
npm install
npm run start-go
```

### Problem: "Unable to resolve module"
```bash
# Expo CLI aktualisieren
npm install -g @expo/cli@latest
npm run reset
```

## 📋 Expo Go Limitierungen

Diese Features sind in Expo Go **vereinfacht**:
- ✅ Grundfunktionen (Kunden, Fahrzeuge, Bestellungen)
- ✅ Tourenplanung (ohne Auto-Optimierung)
- ✅ Einstellungen
- ⚠️ Karte (vereinfachte Ansicht)
- ❌ Auto-Optimierung (deaktiviert für Performance)

## 🏗️ Für Vollversion: Development Build

```bash
# Einmalig installieren
npm install -g @expo/cli eas-cli

# Development Build erstellen
eas build --profile development --platform android
eas build --profile development --platform ios
```

**Vorteile Development Build:**
- ✅ Alle Features verfügbar
- ✅ Bessere Performance
- ✅ Echte App-Erfahrung
- ✅ Auto-Optimierung funktioniert

## 🐛 Debug-Tipps

1. **Console öffnen**: Cmd+D (iOS) / Cmd+M (Android)
2. **Reload**: R drücken im Terminal
3. **Logs anzeigen**: Terminal beobachten
4. **Expo Go neu starten**: App komplett schließen

## 📞 Support

Bei anhaltenden Problemen:
1. Expo Go App aktualisieren
2. Node.js Version prüfen (empfohlen: 18+)
3. Development Build verwenden