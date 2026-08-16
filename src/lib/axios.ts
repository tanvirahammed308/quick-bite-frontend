import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const waitForAuthUser = (): Promise<import("firebase/auth").User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

api.interceptors.request.use(
  async (config) => {
    try {
      let user = auth.currentUser;

      // Firebase may not have restored the session yet
      if (!user) {
        user = await waitForAuthUser();
      }

      console.log("🔥 Firebase user:", user?.uid);

      if (!user) {
        console.error("❌ No authenticated Firebase user");
        return config;
      }

      const token = await user.getIdToken(true);

      console.log("🔥 Firebase token received:", !!token);

      config.headers.Authorization = `Bearer ${token}`;

      console.log("🔥 Authorization header attached");

      return config;
    } catch (error) {
      console.error("❌ Failed to attach Firebase token:", error);

      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;