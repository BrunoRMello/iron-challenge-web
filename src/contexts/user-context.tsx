"use client";

import { onIdTokenChanged, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, deleteCookie } from "cookies-next/client";

import { auth } from "@/firebase/client";

type TUserContext = {
  user: User | null;
  isLoading: boolean;
};

type TUserContextProvider = {
  children: ReactNode;
};

const initialValue: TUserContext = {
  user: null,
  isLoading: true,
};

export const UserContext = createContext<TUserContext>(initialValue);

export function UserProvider({ children }: TUserContextProvider) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const uid = currentUser.uid;

          setCookie('token', token, {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });

          setCookie('uid', uid, {
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });

          setUser(currentUser);
        } else {
          deleteCookie('token');
          deleteCookie('uid');
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao gerenciar token/cookie:", error);
        deleteCookie('token');
        deleteCookie('uid');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
