import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/constants/responsive';
import { clearAuthToken, getUserId } from '@/utils/authStorage';
import { apiFetch, API_BASE_URL } from '@/constants/api';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  department: string;
  division?: string;
  role: string;
  createdAt: string;
  profilePhoto?: string | null;
  profilePhotoPath?: string | null;
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
};

export default function Dashboard() {
  const params = useLocalSearchParams();
  const paramUserId = params.userId ? String(params.userId) : null;
  const paramName = params.name ? String(params.name) : null;

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [effectiveUserId, setEffectiveUserId] = useState<string | null>(paramUserId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadDashboardData = async () => {
    try {
      const id = paramUserId || (await getUserId());
      if (!id) {
        setLoading(false);
        return;
      }
      setEffectiveUserId(String(id));

      // Fetch Profile & Complaints in parallel
      const [profileRes, complaintsRes] = await Promise.allSettled([
        apiFetch(`/api/users/getProfile/${id}`),
        apiFetch(`/api/complaints/getMyComplaint/${id}`),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const profileData = await profileRes.value.json();
        console.log("Dashboard profile loaded:", profileData);
        setProfile(profileData);
      }

      if (complaintsRes.status === 'fulfilled' && complaintsRes.value.ok) {
        const complaintsData = await complaintsRes.value.json();
        if (Array.isArray(complaintsData)) {
          setComplaints(complaintsData);
        }
      }
    } catch (err) {
      console.log('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setImageError(false);
      loadDashboardData();
    }, [paramUserId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out student account...');
      await clearAuthToken();
    } catch (e) {
      console.log('Logout error:', e);
    } finally {
      router.replace('/login');
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to log out of your SCET student account?')
          : true;
      if (confirmed) {
        handleLogout();
      }
      return;
    }

    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your SCET student account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const rawPhoto = profile?.profilePhoto || profile?.profilePhotoPath;
  const photoUrl = rawPhoto
    ? rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://')
      ? rawPhoto
      : `${API_BASE_URL}/uploads/profiles/${rawPhoto}`
    : null;
  const displayName = profile?.name || paramName || 'Student';
  const displayRole = profile?.role || 'STUDENT';
  const displayEmail = profile?.email || '-';
  const displayDepartment = profile?.department || 'General';
  const displayDivision = profile?.division || null;

  // Calculate dynamic metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'SUBMITTED' || c.status === 'ASSIGNED'
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'RESOLVED'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          textColor: '#60A5FA',
          bgColor: 'rgba(59, 130, 246, 0.15)',
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          textColor: '#34D399',
          bgColor: 'rgba(16, 185, 129, 0.15)',
        };
      case 'SUBMITTED':
      case 'ASSIGNED':
      default:
        return {
          label: 'Pending',
          textColor: '#FBBF24',
          bgColor: 'rgba(245, 158, 11, 0.15)',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
      contentContainerStyle={[
        styles.container,
        isMobile && styles.mobileContainer,
        isTablet && styles.tabletContainer,
        isDesktop && styles.desktopContainer,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#60A5FA"
          colors={['#2563EB']}
        />
      }
    >
        <View
          style={[
            styles.contentWrapper,
            isMobile && styles.mobileContentWrapper,
            isTablet && styles.tabletContentWrapper,
            isDesktop && styles.desktopContentWrapper,
          ]}
        >
          {/* ================================================= */}
          {/* TOP GREETING HEADER */}
          {/* ================================================= */}
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.appBadge}>
                <Text style={styles.appBadgeText}>SCET STUDENT PORTAL</Text>
              </View>
              <Text style={styles.headerGreeting}>
                Welcome, {displayName.split(' ')[0]} 👋
              </Text>
              <Text style={styles.headerSubtext}>
                {displayDepartment} {displayDivision ? `• Div ${displayDivision}` : ''}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerAvatarTouchable}
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
            >
              {photoUrl && !imageError ? (
                <Image
                  source={{
                    uri: photoUrl,
                  }}
                  style={styles.headerAvatarImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  onError={(e) => {
                    console.log("Failed to load dashboard profile photo:", e);
                    setImageError(true);
                  }}
                />
              ) : (
                <View style={styles.headerAvatarFallback}>
                  <Text style={styles.headerAvatarInitial}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ================================================= */}
          {/* COMPLAINTS OVERVIEW METRICS */}
          {/* ================================================= */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Overview Statistics</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/myComplaints',
                  params: { userId: effectiveUserId || '', name: displayName },
                })
              }
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {/* Total Complaints */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/myComplaints',
                  params: { userId: effectiveUserId || '', name: displayName },
                })
              }
            >
              <View style={styles.statIconCircle}>
                <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total Complaints</Text>
            </TouchableOpacity>

            {/* Pending */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/myComplaints',
                  params: { userId: effectiveUserId || '', name: displayName },
                })
              }
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Ionicons name="time-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending Triage</Text>
            </TouchableOpacity>

            {/* In Progress */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: '#0EA5E9' }]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/myComplaints',
                  params: { userId: effectiveUserId || '', name: displayName },
                })
              }
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
                <Ionicons name="sync-outline" size={18} color="#0EA5E9" />
              </View>
              <Text style={[styles.statNumber, { color: '#0EA5E9' }]}>
                {inProgressCount}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </TouchableOpacity>

            {/* Resolved */}
            <TouchableOpacity
              style={[styles.statCard, { borderLeftColor: '#10B981' }]}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/myComplaints',
                  params: { userId: effectiveUserId || '', name: displayName },
                })
              }
            >
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              </View>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {resolvedCount}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </TouchableOpacity>
          </View>

          {/* ================================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================================= */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Quick Actions</Text>

          {/* Action: Submit Complaint */}
          <TouchableOpacity
            style={styles.primaryActionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/addComplaint',
                params: {
                  userId: effectiveUserId || '',
                  name: displayName,
                },
              })
            }
          >
            <View style={styles.actionLeft}>
              <View style={styles.primaryIconCircle}>
                <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.actionTexts}>
                <Text style={styles.primaryActionTitle}>Submit New Complaint</Text>
                <Text style={styles.primaryActionSub}>
                  Capture photo & report campus or lab issue
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Action: View Complaints */}
          <TouchableOpacity
            style={styles.secondaryActionCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/myComplaints',
                params: {
                  userId: effectiveUserId || '',
                  name: displayName,
                },
              })
            }
          >
            <View style={styles.actionLeft}>
              <View style={styles.secondaryIconCircle}>
                <Ionicons name="list-outline" size={24} color="#60A5FA" />
              </View>
              <View style={styles.actionTexts}>
                <Text style={styles.secondaryActionTitle}>Track My Complaints</Text>
                <Text style={styles.secondaryActionSub}>
                  Check real-time resolution progress & updates
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#8D8D98" />
          </TouchableOpacity>

          {/* ================================================= */}
          {/* RECENT COMPLAINTS PREVIEW */}
          {/* ================================================= */}
          <View style={[styles.sectionTitleRow, { marginTop: 22 }]}>
            <Text style={styles.sectionTitle}>Recent Grievances</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>Fetching recent complaints...</Text>
            </View>
          ) : complaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="shield-checkmark-outline" size={36} color="#3B82F6" />
              <Text style={styles.emptyTitle}>No Complaints Recorded</Text>
              <Text style={styles.emptySub}>
                You have not filed any complaints yet. If you notice any campus, classroom, or lab maintenance issue, tap "Submit New Complaint".
              </Text>
            </View>
          ) : (
            complaints.slice(0, 3).map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/myComplaints',
                      params: {
                        userId: effectiveUserId || '',
                        name: displayName,
                      },
                    })
                  }
                >
                  <View style={styles.recentTopRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category || 'General'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.textColor }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.recentFooter}>
                    <Text style={styles.recentDate}>
                      Filed on {formatDate(item.createdAt)}
                    </Text>
                    <Text style={styles.recentTap}>View details →</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* ================================================= */}
          {/* STUDENT PROFILE SUMMARY CARD */}
          {/* ================================================= */}
          <View style={styles.profileSnippetCard}>
            <View style={styles.snippetLeft}>
              <Ionicons name="person-circle-outline" size={24} color="#60A5FA" />
              <View style={styles.snippetTexts}>
                <Text style={styles.snippetTitle}>Student Identity</Text>
                <Text style={styles.snippetEmail} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileLinkButton}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.profileLinkText}>View Profile</Text>
            </TouchableOpacity>
          </View>

          {/* ================================================= */}
          {/* LOGOUT BUTTON */}
          {/* ================================================= */}
          <TouchableOpacity
            style={styles.logoutCard}
            activeOpacity={0.8}
            onPress={confirmLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutCardText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            College Complaint Management System
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>

  );
}



const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#17171C',
  },
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mobileContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  tabletContainer: {
    paddingHorizontal: 30,
    paddingVertical: 28,
  },
  desktopContainer: {
    paddingHorizontal: 40,
    paddingVertical: 36,
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 620,
  },
  mobileContentWrapper: {
    maxWidth: '100%',
  },
  tabletContentWrapper: {
    maxWidth: 580,
  },
  desktopContentWrapper: {
    maxWidth: 640,
  },

  /* =====================================
     TOP HEADER
  ====================================== */
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#262630',
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  appBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },

  appBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.8,
  },

  headerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  headerSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },

  headerAvatarTouchable: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#2563EB',
    overflow: 'hidden',
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },

  headerAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  /* =====================================
     STATS GRID
  ====================================== */
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },

  statCard: {
    width: '48.5%',
    backgroundColor: '#1E1E24',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#303038',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },

  /* =====================================
     ACTION CARDS
  ====================================== */
  primaryActionCard: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,

    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  secondaryActionCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#303038',
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  primaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  secondaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  actionTexts: {
    flex: 1,
  },

  primaryActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  primaryActionSub: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 12,
    marginTop: 2,
  },

  secondaryActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryActionSub: {
    color: '#8D8D98',
    fontSize: 12,
    marginTop: 2,
  },

  /* =====================================
     RECENT COMPLAINTS & EMPTY
  ====================================== */
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },

  loadingText: {
    color: '#8D8D98',
    fontSize: 13,
  },

  emptyCard: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#303038',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    textAlign: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },

  emptySub: {
    color: '#8D8D98',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },

  recentCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: '#303038',
    marginBottom: 10,
  },

  recentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryBadge: {
    backgroundColor: '#262630',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  categoryBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  recentTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
    marginBottom: 8,
  },

  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#262630',
    paddingTop: 8,
  },

  recentDate: {
    color: '#8D8D98',
    fontSize: 11.5,
  },

  recentTap: {
    color: '#60A5FA',
    fontSize: 11.5,
    fontWeight: '600',
  },

  /* =====================================
     PROFILE SNIPPET
  ====================================== */
  profileSnippetCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#303038',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  snippetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },

  snippetTexts: {
    flex: 1,
  },

  snippetTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#17171C',
  },
  snippetEmail: {
    color: '#8D8D98',
    fontSize: 12,
    marginTop: 1,
  },

  profileLinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#262630',
  },

  profileLinkText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },

  /* =====================================
     LOGOUT & FOOTER
  ====================================== */
  logoutCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },

  logoutCardText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },

  footerNote: {
    color: '#5E5E68',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
});
