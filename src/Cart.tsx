import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

const Width = Dimensions.get('screen').width;
const cardWidth = Width - 20;

const Cart = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0); // State for total price
  const userId = route.params || {};  // Set initial userId from route params

  // Fetch cart data whenever userId changes
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      const userCart = userDoc.exists ? userDoc.data().cart || [] : [];
      setCartItems(userCart);

      console.log(">>>>>>>>>>>>>>>>>",userDoc);
      
      console.log("<<<<<<<<<<<<<<<<<<<<<",userDoc.data());
      

      // Calculate and round total price
      const total = Math.round(
        userCart.reduce((acc, item) => acc + item.price * item.data.qty, 0)
      );
      setTotalPrice(total);

      console.log('Fetched Cart:', userCart);
      console.log('Total Price:', total);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const isCartEmpty = cartItems.length === 0;

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      Alert.alert('Logged Out', 'You have been logged out.');

      // Reset userId after logout
      //setUserId(null);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleIncrement = async (item) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      let tempCart = [...userDoc.data().cart];

      tempCart = tempCart.map((itm) => {
        if (itm.id === item.id) {
          itm.data.qty += 1;
        }
        return itm;
      });

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });

      setCartItems(tempCart);

      // Recalculate and round total price
      const total = Math.round(
        tempCart.reduce((acc, itm) => acc + itm.price * itm.data.qty, 0)
      );
      setTotalPrice(total);

      console.log('Incremented Cart:', tempCart);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
    }
  };

  const handleDecrement = async (item) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      let tempCart = [...userDoc.data().cart];

      tempCart = tempCart
        .map((itm) => {
          if (itm.id === item.id) {
            if (itm.data.qty >= 1) {
              itm.data.qty -= 1;
            }
          }
          return itm;
        })
        .filter((itm) => itm.data.qty >0);
  

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });

      setCartItems(tempCart);

      // Recalculate and round total price
      const total = Math.round(
        tempCart.reduce((acc, itm) => acc + itm.price * itm.data.qty, 0)
      );
      setTotalPrice(total);

      console.log('Updated Cart after Decrement:', tempCart);
    } catch (error) {
      console.error('Error decrementing quantity:', error);
    }
  };

  const handleDelete = async (item) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      let tempCart = [...userDoc.data().cart];

      tempCart = tempCart.filter((itm) => itm.id !== item.id);

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });

      setCartItems(tempCart);

      // Recalculate and round total price
      const total = Math.round(
        tempCart.reduce((acc, itm) => acc + itm.price * itm.data.qty, 0)
      );
      setTotalPrice(total);

      console.log('Deleted Item from Cart:', tempCart);
    } catch (error) {
      console.error('Error deleting item from Firestore:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart Items</Text>
      {isCartEmpty ? (
        <Text style={styles.emptyMessage}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image source={{ uri: item.images[0] }} style={styles.squareImage} />
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>
                {'\u20B9'}{item.price}
              </Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  onPress={() => handleDecrement(item)}
                  style={styles.decrementButton}
                >
                  <Text style={styles.incrementButtontxt}>-</Text>
                </TouchableOpacity>
                <Text style={styles.container1}>{item.data.qty}</Text>
                <TouchableOpacity
                  onPress={() => handleIncrement(item)}
                  style={styles.incrementButton}
                >
                  <Text style={styles.incrementButtontxt}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text
          style={[styles.totalPriceText, isCartEmpty && styles.disabledText]}
        >
          Total Price: {'\u20B9'}{totalPrice}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // (Same styles as before)
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  itemContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: 'green',
    marginTop: 4,
  },
  squareImage: {
    width: cardWidth - 80,
    height: 200,
    backgroundColor: '#e8edea',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: 'red',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  incrementButton: {
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  decrementButton: {
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  incrementButtontxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container1: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    width: 40,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledText: {
    color: '#bbb',
  },
  logoutButton: {
    backgroundColor: '#007bff',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cart;
