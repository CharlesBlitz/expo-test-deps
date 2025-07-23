export interface Customer {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer: Customer;
  containerCount: number;
  timeWindow?: {
    start: string;
    end: string;
  };
  priority: 'low' | 'medium' | 'high';
  orderDate: string;
  deliveryDate: string; // Gewünschtes Lieferdatum
  status: 'pending' | 'assigned' | 'completed';
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'out-of-service' | 'in-repair';
  licensePlate?: string;
  driverName?: string;
  notes?: string;
}

export interface TourStop {
  orderId: string;
  order: Order;
  sequence: number;
  estimatedArrival?: string;
  notes?: string;
}

export interface Tour {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  stops: TourStop[];
  totalDistance?: number;
  estimatedDuration?: number;
  date: string;
  status: 'planned' | 'in-progress' | 'completed';
  color: string; // For map visualization
  notes?: string;
}

export interface Depot {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Settings {
  depot: Depot;
  maxTourDuration: number; // in hours
  workingHours: {
    start: string;
    end: string;
  };
  distanceUnit: 'km' | 'miles';
  stopDuration: number; // in minutes per stop
  containerHandlingTime: number; // in minutes per container
  autoOptimization: boolean;
  optimizationInterval: number; // in seconds
}

export interface AppState {
  customers: Customer[];
  orders: Order[];
  vehicles: Vehicle[];
  tours: Tour[];
  settings: Settings;
  language: string;
}