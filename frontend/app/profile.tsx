import { apiFetch, API_BASE_URL } from "@/constants/api";
import { getUserId } from "@/utils/authStorage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, StyleSheet, TouchableOpacity } from "react-native";

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
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const getProfile = async () => {
        const userId = await getUserId();
        try {
            console.log("Fetching profile for user:", userId);
            const response = await apiFetch(`/api/users/getProfile/${userId}`);

            console.log("Profile response status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.log("Profile Api Error : ", errorData);
                throw new Error(errorData.message || "Failed to Load Profile");
            }
            const data = await response.json();
            console.log("Profile data:", data);

            setProfile(data);
        } catch (error) {
            console.log("Fetch profile error : ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text style={{ color: '#ffffff', fontSize: 16 }}>Could not load profile</Text>
            </View>
        );
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: "2-digit", month: "short", year: "numeric" });

    const photoFileName = profile.profilePhoto || profile.profilePhotoPath;

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {photoFileName && !imageError ? (
                        <Image
                            source={{
                                uri: `${API_BASE_URL}/uploads/profiles/${photoFileName}`,
                            }}
                            style={styles.profileImage}
                            onError={(e) => {
                                console.log("Failed to load profile photo:", e.nativeEvent);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                        </Text>
                    )}
                </View>

                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.role}>{profile.role}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{profile.email}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Department</Text>
                    <Text style={styles.value}>{profile.department || '-'}</Text>
                </View>
                {profile.division && (
                    <>
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.label}>Division</Text>
                            <Text style={styles.value}>Division {profile.division}</Text>
                        </View>
                    </>
                )}
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Joined</Text>
                    <Text style={styles.value}>{formatDate(profile.createdAt)}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/dashboard")}>
                <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#2a52a2', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e7e9ec',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    name: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    role: { fontSize: 13, color: '#CBD5E1', marginTop: 4, textTransform: 'capitalize' },
    card: {
        backgroundColor: '#f9faf5',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#EEF1F5',
    },
    row: { paddingVertical: 12 },
    label: { fontSize: 12, color: '#475569', marginBottom: 4 },
    value: { fontSize: 15, fontWeight: '700', color: '#172033' },
    divider: { height: 1, backgroundColor: '#E2E8F0' },
    backButton: {
        marginTop: 30,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        resizeMode: 'cover',
    },
    avatarText: {
        color: '#2a52a2',
        fontSize: 36,
        fontWeight: '800',
    },
});