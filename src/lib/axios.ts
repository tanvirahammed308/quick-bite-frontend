import axios from "axios";
import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Wait for Firebase's current user
      const user = auth.currentUser;

      console.log("🔥 Axios Firebase user:", user);

      if (!user) {
        console.warn("❌ No Firebase user found");
        return config;
      }

      // Get Firebase ID token
      const token = await getIdToken(user, true);

      console.log(
        "🔥 Firebase token:",
        token ? "TOKEN RECEIVED" : "NO TOKEN"
      );

      config.headers.Authorization = `Bearer ${token}`;

      console.log(
        "✅ Authorization header attached"
      );

      return config;
    } catch (error) {
      console.error(
        "❌ Firebase token error:",
        error
      );

      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;