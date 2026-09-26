import React, { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';

type Stats = {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
};

type Complaint = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  studentName?: string;
  studentEmail?: string;
  studentDepartment?: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_BASE;
export default function AdminDashboard() {
  const { name, userId, email, role } = useLocalSearchParams();

  const [stats, setStats] = useState<Stats>({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const API_ADMIN = `${API_URL}/api/admin`;

  const fetchData = async () => {
    try {
      console.log("Fetching admin data from:", API_ADMIN);
      const [statsRes, complaintsRes] = await Promise.all([
        fetch(`${API_ADMIN}/dashboard`),
        fetch(`${API_ADMIN}/complaints`),
      ]);

      if (!statsRes.ok || !complaintsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const statsData = await statsRes.json();
      const complaintsData: Complaint[] = await complaintsRes.json();

      setStats(statsData);
      setRecentComplaints(complaintsData);
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

  const handleLogout = () => {
    router.replace('/login');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FFF4E5', text: '#B8710A' };
      case 'IN_PROGRESS':
        return { bg: '#E8F0FF', text: '#2563EB' };
      case 'RESOLVED':
        return { bg: '#E7F8EE', text: '#1D9A5C' };
      default:
        return { bg: '#F0F2F6', text: '#465267' };
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return { bg: '#EEF6FF', text: '#3B82F6' };
      case 'MEDIUM':
        return { bg: '#FFF7E5', text: '#D97706' };
      case 'HIGH':
        return { bg: '#FDECEC', text: '#DC2626' };
      default:
        return { bg: '#F0F2F6', text: '#465267' };
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
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        <Text style={styles.welcomeText}>
          Welcome, {name ? String(name) : 'Admin'}
        </Text>
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

          <View style={[styles.statCard, { borderLeftColor: '#D97706' }]}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>
              {stats.pendingComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={[styles.statNumber, { color: '#2563EB' }]}>
              {stats.inProgressComplaints}
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: '#1D9A5C' }]}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={[styles.statNumber, { color: '#1D9A5C' }]}>
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
                <Text style={styles.studentInfo}>
                  Submitted by: <Text style={styles.studentName}>{item.studentName || 'Student'}</Text>
                </Text>

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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555555' },
  header: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  content: { padding: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: '#007AFF' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  statNumber: { fontSize: 26, fontWeight: 'bold', marginTop: 6 },
  allComplaintsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    elevation: 3,
  },
  allComplaintsButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryPill: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityPillText: { fontSize: 10.5, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  studentInfo: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  studentName: { fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 10, color: '#94A3B8' },
  dateValue: { fontSize: 12, fontWeight: '700', color: '#475569' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  detailsButton: { backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
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
