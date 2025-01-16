import { configureStore } from "@reduxjs/toolkit";
import ProductReducer from './CartSlice';
import authReducer from '../src/authSlice';
export const store = configureStore({
  reducer: {
    products: ProductReducer,
    auth: authReducer,

  },
});

