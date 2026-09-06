import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import { View,Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

const API_BASE = 'http://10.122.90.235:8081';

type UserProfile = {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    createdAt: string;
}

export default function Profile() {

    const { userId } = useLocalSearchParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/users/getProfile/${userId}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(() => setProfile(null))
            .finally(() => setloading(false));
    }, [userId])
    if (loading) {
        return (
            <View style={styles.Center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }
    if (!profile) {
        return (
            <View style={styles.Center}>
                <Text> Could not Load Profile</Text>

            </View>
        );
    }
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { day: "2-digit", month: "short", year: "numeric" });

    return (
        <View style={styles.screen}>

            <View style={styles.header}>
<Text style={styles.avatarText}>
    {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
</Text>  
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
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Joined</Text>
                    <Text style={styles.value}>{formatDate(profile.createdAt)}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#2a52a2', padding: 20 },
    Center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 30,borderColor:'black' },
    avatar: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    avatarText: { color: '#141313', fontSize: 32, fontWeight: '800' },
    name: { fontSize: 22, fontWeight: '800', color: '#172033' },
    role: { fontSize: 13, color: '#8A95A6', marginTop: 4, textTransform: 'capitalize' },
    card: {
        backgroundColor: '#f9faf5', borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: '#EEF1F5',
    },
    row: { paddingVertical: 12 },
    label: { fontSize: 12, color: '#00060e', marginBottom: 4 },
    value: { fontSize: 15, fontWeight: '700', color: '#172033' },
    divider: { height: 1, backgroundColor: '#0f0f0f' },
    backButton: {
        marginTop: 30, height: 50, borderRadius: 14, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
    },
    backButtonText: { color: '#e3cece', fontSize: 15, fontWeight: '800' },
});