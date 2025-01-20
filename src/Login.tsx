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
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '508522032375-r0j40s15nuk0mbruat4gn83sqmh7od93.apps.googleusercontent.com',
    });
  }, []);

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

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

      const userDoc = await firestore().collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const cart = userData.cart || []; // Fetch the existing cart or default to an empty array

        // Navigate to DemoApp with userId and cart
        navigation.navigate('DemoApp', { userId: user.uid, cart });
      } else {
        // If the user document doesn't exist, create it with an empty cart
        await firestore().collection('users').doc(user.uid).set({
          email: user.email,
          userId: user.uid,
          cart: [],
        });
        navigation.navigate('DemoApp', { userId: user.uid, cart: [] });
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo);

      const userId = userInfo.data?.user.id;
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (userDoc.exists) {
        console.log("<<<<<<<<<<<<<<<<");
        
        // const userData = userDoc.data();
        // const cart = userData.cart || [];
        // console.log("<<<<<<<<<<<",userData);
        // console.log(">>>>>>>>>>",cart);
        
        

        // // Navigate to DemoApp with userId and cart
        navigation.navigate('DemoApp', { userId});
      } else {
        await firestore().collection('users').doc(userId).set({
          email: userInfo.data?.user.email,
          userId,
          cart: [],
        });
        navigation.navigate('DemoApp', { userId, cart: [] });
      }
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
      setLoading(false);
    }
  };

  const onFacebookButtonPress = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Starting Facebook login...');
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        setError('Login cancelled');
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        setError('Failed to get access token');
        return;
      }

      const userId = data.userID;
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const cart = userData.cart || [];

        // Navigate to DemoApp with userId and cart
        navigation.navigate('DemoApp', { userId, cart });
      } else {
        await firestore().collection('users').doc(userId).set({
          userId,
          cart: [],
        });
        navigation.navigate('DemoApp', { userId, cart: [] });
      }
    } catch (error) {
      console.error('Facebook Login Error:', error);
      setError('Facebook Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
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
      <Text style={styles.divider}>OR</Text>
      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#90CAF9' : '#4285F4' }]}
        onPress={onGoogleButtonPress}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In with Google</Text>}
      </TouchableOpacity>
      {/* Facebook Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#90CAF9' : '#3b5998' }]}
        onPress={onFacebookButtonPress}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In with Facebook</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // Add your styles here
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
