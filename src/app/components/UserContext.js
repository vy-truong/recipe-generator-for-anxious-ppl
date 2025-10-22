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

  const refreshUser = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (event === "SIGNED_IN") {
        setTimeout(() => {
          router.push(redirectPath);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectPath, router, refreshUser]);

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser, redirectPath, setRedirectPath }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
