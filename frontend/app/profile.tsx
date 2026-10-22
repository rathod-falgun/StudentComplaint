import { apiFetch, API_BASE_URL } from "@/constants/api";
import { getUserId, getToken } from "@/utils/authStorage";
import { router } from "expo-router";
import { File } from 'expo-file-system';
import { fetch as expoFetch } from "expo/fetch";
import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeColors } from "@/constants/theme";

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

export default function Profile() {
    const { colors, isDark } = useAppTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showPickerModal, setShowPickerModal] = useState(false);

    const getProfile = async () => {
        const userId = await getUserId();
        if (!userId) {
            console.log("No userId found in storage for profile");
            setLoading(false);
            return;
        }

        try {
            console.log("Fetching profile for user:", userId);
            const response = await apiFetch(`/api/users/getProfile/${userId}`);

            console.log("Profile response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("Profile Api Error : ", errorData);
                throw new Error(errorData.message || "Failed to Load Profile");
            }
            const data = await response.json().catch(() => null);
            if (data) {
                console.log("Profile data:", data);
                setProfile(data);
            }
        } catch (error) {
            console.log("Fetch profile error : ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const pickImage = async (mode: 'camera' | 'library') => {
        setShowPickerModal(false);
        try {
            if (mode === 'camera') {
                const perm = await ImagePicker.requestCameraPermissionsAsync();
                if (!perm.granted) {
                    Alert.alert("Permission Required", "Camera permission is required to capture a photo.");
                    return;
                }
                const result = await ImagePicker.launchCameraAsync({
                    quality: 0.8,
                });
                console.log("Camera result:", result);
                if (!result.canceled && result.assets && result.assets[0]?.uri) {
                    await uploadPhoto(result.assets[0].uri);
                }
            } else {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) {
                    Alert.alert("Permission Required", "Media library permission is required to select a photo.");
                    return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                });
                console.log("Library result:", result);
                if (!result.canceled && result.assets && result.assets[0]?.uri) {
                    await uploadPhoto(result.assets[0].uri);
                }
            }
        } catch (err) {
            console.log("Image picker error:", err);
            Alert.alert("Error", "Could not open camera or gallery. Please try again.");
        }
    };

    const uploadPhoto = async (imageUri: string) => {
        const userId = await getUserId();
        if (!userId) {
            Alert.alert("Error", "User session not found. Please log in again.");
            return;
        }

        console.log("Uploading photo for userId:", userId, "URI:", imageUri);
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || `avatar_${Date.now()}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? match[1].toLowerCase() : 'jpg';
            const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

            if (Platform.OS === 'web') {
                const photoResponse = await fetch(imageUri);
                const blob = await photoResponse.blob();
                const webFile = new (globalThis as any).File([blob], filename, { type: blob.type || mimeType });
                formData.append('photo', webFile);
                formData.append('profilePhoto', webFile);
            } else {
                const file = new File(imageUri);
                formData.append('photo', file as unknown as Blob);
                formData.append('profilePhoto', file as unknown as Blob);
            }

            const token = await getToken();
            const response = await expoFetch(`${API_BASE_URL}/api/users/${userId}/photo`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            console.log("Upload photo response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("Upload error data:", errorData);
                throw new Error(errorData.message || `Failed to update profile photo (${response.status})`);
            }

            const data: UserProfile = await response.json();
            console.log("Updated profile photo response:", data);

            // Append timestamp cache-buster so React Native and Web immediately reload and render the new image
            const freshUrl = (data.profilePhoto || data.profilePhotoPath || imageUri) + `?t=${Date.now()}`;
            setProfile((prev) =>
                prev
                    ? {
                        ...prev,
                        profilePhoto: freshUrl,
                        profilePhotoPath: freshUrl,
                    }
                    : data
            );
            setImageError(false);

            if (Platform.OS === 'web') {
                window.alert("Profile photo updated successfully!");
            } else {
                Alert.alert("Success", "Profile photo updated successfully!");
            }
        } catch (err: any) {
            console.log("Upload photo error:", err);
            Alert.alert("Upload Failed", err.message || "Could not update profile photo. Please try again.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.center}>
                    <StatusBar barStyle="light-content" backgroundColor="#121216" />
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.center}>
                    <StatusBar barStyle="light-content" backgroundColor="#121216" />
                    <View style={styles.errorIconBox}>
                        <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
                    </View>
                    <Text style={styles.errorTitle}>Could not load profile</Text>
                    <Text style={styles.errorSubtitle}>Please verify your internet connection or login again.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={getProfile} activeOpacity={0.8}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: "2-digit", month: "short", year: "numeric" });

    const photoFileName = profile.profilePhoto || profile.profilePhotoPath;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor="#121216" />

            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={styles.navBackButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Back to dashboard"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.navTitle}>Student Profile</Text>

                <View style={styles.navSpacer}>
                    <ThemeToggle compact />
                </View>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.containerMax}>

                    {/* Hero Card */}
                    <View style={styles.heroCard}>
                        {/* Avatar with Glow and Update Badge */}
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity
                                style={styles.avatarTouch}
                                activeOpacity={0.85}
                                onPress={() => setShowPickerModal(true)}
                                disabled={uploadingPhoto}
                                accessibilityRole="button"
                                accessibilityLabel="Change profile photo"
                            >
                                {photoFileName && !imageError ? (
                                    <Image
                                        source={{ uri: photoFileName }}
                                        style={styles.avatarImage}
                                        contentFit="cover"
                                        transition={200}
                                        onError={(e) => {
                                            console.log("Failed to load profile photo:", e);
                                            setImageError(true);
                                        }}
                                    />
                                ) : (
                                    <View style={styles.avatarFallback}>
                                        <Text style={styles.avatarInitial}>
                                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                                        </Text>
                                    </View>
                                )}

                                {uploadingPhoto && (
                                    <View style={styles.avatarUploadingOverlay}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Badge Icon on Border */}
                            <TouchableOpacity
                                style={styles.cameraBadge}
                                activeOpacity={0.8}
                                onPress={() => setShowPickerModal(true)}
                                disabled={uploadingPhoto}
                                accessibilityRole="button"
                                accessibilityLabel="Update photo"
                            >
                                <Ionicons name="camera" size={15} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Name & Role */}
                        <Text style={styles.heroName}>{profile.name}</Text>

                        <View style={styles.roleBadgeRow}>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>{profile.role || "STUDENT"}</Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                                <Text style={styles.verifiedBadgeText}>Verified</Text>
                            </View>
                        </View>

                        <Text style={styles.avatarHint}>Tap avatar to update picture</Text>
                    </View>

                    {/* Academic Details Card */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="school-outline" size={18} color="#3B82F6" />
                            <Text style={styles.sectionTitle}>Academic Information</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="business-outline" size={16} color="#60A5FA" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Department</Text>
                                <Text style={styles.infoValue}>{profile.department || "General Engineering"}</Text>
                            </View>
                        </View>

                        {profile.division && (
                            <>
                                <View style={styles.rowDivider} />
                                <View style={styles.infoRow}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="people-outline" size={16} color="#60A5FA" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Division</Text>
                                        <Text style={styles.infoValue}>Division {profile.division}</Text>
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.rowDivider} />
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="location-outline" size={16} color="#60A5FA" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Institution</Text>
                                <Text style={styles.infoValue}>SCET College Campus</Text>
                            </View>
                        </View>
                    </View>

                    {/* Account Details Card */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-circle-outline" size={18} color="#3B82F6" />
                            <Text style={styles.sectionTitle}>Account Credentials</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="mail-outline" size={16} color="#60A5FA" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Official College Email</Text>
                                <Text style={styles.infoValue}>{profile.email}</Text>
                            </View>
                        </View>

                        <View style={styles.rowDivider} />
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="calendar-outline" size={16} color="#60A5FA" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Enrolled Since</Text>
                                <Text style={styles.infoValue}>{formatDate(profile.createdAt)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Back to Dashboard Button */}
                    <TouchableOpacity
                        style={styles.backDashboardBtn}
                        activeOpacity={0.85}
                        onPress={() => router.replace("/dashboard")}
                    >
                        <Ionicons name="home-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.backDashboardBtnText}>Back to Dashboard</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Photo Selection Modal - Minimal Premium Dark Theme */}
            <Modal
                visible={showPickerModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPickerModal(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setShowPickerModal(false)}>
                    <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalSheetTitle}>Change Profile Photo</Text>
                            <Text style={styles.modalSheetSubtitle}>Upload a new photo for your student ID</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalOption}
                            activeOpacity={0.75}
                            onPress={() => pickImage('camera')}
                        >
                            <View style={[styles.modalOptionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Ionicons name="camera" size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.modalOptionCopy}>
                                <Text style={styles.modalOptionHeading}>Take Photo</Text>
                                <Text style={styles.modalOptionCaption}>Capture directly using your camera</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            activeOpacity={0.75}
                            onPress={() => pickImage('library')}
                        >
                            <View style={[styles.modalOptionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                <Ionicons name="images" size={20} color="#10B981" />
                            </View>
                            <View style={styles.modalOptionCopy}>
                                <Text style={styles.modalOptionHeading}>Choose from Gallery</Text>
                                <Text style={styles.modalOptionCaption}>Select existing photo from device library</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalDismissBtn}
                            activeOpacity={0.75}
                            onPress={() => setShowPickerModal(false)}
                        >
                            <Text style={styles.modalDismissBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
        </SafeAreaView>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    screen: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
        padding: 24,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 12,
        fontWeight: '500',
    },
    errorIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    errorTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    errorSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        maxWidth: 280,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: colors.accent,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    /* Navigation Bar */
    navBar: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.bgPrimary,
    },
    navBackButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: colors.cardBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    navSpacer: {
        width: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Scrollable Container */
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 36,
        alignItems: 'center',
    },
    containerMax: {
        width: '100%',
        maxWidth: 540,
    },

    /* Hero Card */
    heroCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 16,
        ...Platform.select({
            web: { boxShadow: isDark ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 4px 16px rgba(0, 0, 0, 0.06)' } as any,
            default: { elevation: 3 },
        }),
    },
    avatarWrapper: {
        position: 'relative',
        width: 108,
        height: 108,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatarTouch: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: colors.bgSecondary,
        borderWidth: 2.5,
        borderColor: colors.accent,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
    },
    avatarUploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.accent,
        borderWidth: 2.5,
        borderColor: colors.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)' } as any,
            default: { elevation: 4 },
        }),
    },
    heroName: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    roleBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    roleBadge: {
        backgroundColor: colors.accentSoft,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
    },
    roleBadgeText: {
        color: colors.accent,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.6,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0',
    },
    verifiedBadgeText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '700',
    },
    avatarHint: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: 10,
        fontWeight: '500',
    },

    /* Section Cards */
    sectionCard: {
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 14,
        ...Platform.select({
            web: { boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)' } as any,
            default: { elevation: 2 },
        }),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.accentSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    rowDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 2,
    },

    /* Action Buttons */
    backDashboardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        height: 48,
        marginTop: 6,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    backDashboardBtnText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },

    /* Modal */
    modalBackdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalSheet: {
        width: '100%',
        maxWidth: 390,
        backgroundColor: colors.cardBg,
        borderRadius: 22,
        padding: 22,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...Platform.select({
            web: { boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' } as any,
            default: { elevation: 8 },
        }),
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        marginBottom: 18,
    },
    modalSheetTitle: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '800',
    },
    modalSheetSubtitle: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: 14,
        padding: 13,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalOptionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    modalOptionCopy: {
        flex: 1,
    },
    modalOptionHeading: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    modalOptionCaption: {
        color: colors.textSecondary,
        fontSize: 11,
        marginTop: 2,
    },
    modalDismissBtn: {
        height: 46,
        borderRadius: 12,
        backgroundColor: colors.bgTertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalDismissBtnText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '700',
    },
});