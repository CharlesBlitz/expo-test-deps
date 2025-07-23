import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'de' | 'en' | 'fr' | 'es';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Dashboard
  'dashboard.title': {
    de: 'Tourenplaner',
    en: 'Tour Planner',
    fr: 'Planificateur de Tournées',
    es: 'Planificador de Rutas',
  },
  'dashboard.subtitle': {
    de: 'Container-Lieferungen verwalten',
    en: 'Manage Container Deliveries',
    fr: 'Gérer les Livraisons de Conteneurs',
    es: 'Gestionar Entregas de Contenedores',
  },
  'dashboard.efficiency': {
    de: 'Effizienz',
    en: 'Efficiency',
    fr: 'Efficacité',
    es: 'Eficiencia',
  },
  'dashboard.activeCustomers': {
    de: 'Aktive Kunden',
    en: 'Active Customers',
    fr: 'Clients Actifs',
    es: 'Clientes Activos',
  },
  'dashboard.openOrders': {
    de: 'Offene Bestellungen',
    en: 'Open Orders',
    fr: 'Commandes Ouvertes',
    es: 'Pedidos Abiertos',
  },
  'dashboard.availableVehicles': {
    de: 'Verfügbare Fahrzeuge',
    en: 'Available Vehicles',
    fr: 'Véhicules Disponibles',
    es: 'Vehículos Disponibles',
  },
  'dashboard.activeTours': {
    de: 'Aktive Touren',
    en: 'Active Tours',
    fr: 'Tournées Actives',
    es: 'Rutas Activas',
  },
  'dashboard.quickActions': {
    de: 'Schnellaktionen',
    en: 'Quick Actions',
    fr: 'Actions Rapides',
    es: 'Acciones Rápidas',
  },
  'dashboard.newOrder': {
    de: 'Neue Bestellung',
    en: 'New Order',
    fr: 'Nouvelle Commande',
    es: 'Nuevo Pedido',
  },
  'dashboard.manageCustomers': {
    de: 'Kunden verwalten',
    en: 'Manage Customers',
    fr: 'Gérer les Clients',
    es: 'Gestionar Clientes',
  },
  'dashboard.planTour': {
    de: 'Tour planen',
    en: 'Plan Tour',
    fr: 'Planifier une Tournée',
    es: 'Planificar Ruta',
  },
  'dashboard.showMap': {
    de: 'Karte anzeigen',
    en: 'Show Map',
    fr: 'Afficher la Carte',
    es: 'Mostrar Mapa',
  },
  'dashboard.recentActivities': {
    de: 'Letzte Aktivitäten',
    en: 'Recent Activities',
    fr: 'Activités Récentes',
    es: 'Actividades Recientes',
  },
  
  // Navigation
  'nav.dashboard': {
    de: 'Dashboard',
    en: 'Dashboard',
    fr: 'Tableau de Bord',
    es: 'Panel',
  },
  'nav.customers': {
    de: 'Kunden',
    en: 'Customers',
    fr: 'Clients',
    es: 'Clientes',
  },
  'nav.orders': {
    de: 'Bestellungen',
    en: 'Orders',
    fr: 'Commandes',
    es: 'Pedidos',
  },
  'nav.tours': {
    de: 'Touren',
    en: 'Tours',
    fr: 'Tournées',
    es: 'Rutas',
  },
  'nav.vehicles': {
    de: 'Fahrzeuge',
    en: 'Vehicles',
    fr: 'Véhicules',
    es: 'Vehículos',
  },
  'nav.map': {
    de: 'Karte',
    en: 'Map',
    fr: 'Carte',
    es: 'Mapa',
  },
  'nav.settings': {
    de: 'Einstellungen',
    en: 'Settings',
    fr: 'Paramètres',
    es: 'Configuración',
  },

  // Common
  'common.add': {
    de: 'Hinzufügen',
    en: 'Add',
    fr: 'Ajouter',
    es: 'Agregar',
  },
  'common.edit': {
    de: 'Bearbeiten',
    en: 'Edit',
    fr: 'Modifier',
    es: 'Editar',
  },
  'common.delete': {
    de: 'Löschen',
    en: 'Delete',
    fr: 'Supprimer',
    es: 'Eliminar',
  },
  'common.save': {
    de: 'Speichern',
    en: 'Save',
    fr: 'Enregistrer',
    es: 'Guardar',
  },
  'common.cancel': {
    de: 'Abbrechen',
    en: 'Cancel',
    fr: 'Annuler',
    es: 'Cancelar',
  },
  'common.search': {
    de: 'Suchen...',
    en: 'Search...',
    fr: 'Rechercher...',
    es: 'Buscar...',
  },
  'common.success': {
    de: 'Erfolg',
    en: 'Success',
    fr: 'Succès',
    es: 'Éxito',
  },
  'common.error': {
    de: 'Fehler',
    en: 'Error',
    fr: 'Erreur',
    es: 'Error',
  },
  'common.loading': {
    de: 'Laden...',
    en: 'Loading...',
    fr: 'Chargement...',
    es: 'Cargando...',
  },

  // Settings
  'settings.title': {
    de: 'Einstellungen',
    en: 'Settings',
    fr: 'Paramètres',
    es: 'Configuración',
  },
  'settings.language': {
    de: 'Sprache',
    en: 'Language',
    fr: 'Langue',
    es: 'Idioma',
  },
  'settings.resetApp': {
    de: 'App zurücksetzen',
    en: 'Reset App',
    fr: 'Réinitialiser l\'App',
    es: 'Restablecer App',
  },
  'settings.resetConfirm': {
    de: 'Möchten Sie wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    en: 'Do you really want to delete all data? This action cannot be undone.',
    fr: 'Voulez-vous vraiment supprimer toutes les données ? Cette action ne peut pas être annulée.',
    es: '¿Realmente quiere eliminar todos los datos? Esta acción no se puede deshacer.',
  },
  'settings.resetSuccess': {
    de: 'App wurde erfolgreich zurückgesetzt.',
    en: 'App has been successfully reset.',
    fr: 'L\'application a été réinitialisée avec succès.',
    es: 'La aplicación se ha restablecido correctamente.',
  },
  'settings.languageChanged': {
    de: 'Sprache wurde geändert.',
    en: 'Language has been changed.',
    fr: 'La langue a été changée.',
    es: 'El idioma ha sido cambiado.',
  },

  // Tours
  'tours.newTour': {
    de: 'Neue Tour',
    en: 'New Tour',
    fr: 'Nouvelle Tournée',
    es: 'Nueva Ruta',
  },
  'tours.noTours': {
    de: 'Keine Touren vorhanden',
    en: 'No tours available',
    fr: 'Aucune tournée disponible',
    es: 'No hay rutas disponibles',
  },
  'tours.createFirstTour': {
    de: 'Erste Tour erstellen',
    en: 'Create first tour',
    fr: 'Créer la première tournée',
    es: 'Crear primera ruta',
  },
  'tours.selectOrders': {
    de: 'Bestellungen auswählen',
    en: 'Select orders',
    fr: 'Sélectionner les commandes',
    es: 'Seleccionar pedidos',
  },
  'tours.creating': {
    de: 'Erstelle...',
    en: 'Creating...',
    fr: 'Création...',
    es: 'Creando...',
  },
  'tours.createTour': {
    de: 'Tour erstellen',
    en: 'Create tour',
    fr: 'Créer une tournée',
    es: 'Crear ruta',
  },

  // Customers
  'customers.title': {
    de: 'Kunden verwalten',
    en: 'Manage Customers',
    fr: 'Gérer les Clients',
    es: 'Gestionar Clientes',
  },
  'customers.search': {
    de: 'Kunden suchen...',
    en: 'Search customers...',
    fr: 'Rechercher des clients...',
    es: 'Buscar clientes...',
  },
  'customers.noCustomers': {
    de: 'Noch keine Kunden vorhanden',
    en: 'No customers yet',
    fr: 'Aucun client pour le moment',
    es: 'Aún no hay clientes',
  },
  'customers.addFirst': {
    de: 'Ersten Kunden hinzufügen',
    en: 'Add first customer',
    fr: 'Ajouter le premier client',
    es: 'Agregar primer cliente',
  },
  'customers.new': {
    de: 'Neuer Kunde',
    en: 'New Customer',
    fr: 'Nouveau Client',
    es: 'Nuevo Cliente',
  },
  'customers.edit': {
    de: 'Kunde bearbeiten',
    en: 'Edit Customer',
    fr: 'Modifier le Client',
    es: 'Editar Cliente',
  },

  // Vehicles
  'vehicles.title': {
    de: 'Fahrzeuge verwalten',
    en: 'Manage Vehicles',
    fr: 'Gérer les Véhicules',
    es: 'Gestionar Vehículos',
  },
  'vehicles.noVehicles': {
    de: 'Noch keine Fahrzeuge vorhanden',
    en: 'No vehicles yet',
    fr: 'Aucun véhicule pour le moment',
    es: 'Aún no hay vehículos',
  },
  'vehicles.addFirst': {
    de: 'Erstes Fahrzeug hinzufügen',
    en: 'Add first vehicle',
    fr: 'Ajouter le premier véhicule',
    es: 'Agregar primer vehículo',
  },
  'vehicles.new': {
    de: 'Neues Fahrzeug',
    en: 'New Vehicle',
    fr: 'Nouveau Véhicule',
    es: 'Nuevo Vehículo',
  },
  'vehicles.edit': {
    de: 'Fahrzeug bearbeiten',
    en: 'Edit Vehicle',
    fr: 'Modifier le Véhicule',
    es: 'Editar Vehículo',
  },

  // Orders
  'orders.title': {
    de: 'Bestellungen verwalten',
    en: 'Manage Orders',
    fr: 'Gérer les Commandes',
    es: 'Gestionar Pedidos',
  },
  'orders.search': {
    de: 'Bestellungen suchen...',
    en: 'Search orders...',
    fr: 'Rechercher des commandes...',
    es: 'Buscar pedidos...',
  },
  'orders.noOrders': {
    de: 'Noch keine Bestellungen vorhanden',
    en: 'No orders yet',
    fr: 'Aucune commande pour le moment',
    es: 'Aún no hay pedidos',
  },
  'orders.addFirst': {
    de: 'Erste Bestellung hinzufügen',
    en: 'Add first order',
    fr: 'Ajouter la première commande',
    es: 'Agregar primer pedido',
  },
  'orders.new': {
    de: 'Neue Bestellung',
    en: 'New Order',
    fr: 'Nouvelle Commande',
    es: 'Nuevo Pedido',
  },
  'orders.edit': {
    de: 'Bestellung bearbeiten',
    en: 'Edit Order',
    fr: 'Modifier la Commande',
    es: 'Editar Pedido',
  },

  // Map
  'map.title': {
    de: 'Live-Karte',
    en: 'Live Map',
    fr: 'Carte en Direct',
    es: 'Mapa en Vivo',
  },
  'map.subtitle': {
    de: 'Touren und Standorte in Echtzeit',
    en: 'Tours and locations in real time',
    fr: 'Tournées et emplacements en temps réel',
    es: 'Rutas y ubicaciones en tiempo real',
  },

  // Form fields
  'form.name': {
    de: 'Name',
    en: 'Name',
    fr: 'Nom',
    es: 'Nombre',
  },
  'form.address': {
    de: 'Adresse',
    en: 'Address',
    fr: 'Adresse',
    es: 'Dirección',
  },
  'form.phone': {
    de: 'Telefon',
    en: 'Phone',
    fr: 'Téléphone',
    es: 'Teléfono',
  },
  'form.email': {
    de: 'E-Mail',
    en: 'Email',
    fr: 'E-mail',
    es: 'Correo electrónico',
  },
  'form.notes': {
    de: 'Notizen',
    en: 'Notes',
    fr: 'Notes',
    es: 'Notas',
  },
  'form.capacity': {
    de: 'Kapazität',
    en: 'Capacity',
    fr: 'Capacité',
    es: 'Capacidad',
  },
  'form.status': {
    de: 'Status',
    en: 'Status',
    fr: 'Statut',
    es: 'Estado',
  },
  'form.priority': {
    de: 'Priorität',
    en: 'Priority',
    fr: 'Priorité',
    es: 'Prioridad',
  },

  // Status values
  'status.available': {
    de: 'Verfügbar',
    en: 'Available',
    fr: 'Disponible',
    es: 'Disponible',
  },
  'status.outOfService': {
    de: 'Außer Betrieb',
    en: 'Out of Service',
    fr: 'Hors Service',
    es: 'Fuera de Servicio',
  },
  'status.inRepair': {
    de: 'In Reparatur',
    en: 'In Repair',
    fr: 'En Réparation',
    es: 'En Reparación',
  },
  'status.pending': {
    de: 'Ausstehend',
    en: 'Pending',
    fr: 'En Attente',
    es: 'Pendiente',
  },
  'status.assigned': {
    de: 'Zugewiesen',
    en: 'Assigned',
    fr: 'Assigné',
    es: 'Asignado',
  },
  'status.completed': {
    de: 'Abgeschlossen',
    en: 'Completed',
    fr: 'Terminé',
    es: 'Completado',
  },
  'status.planned': {
    de: 'Geplant',
    en: 'Planned',
    fr: 'Planifié',
    es: 'Planificado',
  },
  'status.inProgress': {
    de: 'In Bearbeitung',
    en: 'In Progress',
    fr: 'En Cours',
    es: 'En Progreso',
  },

  // Priority values
  'priority.low': {
    de: 'Niedrig',
    en: 'Low',
    fr: 'Faible',
    es: 'Baja',
  },
  'priority.medium': {
    de: 'Mittel',
    en: 'Medium',
    fr: 'Moyen',
    es: 'Media',
  },
  'priority.high': {
    de: 'Hoch',
    en: 'High',
    fr: 'Élevé',
    es: 'Alta',
  },

  // Actions
  'action.start': {
    de: 'Starten',
    en: 'Start',
    fr: 'Démarrer',
    es: 'Iniciar',
  },
  'action.complete': {
    de: 'Abschließen',
    en: 'Complete',
    fr: 'Terminer',
    es: 'Completar',
  },
  'action.export': {
    de: 'Exportieren',
    en: 'Export',
    fr: 'Exporter',
    es: 'Exportar',
  },
  'action.import': {
    de: 'Importieren',
    en: 'Import',
    fr: 'Importer',
    es: 'Importar',
  },

  // Messages
  'message.noData': {
    de: 'Keine Daten gefunden',
    en: 'No data found',
    fr: 'Aucune donnée trouvée',
    es: 'No se encontraron datos',
  },
  'message.dataExported': {
    de: 'Daten wurden exportiert',
    en: 'Data has been exported',
    fr: 'Les données ont été exportées',
    es: 'Los datos han sido exportados',
  },
  'message.dataImported': {
    de: 'Daten wurden importiert',
    en: 'Data has been imported',
    fr: 'Les données ont été importées',
    es: 'Los datos han sido importados',
  },
  'message.confirmDelete': {
    de: 'Möchten Sie diesen Eintrag wirklich löschen?',
    en: 'Do you really want to delete this entry?',
    fr: 'Voulez-vous vraiment supprimer cette entrée ?',
    es: '¿Realmente quiere eliminar esta entrada?',
  },
};

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('de');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && ['de', 'en', 'fr', 'es'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem('app_language', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
      throw error;
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[currentLanguage] || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
  };
}