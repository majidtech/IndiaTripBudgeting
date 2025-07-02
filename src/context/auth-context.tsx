'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Start as true
  const [isNamePromptOpen, setNamePromptOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase is not configured. Authentication and data services will not work.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in to Firebase.
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
        // User is signed out from Firebase.
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
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("isAdmin", String(result.isAdmin || false));
        
        // This will trigger the onAuthStateChanged listener
        await signInAnonymously(auth);

        // The listener handles setting user state. We just need to navigate.
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
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    router.push('/grouplogin');
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === '/grouplogin' || pathname === '/signup' || pathname === '/login';

    if (!user && !isAuthPage) {
      router.push('/grouplogin');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isAuthPage = pathname === '/grouplogin' || pathname === '/signup' || pathname === '/login';

  if (loading) {
    return <div className="flex items-center justify-center h-screen w-full bg-muted/40"><p>Loading...</p></div>;
  }

  // Render children if we are on an auth page OR if the user is logged in
  if ((isAuthPage && !user) || (!isAuthPage && user)) {
     return (
      <AuthContext.Provider value={{ user, loading, login, logout, setUserName }}>
        {user && <NamePromptDialog isOpen={isNamePromptOpen} onSaveName={setUserName} />}
        {children}
      </AuthContext.Provider>
    );
  }

  // Otherwise, we are in a redirecting state
  return <div className="flex items-center justify-center h-screen w-full bg-muted/40"><p>Redirecting...</p></div>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
