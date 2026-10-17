import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '@/constants/api';
import { saveAuthData } from '@/utils/authStorage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter both your college email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================
      if (response.ok) {
        const userRole = data.role
          ? String(data.role).trim().toUpperCase()
          : null;

        if (!data.token) {
          Alert.alert('Login Failed', 'JWT token was not provided by the server.');
          return;
        }

        if (!userRole) {
          Alert.alert('Login Failed', 'User role was not provided by the server.');
          return;
        }

        // SAVE AUTH DATA SECURELY
        await saveAuthData(data.token, data.userId, {
          name: data.name,
          email: data.email,
          role: userRole,
        });

        // ROLE ROUTING
        if (userRole === 'ADMIN') {
          router.replace({
            pathname: '/admin/dashboard' as any,
            params: {
              name: data.name,
              userId: data.userId,
              email: data.email,
              role: userRole,
            },
          });
        } else {
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
      } else {
        const failureMsg =
          data.message ||
          data.error ||
          'Invalid credentials. Please verify your email and password.';
        Alert.alert('Login Failed', failureMsg);
      }
    } catch (error: any) {
      Alert.alert(
        'Connection Error',
        `Unable to reach the server. Please check your internet connection or verify that the backend is running.\n\n${error?.message || error}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* BRANDING HEADER */}
        {/* ================================================= */}
        <View style={styles.header}>


          <View style={styles.logoBox}>
            <Ionicons name="school" size={32} color="#1D4ED8" />
          </View>

          <Text style={styles.portalTitle}>Student Grievance Portal</Text>
          <Text style={styles.portalSubtitle}>
            Sarvajanik College of Engineering & Technology
          </Text>
        </View>

        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Access your complaints, track resolution status, and submit campus feedback.
            </Text>
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>College Email</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={focusedField === 'email' ? '#1D4ED8' : '#64748B'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. arjun.co23b1@scet.ac.in"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === 'password' ? '#1D4ED8' : '#64748B'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your account password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.signInButtonText}>Signing you in...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.signInButtonText}>Sign In to Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* REGISTER & HELP FOOTER */}
        {/* ================================================= */}
        <View style={styles.bottomSection}>
          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>New student at SCET?</Text>
            <TouchableOpacity
              onPress={() => router.push('/register' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Create Student Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.helpBox}>
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.helpText}>
              Need assistance? Contact your department coordinator or campus IT cell.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Crisp, modern slate-50
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    paddingBottom: 35,
    justifyContent: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },

  /* =====================================
     BRANDING HEADER
  ====================================== */
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF', // Soft Sky
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    letterSpacing: 0.2,
  },

  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  portalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  portalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
    lineHeight: 18,
  },

  /* =====================================
     CARD
  ====================================== */
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },

  cardHeader: {
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },

  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
  },

  inputWrapperFocused: {
    borderColor: '#1D4ED8',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 15,
  },

  passwordInput: {
    paddingRight: 6,
  },

  eyeButton: {
    padding: 6,
  },

  /* =====================================
     BUTTON
  ====================================== */
  signInButton: {
    backgroundColor: '#1D4ED8',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },

  signInButtonDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* =====================================
     BOTTOM SECTION & FOOTER
  ====================================== */
  bottomSection: {
    marginTop: 22,
    alignItems: 'center',
  },

  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  promptText: {
    color: '#64748B',
    fontSize: 14,
  },

  registerLink: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },

  divider: {
    width: '60%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 18,
  },

  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 320,
  },

  helpText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});