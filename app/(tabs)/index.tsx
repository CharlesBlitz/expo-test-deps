import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ChartBar as BarChart3, Users, Truck, Package, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp, Clock, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';
import { useData } from '@/hooks/useData';
import SimpleLoadingScreen from '@/components/SimpleLoadingScreen';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { customers, orders, vehicles, tours, loading } = useData();

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const activeToursCount = tours.filter(t => t.status === 'in-progress').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'available').length;

  const stats = [
    {
      title: t('dashboard.activeCustomers'),
      value: customers.length.toString(),
      icon: Users,
      color: '#3B82F6',
      gradient: ['#3B82F6', '#1D4ED8'],
      subtitle: `${customers.length} gesamt`,
      trend: '+12%',
      route: 'customers',
    },
    {
      title: t('dashboard.openOrders'),
      value: pendingOrdersCount.toString(),
      icon: Package,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
      subtitle: `${orders.length} gesamt`,
      trend: '+5%',
      route: 'orders',
    },
    {
      title: t('dashboard.availableVehicles'),
      value: availableVehiclesCount.toString(),
      icon: Truck,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      subtitle: `${vehicles.length} gesamt`,
      trend: '0%',
      route: 'vehicles',
    },
    {
      title: t('dashboard.activeTours'),
      value: activeToursCount.toString(),
      icon: BarChart3,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
      subtitle: `${tours.length} gesamt`,
      trend: '+25%',
      route: 'tours',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'Neue Bestellung von Müller GmbH',
      time: 'vor 15 Min',
      icon: Package,
      color: '#3B82F6',
    },
    {
      id: 2,
      type: 'tour',
      title: 'Tour LKW-001 gestartet',
      time: 'vor 1 Std',
      icon: Truck,
      color: '#10B981',
    },
    {
      id: 3,
      type: 'delivery',
      title: 'Lieferung bei Schmidt & Co abgeschlossen',
      time: 'vor 2 Std',
      icon: CheckCircle,
      color: '#059669',
    },
  ];

  const quickActions = [
    {
      title: t('dashboard.newOrder'),
      subtitle: 'Bestellung für Kunden erstellen',
      icon: Package,
      color: '#3B82F6',
      gradient: ['#EBF8FF', '#DBEAFE'],
      route: 'orders',
    },
    {
      title: t('dashboard.manageCustomers'),
      subtitle: 'Neue Kunden hinzufügen',
      icon: Users,
      color: '#10B981',
      gradient: ['#F0FDF4', '#DCFCE7'],
      route: 'customers',
    },
    {
      title: t('dashboard.planTour'),
      subtitle: 'Optimierte Routen erstellen',
      icon: Truck,
      color: '#F59E0B',
      gradient: ['#FEF3C7', '#FDE68A'],
      route: 'tours',
    },
    {
      title: t('dashboard.showMap'),
      subtitle: 'Live-Tracking der Touren',
      icon: MapPin,
      color: '#8B5CF6',
      gradient: ['#F3E8FF', '#E9D5FF'],
      route: 'map',
    },
  ];

  const handleStatPress = (route: string) => {
    router.push(`/(tabs)/${route}` as any);
  };

  const handleActionPress = (route: string) => {
    router.push(`/(tabs)/${route}` as any);
  };

  if (loading) {
    return (
      <SimpleLoadingScreen 
        title="Tourenplaner wird geladen..."
        subtitle="Daten werden initialisiert..."
      />
    );
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{t('dashboard.title')}</Text>
            <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>98%</Text>
              <Text style={styles.headerStatLabel}>{t('dashboard.efficiency')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.statCard, isTablet && styles.statCardTablet]}
              onPress={() => handleStatPress(stat.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
              >
                <View style={styles.statHeader}>
                  <stat.icon size={28} color="#FFFFFF" strokeWidth={2} />
                  <View style={styles.trendContainer}>
                    <TrendingUp size={14} color="#FFFFFF" />
                    <Text style={styles.trendText}>{stat.trend}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        
        <View style={[styles.actionsGrid, isTablet && styles.actionsGridTablet]}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.actionCard}
              onPress={() => handleActionPress(action.route)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.actionGradient}
              >
                <action.icon size={24} color={action.color} strokeWidth={2} />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.recentActivities')}</Text>
        
        <View style={styles.activitiesContainer}>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                <activity.icon size={20} color={activity.color} strokeWidth={2} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.activityTime}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.activityTimeText}>{activity.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.select({ web: 20, default: 60 }),
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'center',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
    marginTop: -15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statsGridTablet: {
    gap: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statCardTablet: {
    minWidth: '22%',
  },
  statGradient: {
    padding: 20,
    minHeight: 140,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  actionGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activitiesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTimeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});