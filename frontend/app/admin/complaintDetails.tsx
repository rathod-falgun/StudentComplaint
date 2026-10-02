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
} from 'react-native';

type ComplaintDetail = {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  userId?: number;
  studentName?: string;
  studentEmail?: string;
  studentDepartment?: string;
};

export default function AdminComplaintDetails() {
  const { complaintId } = useLocalSearchParams();

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [totalComplaints, setTotalComplaints] = useState(0);

  const API_BASE = `${API_BASE_URL}/api/admin/complaints`;

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
      setSelectedStatus(data.status);
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
       return "RESOLVED";
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const handleUpdateStatus = async () => {
    if (!complaint || !selectedStatus || complaint.status === selectedStatus) return;

    try {
      setUpdating(true);
      const response = await apiFetch(`/api/admin/complaints/${complaint.id}/status` ,
        {
          method : "PUT",
          body : JSON.stringify({
            status : selectedStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status in MySQL');
      }

      const updatedData: ComplaintDetail = await response.json();

      // Update UI state immediately without page refresh
      setComplaint(updatedData);
      setSelectedStatus(updatedData.status);

      Alert.alert('Success', `Status updated to ${selectedStatus.replace('_', ' ')} successfully!`);
    } catch (err) {
      console.log('Status update error:', err);
      Alert.alert('Error', 'Failed to update complaint status on server.');
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { bg: '#FFF4E5', text: '#B8710A' };

      case 'ASSIGNED':
        return { bg: '#F3E8FF', text: '#7E22CE' };

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
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error || !complaint) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Complaint Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = statusColor(complaint.status);
  const priority = priorityColor(complaint.priority);

  const next = nextStatus(complaint.status);

  const activeStatusSelection = selectedStatus ?? complaint.status;
  const isStatusChanged = selectedStatus !== null && selectedStatus !== complaint.status;

  return (
    <ScrollView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <Text style={styles.complaintIdHeader}>Complaint ID: #{complaint.id}</Text>
      </View>

      <View style={styles.container}>
        {/* Student Information Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>👤 Student Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{complaint.studentName || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{complaint.studentEmail || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{complaint.studentDepartment || 'N/A'}</Text>
          </View>
        </View>

        {/* Complaint Information Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>📌 Complaint Information</Text>

          <View style={styles.badgeRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{complaint.category || 'General'}</Text>
            </View>
            <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
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
            <Text style={styles.infoValue}>{formatDate(complaint.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(complaint.updatedAt)}</Text>
          </View>
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
                <Image
                  source={{ uri: `${API_BASE}/uploads/${complaint.imageUrl}` }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ) : (
            <Text style={styles.noImageText}>No image attached</Text>
          )}
        </View>

        {/* Status Control Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>⚙️ Update Status</Text>

          <View style={styles.currentStatusRow}>
            <Text style={styles.infoLabel}>Current Status:</Text>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: status.text }]} />
              <Text style={[styles.statusPillText, { color: status.text }]}>
                {complaint.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Text style={styles.selectStatusLabel}>Select new status:</Text>

          <Text style={styles.selectStatusLabel}>
            {next ? 'Next Status:' : 'Status Workflow Complete'}
          </Text>

          {next ? (
            <>
              <TouchableOpacity
                style={[
                  styles.statusOptionBtn,
                  activeStatusSelection === next && styles.activeStatusOptionBtn,
                ]}
                disabled={updating}
                onPress={() => setSelectedStatus(next)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    activeStatusSelection === next &&
                    styles.activeStatusOptionText,
                  ]}
                >
                  {next.replace('_', ' ')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.updateStatusButton,
                  (!isStatusChanged || updating) && styles.disabledUpdateButton,
                ]}
                disabled={!isStatusChanged || updating}
                onPress={handleUpdateStatus}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateStatusButtonText}>
                    {isStatusChanged
                      ? 'Update Status'
                      : 'Select a Status to Update'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.workflowCompleteText}>
              This complaint has completed the status workflow.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B' },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  backButton: { marginTop: 15, backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  header: { backgroundColor: '#1E293B', paddingHorizontal: 20, paddingTop: 25, paddingBottom: 20 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: '#38BDF8', fontSize: 14, fontWeight: 'bold' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  complaintIdHeader: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  container: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  cardSectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  categoryPill: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryPillText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityPillText: { fontSize: 11, fontWeight: '800' },
  complaintTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  descriptionLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginTop: 4 },
  descriptionText: { fontSize: 14, color: '#334155', lineHeight: 22, marginTop: 4, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  imageContainer: { alignItems: 'center' },
  imageToggleButton: { backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
  imageToggleButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  attachedImage: { width: '100%', height: 250, borderRadius: 12, marginTop: 12 },
  noImageText: { color: '#94A3B8', fontStyle: 'italic', fontSize: 14 },
  currentStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusPillText: { fontSize: 12, fontWeight: '800' },
  selectStatusLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  statusButtonsContainer: { flexDirection: 'column', gap: 10 },
  statusOptionBtn: { backgroundColor: '#F1F5F9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  statusOptionText: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  activeStatusOptionText: { color: '#0F172A' },
  updateStatusButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledUpdateButton: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  updateStatusButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeStatusOptionBtn: {
    backgroundColor: '#E8F0FF',
    borderColor: '#2563EB',
  },

  workflowCompleteText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
