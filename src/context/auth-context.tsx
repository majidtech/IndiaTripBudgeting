'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { loginAction } from '@/lib/actions';
import { NamePromptDialog } from '@/components/name-prompt-dialog';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export type AppUser = {
  username: string;
  name: string | null;
  isAdmin: boolean;
};

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (username: string, password:string) => Promise<boolean>;
  logout: () => void;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNamePromptOpen, setNamePromptOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase is not configured. Authentication and data services will not work.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const savedUsername = localStorage.getItem('username') || "OK-Family-2025";
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const savedName = localStorage.getItem('userName');
        
        const appUser: AppUser = {
          username: savedUsername,
          name: isAdmin ? 'Admin' : savedName,
          isAdmin: isAdmin
        };
        setUser(appUser);
        if (!appUser.name && !appUser.isAdmin) {
          setNamePromptOpen(true);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUserName = useCallback((name: string) => {
    if (name) {
      localStorage.setItem('userName', name);
      setUser(prev => prev ? { ...prev, name } : null);
      setNamePromptOpen(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await loginAction(username, password);
    if (result.success && auth) {
      try {
        localStorage.setItem("username", username);
        localStorage.setItem("isAdmin", String(result.isAdmin || false));
        await signInAnonymously(auth);
        // onAuthStateChanged will handle the rest
        router.push("/");
        return true;
      } catch (error) {
        console.error("Firebase anonymous sign-in failed:", error);
        return false;
      }
    }
    return false;
  }, [router]);

  const logout = useCallback(async () => {
    if (auth) {
      await signOut(auth); // This triggers onAuthStateChanged which handles setUser(null)
    }
    localStorage.removeItem("userName");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    router.push('/grouplogin');
  }, [router]);


  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, setUserName }}>
      {user && <NamePromptDialog isOpen={isNamePromptOpen} onSaveName={setUserName} />}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
