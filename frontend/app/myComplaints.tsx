import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
    TouchableOpacity
} from "react-native";

type Complaint = {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
    updatedAt: string;
    imageUrl: string;
};

export default function MyComplaints() {

    const { userId, name } = useLocalSearchParams();

    console.log("userid and name : ", userId, name);

    const API_URL = process.env.EXPO_PUBLIC_API_BASE;

    console.log("\n api url : ", API_URL)

    const API_BASE = `${API_URL}/api/complaints/getMyComplaint/${userId}`;

    console.log("\napi base : ", API_BASE);

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [image, SetImage] = useState(null);
    const [showImageId, setShowImageId] = useState<number | null>(null);



    const fetchComplaints = async () => {
        try {
            const response = await fetch(
                API_BASE,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch complaints");
            }

            const data = await response.json();
            console.log(data);
            setComplaints(data);
            setError(false);

        } catch (err) {
            console.log("Fetch complaints error:", err);
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [userId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchComplaints();
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "PENDING": return { bg: "#FFF4E5", text: "#B8710A" };
            case "IN_PROGRESS": return { bg: "#E8F0FF", text: "#2563EB" };
            case "RESOLVED": return { bg: "#E7F8EE", text: "#1D9A5C" };
            default: return { bg: "#F0F2F6", text: "#465267" };
        }
    };

    const priorityColor = (priority: string) => {
        switch (priority) {
            case "LOW": return { bg: "#EEF6FF", text: "#3B82F6" };
            case "MEDIUM": return { bg: "#FFF7E5", text: "#D97706" };
            case "HIGH": return { bg: "#FDECEC", text: "#DC2626" };
            default: return { bg: "#F0F2F6", text: "#465267" };
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <View style={styles.centerScreen}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading your complaints...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerScreen}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorSubtitle}>
                    Unable to load your complaints. Pull down to try again.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>

            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Complaints</Text>
                <Text style={styles.pageSubtitle}>
                    {complaints.length} complaint{complaints.length !== 1 ? "s" : ""} submitted
                </Text>
            </View>


            {/* <View>
                <TouchableOpacity style={styles.dashboardText} onPress={() => {
                    router.replace("/dashboard")}
                }>
                    
                    <Text>DashBoard</Text>
                    </TouchableOpacity>   
            </View> */}

            {complaints.length === 0 ? (
                <View style={styles.centerScreen}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>No complaints yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Complaints you submit will show up here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={complaints}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => {
                        console.log('Complaint image field:', item.imageUrl);   // ADD THIS LINE
                        const status = statusColor(item.status);
                        const priority = priorityColor(item.priority);

                        return (
                            <View style={styles.card}>

                                <View style={styles.cardTopRow}>
                                    <View style={styles.categoryPill}>
                                        <Text style={styles.categoryPillText}>
                                            {item.category || "General"}
                                        </Text>
                                    </View>

                                    <View style={[styles.priorityPill, { backgroundColor: priority.bg }]}>
                                        <Text style={[styles.priorityPillText, { color: priority.text }]}>
                                            {item.priority}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.cardTitle}>{item.title}</Text>

                                <Text style={styles.cardDescription} numberOfLines={3}>
                                    {item.description}
                                </Text>

                                <View style={styles.divider} />

                                <View style={styles.cardBottomRow}>
                                    <View>
                                        <Text style={styles.dateLabel}>Submitted</Text>
                                        <Text style={styles.dateValue}>{formatDate(item.createdAt)}</Text>
                                    </View>

                                    <View>
                                        <Text style={styles.dateLabel}>Last updated</Text>
                                        <Text style={styles.dateValue}>{formatDate(item.updatedAt)}</Text>
                                    </View>

                                    <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                                        <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                                        <Text style={[styles.statusPillText, { color: status.text }]}>
                                            {item.status.replace("_", " ")}
                                        </Text>
                                    </View>
                                </View>



                                {/* Image Button */}
                                {item.imageUrl && (
                                    <>
                                        <Text
                                            style={styles.buttonText}
                                            onPress={() => {
                                                setShowImageId(
                                                    showImageId === item.id ? null : item.id
                                                );
                                            }}
                                        >
                                            {showImageId === item.id ? "Hide Image" : "View Image"}
                                        </Text>

                                        {/* Show image only when button is pressed */}
                                        {showImageId === item.id && (
                                            <Image
                                                source={{
                                                    uri: `${API_URL}/uploads/${item.imageUrl}`,
                                                }}
                                                style={{
                                                    width: "100%",
                                                    height: 200,
                                                    borderRadius: 12,
                                                    marginTop: 12,
                                                }}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </>
                                )}

                            </View>

                        );
                    }}
                />
            )}
            <TouchableOpacity style={styles.backButton} onPress={() =>
                router.replace({ pathname: "/dashboard", params: { userId  , name} })

            }> <Text style={styles.backButtonText}>← Back</Text> </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#ccced4" },
    centerScreen: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30, backgroundColor: "#f1eeee" },
    loadingText: { marginTop: 12, fontSize: 14, color: "#f0f1f4" },
    errorIcon: { fontSize: 40, marginBottom: 10 },
    errorTitle: { fontSize: 18, fontWeight: "800", color: "#172033", marginBottom: 6 },
    errorSubtitle: { fontSize: 13, color: "#758197", textAlign: "center" },
    emptyIcon: { fontSize: 46, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: "#172033", marginBottom: 6 },
    emptySubtitle: { fontSize: 13, color: "#eff0f2", textAlign: "center" },
    greeting: { fontSize: 13, color: "#f9fbf6", marginBottom: 4, fontWeight: "600" },
    pageSubtitle: { fontSize: 13, color: "#310ab1", marginTop: 4 },
    listContent: { padding: 18, paddingBottom: 40 },
    backButton: {
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E7EF',
        marginVertical: 20
    },

    backButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2563EB',
    },
    card: {
        backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, marginBottom: 14,
        borderWidth: 1, borderColor: "#EEF1F5",
        shadowColor: "#18243A", shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04, shadowRadius: 10, elevation: 1,
    },
    cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    categoryPill: { backgroundColor: "#EEF5FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    categoryPillText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
    priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    priorityPillText: { fontSize: 10.5, fontWeight: "800" },
    cardTitle: { fontSize: 16, fontWeight: "800", color: "#172033", marginBottom: 6 },
    cardDescription: { fontSize: 13, lineHeight: 19, color: "#5B6472", marginBottom: 12 },
    divider: { height: 1, backgroundColor: "#EEF1F5", marginBottom: 12 },
    cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dateLabel: { fontSize: 10, color: "#A1AAB8", marginBottom: 2 },
    dateValue: { fontSize: 12, fontWeight: "700", color: "#465267" },
    statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusPillText: { fontSize: 10.5, fontWeight: "800" },
    buttonText: {
        height: 20,
        marginTop: 17,
        backgroundColor: '#01050d',
        borderRadius: 15,
        color: '#f5efef',
        alignSelf: 'center',
        textAlign: 'center',
        width: '15%',
        shadowColor: '#2563EB',
        shadowOffset: {
            width: 5,
            height: 6,
        },
        shadowOpacity: 0.20,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: "#aeb7dd",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#18243A",
        shadowOffset: { width: 10, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        alignItems: "flex-start",   // ensures left alignment
    },

    pageTitle: {
        fontSize: 40,              // bigger
        fontWeight: "800",
        color: "#082668",
        letterSpacing: -0.5,
        textAlign: "left",
    },
    dashboardText: {
        backgroundColor: "#f0e8e8",
        color: "#0c0101",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#18243A",
        borderRadius: 15,


    }
});