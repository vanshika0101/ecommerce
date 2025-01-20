import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, ToastAndroid } from 'react-native';
import { fetchProducts } from './thunk';
import { ActivityIndicator, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native'; // useRoute to get params
import { ProductActions } from './CartSlice';
import firestore from '@react-native-firebase/firestore';

const DemoApp = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();  // Access route params
  const { userId } = route.params || {};  // Get userId from navigation params
  console.log(userId);


  const { isLoading, items, myCart } = useSelector((store) => store.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch,userId]);

  const showToast = () => {
    ToastAndroid.showWithGravityAndOffset(
      'Item has been added to cart!',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  };

  const handleAddToCart = async (item) => {
    try {
      // Fetch user data from Firestore
      const user = await firestore().collection('users').doc(userId).get();
      console.log(user._data.cart);

      let tempcart = [];
      tempcart = user._data.cart;

      if (tempcart.length > 0) {
        let existing = false;
        tempcart.map(itm => {
          if (itm.id == item.id) {
            existing = true;
            // If qty doesn't exist, add it
            if (!itm.data.qty) {
              itm.data.qty = 1;  // Initialize qty if it's missing
            } else {
              itm.data.qty = itm.data.qty + 1;  // Increment qty
            }
          }
        });
        if (existing == false) {
          // If the item doesn't exist, add it with qty = 1
          tempcart.push({ ...item, data: { ...item.data, qty: 1 } });
        }
      } else {
        // If cart is empty, push the item with qty = 1
        tempcart.push({ ...item, data: { ...item.data, qty: 1 } });
      }

      console.log(tempcart);

      // Update the cart in Firestore
      firestore().collection("users").doc(userId).update({
        cart: tempcart,
      });
      showToast();

    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add item to cart.');
    }
  };

  const handleIncrement = async (item) => {
    dispatch(ProductActions.incrementCounter(item.id));

    try {
      const user = await firestore().collection('users').doc(userId).get();
      let tempCart = [...user._data.cart];

      tempCart.map(itm => {
        if (itm.id === item.id) {
          itm.data.qty += 1;
        }
      });

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  };

  const handleDecrement = async (item) => {
    dispatch(ProductActions.decrementCounter(item.id));

    try {
      const user = await firestore().collection('users').doc(userId).get();
      let tempCart = [...user._data.cart];

      tempCart.map(itm => {
        if (itm.id === item.id && itm.data.qty > 1) {
          itm.data.qty -= 1;
        }
      });

      await firestore().collection('users').doc(userId).update({
        cart: tempCart,
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  };



  const getcount = (itemId) => {
    const productInCart = myCart.find((product) => product.id === itemId);
    return productInCart ? productInCart.count : 0;
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Cart', userId)} style={styles.button}>
        <Text style={styles.buttontxt}>Go to Cart</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const isInCart = myCart.some((product) => product.id === item.id);

            return (
              <View style={styles.cardContainer}>
                <Card style={styles.card}>
                  <Card.Content>
                    <Image source={{ uri: item.images[0] }} style={styles.squareImage} />
                    <View style={styles.imgtxt}>
                      <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.price}>{'\u20B9'}{item.price}</Text>

                      {/* {isInCart && (
                        <View style={styles.counterContainer}>
                          <TouchableOpacity
                            onPress={() => handleDecrement(item)}
                            style={styles.decrementButton}
                          >
                            <Text style={styles.incrementButtontxt}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.container1}>{(getcount)}</Text>
                          <TouchableOpacity
                            onPress={() => handleIncrement(item)}
                            style={styles.incrementButton}
                          >
                            <Text style={styles.incrementButtontxt}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )} */}

                      <TouchableOpacity
                        style={styles.gobtn}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Text style={styles.gobuttontxt}>
                          {isInCart ? 'Added to Cart' : 'Add to Cart'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    margin: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 4,
    padding: 10,
  },
  squareImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  imgtxt: {
    marginTop: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: 'green',
    marginVertical: 4,
    textAlign: 'center',
  },
  gobtn: {
    backgroundColor: '#6200EE',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 8,
  },
  gobuttontxt: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: 'blue',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  buttontxt: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
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
});

export default DemoApp;
