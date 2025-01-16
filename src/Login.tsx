import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import FontAwesome for icons
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next'; // Facebook SDK
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  // Configure Google Sign-In once when the component is mounted
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '508522032375-r0j40s15nuk0mbruat4gn83sqmh7od93.apps.googleusercontent.com', // Replace with your Web Client ID from Firebase
    });
  }, []);

  // Helper: Validate Email Format
  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  // Handle Email/Password Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('User Login Successful:', user);

      // After successful email login, store userId (UID) and email in Firestore if not already present
      const docId = user.email.toLowerCase();
      await firestore().collection('users').doc(docId).set({
        email: user.email,
        userId: user.uid,  // Save user UID to Firestore
      }, { merge: true });

      // Navigate to DemoApp with userId
      navigation.navigate('DemoApp', { userId: user.uid });
      console.log(user.uid);
      
    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const onGoogleButtonPress = async () => {
    setLoading(true); // Start loading state
    setError(''); // Reset any previous error message

    try {
      // Ensure Google Play Services are available on the device
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign-in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);

      const email = userInfo.user.email;
      const userId = userInfo.user.id;

      // Save the user's details in Firestore
      const docId = email.toLowerCase();
      await firestore().collection('users').doc(docId).set({
        email: email,
        userId: userId,  // Save userId to Firestore
      }, { merge: true });

      // Navigate to DemoApp with userId
      navigation.navigate('DemoApp', { userId: userId });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-In was cancelled. Please try again.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign-In is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services are not available or outdated.');
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false); // Stop loading state after the process completes
    }
  };

  // Handle Facebook Login
  const onFacebookButtonPress = async () => {
    setLoading(true); // Start loading state
    setError(''); // Reset any previous error message

    try {
      console.log("Starting Facebook login...");

      // Facebook Login
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      console.log("Facebook result", result);

      if (result.isCancelled) {
        console.log("Facebook login cancelled.");
        setError('Login cancelled');
        return;
      }

      console.log("Facebook login successful!");

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        setError('Failed to get access token');
        return;
      }

      console.log('Facebook Login Success:', data);

      // Get Facebook user info
      const userId = data.userID;
      const email = data.email || 'facebookuser@example.com';  // Fallback in case email is not available

      // Save the user's details in Firestore
      await firestore().collection('users').doc(userId).set({
        email: email,
        userId: userId,  // Save userId to Firestore
      }, { merge: true });

      // Navigate to DemoApp with userId
      navigation.navigate('DemoApp', { userId: userId });
    } catch (error) {
      console.error('Facebook Login Error:', error);
      setError('Facebook Sign-In failed. Please try again.');
    } finally {
      setLoading(false); // Stop loading state after the process completes
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8e8e8e"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8e8e8e"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#A5D6A7' : '#4CAF50' }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={{ color: 'blue' }}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <Text style={styles.divider}>OR</Text>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#90CAF9' : '#4285F4' }]}
        onPress={onGoogleButtonPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Icon name="logo-google" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Sign In with Google</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Facebook Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#90CAF9' : '#3b5998' }]}
        onPress={onFacebookButtonPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Icon name="logo-facebook" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Sign In with Facebook</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: 'black',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    fontSize: 16,
    marginVertical: 15,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
});

export default Login;
