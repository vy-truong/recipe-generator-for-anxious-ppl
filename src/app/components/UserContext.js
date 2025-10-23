"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import supabase from "../config/supabaseClient";

const UserContext = createContext({
  user: null,
  refreshUser: async () => {},
  setUser: () => {},
  redirectPath: "/",
  setRedirectPath: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const router = useRouter();

  const syncUserProfile = useCallback(async (userData) => {
    if (!userData?.id) return;

    const metadata = userData.user_metadata || {};
    const payload = {
      id: userData.id,
      username: metadata.username || userData.email?.split("@")[0] || null,
      first_name: metadata.first_name || null,
      last_name: metadata.last_name || null,
      gender: metadata.gender || null,
      birthday: metadata.birthday || null,
    };

    const cleaned = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() || null : value ?? null,
      ])
    );

    try {
      await supabase.from("users").upsert(cleaned, { onConflict: "id" });
    } catch (error) {
      console.warn("[UserContext] Failed to sync user profile", error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  }, [syncUserProfile]);

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (event === "SIGNED_IN") {
        syncUserProfile(nextUser).finally(() => {
          setTimeout(() => {
            router.push(redirectPath);
          }, 0);
        });
      } else if (nextUser) {
        syncUserProfile(nextUser);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectPath, router, refreshUser, syncUserProfile]);

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser, redirectPath, setRedirectPath }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
