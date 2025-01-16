import React from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { ProductActions } from './CartSlice'; // Assuming you have actions like 'clearCart'
//import { AuthActions } from './authSlice'; // Assuming AuthActions manage user login/logout
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // Ensure GoogleSignin is imported

const Width = Dimensions.get('screen').width;
const cardWidth = Width - 20;

const Cart = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const selectedProducts = useSelector((state) => state.products.myCart);
  const totalPrice = useSelector((state) => state.products.totalPrice);

  // Check if cart is empty
  const isCartEmpty = selectedProducts.length === 0;

  // Logout function
  const handleLogout = async () => {
    dispatch(ProductActions.clearCart());

    try {
      await GoogleSignin.signOut(); // Sign out from Google if the user is logged in via Google
      Alert.alert('Logged Out', 'You have been logged out.');
      navigation.navigate('Login'); // Navigate back to login screen
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Decrement counter and automatically remove the item if count is 0
  const handleDecrement = (item) => {
    if (item.count > 1) {
      dispatch(ProductActions.decrementCounter(item.id));
    } else {
      dispatch(ProductActions.deleteCart(item.id));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart Items</Text>
      {isCartEmpty ? (
        <Text style={styles.emptyMessage}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={selectedProducts}
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
                  onPress={() => handleDecrement(item)} // Use the updated decrement handler
                  style={styles.decrementButton}
                >
                  <Text style={styles.incrementButtontxt}>-</Text>
                </TouchableOpacity>
                <Text style={styles.container1}>{item.count || 0}</Text>
                <TouchableOpacity
                  onPress={() => dispatch(ProductActions.incrementCounter(item.id))}
                  style={styles.incrementButton}
                >
                  <Text style={styles.incrementButtontxt}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => dispatch(ProductActions.deleteCart(item.id))}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        {/* Total Price */}
        <Text
          style={[styles.totalPriceText, isCartEmpty && styles.disabledText]} // Add disabled style if cart is empty
        >
          Total Price: {'\u20B9'}{totalPrice}
        </Text>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
