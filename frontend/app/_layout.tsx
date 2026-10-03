import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';

import {
  getToken,
  getUserData,
  clearAuthToken,
} from '@/utils/authStorage';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('================================');
      console.log('Checking saved authentication...');
      console.log('================================');

      // Get saved JWT
      const token = await getToken();

      // Get saved user information
      const user = await getUserData();

      console.log('Token exists:', !!token);
      console.log('Saved user:', user);

      // ==========================================
      // NO LOGIN SESSION
      // ==========================================
      if (!token || !user) {
        console.log('No saved session.');
        console.log('Going to Login...');

        router.replace('/login');
        return;
      }

      // ==========================================
      // SESSION FOUND
      // ==========================================
      console.log('Saved session found. Role:',user.role);

      const role = String(user.role)
        .trim()
        .toUpperCase();

      // ==========================================
      // ADMIN
      // ==========================================
      if (role === 'ADMIN') {
        console.log(
          'Authenticated ADMIN → Admin Dashboard'
        );

        router.replace('/admin/dashboard');
      }

      // ==========================================
      // STUDENT
      // ==========================================
      else if (role === 'STUDENT') {
        console.log(
          'Authenticated STUDENT → Student Dashboard'
        );

        router.replace('/dashboard');
      }

      // ==========================================
      // INVALID ROLE
      // ==========================================
      else {
        console.log(
          'Invalid user role. Clearing authentication...'
        );

        await clearAuthToken();

        router.replace('/login');
      }

    } catch (error) {
      console.error(
        'Authentication check failed:',
        error
      );

      // If anything goes wrong,
      // remove the saved session.
      await clearAuthToken();

      router.replace('/login');

    } finally {
      setCheckingAuth(false);
    }
  };

  // ==========================================
  // SHOW LOADING WHILE CHECKING AUTH
  // ==========================================
  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#007AFF"
        />
      </View>
    );
  }

  // ==========================================
  // APP NAVIGATION
  // ==========================================
  return (
    <>
      <Stack>

        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="dashboard"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="myComplaints"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="addComplaint"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="admin/dashboard"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="admin/complaints"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="admin/complaintDetails"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
          }}
        />

      </Stack>

      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});