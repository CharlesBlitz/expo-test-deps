import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Order, Vehicle, Tour, Settings } from '@/types';

const DEFAULT_SETTINGS: Settings = {
  depot: {
    name: 'Hauptlager Berlin',
    address: 'Alexanderplatz 1, 10178 Berlin',
    latitude: 52.5200,
    longitude: 13.4050,
  },
  maxTourDuration: 8,
  workingHours: {
    start: '08:00',
    end: '17:00',
  },
  distanceUnit: 'km',
  stopDuration: 15, // 15 minutes per stop
  containerHandlingTime: 5, // 5 minutes per container
  autoOptimization: true,
  optimizationInterval: 30, // 30 seconds
};

// Sample data with real coordinates for demonstration
const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'customer-1',
    name: 'Müller GmbH',
    address: 'Potsdamer Platz 1, 10785 Berlin',
    latitude: 52.5096,
    longitude: 13.3765,
    phone: '+49 30 12345678',
    email: 'info@mueller-gmbh.de',
  },
  {
    id: 'customer-2',
    name: 'Schmidt & Co',
    address: 'Brandenburger Tor, 10117 Berlin',
    latitude: 52.5163,
    longitude: 13.3777,
    phone: '+49 30 87654321',
    email: 'kontakt@schmidt-co.de',
  },
  {
    id: 'customer-3',
    name: 'Weber Industries',
    address: 'Hackescher Markt 1, 10178 Berlin',
    latitude: 52.5225,
    longitude: 13.4026,
    phone: '+49 30 11223344',
    email: 'info@weber-industries.de',
  },
  {
    id: 'customer-4',
    name: 'Fischer Logistik',
    address: 'Friedrichstraße 100, 10117 Berlin',
    latitude: 52.5170,
    longitude: 13.3888,
    phone: '+49 30 55667788',
    email: 'service@fischer-logistik.de',
  },
  {
    id: 'customer-5',
    name: 'Becker Transport',
    address: 'Unter den Linden 50, 10117 Berlin',
    latitude: 52.5177,
    longitude: 13.3920,
    phone: '+49 30 99887766',
    email: 'info@becker-transport.de',
  },
];

const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'vehicle-1',
    name: 'LKW-001',
    capacity: 12,
    status: 'available',
    licensePlate: 'B-AB 1234',
    driverName: 'Max Mustermann',
  },
  {
    id: 'vehicle-2',
    name: 'LKW-002',
    capacity: 10,
    status: 'available',
    licensePlate: 'B-CD 5678',
    driverName: 'Anna Schmidt',
  },
  {
    id: 'vehicle-3',
    name: 'LKW-003',
    capacity: 8,
    status: 'available',
    licensePlate: 'B-EF 9012',
    driverName: 'Thomas Weber',
  },
];

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    customer: SAMPLE_CUSTOMERS[0],
    containerCount: 5,
    priority: 'high',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    status: 'pending',
    timeWindow: {
      start: '09:00',
      end: '12:00',
    },
  },
  {
    id: 'order-2',
    customerId: 'customer-2',
    customer: SAMPLE_CUSTOMERS[1],
    containerCount: 3,
    priority: 'medium',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Day after tomorrow
    status: 'pending',
    timeWindow: {
      start: '13:00',
      end: '16:00',
    },
  },
  {
    id: 'order-3',
    customerId: 'customer-3',
    customer: SAMPLE_CUSTOMERS[2],
    containerCount: 4,
    priority: 'high',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'order-4',
    customerId: 'customer-4',
    customer: SAMPLE_CUSTOMERS[3],
    containerCount: 2,
    priority: 'low',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'order-5',
    customerId: 'customer-5',
    customer: SAMPLE_CUSTOMERS[4],
    containerCount: 6,
    priority: 'medium',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
  },
];

// Sample tours to demonstrate the map functionality
const SAMPLE_TOURS = [
  {
    id: 'tour-1',
    vehicleId: 'vehicle-1',
    vehicle: SAMPLE_VEHICLES[0],
    stops: [
      {
        orderId: 'order-1',
        order: SAMPLE_ORDERS[0],
        sequence: 1,
        estimatedArrival: '09:30',
      },
      {
        orderId: 'order-3',
        order: SAMPLE_ORDERS[2],
        sequence: 2,
        estimatedArrival: '11:00',
      },
      {
        orderId: 'order-5',
        order: SAMPLE_ORDERS[4],
        sequence: 3,
        estimatedArrival: '14:00',
      },
    ],
    totalDistance: 15.2,
    estimatedDuration: 4.5,
    date: new Date().toISOString().split('T')[0],
    status: 'in-progress' as const,
    color: '#2563EB',
  },
  {
    id: 'tour-2',
    vehicleId: 'vehicle-2',
    vehicle: SAMPLE_VEHICLES[1],
    stops: [
      {
        orderId: 'order-2',
        order: SAMPLE_ORDERS[1],
        sequence: 1,
        estimatedArrival: '13:30',
      },
      {
        orderId: 'order-4',
        order: SAMPLE_ORDERS[3],
        sequence: 2,
        estimatedArrival: '15:00',
      },
    ],
    totalDistance: 8.7,
    estimatedDuration: 3.2,
    date: new Date().toISOString().split('T')[0],
    status: 'planned' as const,
    color: '#DC2626',
  },
];

export function useData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Starting data load...');
    
    try {
      // Load data with individual error handling
      const [customersData, ordersData, vehiclesData, toursData, settingsData] = await Promise.all([
        AsyncStorage.getItem('customers').catch(e => { console.error('Error loading customers:', e); return null; }),
        AsyncStorage.getItem('orders').catch(e => { console.error('Error loading orders:', e); return null; }),
        AsyncStorage.getItem('vehicles').catch(e => { console.error('Error loading vehicles:', e); return null; }),
        AsyncStorage.getItem('tours').catch(e => { console.error('Error loading tours:', e); return null; }),
        AsyncStorage.getItem('settings').catch(e => { console.error('Error loading settings:', e); return null; }),
      ]);

      console.log('Data loaded from storage');
      console.log('Customers data exists:', !!customersData);
      console.log('Orders data exists:', !!ordersData);
      console.log('Vehicles data exists:', !!vehiclesData);
      console.log('Tours data exists:', !!toursData);
      console.log('Settings data exists:', !!settingsData);

      // Load customers first
      if (customersData) {
        const parsedCustomers = JSON.parse(customersData);
        console.log('Loaded customers:', parsedCustomers.length);
        setCustomers(parsedCustomers);
      } else {
        console.log('Using sample customers');
        setCustomers(SAMPLE_CUSTOMERS);
        await AsyncStorage.setItem('customers', JSON.stringify(SAMPLE_CUSTOMERS));
      }

      // Load vehicles
      if (vehiclesData) {
        const parsedVehicles = JSON.parse(vehiclesData);
        console.log('Loaded vehicles:', parsedVehicles.length);
        setVehicles(parsedVehicles);
      } else {
        console.log('Using sample vehicles');
        setVehicles(SAMPLE_VEHICLES);
        await AsyncStorage.setItem('vehicles', JSON.stringify(SAMPLE_VEHICLES));
      }

      // Load orders and update customer references
      if (ordersData) {
        const parsedOrders = JSON.parse(ordersData);
        console.log('Loaded orders:', parsedOrders.length);
        const currentCustomers = customersData ? JSON.parse(customersData) : SAMPLE_CUSTOMERS;
        
        // Update customer references in orders
        const updatedOrders = parsedOrders.map((order: Order) => {
          const customer = currentCustomers.find((c: Customer) => c.id === order.customerId);
          return customer ? { ...order, customer } : order;
        });
        
        setOrders(updatedOrders);
      } else {
        console.log('Using sample orders');
        setOrders(SAMPLE_ORDERS);
        await AsyncStorage.setItem('orders', JSON.stringify(SAMPLE_ORDERS));
      }

      // Load tours and update vehicle/order references
      if (toursData) {
        const parsedTours = JSON.parse(toursData);
        console.log('Loaded tours:', parsedTours.length);
        const currentVehicles = vehiclesData ? JSON.parse(vehiclesData) : SAMPLE_VEHICLES;
        const currentOrders = ordersData ? JSON.parse(ordersData) : SAMPLE_ORDERS;
        const currentCustomers = customersData ? JSON.parse(customersData) : SAMPLE_CUSTOMERS;
        
        // Update references in tours
        const updatedTours = parsedTours.map((tour: Tour) => {
          const vehicle = currentVehicles.find((v: Vehicle) => v.id === tour.vehicleId);
          const updatedStops = tour.stops.map((stop: any) => {
            const order = currentOrders.find((o: Order) => o.id === stop.orderId);
            if (order) {
              const customer = currentCustomers.find((c: Customer) => c.id === order.customerId);
              return {
                ...stop,
                order: customer ? { ...order, customer } : order
              };
            }
            return stop;
          });
          
          return vehicle ? { ...tour, vehicle, stops: updatedStops } : tour;
        });
        
        setTours(updatedTours);
      } else {
        console.log('Using sample tours');
        // Set sample tours with updated references
        const toursWithReferences = SAMPLE_TOURS.map(tour => ({
          ...tour,
          stops: tour.stops.map(stop => ({
            ...stop,
            order: {
              ...stop.order,
              customer: SAMPLE_CUSTOMERS.find(c => c.id === stop.order.customerId) || stop.order.customer
            }
          }))
        }));
        
        setTours(toursWithReferences);
        await AsyncStorage.setItem('tours', JSON.stringify(toursWithReferences));
      }

      // Load settings
      if (settingsData) {
        const parsedSettings = JSON.parse(settingsData);
        console.log('Loaded settings');
        setSettings(parsedSettings);
      } else {
        console.log('Using default settings');
        setSettings(DEFAULT_SETTINGS);
        await AsyncStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
      }
      
      console.log('Data loading completed successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      console.log('Falling back to sample data');
      setCustomers(SAMPLE_CUSTOMERS);
      setVehicles(SAMPLE_VEHICLES);
      setOrders(SAMPLE_ORDERS);
      setTours(SAMPLE_TOURS);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const saveCustomers = async (newCustomers: Customer[]) => {
    try {
      await AsyncStorage.setItem('customers', JSON.stringify(newCustomers));
      setCustomers(newCustomers);
      
      // Update customer references in orders
      if (orders.length > 0) {
        const updatedOrders = orders.map(order => {
          const customer = newCustomers.find(c => c.id === order.customerId);
          return customer ? { ...order, customer } : order;
        });
        
        // Check if there are actual changes
        const hasChanges = updatedOrders.some((order, index) => 
          !orders[index] || order.customer.name !== orders[index].customer.name ||
          order.customer.address !== orders[index].customer.address
        );
        
        if (hasChanges) {
          await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
          setOrders(updatedOrders);
        }
      }
    } catch (error) {
      console.error('Error saving customers:', error);
      throw error;
    }
  };

  const saveOrders = async (newOrders: Order[]) => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(newOrders));
      setOrders(newOrders);
    } catch (error) {
      console.error('Error saving orders:', error);
      throw error;
    }
  };

  const saveVehicles = async (newVehicles: Vehicle[]) => {
    try {
      await AsyncStorage.setItem('vehicles', JSON.stringify(newVehicles));
      setVehicles(newVehicles);
    } catch (error) {
      console.error('Error saving vehicles:', error);
      throw error;
    }
  };

  const saveTours = async (newTours: Tour[]) => {
    try {
      await AsyncStorage.setItem('tours', JSON.stringify(newTours));
      setTours(newTours);
    } catch (error) {
      console.error('Error saving tours:', error);
      throw error;
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const resetAllData = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'customers',
        'orders', 
        'vehicles',
        'tours',
        'settings',
        'app_language'
      ]);
      
      // Reset state to sample data
      setCustomers(SAMPLE_CUSTOMERS);
      setVehicles(SAMPLE_VEHICLES);
      setOrders(SAMPLE_ORDERS);
      setTours(SAMPLE_TOURS);
      setSettings(DEFAULT_SETTINGS);
      
      // Save sample data
      await Promise.all([
        AsyncStorage.setItem('customers', JSON.stringify(SAMPLE_CUSTOMERS)),
        AsyncStorage.setItem('vehicles', JSON.stringify(SAMPLE_VEHICLES)),
        AsyncStorage.setItem('orders', JSON.stringify(SAMPLE_ORDERS)),
        AsyncStorage.setItem('tours', JSON.stringify(SAMPLE_TOURS)),
        AsyncStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS)),
      ]);
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  };

  return {
    customers,
    orders,
    vehicles,
    tours,
    settings,
    loading,
    saveCustomers,
    saveOrders,
    saveVehicles,
    saveTours,
    saveSettings,
    resetAllData,
  };
}