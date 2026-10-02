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

import { useResponsive } from "@/constants/responsive";
import { apiFetch } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Complaint = {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
    updatedAt: string;
    imageUrl: string;
};

export default function MyComplaints() {

    const { isMobile, isDesktop, isTablet } = useResponsive();



    const API_URL = process.env.EXPO_PUBLIC_API_BASE;

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [showImageId, setShowImageId] = useState<number | null>(null);

    const [userId , setuserId] = useState<String | null>(null);
    const [name , setname] = useState<String | null>(null);

    useEffect( () => {
        const loadUser = async() => {
            const userId = await AsyncStorage.getItem("userId");
            const name = await AsyncStorage.getItem("name");

              console.log("Global User ID:", userId);
        console.log("Global Name:", name);

        setuserId(userId);
        setname(name);
        };
        loadUser();
    } , [userId]);

    const fetchComplaints = async () => {
    try {

        const response = await apiFetch(`/api/complaints/getMyComplaint/${userId}`);
        console.log(response.json);
        if (!response.ok) {
            let errorMessage = "Failed to fetch complaints";

            try {
                const errorData = await response.json();
                console.log("API ERROR STATUS:", response.status);
                console.log("API ERROR DATA:", errorData);
                errorMessage = errorData.message || errorMessage;
            } catch {
                console.log("API ERROR STATUS:", response.status);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Complaints:", data);

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

useEffect(()  => {
    fetchComplaints();
} ,[userId] );

    const statusColor = (status: string) => {
        switch (status) {
            case "ASSIGNED":
                return { bg: "#FFF4E5", text: "#B8710A" };

            case "IN_PROGRESS":
                return { bg: "#E8F0FF", text: "#2563EB" };

            case "RESOLVED":
                return { bg: "#E7F8EE", text: "#1D9A5C" };

            default:
                return { bg: "#F0F2F6", text: "#465267" };
        }
    };

    const priorityColor = (priority: string) => {
        switch (priority) {
            case "LOW":
                return { bg: "#EEF6FF", text: "#3B82F6" };

            case "MEDIUM":
                return { bg: "#FFF7E5", text: "#D97706" };

            case "HIGH":
                return { bg: "#FDECEC", text: "#DC2626" };

            default:
                return { bg: "#F0F2F6", text: "#465267" };
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
                <ActivityIndicator
                    size="large"
                    color="#2563EB"
                />

                <Text style={styles.loadingText}>
                    Loading your complaints...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerScreen}>
                <Text style={styles.errorIcon}>
                    ⚠️
                </Text>

                <Text style={styles.errorTitle}>
                    Something went wrong
                </Text>

                <Text style={styles.errorSubtitle}>
                    Unable to load your complaints. Pull down to try again.
                </Text>
            </View>
        );
    }

    function onRefresh(): void {
        setRefreshing(true);
        fetchComplaints();
    }

    return (
        <View style={styles.screen}>

            {/* HEADER */}
            <View
                style={[
                    styles.header,
                    isMobile && styles.mobileHeader,
                    isTablet && styles.tabletHeader,
                    isDesktop && styles.desktopHeader,
                ]}
            >
                <Text
                    style={[
                        styles.pageTitle,
                        isMobile && styles.mobilePageTitle,
                        isTablet && styles.tabletPageTitle,
                        isDesktop && styles.desktopPageTitle,
                    ]}
                >
                    My Complaints
                </Text>

                <Text
                    style={[
                        styles.pageSubtitle,
                        isMobile && styles.mobilePageSubtitle,
                    ]}
                >
                    {complaints.length} complaint
                    {complaints.length !== 1 ? "s" : ""} submitted
                </Text>
            </View>

            {/* COMPLAINT LIST */}
            {complaints.length === 0 ? (

                <View
                    style={[
                        styles.emptyContainer,
                        isMobile && styles.mobileEmptyContainer,
                        isDesktop && styles.desktopEmptyContainer,
                    ]}
                >
                    <Text style={styles.emptyIcon}>
                        📭
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No complaints yet
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        Complaints you submit will show up here.
                    </Text>
                </View>

            ) : (

                <FlatList
                    data={complaints}
                    keyExtractor={(item) => String(item.id)}

                    contentContainerStyle={[
                        styles.listContent,
                        isMobile && styles.mobileListContent,
                        isTablet && styles.tabletListContent,
                        isDesktop && styles.desktopListContent,
                    ]}

                    showsVerticalScrollIndicator={false}

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }

                    renderItem={({ item }) => {

                        console.log(
                            "Complaint image field:",
                            item.imageUrl
                        );

                        const status = statusColor(item.status);
                        const priority = priorityColor(item.priority);

                        return (
                            <View
                                style={[
                                    styles.card,
                                    isMobile && styles.mobileCard,
                                    isTablet && styles.tabletCard,
                                    isDesktop && styles.desktopCard,
                                ]}
                            >

                                {/* TOP ROW */}
                                <View
                                    style={[
                                        styles.cardTopRow,
                                        isMobile && styles.mobileCardTopRow,
                                    ]}
                                >
                                    <View style={styles.categoryPill}>
                                        <Text style={styles.categoryPillText}>
                                            {item.category || "General"}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.priorityPill,
                                            {
                                                backgroundColor: priority.bg,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.priorityPillText,
                                                {
                                                    color: priority.text,
                                                },
                                            ]}
                                        >
                                            {item.priority}
                                        </Text>
                                    </View>
                                </View>

                                {/* TITLE */}
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        isMobile && styles.mobileCardTitle,
                                        isDesktop && styles.desktopCardTitle,
                                    ]}
                                >
                                    {item.title}
                                </Text>

                                {/* DESCRIPTION */}
                                <Text
                                    style={[
                                        styles.cardDescription,
                                        isMobile && styles.mobileCardDescription,
                                    ]}
                                    numberOfLines={3}
                                >
                                    {item.description}
                                </Text>

                                <View style={styles.divider} />

                                {/* BOTTOM INFORMATION */}
                                <View
                                    style={[
                                        styles.cardBottomRow,
                                        isMobile && styles.mobileCardBottomRow,
                                        isTablet && styles.tabletCardBottomRow,
                                    ]}
                                >

                                    <View style={styles.dateBlock}>
                                        <Text style={styles.dateLabel}>
                                            Submitted
                                        </Text>

                                        <Text style={styles.dateValue}>
                                            {formatDate(item.createdAt)}
                                        </Text>
                                    </View>

                                    <View style={styles.dateBlock}>
                                        <Text style={styles.dateLabel}>
                                            Last updated
                                        </Text>

                                        <Text style={styles.dateValue}>
                                            {formatDate(item.updatedAt)}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.statusPill,
                                            {
                                                backgroundColor: status.bg,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.statusDot,
                                                {
                                                    backgroundColor: status.text,
                                                },
                                            ]}
                                        />

                                        <Text
                                            style={[
                                                styles.statusPillText,
                                                {
                                                    color: status.text,
                                                },
                                            ]}
                                        >
                                            {item.status.replace("_", " ")}
                                        </Text>
                                    </View>

                                </View>

                                {/* IMAGE BUTTON */}
                                {item.imageUrl && (
                                    <>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[
                                                styles.imageButton,
                                                isMobile && styles.mobileImageButton,
                                            ]}
                                            onPress={() => {
                                                setShowImageId(
                                                    showImageId === item.id
                                                        ? null
                                                        : item.id
                                                );
                                            }}
                                        >
                                            <Text style={styles.imageButtonText}>
                                                {showImageId === item.id
                                                    ? "Hide Image"
                                                    : "View Image"}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* IMAGE */}
                                        {showImageId === item.id && (
                                            <Image
                                                source={{
                                                    uri: `${API_URL}/uploads/${item.imageUrl}`,
                                                }}
                                                style={[
                                                    styles.complaintImage,
                                                    isMobile && styles.mobileComplaintImage,
                                                    isDesktop && styles.desktopComplaintImage,
                                                ]}
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

            {/* BACK BUTTON */}
            <TouchableOpacity
                style={[
                    styles.backButton,
                    isMobile && styles.mobileBackButton,
                    isTablet && styles.tabletBackButton,
                    isDesktop && styles.desktopBackButton,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                    router.replace({
                        pathname: "/dashboard",
                    })
                }
            >
                <Text style={styles.backButtonText}>
                    ← Back
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    // =====================================================
    // SCREEN
    // =====================================================

    screen: {
        flex: 1,
        backgroundColor: "#F5F7FB",
    },

    centerScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: "#F5F7FB",
    },

    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#465267",
    },

    errorIcon: {
        fontSize: 40,
        marginBottom: 10,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#172033",
        marginBottom: 6,
    },

    errorSubtitle: {
        fontSize: 13,
        color: "#758197",
        textAlign: "center",
    },

    // =====================================================
    // EMPTY
    // =====================================================

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    mobileEmptyContainer: {
        paddingHorizontal: 20,
    },

    desktopEmptyContainer: {
        maxWidth: 700,
        alignSelf: "center",
        width: "100%",
    },

    emptyIcon: {
        fontSize: 46,
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#172033",
        marginBottom: 6,
    },

    emptySubtitle: {
        fontSize: 13,
        color: "#758197",
        textAlign: "center",
    },

    // =====================================================
    // HEADER
    // =====================================================

    header: {
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: "#AEB7DD",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#18243A",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        alignItems: "flex-start",
    },

    mobileHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 17,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },

    tabletHeader: {
        paddingHorizontal: 35,
        paddingTop: 22,
        paddingBottom: 22,
    },

    desktopHeader: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        paddingHorizontal: 35,
        paddingTop: 25,
        paddingBottom: 25,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },

    pageTitle: {
        fontSize: 40,
        fontWeight: "800",
        color: "#082668",
        letterSpacing: -0.5,
        textAlign: "left",
    },

    mobilePageTitle: {
        fontSize: 25,
    },

    tabletPageTitle: {
        fontSize: 32,
    },

    desktopPageTitle: {
        fontSize: 38,
    },

    pageSubtitle: {
        fontSize: 13,
        color: "#310AB1",
        marginTop: 4,
    },

    mobilePageSubtitle: {
        fontSize: 11.5,
    },

    // =====================================================
    // LIST
    // =====================================================

    listContent: {
        padding: 18,
        paddingBottom: 40,
    },

    mobileListContent: {
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 25,
    },

    tabletListContent: {
        width: "100%",
        maxWidth: 850,
        alignSelf: "center",
        paddingHorizontal: 25,
        paddingTop: 20,
    },

    desktopListContent: {
        width: "100%",
        maxWidth: 1000,
        alignSelf: "center",
        paddingHorizontal: 30,
        paddingTop: 25,
        paddingBottom: 45,
    },

    // =====================================================
    // CARD
    // =====================================================

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#EEF1F5",
        shadowColor: "#18243A",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 1,
    },

    mobileCard: {
        padding: 13,
        borderRadius: 15,
        marginBottom: 12,
    },

    tabletCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },

    desktopCard: {
        padding: 22,
        borderRadius: 20,
        marginBottom: 18,
    },

    // =====================================================
    // CARD TOP
    // =====================================================

    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    mobileCardTopRow: {
        marginBottom: 8,
    },

    categoryPill: {
        backgroundColor: "#EEF5FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        maxWidth: "65%",
    },

    categoryPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563EB",
    },

    priorityPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },

    priorityPillText: {
        fontSize: 10.5,
        fontWeight: "800",
    },

    // =====================================================
    // CARD CONTENT
    // =====================================================

    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#172033",
        marginBottom: 6,
    },

    mobileCardTitle: {
        fontSize: 15,
    },

    desktopCardTitle: {
        fontSize: 18,
    },

    cardDescription: {
        fontSize: 13,
        lineHeight: 19,
        color: "#5B6472",
        marginBottom: 12,
    },

    mobileCardDescription: {
        fontSize: 12.5,
        lineHeight: 18,
    },

    divider: {
        height: 1,
        backgroundColor: "#EEF1F5",
        marginBottom: 12,
    },

    // =====================================================
    // CARD BOTTOM
    // =====================================================

    cardBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    mobileCardBottomRow: {
        flexWrap: "wrap",
        gap: 12,
    },

    tabletCardBottomRow: {
        gap: 15,
    },

    dateBlock: {
        flexShrink: 1,
    },

    dateLabel: {
        fontSize: 10,
        color: "#A1AAB8",
        marginBottom: 2,
    },

    dateValue: {
        fontSize: 12,
        fontWeight: "700",
        color: "#465267",
    },

    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },

    statusPillText: {
        fontSize: 10.5,
        fontWeight: "800",
    },

    // =====================================================
    // IMAGE BUTTON
    // =====================================================

    imageButton: {
        marginTop: 15,
        alignSelf: "center",
        backgroundColor: "#172033",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 9,
        minWidth: 110,
        alignItems: "center",
        justifyContent: "center",
    },

    mobileImageButton: {
        width: "100%",
        marginTop: 14,
    },

    imageButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },

    // =====================================================
    // IMAGE
    // =====================================================

    complaintImage: {
        width: "100%",
        height: 220,
        borderRadius: 12,
        marginTop: 12,
    },

    mobileComplaintImage: {
        height: 190,
        borderRadius: 10,
    },

    desktopComplaintImage: {
        height: 320,
    },

    // =====================================================
    // BACK BUTTON
    // =====================================================

    backButton: {
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E7EF",
        marginVertical: 20,
        paddingHorizontal: 25,
        paddingVertical: 11,
    },

    mobileBackButton: {
        width: "90%",
        marginVertical: 14,
    },

    tabletBackButton: {
        paddingHorizontal: 35,
    },

    desktopBackButton: {
        paddingHorizontal: 40,
        paddingVertical: 12,
    },

    backButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#2563EB",
    },

    // =====================================================
    // UNUSED / FUTURE DASHBOARD STYLE
    // =====================================================

    dashboardText: {
        backgroundColor: "#F0E8E8",
        color: "#0C0101",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#18243A",
        borderRadius: 15,
    },
});


