
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export function useAuthGuard(requireAdmin: boolean = false) {
  const router = useRouter();
  const { currentUser, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (loading) return;
    
    if (!currentUser) {
      router.push("/login");
    } else if (requireAdmin && currentUser.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, loading, router, requireAdmin]);

  return { user: currentUser, loading };
}