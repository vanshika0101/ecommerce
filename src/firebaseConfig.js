// firebase.js
import firebase from '@react-native-firebase/app'; // Import the core Firebase module
import '@react-native-firebase/auth'; // Import Auth module (if you're using Firebase Authentication)

// Initialize Firebase (you don't need to pass any config for @react-native-firebase, it auto-detects from your config files)
if (!firebase.apps.length) {
  firebase.initializeApp(); // Initializes Firebase (only once, no need to pass config)
} else {
  firebase.app(); // If already initialized, use the existing instance
}

export default firebase;
