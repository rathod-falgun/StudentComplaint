import { router } from 'expo-router';
import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
export default function Default() {
    const [name, setname] = ('')

    return (
        <View style={styles.container}>
            <Text style={styles.text}> Welcome to DashBoard </Text>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/addComplaint')}>

                <Text style={styles.buttonText}>Make an Complaint </Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.button} onPress={() => router.push('/myComplaints')}>

                <Text style={styles.buttonText}>View My Complaints </Text>
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
        alignItems: 'center',

        // slight shadow
        elevation: 4,
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold',
    },
});