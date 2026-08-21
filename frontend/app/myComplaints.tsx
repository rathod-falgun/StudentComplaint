import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default function MyComplaints() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                My Complaints
            </Text>
        </View>
    )
}

const styles = StyleSheet.create(

    {
        container: {
            backgroundColor:'#9d9696',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        title: {
            fontSize: 28,
            fontWeight: 'bold',
        }
    }
);