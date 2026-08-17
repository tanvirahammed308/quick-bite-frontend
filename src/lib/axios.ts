import axios from "axios";
import { auth } from "./firebase";
import { getIdToken, onAuthStateChanged, User } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Resolves once Firebase has settled its auth state at least once
function waitForFirebaseUser(): Promise<User | null> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

api.interceptors.request.use(
  async (config) => {
    try {
      const user = await waitForFirebaseUser();

      if (!user) {
        console.warn("❌ No Firebase user found for request:", config.url);
        return config;
      }

      const token = await getIdToken(user, true);
      config.headers.Authorization = `Bearer ${token}`;

      return config;
    } catch (error) {
      console.error("❌ Firebase token error:", error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

export default api;