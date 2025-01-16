// index.js or App.js

import { AppRegistry } from 'react-native';
import App from './App'; // Import your root app component
import { name as appName } from './app.json'; // App name from app.json

// Register your app component with AppRegistry
AppRegistry.registerComponent(appName, () => App);
