import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

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
  userId?: number;
  studentName?: string;
  studentEmail?: string;
  studentDepartment?: string;
};

export default function AdminComplaints() {
  const { name, userId, email, role } = useLocalSearchParams();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const API_URL = 'http://172.22.245.235:8081/api/admin/complaints';

  const fetchComplaints = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data: Complaint[] = await response.json();
      setComplaints(data);

      // Extract unique categories
      const categoriesSet = new Set<string>();
      data.forEach((item) => {
        if (item.category) categoriesSet.add(item.category);
      });
      setAvailableCategories(Array.from(categoriesSet));
      setError(false);
    } catch (err) {
      console.log('Error fetching complaints:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    let result = complaints;

    // Search filter (title, studentName, category)
    if (searchText.trim() !== '') {
      const term = searchText.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
          c.studentName?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    setFilteredComplaints(result);
  }, [searchText, statusFilter, priorityFilter, categoryFilter, complaints]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
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
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to load complaints</Text>
        <Text style={styles.errorSubtitle}>Please check your connection and pull down to retry.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchComplaints}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Complaints</Text>
        <Text style={styles.headerSubtitle}>
          Showing {filteredComplaints.length} of {complaints.length} total
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, student name, or category..."
          placeholderTextColor="#94A3B8"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Horizontal Scroll */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Text style={styles.filterLabel}>Status:</Text>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.chip,
                statusFilter === st && styles.activeStatusChip,
              ]}
              onPress={() => setStatusFilter(st)}
            >
              <Text
                style={[
                  styles.chipText,
                  statusFilter === st && styles.activeChipText,
                ]}
              >
                {st.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.filterDivider} />

          <Text style={styles.filterLabel}>Priority:</Text>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                priorityFilter === p && styles.activePriorityChip,
              ]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  priorityFilter === p && styles.activeChipText,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}

          {availableCategories.length > 0 && (
            <>
              <View style={styles.filterDivider} />
              <Text style={styles.filterLabel}>Category:</Text>
              {['ALL', ...availableCategories].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    categoryFilter === cat && styles.activeCategoryChip,
                  ]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      categoryFilter === cat && styles.activeChipText,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <View style={styles.centerScreen}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No complaints match your filter</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search query or status filters.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const status = statusColor(item.status);
            const priority = priorityColor(item.priority);

            return (
              <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.complaintIdText}>ID: #{item.id}</Text>

                  <View style={styles.pillsRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{item.category || 'General'}</Text>
                    </View>
                    <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
                      <Text style={[styles.priorityPillText, { color: priority.text }]}>
                        {item.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Title & Description Excerpt */}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Student Details Preview */}
                <View style={styles.studentBox}>
                  <Text style={styles.studentLabel}>Student:</Text>
                  <Text style={styles.studentValue}>
                    {item.studentName || 'Student'} ({item.studentEmail || 'No Email'})
                  </Text>
                  {item.studentDepartment && (
                    <Text style={styles.deptText}>Dept: {item.studentDepartment}</Text>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Bottom Bar */}
                <View style={styles.cardBottomRow}>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                    <Text style={[styles.statusPillText, { color: status.text }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>

                  {item.imageUrl ? (
                    <View style={styles.imageBadge}>
                      <Text style={styles.imageBadgeText}>📷 Image</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/admin/complaintDetails' as any,
                        params: { complaintId: String(item.id), name, userId, email, role },
                      })
                    }
                  >
                    <Text style={styles.detailsBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B' },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  errorSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 4 },
  retryButton: { marginTop: 15, backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 },
  header: { backgroundColor: '#1E293B', paddingHorizontal: 20, paddingTop: 25, paddingBottom: 20 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: '#38BDF8', fontSize: 14, fontWeight: 'bold' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  searchContainer: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 6, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 44, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 15, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  clearSearchBtn: { position: 'absolute', right: 25 },
  clearSearchText: { fontSize: 16, color: '#64748B', fontWeight: 'bold' },
  filterSection: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterScroll: { paddingHorizontal: 15 },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748B', alignSelf: 'center', marginRight: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8 },
  activeStatusChip: { backgroundColor: '#007AFF' },
  activePriorityChip: { backgroundColor: '#D97706' },
  activeCategoryChip: { backgroundColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  activeChipText: { color: '#FFFFFF', fontWeight: 'bold' },
  filterDivider: { width: 1, height: 20, backgroundColor: '#CBD5E1', marginHorizontal: 8, alignSelf: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complaintIdText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  pillsRow: { flexDirection: 'row', gap: 6 },
  categoryPill: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  priorityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  priorityPillText: { fontSize: 10.5, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  cardDescription: { fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 18 },
  studentBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 10 },
  studentLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  studentValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  deptText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 10 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  imageBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  imageBadgeText: { fontSize: 11, fontWeight: '700', color: '#7E22CE' },
  detailsBtn: { backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  detailsBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});
