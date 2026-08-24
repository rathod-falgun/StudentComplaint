import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

const handleLogout = () => {
  router.replace('/login');
};

export default function Default() {
    const { userId , name } = useLocalSearchParams();
    const handleLogout = () => {
        router.replace('/login');
    };
    return (
        <View style={styles.container}>
            <Text style={styles.text}> Welcome to DashBoard </Text>

            <TouchableOpacity style={styles.button} onPress={() => router.push({
                pathname: '/addComplaint',
                params: { userId , name},
            })
            }>

                <Text style={styles.buttonText}>Make an Complaint </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() =>
                router.push({
                    pathname: '/myComplaints',
                    params: { userId },
                })
            }>
                <Text style={styles.buttonText}>View My Complaints </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

             <TouchableOpacity style={styles.button} onPress={() => 
                router.push({
                    pathname: '/profile',
                    params : {userId},
                })
             }>
                <Text style={styles.buttonText}> Profile </Text>
            </TouchableOpacity>

        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', },
    text: { fontSize: 22, fontWeight: 'bold' },
    button: {
        width: '85%',
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        marginTop:10,
        alignItems: 'center',

        // slight shadow
        elevation: 4,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    logoutButton: {
    width: '85%',
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
},

logoutButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
},
});