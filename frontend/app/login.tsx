import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { API_BASE_URL } from '@/constants/api';
import { saveAuthData } from '@/utils/authStorage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'All Fields are Required');
      return;
    }

    try {
      console.log('Base API URL:', API_BASE_URL);

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log('Full Login Response:', data);

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================
      if (response.ok) {
        const userRole = data.role
          ? String(data.role).trim().toUpperCase()
          : null;

        // Check token
        if (!data.token) {
          Alert.alert(
            'Login Failed',
            'JWT token was not provided by the server.'
          );
          return;
        }

        // Check role
        if (!userRole) {
          Alert.alert(
            'Login Failed',
            'User role was not provided by the server.'
          );
          return;
        }

        console.log(
          'LOGIN SUCCESS - userId:',
          data.userId,
          'name:',
          data.name,
          'role:',
          userRole
        );

        // ==========================================
        // SAVE AUTH DATA SECURELY
        // ==========================================
        await saveAuthData(
          data.token,
          data.userId,
          {
            name: data.name,
            email: data.email,
            role: userRole,
          }
        );

        console.log('JWT saved securely in SecureStore');

        // ==========================================
        // ADMIN
        // ==========================================
        if (userRole === 'ADMIN') {
          console.log(
            'Navigating to Admin Dashboard...'
          );

          router.replace({
            pathname: '/admin/dashboard' as any,
            params: {
              name: data.name,
              userId: data.userId,
              email: data.email,
              role: userRole,
            },
          });
        }

        // ==========================================
        // STUDENT
        // ==========================================
        else if (userRole === 'STUDENT') {
          console.log(
            'Navigating to Student Dashboard...'
          );

          router.replace({
            pathname: '/dashboard',
            params: {
              name: data.name,
              userId: data.userId,
              email: data.email,
              role: userRole,
            },
          });
        }

        // ==========================================
        // UNKNOWN ROLE
        // ==========================================
        else {
          console.log(
            'Unknown role. Going to Student Dashboard...'
          );

          router.replace({
            pathname: '/dashboard',
            params: {
              name: data.name,
              userId: data.userId,
              email: data.email,
              role: userRole,
            },
          });
        }
      }

      // ==========================================
      // LOGIN FAILED
      // ==========================================
      else {
        const failureMsg =
          data.message ||
          data.error ||
          'Login Failed: Invalid credentials';

        console.error(
          'LOGIN FAILED DETAILS:',
          failureMsg
        );

        Alert.alert(
          'Login Failed',
          failureMsg
        );
      }
    } catch (error: any) {
      console.error(
        'LOGIN CONNECTION ERROR DETAILS:',
        error
      );

      Alert.alert(
        'Connection Error',
        `Unable to connect to server: ${
          error?.message || error
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        College Complaint App
      </Text>

      <Text style={styles.subtitle}>
        Login to your account
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Student ID / Email"
        placeholderTextColor="#777"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/register' as any)}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
  },

  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#007AFF',
    fontSize: 15,
  },
});