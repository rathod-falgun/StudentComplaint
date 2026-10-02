import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useResponsive } from '../constants/responsive';

export default function Default() {

    const params = useLocalSearchParams();

    console.log("DASHBOARD ALL PARAMS:", params);

    const { userId, name } = params;

    console.log("DASHBOARD USER ID:", userId);
    console.log("DASHBOARD NAME:", name);
    console.log("DASHBOARD RECEIVED:", userId, name);

    const { isMobile, isTablet, isDesktop } = useResponsive();

    const handleLogout = () => {
        router.replace('/login');
    };

    return (
        <View style={styles.container}>

            <View
                style={[
                    styles.content,
                    isMobile && styles.mobileContent,
                    isTablet && styles.tabletContent,
                    isDesktop && styles.desktopContent,
                ]}
            >

                <Text
                    style={[
                        styles.text,
                        isMobile && styles.mobileText,
                        isDesktop && styles.desktopText,
                    ]}
                >
                    Welcome to Dashboard
                </Text>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isMobile && styles.mobileButton,
                        isTablet && styles.tabletButton,
                        isDesktop && styles.desktopButton,
                    ]}
                    onPress={() =>
                        router.push({
                            pathname: '/addComplaint',
                            params: { userId, name },
                        })
                    }
                >
                    <Text style={styles.buttonText}>
                        Make a Complaint
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isMobile && styles.mobileButton,
                        isTablet && styles.tabletButton,
                        isDesktop && styles.desktopButton,
                    ]}
                    onPress={() =>
                        router.push({
                            pathname: '/myComplaints',
                            params: {
                                userId: userId,
                                name: name,
                            },
                        })
                    }
                >
                    <Text style={styles.buttonText}>
                        View My Complaints
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        isMobile && styles.mobileButton,
                        isTablet && styles.tabletButton,
                        isDesktop && styles.desktopButton,
                    ]}
                    onPress={() =>
                        router.push({
                            pathname: '/profile',
                            params: { userId },
                        })
                    }
                >
                    <Text style={styles.buttonText}>
                        Profile
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.logoutButton,
                        isMobile && styles.mobileButton,
                        isTablet && styles.tabletButton,
                        isDesktop && styles.desktopButton,
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>
                        Logout
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    content: {
        width: '100%',
        alignItems: 'center',
    },

    mobileContent: {
        maxWidth: 500,
    },

    tabletContent: {
        maxWidth: 600,
    },

    desktopContent: {
        maxWidth: 500,
    },

    text: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
    },

    mobileText: {
        fontSize: 22,
    },

    desktopText: {
        fontSize: 26,
        marginBottom: 30,
    },

    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginTop: 5,
        alignItems: 'center',
        elevation: 4,
    },

    mobileButton: {
        width: '95%',
        paddingVertical: 15,
    },

    tabletButton: {
        width: '80%',
        paddingVertical: 16,
    },

    desktopButton: {
        width: '100%',
        paddingVertical: 16,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 5,
        alignItems: 'center',
    },

    logoutButtonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

