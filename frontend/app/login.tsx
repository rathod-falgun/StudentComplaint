import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { API_BASE_URL } from '@/constants/api';

export default function Login() {

  const [email,setemail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);

  const handleLogin = async () => {
    if(!email || !password){
      Alert.alert('Error',"All Fields are Required");
      return;
    }
    try{

      console.log("base api url : " , API_BASE_URL);

      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`,
      {
        method : 'POST',
        headers:{ 'Content-Type' : 'application/json'},
        body : JSON.stringify({email:email.trim(),password}),
      });

      const data = await response.json(); 

      console.log("\n Full Login Response : " , data);

      if(response.ok){
        const userRole = data.role ? String(data.role).trim().toUpperCase() : 'STUDENT';
        console.log("LOGIN SUCCESS - userId:", data.userId, "name:", data.name, "role:", userRole);

        if (userRole === 'ADMIN') {
          console.log("Navigating to Admin Dashboard (/admin/dashboard)...");
          router.replace({
            pathname: '/admin/dashboard' as any,
            params: { name: data.name, userId: data.userId, email: data.email, role: userRole },
          });
        } else {
          console.log("Navigating to Student Dashboard (/dashboard)...");
          router.replace({
            pathname: '/dashboard',
            params: { name: data.name, userId: data.userId, email: data.email, role: userRole },
          });
        }
      }else{
        const failureMsg = data.message || data.error || "Login Failed: Invalid credentials";
        console.error("LOGIN FAILED DETAILS:", failureMsg);
        Alert.alert('Login Failed', failureMsg);
      }
    }catch(error: any){
      console.error("LOGIN CONNECTION ERROR DETAILS:", error);
      Alert.alert('Connection Error', `Unable to connect to server: ${error?.message || error}`);
    }finally{
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
        value={email}
        onChangeText={setemail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText} >
          Login
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 30,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#000000',
    marginBottom: 15,
  },

  loginButton: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  registerText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});