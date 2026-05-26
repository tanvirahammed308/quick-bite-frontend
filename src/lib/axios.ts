import axios from "axios";
import {  getIdToken } from "firebase/auth";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Firebase Auth 
api.interceptors.request.use(async (config) => {

  const user = auth.currentUser;
  
  if (user) {
    // Firebase from token
    const token = await getIdToken(user);
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;