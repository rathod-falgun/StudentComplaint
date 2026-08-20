import { router } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        College Complaint App
      </Text>

      <Text style={styles.subtitle}>
        Welcome to the College Complaint System
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e7d3d3',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },

  button: {
    width: 200,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});