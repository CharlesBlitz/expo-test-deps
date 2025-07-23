import * as FileSystem from 'expo-file-system';
import { Customer, Vehicle, Tour } from '@/types';

export function formatCustomersForExport(customers: Customer[]): string {
  const headers = ['Name', 'Adresse', 'Container-Anzahl', 'Zeitfenster Start', 'Zeitfenster Ende', 'Priorität', 'Telefon', 'E-Mail', 'Notizen'];
  const rows = customers.map(customer => [
    customer.name,
    customer.address,
    customer.containerCount.toString(),
    customer.timeWindow?.start || '',
    customer.timeWindow?.end || '',
    customer.priority,
    customer.phone || '',
    customer.email || '',
    customer.notes || ''
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function formatVehiclesForExport(vehicles: Vehicle[]): string {
  const headers = ['Name', 'Kapazität', 'Status', 'Kennzeichen', 'Fahrer', 'Notizen'];
  const rows = vehicles.map(vehicle => [
    vehicle.name,
    vehicle.capacity.toString(),
    vehicle.status,
    vehicle.licensePlate || '',
    vehicle.driverName || '',
    vehicle.notes || ''
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function formatToursForExport(tours: Tour[]): string {
  const headers = ['Fahrzeug', 'Datum', 'Status', 'Kunde', 'Adresse', 'Container', 'Reihenfolge', 'Geschätzte Ankunft'];
  const rows: string[][] = [];

  tours.forEach(tour => {
    tour.stops.forEach(stop => {
      rows.push([
        tour.vehicle.name,
        tour.date,
        tour.status,
        stop.customer.name,
        stop.customer.address,
        stop.customer.containerCount.toString(),
        stop.order.toString(),
        stop.estimatedArrival || ''
      ]);
    });
  });

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export async function exportToFile(content: string, filename: string): Promise<string> {
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, content);
  return fileUri;
}

export function parseCustomersFromCSV(csvContent: string): Customer[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const customers: Customer[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length >= 3) {
      const customer: Customer = {
        id: `import-${Date.now()}-${i}`,
        name: values[0] || `Kunde ${i}`,
        address: values[1] || '',
        containerCount: parseInt(values[2]) || 1,
        priority: (values[5] as any) || 'medium',
        phone: values[6] || '',
        email: values[7] || '',
        notes: values[8] || ''
      };

      if (values[3] && values[4]) {
        customer.timeWindow = {
          start: values[3],
          end: values[4]
        };
      }

      customers.push(customer);
    }
  }

  return customers;
}

export function parseVehiclesFromCSV(csvContent: string): Vehicle[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const vehicles: Vehicle[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length >= 2) {
      const vehicle: Vehicle = {
        id: `import-${Date.now()}-${i}`,
        name: values[0] || `Fahrzeug ${i}`,
        capacity: parseInt(values[1]) || 10,
        status: (values[2] as any) || 'available',
        licensePlate: values[3] || '',
        driverName: values[4] || '',
        notes: values[5] || ''
      };

      vehicles.push(vehicle);
    }
  }

  return vehicles;
}