import { router } from 'expo-router';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Login() {
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
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>
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