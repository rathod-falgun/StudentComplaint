import { apiFetch } from '@/constants/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE;

  const departmentData = [
    { label: 'Computer Engineering (CO)', value: 'CO' },
    { label: 'Information Technology (IT)', value: 'IT' },
    { label: 'Mechanical Engineering (MECH)', value: 'MECH' },
    { label: 'Instrumentation & Control (IC)', value: 'IC' },
    { label: 'Electronics & Communication (EC)', value: 'EC' },
    { label: 'Civil Engineering', value: 'CIVIL' },
    { label: 'Electrical Engineering', value: 'EE' },
  ];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (!department) {
      Alert.alert('Error', 'Please select your department');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Error',
        'Passwords do not match'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch(
        `/api/auth/register`,
        {
          method: 'POST',

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            department: department,
          }),
        }
      );

      const data = await response.json();

      console.log('Backend response:', data);

      if (response.ok) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully.',
          [
            {
              text: 'Login',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          data.message || 'Something went wrong'
        );
      }

    } catch (error) {
      console.log('Registration error:', error);

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please make sure the backend is running.'
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ================================
            HEADER
        ================================= */}

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>C</Text>
          </View>

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join the College Complaint App
          </Text>
        </View>


        {/* ================================
            REGISTRATION CARD
        ================================= */}

        <View style={styles.card}>

          {/* Full Name */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8D8D98"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>


          {/* Email */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8D8D98"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>


          {/* Password */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#8D8D98"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>


          {/* Confirm Password */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Confirm Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#8D8D98"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>


          {/* Department */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Department
            </Text>

            <Dropdown
              style={[
                styles.dropdown,
                isFocus && styles.dropdownFocused,
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={departmentData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={
                !isFocus
                  ? 'Select your department'
                  : '...'
              }
              searchPlaceholder="Search department..."
              value={department}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setDepartment(item.value);
                setIsFocus(false);
              }}
              dropdownPosition="top"
              containerStyle={styles.dropdownContainer}
            />
          </View>


          {/* Register Button */}

          <TouchableOpacity
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >

            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.registerButtonText}>
                  Creating Account...
                </Text>
              </>
            ) : (
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>
            )}

          </TouchableOpacity>

        </View>


        {/* ================================
            LOGIN SECTION
        ================================= */}

        <View style={styles.loginContainer}>

          <Text style={styles.loginQuestion}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginText}>
              Login
            </Text>
          </TouchableOpacity>

        </View>


        {/* Footer */}

        <Text style={styles.footerText}>
          College Complaint Management System
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({

  /* =====================================
     MAIN CONTAINER
  ====================================== */

  keyboardContainer: {
    flex: 1,
    backgroundColor: '#17171C',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#17171C',
    paddingHorizontal: 22,
    paddingVertical: 35,
    justifyContent: 'center',
  },


  /* =====================================
     HEADER
  ====================================== */

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,

    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#9B9BA5',
    textAlign: 'center',
  },


  /* =====================================
     CARD
  ====================================== */

  card: {
    backgroundColor: '#222229',
    borderRadius: 20,
    padding: 22,

    borderWidth: 1,
    borderColor: '#303038',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },


  /* =====================================
     FORM FIELDS
  ====================================== */

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8E8ED',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#3A3A44',
    borderRadius: 11,

    backgroundColor: '#1B1B21',

    paddingHorizontal: 15,

    color: '#FFFFFF',
    fontSize: 15,
  },


  /* =====================================
     DROPDOWN
  ====================================== */

  dropdown: {
    height: 52,

    borderWidth: 1,
    borderColor: '#3A3A44',
    borderRadius: 11,

    paddingHorizontal: 14,

    backgroundColor: '#1B1B21',
  },

  dropdownFocused: {
    borderColor: '#007AFF',
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#8D8D98',
  },

  selectedTextStyle: {
    fontSize: 15,
    color: '#FFFFFF',
  },

  inputSearchStyle: {
    height: 42,
    fontSize: 15,
    borderRadius: 8,
    color: '#222222',
  },

  iconStyle: {
    width: 20,
    height: 20,
  },

  dropdownContainer: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },


  /* =====================================
     REGISTER BUTTON
  ====================================== */

  registerButton: {
    height: 53,

    backgroundColor: '#007AFF',

    borderRadius: 11,

    justifyContent: 'center',
    alignItems: 'center',

    flexDirection: 'row',

    marginTop: 5,

    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },


  /* =====================================
     LOGIN
  ====================================== */

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 25,
  },

  loginQuestion: {
    color: '#8D8D98',
    fontSize: 14,
  },

  loginText: {
    color: '#4DA3FF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 5,
  },


  /* =====================================
     FOOTER
  ====================================== */

  footerText: {
    color: '#5E5E68',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },

}); 