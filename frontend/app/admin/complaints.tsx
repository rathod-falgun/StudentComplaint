import React, { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, apiFetch } from '@/constants/api';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeColors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { formatDate } from '@/utils/dateUtils';

type Complaint = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  adminRemarks?: string;
  studentDepartment?: string;
  studentDivision?: string;
  deadline?: string;
  isOverdue?: boolean;
  slaHours?: number;
};

export default function AdminComplaints() {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

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

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);


  const getContent = (data: any): Complaint[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) {
      return data.content;
    }
    if (data._embedded) {
      const embeddedArray = Object.values(data._embedded).find(
        (value) => Array.isArray(value)
      );

      if (Array.isArray(embeddedArray)) {
        return embeddedArray as Complaint[];
      }
    }

    return [];
  };

  const fetchAllComplaints = async () => {
    try {
      setLoading(true);
      let allComplaints: Complaint[] = [];

      // Try single batch endpoint first
      const response = await apiFetch('/api/admin/Allcomplaints');
      if (response.ok) {
        const data = await response.json().catch(() => null);
        allComplaints = getContent(data);
      }

      // Fallback to paginated endpoint with size 100 if Allcomplaints fails
      if (allComplaints.length === 0 && !response.ok) {
        const fallbackRes = await apiFetch(`/api/admin/complaints?page=0&size=100`);
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json().catch(() => null);
          allComplaints = getContent(fbData);
        } else {
          throw new Error('Failed to fetch complaints');
        }
      }

      setComplaints(allComplaints);

      const categoriesSet = new Set<string>();
      allComplaints.forEach((item) => {
        if (item.category) {
          categoriesSet.add(item.category);
        }
      });

      setAvailableCategories(Array.from(categoriesSet));
      setCurrentPage(0);
      setError(false);
    } catch (err) {
      console.log('Error fetching complaints:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchAllComplaints();
    }, [])
  );

  // Filter and Search logic
  useEffect(() => {
    let result = [...complaints];

    if (searchText.trim() !== '') {
      console.log(searchText);
      const term = searchText.toLowerCase();
      console.log("\n",term,"\n")
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(term) ||
  //        c.studentName?.toLowerCase().includes(term) ||
          c.category?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    setFilteredComplaints(result);
    setCurrentPage(0);
  }, [
    complaints,
    searchText,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);
  const totalPages = Math.ceil(filteredComplaints.length / pageSize);

  const paginatedComplaints = filteredComplaints.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: isDark ? 'rgba(217, 119, 6, 0.18)' : '#FFF4E5', text: isDark ? '#FBBF24' : '#B8710A' };
      case 'ASSIGNED':
        return { bg: isDark ? 'rgba(126, 34, 206, 0.18)' : '#FAF5FF', text: isDark ? '#C084FC' : '#7E22CE' };
      case 'IN_PROGRESS':
        return { bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#E8F0FF', text: isDark ? '#60A5FA' : '#2563EB' };
      case 'RESOLVED':
        return { bg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#E7F8EE', text: isDark ? '#34D399' : '#1D9A5C' };
      case 'REJECTED':
        return { bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FDECEC', text: isDark ? '#F87171' : '#DC2626' };
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerScreen}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerScreen}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load complaints</Text>
          <Text style={styles.errorSubtitle}>Please check your connection and pull down to retry.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { fetchAllComplaints() }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function onRefresh(): void {
    setRefreshing(true);
    fetchAllComplaints();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Complaints</Text>
          <ThemeToggle compact />
        </View>
        <Text style={styles.headerSubtitle}>
          Showing {filteredComplaints.length} of {complaints.length} total
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, department, or category..."
          placeholderTextColor={colors.inputPlaceholder}
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
          {['ALL', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.chip,
                statusFilter === st && styles.activeStatusChip,
              ]}
              onPress={() => {
                setStatusFilter(statusFilter === st ? "ALL" : st);
                setCurrentPage(0);
              }}

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
          {['ALL','LOW', 'MEDIUM', 'HIGH'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.chip,
                priorityFilter === p && styles.activePriorityChip,
              ]}
              onPress={() => {
                setPriorityFilter(priorityFilter === p ? "ALL" : p);
                setCurrentPage(0);
              }
              }
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
              {['ALL',...availableCategories].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    categoryFilter === cat && styles.activeCategoryChip,
                  ]}
                  onPress={() => {
                    setCategoryFilter(categoryFilter === cat ? 'ALL' : cat);
                    setCurrentPage(0);
                  }}
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No complaints found</Text>
          <Text style={styles.emptySubtitle}>
            Try changing the search text or filters.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedComplaints}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const status = statusColor(item.status);
              const priority = priorityColor(item.priority);

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.complaintIdText}>
                      Complaint #{item.id}
                    </Text>

                    <View style={styles.pillsRow}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>
                          {item.category || 'General'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.priorityPill,
                          { backgroundColor: priority.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityPillText,
                            { color: priority.text },
                          ]}
                        >
                          {item.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>
                    {item.title || 'Untitled complaint'}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {item.description || 'No description available.'}
                  </Text>

                  <View style={styles.studentBox}>
                    <Text style={styles.studentLabel}>SUBMITTER</Text>
                    <Text style={styles.studentValue}>Anonymous Student</Text>
                    {item.studentDepartment ? (
                      <Text style={styles.deptText}>
                        Department: {item.studentDepartment}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardBottomRow}>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: status.text },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: status.text },
                        ]}
                      >
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

                    <Text style={styles.deptText}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Pagination - always based on the FILTERED results */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === 0 && styles.disabledPageButton,
              ]}
              disabled={currentPage === 0}
              onPress={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 0))
              }
            >
              <Text style={styles.pageButtonText}>Previous</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pageNumbers}
              style={styles.pageNumberScroll}
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.numberButton,
                    currentPage === index && styles.activeNumberButton,
                  ]}
                  onPress={() => setCurrentPage(index)}
                >
                  <Text
                    style={[
                      styles.numberButtonText,
                      currentPage === index &&
                        styles.activeNumberButtonText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.pageButton,
                currentPage === totalPages - 1 &&
                  styles.disabledPageButton,
              ]}
              disabled={currentPage === totalPages - 1}
              onPress={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages - 1)
                )
              }
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pageInfoContainer}>
            <Text style={styles.pageInfoText}>
              Page {currentPage + 1} of {totalPages} • Showing{' '}
              {currentPage * pageSize + 1}-
              {Math.min(
                (currentPage + 1) * pageSize,
                filteredComplaints.length
              )}{' '}
              of {filteredComplaints.length}
            </Text>
          </View>
        </>
      )}

    </View>
    </SafeAreaView>

  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.headerBg },
  screen: { flex: 1, backgroundColor: colors.bgPrimary },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: colors.bgPrimary },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textSecondary },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  errorSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  retryButton: { marginTop: 15, backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  header: { backgroundColor: colors.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.headerBorder },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backBtn: { paddingVertical: 4, minWidth: 50 },
  backBtnText: { color: colors.accent, fontSize: 14, fontWeight: 'bold' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' },
  headerSpacer: { minWidth: 50 },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  searchContainer: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 6, backgroundColor: colors.cardBg, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  searchInput: { flex: 1, height: 44, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, paddingHorizontal: 15, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.inputBg },
  clearSearchBtn: { position: 'absolute', right: 25 },
  clearSearchText: { fontSize: 16, color: colors.textSecondary, fontWeight: 'bold' },
  filterSection: { backgroundColor: colors.cardBg, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  filterScroll: { paddingHorizontal: 15 },
  filterLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textSecondary, alignSelf: 'center', marginRight: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: isDark ? '#262632' : '#F1F5F9', marginRight: 8 },
  activeStatusChip: { backgroundColor: colors.accent },
  activePriorityChip: { backgroundColor: '#D97706' },
  activeCategoryChip: { backgroundColor: isDark ? '#3B82F6' : '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  activeChipText: { color: '#FFFFFF', fontWeight: 'bold' },
  filterDivider: { width: 1, height: 20, backgroundColor: colors.divider, marginHorizontal: 8, alignSelf: 'center' },
  listContent: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: colors.cardBg, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.cardBorder, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complaintIdText: { fontSize: 12, fontWeight: 'bold', color: colors.textMuted },
  pillsRow: { flexDirection: 'row', gap: 6 },
  categoryPill: { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  categoryPillText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  priorityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  priorityPillText: { fontSize: 10.5, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  cardDescription: { fontSize: 13, color: colors.textSecondary, marginBottom: 10, lineHeight: 18 },
  studentBox: { backgroundColor: colors.inputBg, padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder },
  studentLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  studentValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  deptText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider, marginBottom: 10 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  imageBadge: { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : '#F3E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  imageBadgeText: { fontSize: 11, fontWeight: '700', color: '#A855F7' },
  detailsBtn: { backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  detailsBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  pageNumberScroll: {
    flex: 1,
    marginHorizontal: 8,
  },
  pageInfoContainer: {
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    paddingBottom: 8,
  },
  pageInfoText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  pageText: {
    color: '#FFFFFF'
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  pageButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  disabledPageButton: {
    backgroundColor: isDark ? '#262632' : '#CBD5E1',
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  pageNumbers: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  numberButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: isDark ? '#262632' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  activeNumberButton: {
    backgroundColor: colors.accent,
  },
  numberButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeNumberButtonText: {
    color: '#FFFFFF',
  },
  detailsButton: { backgroundColor: isDark ? '#262632' : '#0F172A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  detailsButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }
});
