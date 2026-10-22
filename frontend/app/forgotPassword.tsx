import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeColors } from '@/constants/theme';

const ALLOWED_COLLEGE_DOMAIN = 'scet.ac.in';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@scet\.ac\.in$/;

export default function ForgotPassword() {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [focusedField, setFocusedField] = useState<'email' | 'otp' | 'newPassword' | 'confirmPassword' | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const normalizedEmail = email.trim().toLowerCase();
  const collegeEmailValid = EMAIL_REGEX.test(normalizedEmail);
  const otpMatchesCurrentEmail = otpSent && normalizedEmail === otpEmail;

  const handleSendOtp = async () => {
    if (!normalizedEmail) {
      Alert.alert('Email Required', 'Please enter your official college email address.');
      return;
    }

    if (!collegeEmailValid) {
      Alert.alert(
        'Invalid College Domain',
        `Please use your official college email ending with @${ALLOWED_COLLEGE_DOMAIN}.`
      );
      return;
    }

    try {
      setSendingOtp(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code. Please verify your email.');
      }

      setOtpSent(true);
      setOtpEmail(normalizedEmail);
      setCountdown(60);
      Alert.alert(
        'Verification Code Sent',
        `A 6-digit password reset code has been sent to ${normalizedEmail}. Please check your inbox.`
      );
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Could not send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!normalizedEmail) {
      Alert.alert('Required Field', 'Please enter your official college email.');
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (!newPassword) {
      Alert.alert('Password Required', 'Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Password Too Short', 'Your new password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'New password and confirm password must match.');
      return;
    }

    try {
      setResetting(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. Please check your code and try again.');
      }

      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated successfully. You can now log in with your new password.',
        [
          {
            text: 'Sign In Now',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Unable to reset password. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Reset Password</Text>
          <ThemeToggle compact />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* HERO BADGE & TITLE */}
            <View style={styles.heroContainer}>
              <View style={styles.heroIconBadge}>
                <Ionicons name="key-outline" size={28} color={colors.accent} />
              </View>
              <Text style={styles.heroTitle}>Forgot Password?</Text>
              <Text style={styles.heroSubtitle}>
                Enter your registered college email to receive a secure 6-digit verification code.
              </Text>
            </View>

            {/* FORM CARD */}
            <View style={styles.formCard}>
              {/* STEP 1: COLLEGE EMAIL */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Official College Email</Text>
                  <Text style={styles.helperTag}>@scet.ac.in</Text>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color={focusedField === 'email' ? colors.accent : colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={`your.name@${ALLOWED_COLLEGE_DOMAIN}`}
                    placeholderTextColor={colors.inputPlaceholder}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (otpSent && val.trim().toLowerCase() !== otpEmail) {
                        setOtpSent(false);
                        setOtp('');
                      }
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Email domain status pill */}
                {email.trim().length > 0 && (
                  <View
                    style={[
                      styles.domainStatusPill,
                      collegeEmailValid ? styles.domainValid : styles.domainInvalid,
                    ]}
                  >
                    <Ionicons
                      name={collegeEmailValid ? 'checkmark-circle' : 'alert-circle'}
                      size={14}
                      color={collegeEmailValid ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.domainStatusText,
                        { color: collegeEmailValid ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {collegeEmailValid
                        ? 'Valid @scet.ac.in college email'
                        : `Must end with @${ALLOWED_COLLEGE_DOMAIN}`}
                    </Text>
                  </View>
                )}
              </View>

              {/* SEND OTP BUTTON */}
              <TouchableOpacity
                style={[
                  styles.sendOtpButton,
                  (!collegeEmailValid || sendingOtp || countdown > 0) && styles.buttonDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={!collegeEmailValid || sendingOtp || countdown > 0}
                activeOpacity={0.85}
              >
                {sendingOtp ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.sendOtpButtonText}>Sending verification code...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name={otpMatchesCurrentEmail ? 'refresh' : 'paper-plane-outline'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.sendOtpButtonText}>
                      {countdown > 0
                        ? `Resend Code (${countdown}s)`
                        : otpMatchesCurrentEmail
                        ? 'Resend Verification Code'
                        : 'Send Verification Code'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* STEP 2: ENTER OTP & NEW PASSWORD (VISIBLE ONCE OTP IS SENT) */}
              {otpMatchesCurrentEmail && (
                <View style={styles.stepTwoSection}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>ENTER CODE & NEW PASSWORD</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* 6-DIGIT OTP FIELD */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>6-Digit Verification Code</Text>
                      <Text style={styles.helperTag}>Sent to inbox</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'otp' && styles.inputWrapperFocused,
                        otp.length === 6 && styles.inputWrapperSuccess,
                      ]}
                    >
                      <Ionicons
                        name="shield-outline"
                        size={19}
                        color={otp.length === 6 ? '#10B981' : focusedField === 'otp' ? colors.accent : colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="000000"
                        placeholderTextColor={colors.inputPlaceholder}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={(val) => setOtp(val.replace(/\D/g, ''))}
                        onFocus={() => setFocusedField('otp')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  {/* NEW PASSWORD FIELD */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>New Password</Text>
                      <Text style={styles.helperTag}>Min 6 characters</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'newPassword' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={19}
                        color={focusedField === 'newPassword' ? colors.accent : colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Enter new password"
                        placeholderTextColor={colors.inputPlaceholder}
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        onFocus={() => setFocusedField('newPassword')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={19}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* CONFIRM NEW PASSWORD FIELD */}
                  <View style={styles.fieldContainer}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Confirm New Password</Text>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                        confirmPassword.length > 0 &&
                          newPassword === confirmPassword &&
                          styles.inputWrapperSuccess,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={19}
                        color={
                          confirmPassword.length > 0 && newPassword === confirmPassword
                            ? '#10B981'
                            : focusedField === 'confirmPassword'
                            ? colors.accent
                            : colors.textMuted
                        }
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Re-enter new password"
                        placeholderTextColor={colors.inputPlaceholder}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={19}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Password match indicator */}
                    {confirmPassword.length > 0 && (
                      <View style={styles.matchIndicatorRow}>
                        <Ionicons
                          name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                          size={14}
                          color={newPassword === confirmPassword ? '#10B981' : '#EF4444'}
                        />
                        <Text
                          style={[
                            styles.matchIndicatorText,
                            { color: newPassword === confirmPassword ? '#10B981' : '#EF4444' },
                          ]}
                        >
                          {newPassword === confirmPassword
                            ? 'Passwords match'
                            : 'Passwords do not match'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* RESET PASSWORD ACTION BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.resetButton,
                      (resetting || otp.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleResetPassword}
                    disabled={
                      resetting ||
                      otp.length !== 6 ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    activeOpacity={0.85}
                  >
                    {resetting ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.resetButtonText}>Updating password...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.resetButtonText}>Save New Password</Text>
                        <Ionicons name="checkmark-done" size={17} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* BACK TO LOGIN LINK */}
              <View style={styles.backToLoginRow}>
                <Text style={styles.backToLoginPrompt}>Remember your password?</Text>
                <TouchableOpacity
                  onPress={() => router.replace('/login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToLoginLink}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },

  keyboardContainer: {
    flex: 1,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.headerBorder,
    backgroundColor: colors.headerBg,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  topBarSpacer: {
    width: 38,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  contentWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  /* HERO HEADER */
  heroContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },

  heroIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(59, 130, 246, 0.28)' : '#BFDBFE',
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },

  /* FORM CARD */
  formCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  helperTag: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 11,
    paddingHorizontal: 13,
    height: 48,
  },

  inputWrapperFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.inputBg,
  },

  inputWrapperSuccess: {
    borderColor: '#10B981',
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    height: '100%',
  },

  passwordInput: {
    paddingRight: 8,
  },

  otpInput: {
    letterSpacing: 6,
    fontSize: 16,
    fontWeight: '700',
  },

  eyeButton: {
    padding: 4,
  },

  domainStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  domainValid: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },

  domainInvalid: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },

  domainStatusText: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  sendOtpButton: {
    backgroundColor: colors.navy,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 8,
  },

  sendOtpButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* STEP TWO */
  stepTwoSection: {
    marginTop: 12,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },

  dividerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },

  matchIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },

  matchIndicatorText: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  resetButton: {
    backgroundColor: '#10B981',
    height: 48,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* BACK TO LOGIN */
  backToLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  backToLoginPrompt: {
    color: colors.textSecondary,
    fontSize: 12.5,
  },

  backToLoginLink: {
    color: colors.accent,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
