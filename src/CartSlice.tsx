import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts } from "./thunk";

// Product slice
const CartSlice = createSlice({
  name: "products",
  initialState: {
    items: [], // Holds the products array
    isLoading: false, // Tracks loading state
    isError: false, // Tracks the error
    myCart: [], // Cart with products
    totalPrice: 0, // Total price
  },

  reducers: {

    addToCart: (state, action) => {
      const existProduct = state.myCart.find(
        (product) => product.id === action.payload.id
      );

      if (existProduct) {
        existProduct.count = existProduct.count + 1;
      } else {
        state.myCart = [...state.myCart, { ...action.payload, count: 1 }];
      }
      state.totalPrice = Math.round(
        state.myCart.reduce(
          (sum, product) => sum + product.price * product.count,
          0
        )
      );
    },

    deleteCart: (state, action) => {
      state.myCart = state.myCart.filter((p) => p.id !== action.payload);
      state.totalPrice = Math.round(
        state.myCart.reduce(
          (sum, product) => sum + product.price * product.count,
          0
        )
      );
    },

    incrementCounter: (state, action) => {
      const id = action.payload;
      const product = state.myCart.find((p) => p.id === id);
      if (product) {
        product.count += 1;
      }
      state.totalPrice = Math.round(
        state.myCart.reduce(
          (sum, product) => sum + product.price * product.count,
          0
        )
      );
    },

    decrementCounter: (state, action) => {
      const id = action.payload;
      const product = state.myCart.find((p) => p.id === id);
      if (product && product.count > 1) {
        product.count -= 1;
      }
      state.totalPrice = Math.round(
        state.myCart.reduce(
          (sum, product) => sum + product.price * product.count,
          0
        )
      );
    },

    clearCart: (state) => {
      state.myCart = [];
      state.totalPrice = 0;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const ProductActions = CartSlice.actions;

export default CartSlice.reducer;
