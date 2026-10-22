import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeColors } from '@/constants/theme';

const COLORS = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  text: '#101828',
  secondary: '#667085',
  muted: '#98A2B3',
  border: '#E4E7EC',
  navy: '#173B70',
  blue: '#2457C5',
  blueSoft: '#EFF5FF',
  success: '#16804A',
  successSoft: '#ECFDF3',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  disabled: '#AAB8D2',
};

const ALLOWED_COLLEGE_DOMAIN = 'scet.ac.in';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const departmentData = [
  { label: 'Computer Engineering (CO)', value: 'CO' },
  { label: 'Information Technology (IT)', value: 'IT' },
  { label: 'Mechanical Engineering (MECH)', value: 'MECH' },
  { label: 'Instrumentation & Control (IC)', value: 'IC' },
  { label: 'Electronics & Communication (EC)', value: 'EC' },
  { label: 'Civil Engineering (CIVIL)', value: 'CIVIL' },
  { label: 'Electrical Engineering (EE)', value: 'EE' },
];

const divisionData = [
  { label: 'Division A', value: 'A' },
  { label: 'Division B', value: 'B' },
  { label: 'Division C', value: 'C' },
  { label: 'Division D', value: 'D' },
  { label: 'Division A1', value: 'A1' },
  { label: 'Division A2', value: 'A2' },
  { label: 'Division B1', value: 'B1' },
  { label: 'Division B2', value: 'B2' },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidCollegeEmail(value: string) {
  const normalized = normalizeEmail(value);
  if (!EMAIL_REGEX.test(normalized)) return false;
  const parts = normalized.split('@');
  return parts.length === 2 && parts[1] === ALLOWED_COLLEGE_DOMAIN;
}

function readServerMessage(raw: string, fallback: string) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.message || parsed?.error || raw || fallback;
  } catch {
    return raw || fallback;
  }
}

export default function RegisterScreen() {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const emailRef = useRef('');

  const API_URL = API_BASE_URL;
  const normalizedEmail = normalizeEmail(email);
  const collegeEmailValid = isValidCollegeEmail(email);
  const otpMatchesCurrentEmail = otpSent && otpEmail === normalizedEmail;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailChange = (value: string) => {
    emailRef.current = value;
    const previousNormalized = normalizeEmail(email);
    const nextNormalized = normalizeEmail(value);
    setEmail(value);

    if (previousNormalized !== nextNormalized) {
      setOtp('');
      setOtpSent(false);
      setOtpEmail(null);
      setCountdown(0);
    }
  };

  const handleSendOtp = async () => {
    const targetEmail = normalizeEmail(email);

    if (!targetEmail) {
      Alert.alert('Email required', 'Enter your official college email address first.');
      return;
    }
    if (!EMAIL_REGEX.test(targetEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!isValidCollegeEmail(targetEmail)) {
      Alert.alert('College email required', `Use your official @${ALLOWED_COLLEGE_DOMAIN} address.`);
      return;
    }
    if (!API_URL) {
      Alert.alert('Configuration error', 'The API URL is not configured. Set EXPO_PUBLIC_API_BASE and restart Expo.');
      return;
    }

    setSendingOtp(true);
    setOtp('');
    setOtpSent(false);
    setOtpEmail(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const rawResponse = await response.text();

      if (!response.ok) {
        Alert.alert('Could not send code', readServerMessage(rawResponse, 'Failed to send the verification code.'));
        return;
      }

      // Do not attach an OTP request to a different address if the field changed mid-request.
      if (normalizeEmail(emailRef.current) !== targetEmail) {
        Alert.alert('Email changed', 'The email field changed while the code was being sent. Send a new code for the current address.');
        return;
      }

      setOtpSent(true);
      setOtpEmail(targetEmail);
      setCountdown(60);
      Alert.alert('Verification code sent', `Check the inbox for ${targetEmail} and enter the 6-digit code below.`);
    } catch {
      Alert.alert('Connection error', 'Unable to reach the server. Check that the backend is running and the API URL is correct.');
    } finally {
      setSendingOtp(false);
    }
  };

  const pickProfilePhoto = () => {
    Alert.alert('Profile photo', 'Choose where to get your profile photo.', [
      {
        text: 'Take photo',
        onPress: async () => {
          try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission required', 'Camera permission is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) setProfilePhoto(result.assets[0].uri);
          } catch {
            Alert.alert('Unable to open camera', 'Please try again or choose a photo from your gallery.');
          }
        },
      },
      {
        text: 'Choose from gallery',
        onPress: async () => {
          try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission required', 'Gallery access is required to pick a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) setProfilePhoto(result.assets[0].uri);
          } catch {
            Alert.alert('Unable to open gallery', 'Please try again or take a photo instead.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const targetEmail = normalizeEmail(email);

    if (!trimmedName || !targetEmail || !password || !confirmPassword) {
      Alert.alert('Required fields', 'Please complete your name, email and password fields.');
      return;
    }
    if (!department) {
      Alert.alert('Department required', 'Select your academic department.');
      return;
    }
    if (!division) {
      Alert.alert('Division required', 'Select your division.');
      return;
    }
    if (!EMAIL_REGEX.test(targetEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!isValidCollegeEmail(targetEmail)) {
      Alert.alert('Official college email required', `Registration is only available for @${ALLOWED_COLLEGE_DOMAIN} addresses.`);
      return;
    }
    if (!otpMatchesCurrentEmail || otpEmail !== targetEmail) {
      Alert.alert('Verify your email', 'Send a verification code to this email address before creating your account.');
      return;
    }
    if (countdown <= 0) {
      Alert.alert(
        'Verification Code Expired',
        'Your 1-minute verification code has expired. Please tap "Resend verification code" to try again for a new one.'
      );
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert('Invalid verification code', 'Enter the 6-digit code sent to your college email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Check both password fields and try again.');
      return;
    }
    if (!API_URL) {
      Alert.alert('Configuration error', 'The API URL is not configured. Set EXPO_PUBLIC_API_BASE and restart Expo.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('email', targetEmail);
      formData.append('password', password);
      formData.append('department', department);
      formData.append('division', division);
      formData.append('otp', otp.trim());

      if (profilePhoto) {
        if (Platform.OS === 'web') {
          const photoResponse = await fetch(profilePhoto);
          const blob = await photoResponse.blob();
          let fileName = profilePhoto.split('/').pop() || `profile-photo-${Date.now()}.jpg`;
          if (!fileName.includes('.')) {
            const extension = blob.type ? blob.type.split('/')[1] || 'jpg' : 'jpg';
            fileName = `${fileName}.${extension}`;
          }
          const webFile = new globalThis.File([blob], fileName, { type: blob.type || 'image/jpeg' });
          formData.append('profilePhotoFile', webFile);
        } else {
          const file = new File(profilePhoto);
          formData.append('profilePhotoFile', file as unknown as Blob);
        }
      }

      const response = await expoFetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });
      const rawResponse = await response.text();

      if (response.ok) {
        Alert.alert('Account created', 'Your student account has been created. You can now sign in.', [
          { text: 'Go to sign in', onPress: () => router.replace('/login') },
        ]);
      } else {
        Alert.alert('Registration failed', readServerMessage(rawResponse, 'Something went wrong during registration.'));
      }
    } catch {
      Alert.alert('Connection error', 'Unable to connect to the server. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    field: string,
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    options: {
      placeholder: string;
      icon: keyof typeof Ionicons.glyphMap;
      secureTextEntry?: boolean;
      rightAction?: React.ReactNode;
      keyboardType?: 'default' | 'email-address';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      autoCorrect?: boolean;
      maxLength?: number;
    },
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, focusedField === field && styles.inputShellFocused]}>
        <Ionicons name={options.icon} size={18} color={focusedField === field ? colors.accent : colors.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={options.placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'none'}
          autoCorrect={options.autoCorrect ?? false}
          maxLength={options.maxLength}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          selectionColor={colors.accent}
        />
        {options.rightAction}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
        <Text style={styles.topBarTitle}>Create account</Text>
        <ThemeToggle compact />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.brandMark}>
            <Ionicons name="school-outline" size={25} color={COLORS.navy} />
          </View>
          <Text style={styles.eyebrow}>SCET • STUDENT PORTAL</Text>
          <Text style={styles.pageTitle}>Create your account</Text>
          <Text style={styles.pageSubtitle}>Register with your college email to report and track campus complaints.</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Student details</Text>
            <Text style={styles.optionalText}>Photo is optional</Text>
          </View>

          <TouchableOpacity style={styles.photoRow} onPress={pickProfilePhoto} activeOpacity={0.8}>
            <View style={styles.photoAvatar}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.photoImage} />
              ) : (
                <Ionicons name="camera-outline" size={23} color={COLORS.blue} />
              )}
            </View>
            <View style={styles.photoCopy}>
              <Text style={styles.photoTitle}>{profilePhoto ? 'Change profile photo' : 'Add a profile photo'}</Text>
              <Text style={styles.photoSubtitle}>Optional · JPG or PNG image</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>

          {renderInput('name', 'Full name', name, setName, {
            placeholder: 'Enter your full name', icon: 'person-outline', autoCapitalize: 'words',
          })}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Department</Text>
            <Dropdown
              style={[styles.dropdown, department && styles.dropdownSelected, focusedField === 'department' && styles.dropdownFocused]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              containerStyle={styles.dropdownMenu}
              data={departmentData}
              labelField="label"
              valueField="value"
              placeholder="Select your department"
              value={department}
              onFocus={() => setFocusedField('department')}
              onBlur={() => setFocusedField(null)}
              onChange={(item) => { setDepartment(item.value); setFocusedField(null); }}
              renderLeftIcon={() => <Ionicons name="business-outline" size={18} color={COLORS.muted} style={styles.dropdownIcon} />}
              renderRightIcon={() => <Ionicons name="chevron-down" size={17} color={COLORS.secondary} />}
              activeColor={COLORS.blueSoft}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Division</Text>
            <Dropdown
              style={[styles.dropdown, division && styles.dropdownSelected, focusedField === 'division' && styles.dropdownFocused]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              itemTextStyle={styles.dropdownItemText}
              containerStyle={styles.dropdownMenu}
              data={divisionData}
              labelField="label"
              valueField="value"
              placeholder="Select your division"
              value={division}
              onFocus={() => setFocusedField('division')}
              onBlur={() => setFocusedField(null)}
              onChange={(item) => { setDivision(item.value); setFocusedField(null); }}
              renderLeftIcon={() => <Ionicons name="people-outline" size={18} color={COLORS.muted} style={styles.dropdownIcon} />}
              renderRightIcon={() => <Ionicons name="chevron-down" size={17} color={COLORS.secondary} />}
              activeColor={COLORS.blueSoft}
            />
          </View>

          <View style={styles.sectionDivider} />
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Account security</Text>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.blue} />
          </View>

          {renderInput('email', 'Official college email', email, handleEmailChange, {
            placeholder: `name@${ALLOWED_COLLEGE_DOMAIN}`,
            icon: 'mail-outline',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {email.trim().length > 0 && (
            <View style={[styles.inlineNotice, collegeEmailValid ? styles.noticeSuccess : styles.noticeError]}>
              <Ionicons
                name={collegeEmailValid ? 'checkmark-circle-outline' : 'information-circle-outline'}
                size={16}
                color={collegeEmailValid ? COLORS.success : COLORS.danger}
              />
              <Text style={[styles.inlineNoticeText, { color: collegeEmailValid ? COLORS.success : COLORS.danger }]}>
                {collegeEmailValid
                  ? `Official college domain recognized: @${ALLOWED_COLLEGE_DOMAIN}`
                  : `Use a valid address ending in @${ALLOWED_COLLEGE_DOMAIN}`}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.otpButton, (!collegeEmailValid || sendingOtp || countdown > 0) && styles.otpButtonDisabled]}
            onPress={handleSendOtp}
            disabled={!collegeEmailValid || sendingOtp || countdown > 0}
            activeOpacity={0.85}
          >
            {sendingOtp ? (
              <ActivityIndicator size="small" color={COLORS.blue} />
            ) : (
              <Ionicons name={otpMatchesCurrentEmail ? 'refresh-outline' : 'mail-unread-outline'} size={17} color={COLORS.blue} />
            )}
            <Text style={styles.otpButtonText}>
              {sendingOtp ? 'Sending code…' : countdown > 0 ? `Resend code in ${countdown}s` : otpMatchesCurrentEmail ? 'Resend verification code' : 'Send verification code'}
            </Text>
          </TouchableOpacity>

          {otpMatchesCurrentEmail && (
            <View style={styles.otpPanel}>
              <View style={styles.otpPanelHeader}>
                <View style={styles.otpIconBox}>
                  <Ionicons name="lock-closed-outline" size={17} color={COLORS.blue} />
                </View>
                <View style={styles.otpPanelCopy}>
                  <Text style={styles.otpTitle}>Check your inbox</Text>
                  <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to this email.</Text>
                </View>


              </View>

              <TextInput
                style={[
                  styles.otpInput,
                  otp.length === 6 && styles.otpInputFilled,
                  countdown === 0 && styles.otpInputExpired,
                ]}
                value={otp}
                onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={COLORS.muted}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                textContentType="oneTimeCode"
                accessibilityLabel="Six-digit email verification code"
                editable={countdown > 0}
              />

              {countdown > 0 ? (
                <Text style={styles.otpFootnote}>
                  Code valid for{' '}
                  <Text
                    style={{
                      fontWeight: '700',
                      color: countdown <= 15 ? COLORS.danger : COLORS.navy,
                    }}
                  >
                    {countdown}s
                  </Text>
                  . Enter code before the timer expires.
                </Text>
              ) : (
                <View style={styles.expiredNoticeRow}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                  <Text style={styles.expiredNoticeText}>
                    Code has expired! Tap "Resend verification code" below to try again for a new one.
                  </Text>
                </View>
              )}
            </View>
          )}

          {renderInput('password', 'Password', password, setPassword, {
            placeholder: 'At least 6 characters', icon: 'lock-closed-outline', secureTextEntry: !showPassword,
            rightAction: (
              <TouchableOpacity style={styles.visibilityButton} onPress={() => setShowPassword((value) => !value)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={COLORS.secondary} />
              </TouchableOpacity>
            ),
          })}

          {renderInput('confirmPassword', 'Confirm password', confirmPassword, setConfirmPassword, {
            placeholder: 'Re-enter your password', icon: 'lock-closed-outline', secureTextEntry: !showConfirmPassword,
            rightAction: (
              <TouchableOpacity style={styles.visibilityButton} onPress={() => setShowConfirmPassword((value) => !value)} accessibilityRole="button" accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={COLORS.secondary} />
              </TouchableOpacity>
            ),
          })}

          {confirmPassword.length > 0 && (
            <View style={styles.passwordMatchRow}>
              <Ionicons name={password === confirmPassword ? 'checkmark-circle' : 'alert-circle-outline'} size={15} color={password === confirmPassword ? COLORS.success : COLORS.danger} />
              <Text style={[styles.passwordMatchText, { color: password === confirmPassword ? COLORS.success : COLORS.danger }]}>
                {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator size="small" color={COLORS.surface} /> : <Text style={styles.submitButtonText}>Create account</Text>}
            {!loading && <Ionicons name="arrow-forward" size={18} color={COLORS.surface} />}
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.muted} />
          <Text style={styles.footerText}>Your information is used to manage your campus account.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bgPrimary },
  keyboardContainer: { flex: 1, backgroundColor: colors.bgPrimary },
  topBar: {
    minHeight: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', backgroundColor: colors.headerBg, borderBottomWidth: 1, borderBottomColor: colors.headerBorder,
  },
  backButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBg },
  topBarTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  topBarBalance: { width: 38 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 26, paddingBottom: 32, alignItems: 'center' },
  pageHeader: { width: '100%', maxWidth: 520, alignItems: 'center', marginBottom: 22 },
  brandMark: { width: 52, height: 52, borderRadius: 16, backgroundColor: isDark ? '#1E2433' : '#EAF0FA', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  eyebrow: { color: colors.navy, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  pageTitle: { color: colors.textPrimary, fontSize: 27, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7, textAlign: 'center' },
  pageSubtitle: { maxWidth: 360, marginTop: 8, color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  formCard: {
    width: '100%', maxWidth: 520, padding: 22, borderRadius: 20, backgroundColor: colors.cardBg,
    borderWidth: 1, borderColor: colors.cardBorder,
    ...Platform.select({ web: { boxShadow: isDark ? '0px 8px 30px rgba(0, 0, 0, 0.4)' : '0px 8px 30px rgba(16, 24, 40, 0.04)' } as any, default: { elevation: 1 } }),
  },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' },
  optionalText: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
  photoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, marginBottom: 20, backgroundColor: colors.inputBg },
  photoAvatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: isDark ? '#262632' : colors.accentSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoCopy: { flex: 1, marginLeft: 12 },
  photoTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  photoSubtitle: { marginTop: 4, color: colors.textSecondary, fontSize: 11 },
  fieldGroup: { marginBottom: 16 },
  label: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  inputShell: {
    minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13,
    borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, backgroundColor: colors.inputBg,
  },
  inputShellFocused: { borderColor: colors.accent, backgroundColor: colors.inputBg, ...Platform.select({ web: { boxShadow: '0px 0px 0px 3px rgba(36, 87, 197, 0.08)' } as any, default: {} }) },
  input: { flex: 1, minWidth: 0, minHeight: 46, paddingVertical: 10, color: colors.textPrimary, fontSize: 14 },
  dropdown: { height: 49, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, backgroundColor: colors.inputBg },
  dropdownSelected: { borderColor: colors.cardBorder },
  dropdownFocused: { borderColor: colors.accent },
  dropdownPlaceholder: { color: colors.inputPlaceholder, fontSize: 13 },
  dropdownSelectedText: { color: colors.textPrimary, fontSize: 13 },
  dropdownItemText: { color: colors.textPrimary, fontSize: 13 },
  dropdownMenu: { borderRadius: 12, borderColor: colors.cardBorder, backgroundColor: colors.cardBg, overflow: 'hidden' },
  dropdownIcon: { marginRight: 10 },
  sectionDivider: { height: 1, backgroundColor: colors.divider, marginTop: 2, marginBottom: 20 },
  inlineNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, marginTop: -7, marginBottom: 13 },
  noticeSuccess: { backgroundColor: COLORS.successSoft },
  noticeError: { backgroundColor: COLORS.dangerSoft },
  inlineNoticeText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  otpButton: { minHeight: 43, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 11, backgroundColor: isDark ? '#1C1C24' : '#F8FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  otpButtonDisabled: { opacity: 0.55 },
  otpButtonText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  otpPanel: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 13, padding: 13, backgroundColor: isDark ? '#14141B' : '#FAFCFF', marginBottom: 17 },
  otpPanelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  otpIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? '#262632' : colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  otpPanelCopy: { flex: 1, marginLeft: 10 },
  otpTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
  otpSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  otpInput: { minHeight: 48, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10, backgroundColor: colors.inputBg, textAlign: 'center', letterSpacing: 7, fontSize: 20, fontWeight: '800', color: colors.textPrimary, paddingHorizontal: 12 },
  otpInputFilled: { borderColor: colors.accent },
  otpInputExpired: { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#991B1B' },
  otpFootnote: { marginTop: 8, color: colors.textSecondary, fontSize: 11 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: isDark ? '#1E2433' : '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#2E3A59' : '#BFDBFE' },
  timerBadgeText: { fontSize: 12, fontWeight: '800', color: colors.accent },
  timerBadgeExpired: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' },
  timerBadgeExpiredText: { fontSize: 11, fontWeight: '800', color: COLORS.danger },
  expiredNoticeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, padding: 8, marginTop: 10 },
  expiredNoticeText: { flex: 1, fontSize: 11, fontWeight: '600', color: COLORS.danger, lineHeight: 16 },
  visibilityButton: { width: 30, height: 38, alignItems: 'center', justifyContent: 'center' },
  passwordMatchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -7, marginBottom: 14 },
  passwordMatchText: { fontSize: 11, fontWeight: '600' },
  submitButton: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 3, backgroundColor: colors.navy, borderRadius: 12, paddingHorizontal: 16 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 19 },
  signInPrompt: { color: colors.textSecondary, fontSize: 12 },
  signInLink: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  footer: { maxWidth: 500, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, paddingHorizontal: 10 },
  footerText: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
});
