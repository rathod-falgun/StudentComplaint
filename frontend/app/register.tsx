import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // validation passed — backend call goes here later
    Alert.alert('Success', 'Validation passed. Backend not connected yet.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Register to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#777"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#ffffff', justifyContent: 'center', padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555555', textAlign: 'center', marginBottom: 30 },
  input: { height: 50, borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, paddingHorizontal: 15, color: '#000000', marginBottom: 15 },
  registerButton: { height: 50, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 15 },
});