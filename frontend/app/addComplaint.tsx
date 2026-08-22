import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

// =====================================================
// COMPONENT
// =====================================================

export default function AddComplaint() {

    const [categories, setCategories] = useState<{ cid: number; name: string }[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [categoryName, setCategoryName] = useState('');

    const priorities = ['LOW', 'MEDIUM', 'HIGH'];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [priority, setPriority] = useState('MEDIUM');

    const [showCategories, setShowCategories] = useState(false);
    const [loading, setLoading] = useState(false);

    const { userId } = useLocalSearchParams();

    useEffect(() => {
        fetch('http://10.122.90.235:8081/api/complaints/categories').
            then(res => res.json())
            .then(data => setCategories(data))
            .catch(() => Alert.alert('Error', 'Could not load Categories'))
            .finally(() => setCategoriesLoading(false));
    }, []);


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async () => {
        console.log('categoryId at submit:', categoryId);


        if (!userId) { Alert.alert('Login Required', '...'); return; }

        if (!title.trim()) {
            Alert.alert(
                'Missing Title',
                'Please enter a complaint title.'
            );
            return;
        }

        if (!categoryId) {
            Alert.alert(
                'Missing Category',
                'Please select a complaint category.'
            );
            return;
        }

        if (!description.trim()) {
            Alert.alert(
                'Missing Description',
                'Please describe your complaint.'
            );
            return;
        }

        if (description.trim().length < 10) {
            Alert.alert(
                'Description Too Short',
                'Please provide a little more detail about your complaint.'
            );
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `http://10.122.90.235:8081/api/complaints/${userId}`,
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        categoryId,
                        priority
                    }),
                }
            );

            // Temporary delay for testing UI
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                Alert.alert(
                    'Complaint Submitted',
                    'Your complaint has been submitted successfully.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                Alert.alert("Complaint is not Submitted ", "Something went wrong");
            }

        } catch (error) {

            console.log(
                'Complaint submission error:',
                error
            );

            Alert.alert(
                'Submission Failed',
                'Unable to submit your complaint. Please try again.'
            );

        } finally {

            setLoading(false);
        }
    };


    // =================================================
    // CATEGORY ICON
    // =================================================

    const getCategoryIcon = (item: string) => {

        const icons: Record<string, string> = {
            Academic: '📚',
            Canteen: '🍽️',
            Cleanliness: '✨',
            Electricity: '⚡',
            Faculty: '👨‍🏫',
            Infrastructure: '🏢',
            'Internet/Wi-Fi': '📶',
            Laboratory: '🧪',
            Library: '📖',
        };

        return icons[item] || '•';
    };


    // =================================================
    // PRIORITY ICON
    // =================================================

    const getPriorityIcon = (item: string) => {

        if (item === 'LOW') return '↓';
        if (item === 'MEDIUM') return '→';
        return '↑';
    };


    // =================================================
    // UI
    // =================================================

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
        >

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                {/* ===================================== */}
                {/* HEADER */}
                {/* ===================================== */}

                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>

                    <View style={styles.headerContent}>

                        <Text style={styles.headerTitle}>
                            Submit a Complaint
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Help us improve your campus
                        </Text>

                    </View>

                </View>


                {/* ===================================== */}
                {/* TRUST / INFO CARD */}
                {/* ===================================== */}

                <View style={styles.infoCard}>

                    <View style={styles.infoIconContainer}>
                        <Text style={styles.infoIcon}>
                            ✓
                        </Text>
                    </View>

                    <View style={styles.infoContent}>

                        <Text style={styles.infoTitle}>
                            Your voice matters
                        </Text>

                        <Text style={styles.infoText}>
                            Share the issue clearly and our team
                            will route it to the right department.
                        </Text>

                    </View>

                </View>


                {/* ===================================== */}
                {/* FORM CARD */}
                {/* ===================================== */}

                <View style={styles.formCard}>


                    {/* ================================= */}
                    {/* TITLE */}
                    {/* ================================= */}

                    <View style={styles.section}>

                        <View style={styles.labelRow}>

                            <Text style={styles.label}>
                                Complaint title
                            </Text>

                            <Text style={styles.required}>
                                Required
                            </Text>

                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Classroom fan is not working"
                            placeholderTextColor="#A1AAB8"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={150}
                            returnKeyType="next"
                        />

                        <View style={styles.counterRow}>

                            <Text style={styles.fieldHint}>
                                Keep it short and specific
                            </Text>

                            <Text style={styles.counter}>
                                {title.length}/150
                            </Text>

                        </View>

                    </View>


                    {/* ================================= */}
                    {/* CATEGORY */}
                    {/* ================================= */}

                    <View style={styles.section}>

                        <View style={styles.labelRow}>

                            <Text style={styles.label}>
                                Category
                            </Text>

                            <Text style={styles.required}>
                                Required
                            </Text>

                        </View>

                        <TouchableOpacity
                            style={[
                                styles.dropdown,
                                categoryName && styles.dropdownSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() =>
                                setShowCategories(true)
                            }
                        >

                            <View style={styles.dropdownLeft}>

                                {categoryName ? (
                                    <View style={styles.selectedCategoryIcon}>
                                        <Text>
                                            {getCategoryIcon(categoryName)}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.categoryPlaceholderIcon}>
                                        <Text style={styles.placeholderIconText}>
                                            +
                                        </Text>
                                    </View>
                                )}

                                <Text
                                    style={
                                        categoryName
                                            ? styles.dropdownText
                                            : styles.placeholder
                                    }
                                >
                                    {categoryName ||
                                        'Select a category'}
                                </Text>

                            </View>

                            <Text style={styles.dropdownArrow}>
                                ›
                            </Text>

                        </TouchableOpacity>

                    </View>


                    {/* ================================= */}
                    {/* PRIORITY */}
                    {/* ================================= */}

                    <View style={styles.section}>

                        <View style={styles.labelRow}>

                            <Text style={styles.label}>
                                Priority
                            </Text>

                            <Text style={styles.optional}>
                                How urgent?
                            </Text>

                        </View>

                        <View style={styles.priorityContainer}>

                            {priorities.map((item) => {

                                const selected =
                                    priority === item;

                                return (
                                    <TouchableOpacity
                                        key={item}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.priorityButton,
                                            selected &&
                                            styles.priorityButtonSelected,
                                        ]}
                                        onPress={() =>
                                            setPriority(item)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.priorityText,
                                                selected &&
                                                styles.priorityTextSelected,
                                            ]}
                                        >
                                            {item}
                                        </Text>

                                        {selected && (
                                            <View
                                                style={styles.selectedDot}
                                            />
                                        )}

                                    </TouchableOpacity>
                                );
                            })}

                        </View>

                    </View>


                    {/* ================================= */}
                    {/* DESCRIPTION */}
                    {/* ================================= */}

                    <View style={styles.sectionLast}>

                        <View style={styles.labelRow}>

                            <Text style={styles.label}>
                                Describe the issue
                            </Text>

                            <Text style={styles.required}>
                                Required
                            </Text>

                        </View>

                        <TextInput
                            style={styles.descriptionInput}
                            placeholder={
                                'Tell us what happened, where it happened, and any details that may help us resolve it...'
                            }
                            placeholderTextColor="#A1AAB8"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                            maxLength={1000}
                        />

                        <View style={styles.descriptionFooter}>

                            <Text style={styles.fieldHint}>
                                More details help us resolve issues faster
                            </Text>

                            <Text style={styles.counter}>
                                {description.length}/1000
                            </Text>

                        </View>

                    </View>

                </View>


                {/* ===================================== */}
                {/* SUBMIT BUTTON */}
                {/* ===================================== */}

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                        styles.submitButton,
                        loading &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >

                    {loading ? (

                        <>
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />

                            <Text style={styles.submitText}>
                                Submitting...
                            </Text>
                        </>

                    ) : (

                        <>
                            <Text style={styles.submitText}>
                                Submit Complaint
                            </Text>

                            <View style={styles.submitArrowCircle}>
                                <Text style={styles.submitArrow}>
                                    →
                                </Text>
                            </View>
                        </>

                    )}

                </TouchableOpacity>


                {/* ===================================== */}
                {/* FOOTER TRUST MESSAGE */}
                {/* ===================================== */}

                <View style={styles.footer}>

                    <Text style={styles.footerIcon}>
                        🔒
                    </Text>

                    <Text style={styles.footerText}>
                        Your complaint will be reviewed by the
                        concerned department.
                    </Text>

                </View>


            </ScrollView>


            {/* ========================================= */}
            {/* CATEGORY MODAL */}
            {/* ========================================= */}

            <Modal
                visible={showCategories}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setShowCategories(false)
                }
            >

                <View style={styles.modalOverlay}>

                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() =>
                            setShowCategories(false)
                        }
                    />

                    <View style={styles.categoryModal}>

                        {/* Modal Header */}

                        <View style={styles.modalHeader}>

                            <View>

                                <Text style={styles.modalTitle}>
                                    Select category
                                </Text>

                                <Text style={styles.modalSubtitle}>
                                    Choose what your complaint is about
                                </Text>

                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() =>
                                    setShowCategories(false)
                                }
                            >
                                <Text style={styles.closeText}>
                                    ×
                                </Text>
                            </TouchableOpacity>

                        </View>
                        {/* Category List */}

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={
                                styles.categoryList
                            }
                        >

                            {categories.map((item) => {

                                const selected =
                                    categoryName === item.name;
                                return (
                                    <TouchableOpacity
                                        key={item.cid}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.categoryItem,
                                            selected &&
                                            styles.categoryItemSelected,
                                        ]}
                                        onPress={() => {
                                            console.log('Selected category:', item.cid, item.name);
                                            setCategoryId(item.cid);
                                            setCategoryName(item.name);
                                            setShowCategories(false);

                                        }}
                                    >

                                        <View
                                            style={[
                                                styles.categoryIcon,
                                                selected &&
                                                styles.categoryIconSelected,
                                            ]}

                                        >
                                            <Text style={styles.categoryEmoji}>
                                                {getCategoryIcon(item.name)}
                                            </Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selected &&
                                                styles.categoryTextSelected,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>

                                        <View
                                            style={[
                                                styles.radioOuter,
                                                selected &&
                                                styles.radioOuterSelected,
                                            ]}
                                        >

                                            {selected && (
                                                <View
                                                    style={
                                                        styles.radioInner
                                                    }
                                                />
                                            )}

                                        </View>

                                    </TouchableOpacity>
                                );
                            })}

                        </ScrollView>

                    </View>

                </View>

            </Modal>

        </KeyboardAvoidingView>
    );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    // ================================================
    // SCREEN
    // ================================================

    screen: {
        flex: 1,
        backgroundColor: '#F5F7FB',
    },

    container: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 35,
    },


    // ================================================
    // HEADER
    // ================================================

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E7EBF2',
        marginRight: 13,

        shadowColor: '#172033',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },

    backIcon: {
        fontSize: 31,
        lineHeight: 31,
        color: '#172033',
        marginTop: -2,
        marginLeft: -2,
    },

    headerContent: {
        flex: 1,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#172033',
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        fontSize: 13,
        color: '#758197',
        marginTop: 4,
    },


    // ================================================
    // INFO CARD
    // ================================================

    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EEF5FF',
        borderRadius: 18,
        padding: 15,
        borderWidth: 1,
        borderColor: '#DCE9FF',
        marginBottom: 18,
    },

    infoIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#DCEAFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    infoIcon: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2563EB',
    },

    infoContent: {
        flex: 1,
    },

    infoTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1D4ED8',
        marginBottom: 3,
    },

    infoText: {
        fontSize: 12.5,
        lineHeight: 18,
        color: '#59708F',
    },


    // ================================================
    // FORM CARD
    // ================================================

    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E8ECF2',

        shadowColor: '#18243A',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 14,

        elevation: 2,
    },


    // ================================================
    // SECTION
    // ================================================

    section: {
        marginBottom: 23,
    },

    sectionLast: {
        marginBottom: 2,
    },

    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 9,
    },

    label: {
        fontSize: 14,
        fontWeight: '800',
        color: '#273247',
    },

    required: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D14343',
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 20,
        marginLeft: 8,
        overflow: 'hidden',
    },

    optional: {
        marginLeft: 'auto',
        fontSize: 11,
        color: '#8A95A6',
    },


    // ================================================
    // INPUT
    // ================================================

    input: {
        height: 54,
        backgroundColor: '#FAFBFD',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E2E7EF',
        paddingHorizontal: 15,
        fontSize: 14,
        color: '#172033',
    },

    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },

    fieldHint: {
        fontSize: 10.5,
        color: '#98A2B2',
        flex: 1,
    },

    counter: {
        fontSize: 10.5,
        color: '#98A2B2',
        marginLeft: 10,
    },


    // ================================================
    // DROPDOWN
    // ================================================

    dropdown: {
        height: 56,
        backgroundColor: '#FAFBFD',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E2E7EF',
        paddingHorizontal: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    dropdownSelected: {
        borderColor: '#BFD5FF',
        backgroundColor: '#F8FBFF',
    },

    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    selectedCategoryIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#E8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    categoryPlaceholderIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#F0F2F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    placeholderIconText: {
        color: '#7F8A9D',
        fontSize: 20,
        fontWeight: '400',
    },

    dropdownText: {
        fontSize: 14,
        color: '#172033',
        fontWeight: '600',
    },

    placeholder: {
        fontSize: 14,
        color: '#98A2B2',
    },

    dropdownArrow: {
        fontSize: 27,
        color: '#7D899C',
        transform: [{ rotate: '90deg' }],
    },


    // ================================================
    // PRIORITY
    // ================================================

    priorityContainer: {
        flexDirection: 'row',
        gap: 8,
    },

    priorityButton: {
        flex: 1,
        minHeight: 56,
        backgroundColor: '#FAFBFD',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E2E7EF',
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },

    priorityButtonSelected: {
        backgroundColor: '#EEF5FF',
        borderColor: '#7EABFF',
    },

    priorityIcon: {
        width: 23,
        height: 23,
        borderRadius: 8,
        backgroundColor: '#EEF1F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },

    priorityIconSelected: {
        backgroundColor: '#D9E8FF',
    },

    priorityIconText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#7C8798',
    },

    priorityIconTextSelected: {
        color: '#2563EB',
    },

    priorityText: {
        fontSize: 10.5,
        fontWeight: '800',
        color: '#7C8798',
    },

    priorityTextSelected: {
        color: '#2563EB',
    },

    selectedDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#2563EB',
        position: 'absolute',
        top: 7,
        right: 7,
    },


    // ================================================
    // DESCRIPTION
    // ================================================

    descriptionInput: {
        minHeight: 145,
        backgroundColor: '#FAFBFD',
        borderRadius: 13,
        borderWidth: 1,
        borderColor: '#E2E7EF',
        paddingHorizontal: 15,
        paddingTop: 14,
        paddingBottom: 12,
        fontSize: 14,
        lineHeight: 21,
        color: '#172033',
    },

    descriptionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },


    // ================================================
    // SUBMIT
    // ================================================

    submitButton: {
        height: 57,
        marginTop: 17,
        backgroundColor: '#2563EB',
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#2563EB',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.20,
        shadowRadius: 12,

        elevation: 5,
    },

    submitButtonDisabled: {
        opacity: 0.75,
    },

    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.1,
    },

    submitArrowCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },

    submitArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },


    // ================================================
    // FOOTER
    // ================================================

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 13,
    },

    footerIcon: {
        fontSize: 11,
        marginRight: 6,
    },

    footerText: {
        flex: 1,
        textAlign: 'center',
        color: '#8994A5',
        fontSize: 10.5,
        lineHeight: 16,
    },


    // ================================================
    // MODAL
    // ================================================

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },

    categoryModal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: '82%',
        paddingTop: 18,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF1F5',
    },

    modalTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#172033',
    },

    modalSubtitle: {
        fontSize: 11.5,
        color: '#8A95A6',
        marginTop: 3,
    },

    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F1F3F6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeText: {
        fontSize: 25,
        color: '#687386',
        lineHeight: 27,
        marginTop: -2,
    },

    categoryList: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    categoryItem: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        borderRadius: 14,
        marginBottom: 4,
    },

    categoryItemSelected: {
        backgroundColor: '#F0F6FF',
    },

    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    categoryIconSelected: {
        backgroundColor: '#DDEAFF',
    },

    categoryEmoji: {
        fontSize: 17,
    },

    categoryText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#465267',
    },

    categoryTextSelected: {
        color: '#2563EB',
        fontWeight: '800',
    },

    radioOuter: {
        width: 21,
        height: 21,
        borderRadius: 11,
        borderWidth: 1.8,
        borderColor: '#CBD2DC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    radioOuterSelected: {
        borderColor: '#2563EB',
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#24169f',
    },

});