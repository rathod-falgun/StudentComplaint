import { router } from 'expo-router';
import React from 'react';
import { useState } from 'react';
// @ts-ignore React Native types may be unavailable in the current TypeScript setup.
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';


export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

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
    try {
      setLoading(true);

      const response = await fetch(
        'http://10.122.90.235:8081/api/auth/register',
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            name: name.trim(),
            email: email.trim(),
            password: password
          }
        ),
      }
      );
      const data = await response.json();
      console.log('Backend response:', data.message);

      if (response.ok && data.message) {
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
          'Already Registration ',
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
        placeholderTextColor="#f0e8e8"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

       <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: '#f0e8e8' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={departmentData}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select Department' : '...'}
        searchPlaceholder="Search department..."
        value={department}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setDepartment(item.value);
          setIsFocus(false);
        }}
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
  container: { flexGrow: 1, backgroundColor: '#382525', justifyContent: 'center', padding: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f2eded', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#a19898', textAlign: 'center', marginBottom: 30 },
  input: { height: 50, borderWidth: 1, borderColor: '#fef8f8', borderRadius: 8, paddingHorizontal: 15, color: '#0f0e0e', marginBottom: 15 },
  registerButton: { height: 50, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#b3a7a7', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 15 },
  dropdown: {
    height: 50,
    borderColor: '#f0e8e8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'transparent', // Match your background color here
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#f0e8e8', // Matches your template text color
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#ffffff', // Color of text after selection
  },
  iconStyle: {
    width: 20,
    height: 20,
    tintColor: '#f0e8e8',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
  }
});

function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
