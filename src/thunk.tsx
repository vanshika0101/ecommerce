import { createAsyncThunk } from "@reduxjs/toolkit";

//Async thunk for fetching products
export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const response = await fetch("https://dummyjson.com/products");
  const data = await response.json();
  // console.log("API Response:", data); // Check if 'data.products' exists
  return data.products; // Ensure you're returning only the products array
});

