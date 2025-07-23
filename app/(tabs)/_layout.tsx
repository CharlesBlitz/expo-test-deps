import { Tabs } from 'expo-router';
import { Chrome as Home, Settings, Users, Package, Truck, Map, Route } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          height: Platform.select({ web: 60, default: 80 }),
          paddingBottom: Platform.select({ web: 8, default: 16 }),
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ size, color }) => (
            <Home size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: t('nav.customers'),
          tabBarIcon: ({ size, color }) => (
            <Users size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('nav.orders'),
          tabBarIcon: ({ size, color }) => (
            <Package size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tours"
        options={{
          title: t('nav.tours'),
          tabBarIcon: ({ size, color }) => (
            <Route size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: t('nav.vehicles'),
          tabBarIcon: ({ size, color }) => (
            <Truck size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('nav.map'),
          tabBarIcon: ({ size, color }) => (
            <Map size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ size, color }) => (
            <Settings size={size || 20} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}