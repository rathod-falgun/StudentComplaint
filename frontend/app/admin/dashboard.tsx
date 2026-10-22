import React, { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, apiFetch } from '@/constants/api';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAuthToken, getToken } from '@/utils/authStorage';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeColors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';

type Stats = {
  totalComplaints: number;
  submittedComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
};

type Complaint = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  studentDepartment?: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_BASE;
export default function AdminDashboard() {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const { name, userId, email, role } = useLocalSearchParams();

  const [stats, setStats] = useState<Stats>({
    totalComplaints: 0,
    submittedComplaints: 0,
    assignedComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {

    try {
      const token = await getToken();
      console.log("\n admin token : ", token);
      console.log("Fetching admin dashboard : \n");

      const stats = await apiFetch('/api/admin/dashboard');

      console.log("===== AFTER Comlaints API FETCH =====");
      console.log("Response received:", stats);
      console.log("Response status:", stats?.status);
      console.log("Response ok:", stats?.ok);

      if (!stats.ok) {
        throw new Error(`Failed to load admin dashboard: ${stats.status}`);
      }

      const dashboardData = await stats.json().catch(() => null);
      if (!dashboardData) {
        throw new Error('Invalid dashboard data received');
      }

      console.log("===== DASHBOARD DATA =====");
      console.log(dashboardData);

      // Set dashboard statistics
      setStats({
        totalComplaints: dashboardData.totalComplaints,
        submittedComplaints: dashboardData.submittedComplaints,
        assignedComplaints: dashboardData.assignedComplaints,
        inProgressComplaints: dashboardData.inProgressComplaints,
        resolvedComplaints: dashboardData.resolvedComplaints,
      });

      setRecentComplaints(dashboardData.recentComplaints || []);
      setError(false);
    } catch (err) {
      console.log('Error loading admin dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    console.log("Logout started");

    try {
      await clearAuthToken();

      console.log("Token removed");

      router.replace("/login");

    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SUBMITTED':
        return { bg: isDark ? 'rgba(217, 119, 6, 0.18)' : '#FFF4E5', text: isDark ? '#FBBF24' : '#B8710A' };
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return { bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#E8F0FF', text: isDark ? '#60A5FA' : '#2563EB' };
      case 'RESOLVED':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#E7F8EE', text: isDark ? '#34D399' : '#1D9A5C' };
      default:
        return { bg: isDark ? '#262632' : '#F0F2F6', text: colors.textSecondary };
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return { bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EEF6FF', text: isDark ? '#60A5FA' : '#3B82F6' };
      case 'MEDIUM':
        return { bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FFF7E5', text: isDark ? '#FBBF24' : '#D97706' };
      case 'HIGH':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FDECEC', text: isDark ? '#F87171' : '#DC2626' };
      default:
        return { bg: isDark ? '#262632' : '#F0F2F6', text: colors.textSecondary };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerScreen}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        style={styles.screen}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
            <Text style={styles.welcomeText}>
              Welcome, {name ? String(name) : 'Admin'}
            </Text>
          </View>
          <ThemeToggle compact />
        </View>
      </View>

      <View style={styles.content}>
        {/* Statistics Section */}
        <Text style={styles.sectionTitle}>Overview Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#007AFF' }]}>
            <Text style={styles.statLabel}>Total Complaints</Text>
            <Text style={[styles.statNumber, { color: '#007AFF' }]}>
              {stats.totalComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#0ee2f5' }]}>
            <Text style={styles.statLabel}>Submitted </Text>
            <Text style={[styles.statNumber, { color: '#09cedc' }]}>
              {stats.submittedComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#360fd4' }]}>
            <Text style={styles.statLabel}>Assigned</Text>
            <Text style={[styles.statNumber, { color: '#1806d9' }]}>
              {stats.assignedComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={[styles.statNumber, { color: '#2563EB' }]}>
              {stats.inProgressComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#0af129' }]}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={[styles.statNumber, { color: '#0cf508' }]}>
              {stats.resolvedComplaints}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.allComplaintsButton}
          onPress={() =>
            router.push({
              pathname: '/admin/complaints' as any,
              params: { name, userId, email, role },
            })
          }
        >
          <Text style={styles.allComplaintsButtonText}>📋 View All Complaints ({stats.totalComplaints})</Text>
        </TouchableOpacity>

        {/* Recent Complaints Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Complaints</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/admin/complaints' as any,
                params: { name, userId, email, role },
              })
            }
          >
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No complaints recorded yet.</Text>
          </View>
        ) : (
          recentComplaints.slice(0, 5).map((item) => {
            const status = statusColor(item.status);
            const priority = priorityColor(item.priority);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{item.category || 'General'}</Text>
                  </View>
                  <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
                    <Text style={[styles.priorityPillText, { color: priority.text }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                {/* <Text style={styles.studentInfo}>
                  Submitted by: <Text style={styles.studentName}>{item.studentName || 'Student'}</Text>
                </Text> */}

                <View style={styles.divider} />

                <View style={styles.cardBottomRow}>
                  <View>
                    <Text style={styles.dateLabel}>Date</Text>
                    <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
                  </View>

                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                    <Text style={[styles.statusPillText, { color: status.text }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() =>
                      router.push({
                        pathname: '/admin/complaintDetails' as any,
                        params: { complaintId: String(item.id), name, userId, email, role },
                      })
                    }
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            console.log("LOGOUT BUTTON PRESSED");
            handleLogout();
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.headerBg },
  screen: { flex: 1, backgroundColor: colors.bgPrimary },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgPrimary },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textSecondary },
  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: { fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.2 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginTop: 4 },
  content: { padding: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: colors.accent },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 5,
  },
  statLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  statNumber: { fontSize: 26, fontWeight: 'bold', marginTop: 6 },
  allComplaintsButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    elevation: 3,
  },
  allComplaintsButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { backgroundColor: colors.cardBg, padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryPill: { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityPillText: { fontSize: 10.5, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  studentInfo: { fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  studentName: { fontWeight: '700', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.divider, marginBottom: 10 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 10, color: colors.textMuted },
  dateValue: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  detailsButton: { backgroundColor: isDark ? '#262632' : '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  detailsButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoutButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
