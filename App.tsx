import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./src/store";
import DemoApp from './src/Demoapp';
import Cart from "./src/Cart";
import Login from "./src/Login";
import Signup from "./src/Signup";

const HomeStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <HomeStack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />


      <HomeStack.Screen name="DemoApp" component={DemoApp} options={{ headerShown: false }} />
      <HomeStack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />


    </HomeStack.Navigator>
  );
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <HomeStackNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
});

export default App;
