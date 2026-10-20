import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {/* ================================================= */}
          {/* INSTITUTIONAL BANNER */}
          {/* ================================================= */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerIconBadge}>
              <Ionicons name="school" size={24} color="#3B82F6" />
            </View>

            <Text style={styles.bannerTitle}>
              Student Complaint Management System
            </Text>

            <View style={styles.bannerLiveTag}>
              <View style={styles.bannerLiveDot} />
              <Text style={styles.bannerLiveText}>SCET GRIEVANCE SYSTEM</Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* BRANDING HEADER */}
          {/* ================================================= */}
          <View style={styles.header}>
            <Text style={styles.portalTitle}>Welcome Back</Text>
            <Text style={styles.portalSubtitle}>
              Sign in with your official college credentials to continue.
            </Text>
          </View>

          {/* ================================================= */}
          {/* LOGIN CARD */}
          {/* ================================================= */}
          <View style={styles.card}>
            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Official College Email</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={focusedField === 'email' ? '#3B82F6' : '#8D8D98'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. name@scet.ac.in"
                  placeholderTextColor="#6B7280"
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
                  size={19}
                  color={focusedField === 'password' ? '#3B82F6' : '#8D8D98'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your account password"
                  placeholderTextColor="#6B7280"
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
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#8D8D98"
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
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {loading ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.signInButtonText}>Signing you in...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPromptText}>New Student ?</Text>
              <TouchableOpacity
                onPress={() => router.push('/register' as any)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Create account"
              >
                <Text style={styles.registerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================================================= */}
          {/* TRUST / SECURITY FOOTER */}
          {/* ================================================= */}
          <View style={styles.footer}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
            <Text style={styles.footerText}>
              Official SCET Student & Faculty Grievance System
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121216',
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: '#121216',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#121216',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 440,
  },

  /* =====================================
     INSTITUTIONAL BANNER
  ====================================== */
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161822',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.22)',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 22,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)' } as any,
      default: { elevation: 3 },
    }),
  },

  bannerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.28)',
    marginBottom: 12,
  },

  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 23,
  },

  bannerLiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  },

  bannerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },

  bannerLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#60A5FA',
    letterSpacing: 0.8,
  },

  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  /* =====================================
     BRANDING HEADER
  ====================================== */
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  portalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  portalSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 18,
  },

  /* =====================================
     CARD
  ====================================== */
  card: {
    backgroundColor: '#181820',
    borderWidth: 1,
    borderColor: '#262632',
    borderRadius: 22,
    padding: 22,
    ...Platform.select({
      web: { boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)' } as any,
      default: { elevation: 4 },
    }),
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
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 7,
    letterSpacing: 0.1,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.2,
    borderColor: '#2A2A38',
    borderRadius: 12,
    backgroundColor: '#13131A',
    paddingHorizontal: 13,
  },

  inputWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#161622',
    ...Platform.select({
      web: { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' } as any,
      default: {},
    }),
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
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
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...Platform.select({
      web: { boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' } as any,
      default: { elevation: 3 },
    }),
  },

  signInButtonDisabled: {
    opacity: 0.65,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* =====================================
     REGISTER ROW
  ====================================== */
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#22222D',
  },

  registerPromptText: {
    color: '#9CA3AF',
    fontSize: 12.5,
  },

  registerLink: {
    color: '#60A5FA',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* =====================================
     FOOTER
  ====================================== */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },

  footerText: {
    color: '#8D8D98',
    fontSize: 11,
    fontWeight: '500',
  },
});