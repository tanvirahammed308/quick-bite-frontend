"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/features/auth/auth.slice";
import api from "@/lib/axios";

export function useAuthGuard(requireAdmin: boolean = false) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, loading: reduxLoading } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      // Try to restore session from localStorage if Redux doesn't have a user yet
      if (token && savedUser && !currentUser) {
        try {
          const response = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (cancelled) return;

          if (response.data.user) {
            dispatch(setCurrentUser(response.data.user));
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Session restore failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      if (cancelled) return;

      // Everything below can run with no prior `await` (e.g. no token at all),
      // so defer to break the synchronous dispatch/setState chain.
      queueMicrotask(() => {
        if (cancelled) return;

        if (currentUser) {
          if (requireAdmin && currentUser.role !== "admin") {
            setIsAuthenticated(false);
            setIsLoading(false);
            router.push("/");
            return;
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // No user found anywhere, redirect to login
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push("/login");
      });
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [currentUser, dispatch, requireAdmin, router]);

  if (isLoading || reduxLoading) {
    return { user: null, loading: true };
  }

  if (!isAuthenticated) {
    return { user: null, loading: false };
  }

  return { user: currentUser, loading: false };
}