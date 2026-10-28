import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL, apiFetch } from '@/constants/api';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeColors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { formatDateTime } from '@/utils/dateUtils';

type ComplaintDetail = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  studentDepartment?: string;
  studentDivision?: string;
  deadline?: string;
  isOverdue?: boolean;
  slaHours?: number;
  adminRemarks?: string;
};

export default function AdminComplaintDetails() {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const { complaintId } = useLocalSearchParams();

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalComplaints, setTotalComplaints] = useState(0);

  const API_BASE = `${API_BASE_URL}`;

  const fetchComplaintDetails = async () => {
    console.log("========== FETCH COMPLAINT DETAILS ==========");
    console.log("complaintId:", complaintId);

    if (!complaintId) {
      console.log("complaintId is missing!");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        `/api/admin/complaints/${complaintId}`
      );

      console.log("Response status:", response.status);
      console.log("Response OK:", response.ok);

      const responseText = await response.text();

      console.log("Backend response:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch complaint details: ${response.status}`
        );
      }

      const data: ComplaintDetail = JSON.parse(responseText);

      console.log("Complaint data:", data);

      setComplaint(data);
      setSelectedStatus(null);
      setAdminRemarks(data.adminRemarks || '');
      setError(false);

    } catch (err) {
      console.log("Error fetching complaint details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const nextStatus = (currentStatus: ComplaintDetail['status']) => {
    switch (currentStatus) {
      case "SUBMITTED":
        return "ASSIGNED";

      case "ASSIGNED":
        return "IN_PROGRESS";

      case "IN_PROGRESS":
        return "RESOLVED";

      case "RESOLVED":
      case "REJECTED":
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const handleUpdateStatus = async () => {
    if (!complaint || !selectedStatus || complaint.status === selectedStatus) return;

    if (selectedStatus === 'REJECTED' && !adminRemarks.trim()) {
      Alert.alert('Remarks Required', 'Please provide an explanation or reason for rejecting this complaint.');
      return;
    }

    try {
      setUpdating(true);
      const response = await apiFetch(`/api/admin/complaints/${complaint.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: selectedStatus,
          adminRemarks: adminRemarks.trim(),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let displayMsg = errText;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.message) {
            displayMsg = parsed.message;
          }
        } catch (_) { }
        throw new Error(displayMsg || 'Failed to update status on server');
      }

      const updatedData: ComplaintDetail = await response.json();

      // Update UI state immediately without page refresh
      const previousSelected = selectedStatus;
      setComplaint(updatedData);
      setSelectedStatus(null);
      setAdminRemarks(updatedData.adminRemarks || '');

      Alert.alert(
        'Success',
        previousSelected === 'REJECTED'
          ? 'Complaint has been marked as REJECTED with your remarks.'
          : `Status updated to ${previousSelected.replace('_', ' ')} successfully!`
      );
    } catch (err: any) {
      console.log('Status update error:', err);
      Alert.alert('Error', err.message || 'Failed to update complaint status on server.');
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          bg: isDark ? 'rgba(194, 65, 12, 0.2)' : '#FFF7ED',
          text: isDark ? '#FB923C' : '#C2410C',
          border: isDark ? '#7C2D12' : '#FED7AA',
        };
      case 'ASSIGNED':
        return {
          bg: isDark ? 'rgba(126, 34, 206, 0.2)' : '#FAF5FF',
          text: isDark ? '#C084FC' : '#7E22CE',
          border: isDark ? '#581C87' : '#E9D5FF',
        };
      case 'IN_PROGRESS':
        return {
          bg: isDark ? 'rgba(29, 78, 216, 0.2)' : '#EFF6FF',
          text: isDark ? '#60A5FA' : '#1D4ED8',
          border: isDark ? '#1E3A8A' : '#BFDBFE',
        };
      case 'RESOLVED':
        return {
          bg: isDark ? 'rgba(4, 120, 87, 0.2)' : '#ECFDF5',
          text: isDark ? '#34D399' : '#047857',
          border: isDark ? '#064E3B' : '#A7F3D0',
        };
      case 'REJECTED':
        return {
          bg: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
          text: isDark ? '#F87171' : '#DC2626',
          border: isDark ? '#7F1D1D' : '#FECACA',
        };
      default:
        return {
          bg: isDark ? '#262632' : '#F8FAFC',
          text: colors.textSecondary,
          border: colors.cardBorder,
        };
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return {
          bg: isDark ? 'rgba(29, 78, 216, 0.2)' : '#EFF6FF',
          text: isDark ? '#60A5FA' : '#1D4ED8',
          border: isDark ? '#1E3A8A' : '#BFDBFE',
        };
      case 'MEDIUM':
        return {
          bg: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FFFBEB',
          text: isDark ? '#FBBF24' : '#B45309',
          border: isDark ? '#78350F' : '#FDE68A',
        };
      case 'HIGH':
        return {
          bg: isDark ? 'rgba(185, 28, 28, 0.2)' : '#FEF2F2',
          text: isDark ? '#F87171' : '#B91C1C',
          border: isDark ? '#7F1D1D' : '#FECACA',
        };
      default:
        return {
          bg: isDark ? '#262632' : '#F8FAFC',
          text: colors.textSecondary,
          border: colors.cardBorder,
        };
    }
  };

  const formatDate = (dateStr?: string) => formatDateTime(dateStr);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerScreen}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !complaint) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerScreen}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Complaint Not Found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = statusColor(complaint.status);
  const priority = priorityColor(complaint.priority);

  const next = nextStatus(complaint.status);

  const isStatusChanged = selectedStatus !== null && selectedStatus !== complaint.status;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complaint Details</Text>
            <ThemeToggle compact />
          </View>
          <Text style={styles.complaintIdHeader}>Complaint ID: #{complaint.id}</Text>
        </View>

        <View style={styles.container}>
          {/* Submitter Privacy Information */}


          {/* Complaint Information Section */}
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>📌 Complaint Information</Text>

            <View style={styles.badgeRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{complaint.category || 'General'}</Text>
              </View>
              <View style={[styles.priorityPill, { backgroundColor: priority.bg, borderColor: priority.border, borderWidth: 1 }]}>
                <Text style={[styles.priorityPillText, { color: priority.text }]}>
                  {complaint.priority} PRIORITY
                </Text>
              </View>
            </View>

            <Text style={styles.complaintTitle}>{complaint.title}</Text>
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.descriptionText}>{complaint.description}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted Date:</Text>
              <Text style={styles.infoValue}>{formatDate(complaint.createdAt)} IST</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>{formatDate(complaint.updatedAt)} IST</Text>
            </View>
            {complaint.deadline ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SLA Deadline:</Text>
                <Text style={[styles.infoValue, complaint.isOverdue && { color: '#EF4444', fontWeight: '700' }]}>
                  {formatDate(complaint.deadline)} IST {complaint.isOverdue ? '(Breached)' : ''}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Image Attachment Section */}
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>🖼️ Attached Image</Text>
            {complaint.imageUrl ? (
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  style={styles.imageToggleButton}
                  onPress={() => setShowImage(!showImage)}
                >
                  <Text style={styles.imageToggleButtonText}>
                    {showImage ? 'Hide Attached Image' : 'View Attached Image'}
                  </Text>
                </TouchableOpacity>

                {showImage && (
                  imageLoadError ? (
                    <View style={styles.imageErrorBox}>
                      <Text style={styles.imageErrorText}>⚠️ Could not load image from server</Text>
                      <Text style={styles.imageErrorSubText}>File: {complaint.imageUrl}</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: complaint.imageUrl }} // full Supabase public URL stored in DB
                      style={styles.attachedImage}
                      resizeMode="cover"
                      onError={(e) => {
                        console.log("Error loading complaint image:", e.nativeEvent);
                        setImageLoadError(true);
                      }}
                    />
                  )
                )}
              </View>
            ) : (
              <Text style={styles.noImageText}>No image attached</Text>
            )}
          </View>

          {/* Status Control Section */}
          <View style={styles.card}>
            <Text style={styles.cardSectionHeader}>⚙️ Status & Remarks</Text>

            <View style={styles.currentStatusRow}>
              <Text style={styles.infoLabel}>Current Status:</Text>
              <View style={[styles.statusPill, { backgroundColor: status.bg, borderColor: status.border, borderWidth: 1 }]}>
                <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                <Text style={[styles.statusPillText, { color: status.text }]}>
                  {complaint.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Existing Official Admin Remarks */}
            {complaint.adminRemarks ? (
              <View style={[
                styles.existingRemarksBox,
                complaint.status === 'REJECTED' ? styles.existingRemarksBoxRejected : styles.existingRemarksBoxResolved
              ]}>
                <Text style={[
                  styles.existingRemarksLabel,
                  complaint.status === 'REJECTED' ? styles.existingRemarksLabelRejected : styles.existingRemarksLabelResolved
                ]}>
                  📋 Official Admin Remarks:
                </Text>
                <Text style={styles.existingRemarksText}>{complaint.adminRemarks}</Text>
              </View>
            ) : null}

            {/* Workflow Actions */}
            {complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED' ? (
              <>
                <Text style={styles.selectStatusLabel}>Choose Next Action:</Text>

                <View style={styles.actionButtonsRow}>
                  {next && (
                    <TouchableOpacity
                      style={[
                        styles.statusOptionBtn,
                        selectedStatus === next && styles.activeStatusOptionBtn,
                      ]}
                      disabled={updating}
                      onPress={() =>
                        setSelectedStatus((prev) => (prev === next ? null : next))
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          selectedStatus === next && styles.activeStatusOptionText,
                        ]}
                      >
                        {selectedStatus === next ? '✓ ' : ''}Move to {next.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.rejectOptionBtn,
                      selectedStatus === 'REJECTED' && styles.activeRejectOptionBtn,
                    ]}
                    disabled={updating}
                    onPress={() =>
                      setSelectedStatus((prev) => (prev === 'REJECTED' ? null : 'REJECTED'))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.rejectOptionText,
                        selectedStatus === 'REJECTED' && styles.activeRejectOptionText,
                      ]}
                    >
                      {selectedStatus === 'REJECTED' ? '✓ ' : '✕ '}Reject Complaint
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Remarks Text Input (Shown when a status action is selected) */}
                {selectedStatus && (
                  <View style={styles.remarksInputContainer}>
                    <Text style={styles.remarksInputLabel}>
                      {selectedStatus === 'REJECTED'
                        ? 'Rejection Reason * (Required for student email)'
                        : 'Admin Remarks / Resolution Note (Optional)'}
                    </Text>
                    <TextInput
                      style={[
                        styles.remarksInput,
                        selectedStatus === 'REJECTED' && styles.remarksInputReject
                      ]}
                      placeholder={
                        selectedStatus === 'REJECTED'
                          ? 'e.g., Duplicate of ticket #12, invalid photo, or outside college scope...'
                          : 'e.g., Assigned to electrical team, repaired on-site, or tested...'
                      }
                      placeholderTextColor={colors.inputPlaceholder}
                      value={adminRemarks}
                      onChangeText={setAdminRemarks}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.updateStatusButton,
                    selectedStatus === 'REJECTED' && styles.rejectStatusButton,
                    (!isStatusChanged || updating) && styles.disabledUpdateButton,
                  ]}
                  disabled={!isStatusChanged || updating}
                  onPress={handleUpdateStatus}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.updateStatusButtonText}>
                      {selectedStatus === 'REJECTED'
                        ? 'Confirm Rejection & Send Email'
                        : isStatusChanged
                          ? `Update to ${selectedStatus?.replace('_', ' ')} & Notify`
                          : 'Select an Action Above'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.workflowCompleteBox}>
                <Text style={styles.workflowCompleteText}>
                  {complaint.status === 'RESOLVED'
                    ? '✅ This complaint has been successfully resolved.'
                    : '⛔ This complaint was rejected by the administration.'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  backButton: { marginTop: 15, backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  header: { backgroundColor: colors.headerBg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.headerBorder },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backBtn: { paddingVertical: 4, minWidth: 50 },
  backBtnText: { color: colors.accent, fontSize: 14, fontWeight: 'bold' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' },
  headerSpacer: { minWidth: 50 },
  complaintIdHeader: { fontSize: 13, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  container: { padding: 16 },
  card: { backgroundColor: colors.cardBg, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder, elevation: 2 },
  cardSectionHeader: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  categoryPill: { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityPillText: { fontSize: 11, fontWeight: '800' },
  complaintTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
  descriptionLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '700', marginTop: 4 },
  descriptionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 4, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 12 },
  imageContainer: { alignItems: 'center' },
  imageToggleButton: { backgroundColor: isDark ? '#262632' : '#0F172A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
  imageToggleButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  attachedImage: { width: '100%', height: 250, borderRadius: 12, marginTop: 12 },
  imageErrorBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: isDark ? '#2E1515' : '#FEF2F2',
    borderWidth: 1,
    borderColor: isDark ? '#7F1D1D' : '#FECACA',
    alignItems: 'center',
    marginTop: 12,
  },
  imageErrorText: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  imageErrorSubText: { color: isDark ? '#FCA5A5' : '#991B1B', fontSize: 12, marginTop: 4 },
  noImageText: { color: colors.textMuted, fontStyle: 'italic', fontSize: 14 },
  currentStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusPillText: { fontSize: 12, fontWeight: '800' },
  selectStatusLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 },
  actionButtonsRow: { flexDirection: 'column', gap: 10, marginBottom: 14 },
  statusOptionBtn: { backgroundColor: isDark ? '#1C1C24' : '#F1F5F9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  statusOptionText: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary },
  activeStatusOptionText: { color: colors.accent },
  activeStatusOptionBtn: {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  rejectOptionBtn: {
    backgroundColor: isDark ? '#221417' : '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#7F1D1D' : '#FECACA',
  },
  rejectOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  activeRejectOptionBtn: {
    backgroundColor: isDark ? '#35191C' : '#FEE2E2',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  activeRejectOptionText: {
    color: '#F87171',
  },
  remarksInputContainer: {
    marginBottom: 14,
  },
  remarksInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  remarksInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  remarksInputReject: {
    borderColor: '#F87171',
    backgroundColor: isDark ? '#201315' : '#FFF5F5',
  },
  existingRemarksBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderLeftWidth: 4,
  },
  existingRemarksBoxResolved: {
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#F0FDF4',
    borderLeftColor: '#10B981',
  },
  existingRemarksBoxRejected: {
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  existingRemarksLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  existingRemarksLabelResolved: {
    color: isDark ? '#34D399' : '#065F46',
  },
  existingRemarksLabelRejected: {
    color: isDark ? '#F87171' : '#991B1B',
  },
  existingRemarksText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  updateStatusButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  rejectStatusButton: {
    backgroundColor: '#DC2626',
  },
  disabledUpdateButton: {
    backgroundColor: isDark ? '#262632' : '#94A3B8',
    opacity: 0.6,
  },
  updateStatusButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  workflowCompleteBox: {
    backgroundColor: isDark ? '#1C1C24' : '#F8FAFC',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    marginVertical: 6,
  },
  workflowCompleteText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
