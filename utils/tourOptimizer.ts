import { Order, Vehicle, Tour, TourStop, Settings } from '@/types';

interface OptimizationParams {
  orders: Order[];
  vehicles: Vehicle[];
  settings: Settings;
}

// Simple distance calculation (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Nearest neighbor algorithm for basic route optimization
function optimizeRoute(orders: Order[], depot: { latitude: number; longitude: number }): Order[] {
  if (orders.length === 0) return [];
  
  const unvisited = [...orders];
  const route: Order[] = [];
  let currentLat = depot.latitude;
  let currentLon = depot.longitude;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((order, index) => {
      const customerLat = order.customer.latitude || 52.5200;
      const customerLon = order.customer.longitude || 13.4050;
      const distance = calculateDistance(currentLat, currentLon, customerLat, customerLon);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearestOrder = unvisited[nearestIndex];
    route.push(nearestOrder);
    unvisited.splice(nearestIndex, 1);
    
    currentLat = nearestOrder.customer.latitude || 52.5200;
    currentLon = nearestOrder.customer.longitude || 13.4050;
  }

  return route;
}

// Advanced optimization using 2-opt improvement
function improve2Opt(route: Order[], depot: { latitude: number; longitude: number }): Order[] {
  if (route.length < 4) return route;
  
  let improved = true;
  let bestRoute = [...route];
  
  while (improved) {
    improved = false;
    
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        if (j - i === 1) continue; // Skip adjacent edges
        
        const newRoute = [...bestRoute];
        // Reverse the segment between i and j
        const segment = newRoute.slice(i, j + 1).reverse();
        newRoute.splice(i, j - i + 1, ...segment);
        
        const currentDistance = calculateRouteDistance(bestRoute, depot);
        const newDistance = calculateRouteDistance(newRoute, depot);
        
        if (newDistance < currentDistance) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }
  
  return bestRoute;
}

function calculateRouteDistance(route: Order[], depot: { latitude: number; longitude: number }): number {
  if (route.length === 0) return 0;
  
  let totalDistance = 0;
  let currentLat = depot.latitude;
  let currentLon = depot.longitude;
  
  // Distance from depot to first stop
  const firstCustomer = route[0].customer;
  totalDistance += calculateDistance(
    currentLat, 
    currentLon, 
    firstCustomer.latitude || 52.5200, 
    firstCustomer.longitude || 13.4050
  );
  
  // Distance between consecutive stops
  for (let i = 0; i < route.length - 1; i++) {
    const current = route[i].customer;
    const next = route[i + 1].customer;
    totalDistance += calculateDistance(
      current.latitude || 52.5200,
      current.longitude || 13.4050,
      next.latitude || 52.5200,
      next.longitude || 13.4050
    );
  }
  
  // Distance from last stop back to depot
  const lastCustomer = route[route.length - 1].customer;
  totalDistance += calculateDistance(
    lastCustomer.latitude || 52.5200,
    lastCustomer.longitude || 13.4050,
    depot.latitude,
    depot.longitude
  );
  
  return totalDistance;
}

export function generateOptimizedTours({ orders, vehicles, settings }: OptimizationParams): Tour[] {
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  if (availableVehicles.length === 0) {
    console.warn('No available vehicles for tour generation');
    return [];
  }
  
  if (orders.length === 0) {
    console.warn('No orders to process for tour generation');
    return [];
  }

  // Group orders by delivery date
  const ordersByDate = orders.reduce((acc, order) => {
    const date = order.deliveryDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const allTours: Tour[] = [];

  // Process each date separately
  Object.entries(ordersByDate).forEach(([date, dateOrders]) => {
    const dateTours = generateToursForDate(dateOrders, availableVehicles, settings, date);
    console.log(`Generated ${dateTours.length} tours for date ${date}`);
    allTours.push(...dateTours);
  });

  console.log(`Total tours generated: ${allTours.length}`);
  return allTours;
}

function generateToursForDate(orders: Order[], vehicles: Vehicle[], settings: Settings, date: string): Tour[] {
  // Sort orders by priority and then by container count for better packing
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedOrders = orders.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.containerCount - a.containerCount; // Larger orders first
  });

  const tours: Tour[] = [];
  const unassignedOrders = [...sortedOrders];

  // Assign orders to vehicles using bin packing approach
  for (const vehicle of vehicles) {
    const vehicleOrders: Order[] = [];
    let totalContainers = 0;

    // First fit decreasing algorithm for better capacity utilization
    for (let i = unassignedOrders.length - 1; i >= 0; i--) {
      const order = unassignedOrders[i];
      if (totalContainers + order.containerCount <= vehicle.capacity) {
        vehicleOrders.push(order);
        totalContainers += order.containerCount;
        unassignedOrders.splice(i, 1);
      }
    }

    if (vehicleOrders.length > 0) {
      // Optimize the route using nearest neighbor + 2-opt
      let optimizedRoute = optimizeRoute(vehicleOrders, settings.depot);
      optimizedRoute = improve2Opt(optimizedRoute, settings.depot);
      
      const stops: TourStop[] = optimizedRoute.map((order, index) => ({
        orderId: order.id,
        order,
        sequence: index + 1,
      }));

      tours.push({
        id: `tour-${vehicle.id}-${Date.now()}`,
        vehicleId: vehicle.id,
        vehicle,
        stops,
        date,
        status: 'planned',
        color: '#2563EB', // Will be assigned later
      });
    }
  }

  // If there are still unassigned orders, try to create additional tours
  // by allowing vehicles to exceed capacity slightly (with warning)
  if (unassignedOrders.length > 0 && vehicles.length > 0) {
    const remainingVehicles = vehicles.filter(v => 
      !tours.some(t => t.vehicleId === v.id)
    );
    
    for (const vehicle of remainingVehicles) {
      if (unassignedOrders.length === 0) break;
      
      const vehicleOrders: Order[] = [];
      let totalContainers = 0;
      
      // Allow up to 120% capacity for remaining orders
      const maxCapacity = Math.floor(vehicle.capacity * 1.2);
      
      for (let i = unassignedOrders.length - 1; i >= 0; i--) {
        const order = unassignedOrders[i];
        if (totalContainers + order.containerCount <= maxCapacity) {
          vehicleOrders.push(order);
          totalContainers += order.containerCount;
          unassignedOrders.splice(i, 1);
        }
      }
      
      if (vehicleOrders.length > 0) {
        let optimizedRoute = optimizeRoute(vehicleOrders, settings.depot);
        optimizedRoute = improve2Opt(optimizedRoute, settings.depot);
        
        const stops: TourStop[] = optimizedRoute.map((order, index) => ({
          orderId: order.id,
          order,
          sequence: index + 1,
        }));

        tours.push({
          id: `tour-${vehicle.id}-${Date.now()}`,
          vehicleId: vehicle.id,
          vehicle,
          stops,
          date,
          status: 'planned',
          color: '#F59E0B', // Different color for over-capacity tours
        });
      }
    }
  }

  return tours;
}

export function calculateTourStatistics(tour: Tour, depot: { latitude: number; longitude: number }, settings?: any) {
  if (tour.stops.length === 0) {
    return { totalDistance: 0, estimatedDuration: 0 };
  }

  const route = tour.stops.map(stop => stop.order);
  const totalDistance = calculateRouteDistance(route, depot);

  // Estimate duration (assuming 40 km/h average speed + 15 min per stop + 5 min per container)
  const drivingTime = totalDistance / 40; // hours
  const stopTime = tour.stops.length * ((settings?.stopDuration || 15) / 60); // configurable minutes per stop
  const containerTime = tour.stops.reduce((sum, stop) => sum + stop.order.containerCount, 0) * ((settings?.containerHandlingTime || 5) / 60); // configurable minutes per container
  const estimatedDuration = drivingTime + stopTime + containerTime;

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedDuration: Math.round(estimatedDuration * 10) / 10,
  };
}