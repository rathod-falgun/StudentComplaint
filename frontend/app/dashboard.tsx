import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
export default function Default() {
    const [name ,setname] = ('')
    return (
        <View style={styles.container}>
            <Text style={styles.text}> Welcome to DashBoard </Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center',     backgroundColor: '#ffffff', },
    text: { fontSize: 22, fontWeight: 'bold' },
});