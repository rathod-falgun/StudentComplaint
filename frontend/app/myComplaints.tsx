import React, { useEffect, useState, useCallback, useMemo } from "react";
import { router } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useResponsive } from "@/constants/responsive";
import { apiFetch, API_BASE_URL } from "@/constants/api";
import { getUserId } from "@/utils/authStorage";

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
    deadline?: string;
    isOverdue?: boolean;
    slaHours?: number;
};

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

type ComplaintCardProps = {
    item: Complaint;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
};

// =====================================================
// MEMOIZED COMPLAINT CARD
// Encapsulates its own image toggle state so toggling view/hide
// does NOT re-render any other complaint in the list.
// =====================================================
const ComplaintCard = React.memo(function ComplaintCard({
    item,
    isMobile,
    isTablet,
    isDesktop,
}: ComplaintCardProps) {
    const [showImage, setShowImage] = useState(false);
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
                    <Text style={styles.dateLabel}>Submitted</Text>
                    <Text style={styles.dateValue}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>

                <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>Last updated</Text>
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

            {/* IMAGE BUTTON & VIEW */}
            {item.imageUrl ? (
                <>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.imageButton,
                            isMobile && styles.mobileImageButton,
                        ]}
                        onPress={() => setShowImage((prev) => !prev)}
                    >
                        <Text style={styles.imageButtonText}>
                            {showImage ? "Hide Image" : "View Image"}
                        </Text>
                    </TouchableOpacity>

                    {/* EXPO IMAGE WITH PERSISTENT DISK/MEMORY CACHE */}
                    {showImage && (
                        <Image
                            source={{
                                uri: item.imageUrl, // full Supabase public URL stored in DB
                            }}
                            style={[
                                styles.complaintImage,
                                isMobile && styles.mobileComplaintImage,
                                isDesktop && styles.desktopComplaintImage,
                            ]}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={150}
                        />
                    )}
                </>
            ) : null}
        </View>
    );
});

const STATUS_FILTERS = [
    { key: "ALL", label: "All", icon: "📁" },
    { key: "SUBMITTED", label: "Submitted", icon: "📝" },
    { key: "ASSIGNED", label: "Assigned", icon: "👤" },
    { key: "IN_PROGRESS", label: "In Progress", icon: "⏳" },
    { key: "RESOLVED", label: "Resolved", icon: "✅" },
] as const;

export default function MyComplaints() {
    const { isMobile, isDesktop, isTablet } = useResponsive();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);
    const [userId, setuserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const id = await getUserId();
            console.log("Global User ID:", id);
            setuserId(id);
        };
        loadUser();
    }, []);

    const fetchComplaints = async () => {
        if (!userId) return;
        try {
            const response = await apiFetch(`/api/complaints/getMyComplaint/${userId}`);
            if (!response.ok) {
                let errorMessage = "Failed to fetch complaints";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    console.log("API ERROR STATUS:", response.status);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
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
        if (userId) {
            fetchComplaints();
        }
    }, [userId]);

    // Calculate counts for each status
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {
            ALL: complaints.length,
            SUBMITTED: 0,
            ASSIGNED: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
        };
        complaints.forEach((c) => {
            if (counts[c.status] !== undefined) {
                counts[c.status]++;
            }
        });
        return counts;
    }, [complaints]);

    // Filter complaints based on selected status tab
    const filteredComplaints = useMemo(() => {
        if (selectedStatus === "ALL") {
            return complaints;
        }
        return complaints.filter((c) => c.status === selectedStatus);
    }, [complaints, selectedStatus]);

    const renderComplaintItem = useCallback(
        ({ item }: { item: Complaint }) => (
            <ComplaintCard
                item={item}
                isMobile={isMobile}
                isTablet={isTablet}
                isDesktop={isDesktop}
            />
        ),
        [isMobile, isTablet, isDesktop]
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.centerScreen}>
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text style={styles.loadingText}>
                        Loading your complaints...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            </SafeAreaView>
        );
    }

    function onRefresh(): void {
        setRefreshing(true);
        fetchComplaints();
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                    {selectedStatus === "ALL"
                        ? `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} submitted`
                        : `Showing ${filteredComplaints.length} of ${complaints.length} complaint${complaints.length !== 1 ? "s" : ""}`}
                </Text>
            </View>

            {/* STATUS FILTER ROW (IN ONE ROW) */}
            <View
                style={[
                    styles.filterSection,
                    isMobile && styles.mobileFilterSection,
                    isTablet && styles.tabletFilterSection,
                    isDesktop && styles.desktopFilterSection,
                ]}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.filterScrollContent,
                        isMobile && styles.mobileFilterScrollContent,
                        isTablet && styles.tabletFilterScrollContent,
                        isDesktop && styles.desktopFilterScrollContent,
                    ]}
                >
                    {STATUS_FILTERS.map((filter) => {
                        const isSelected = selectedStatus === filter.key;
                        const count = statusCounts[filter.key] ?? 0;

                        return (
                            <TouchableOpacity
                                key={filter.key}
                                activeOpacity={0.75}
                                style={[
                                    styles.filterChip,
                                    isMobile && styles.mobileFilterChip,
                                    isDesktop && styles.desktopFilterChip,
                                    isSelected && styles.filterChipSelected,
                                ]}
                                onPress={() => setSelectedStatus(filter.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterIcon,
                                        isMobile && styles.mobileFilterIcon,
                                    ]}
                                >
                                    {filter.icon}
                                </Text>
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        isMobile && styles.mobileFilterChipText,
                                        isSelected && styles.filterChipTextSelected,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {filter.label}
                                </Text>
                                <View
                                    style={[
                                        styles.filterCountBadge,
                                        isMobile && styles.mobileFilterCountBadge,
                                        isSelected && styles.filterCountBadgeSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterCountText,
                                            isMobile && styles.mobileFilterCountText,
                                            isSelected && styles.filterCountTextSelected,
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* COMPLAINTS LIST OR EMPTY STATE */}
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
            ) : filteredComplaints.length === 0 ? (
                <View
                    style={[
                        styles.emptyContainer,
                        isMobile && styles.mobileEmptyContainer,
                        isDesktop && styles.desktopEmptyContainer,
                    ]}
                >
                    <Text style={styles.emptyIcon}>
                        🔍
                    </Text>

                    <Text style={styles.emptyTitle}>
                        No {selectedStatus.replace("_", " ").toLowerCase()} complaints
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        You don't have any complaints with status "{selectedStatus.replace("_", " ")}".
                    </Text>

                    <TouchableOpacity
                        style={styles.resetFilterButton}
                        onPress={() => setSelectedStatus("ALL")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.resetFilterText}>
                            View All Complaints ({complaints.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredComplaints}
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
                    renderItem={renderComplaintItem}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        backgroundColor: "#F5F7FB",
    },

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
        alignItems: "center",
    },

    mobileHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 17,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        alignItems: "center",
    },

    tabletHeader: {
        paddingHorizontal: 35,
        paddingTop: 22,
        paddingBottom: 22,
        alignItems: "center",
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
        alignItems: "center",
    },

    pageTitle: {
        fontSize: 40,
        fontWeight: "800",
        color: "#082668",
        letterSpacing: -0.5,
        textAlign: "center",
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
        textAlign: "center",
    },

    mobilePageSubtitle: {
        fontSize: 11.5,
        textAlign: "center",
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

    // =====================================================
    // STATUS FILTERS ROW
    // =====================================================
    filterSection: {
        marginTop: 14,
        marginBottom: 8,
        width: "100%",
    },

    mobileFilterSection: {
        marginTop: 10,
        marginBottom: 6,
    },

    tabletFilterSection: {
        maxWidth: 700,
        alignSelf: "center",
        width: "100%",
    },

    desktopFilterSection: {
        maxWidth: 700,
        alignSelf: "center",
        width: "100%",
        paddingHorizontal: 0,
    },

    filterScrollContent: {
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    mobileFilterScrollContent: {
        paddingHorizontal: 14,
        gap: 6,
    },

    tabletFilterScrollContent: {
        paddingHorizontal: 28,
        justifyContent: "space-between",
        width: "100%",
    },

    desktopFilterScrollContent: {
        maxWidth: 700,
        alignSelf: "center",
        paddingHorizontal: 0,
        width: "100%",
        justifyContent: "space-between",
        gap: 8,
    },

    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 9,
        paddingHorizontal: 13,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },

    mobileFilterChip: {
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 16,
    },

    desktopFilterChip: {
        flex: 1,
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
    },

    filterChipSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 3,
    },

    filterIcon: {
        fontSize: 13,
        marginRight: 6,
    },

    mobileFilterIcon: {
        fontSize: 12,
        marginRight: 4,
    },

    filterChipText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: "#475569",
    },

    mobileFilterChipText: {
        fontSize: 11.5,
    },

    filterChipTextSelected: {
        color: "#FFFFFF",
    },

    filterCountBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    },

    mobileFilterCountBadge: {
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 8,
        marginLeft: 4,
    },

    filterCountBadgeSelected: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },

    filterCountText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#64748B",
    },

    mobileFilterCountText: {
        fontSize: 10,
    },

    filterCountTextSelected: {
        color: "#FFFFFF",
    },

    resetFilterButton: {
        marginTop: 14,
        backgroundColor: "#EFF6FF",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },

    resetFilterText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563EB",
    },
});


