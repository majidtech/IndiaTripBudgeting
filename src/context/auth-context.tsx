'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface AuthContextType {
  user: User | { username: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | { username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Manages the splash screen visibility and fade-out effect.
    if (showSplashScreen) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000); // Start fading after 2 seconds

      const hideTimer = setTimeout(() => {
        setShowSplashScreen(false);
        setIsFadingOut(false);
      }, 2500); // Hide completely after 0.5s fade

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showSplashScreen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            setLoading(false);
        } else {
            // If no firebase user, check for our custom auth
            try {
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                if (isAuthenticated) {
                    setUser({ username: "OK-Family-2025" });
                } else {
                    setUser(null);
                }
            } catch (error) {
                // localStorage is not available
                setUser(null);
            }
            setLoading(false);
        }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await loginAction(username, password);
    if (result.success) {
      try {
        localStorage.setItem("isAuthenticated", "true");
      } catch (error) {
        // localStorage is not available
      }
      setUser({ username: "OK-Family-2025" });
      setShowSplashScreen(true);
      router.push("/");
      return true;
    }
    return false;
  }, [router]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        setShowSplashScreen(true);
        // onAuthStateChanged will handle setting the user and the useEffect will handle the redirect
        return true;
    } catch (error) {
        console.error("Google sign-in error", error);
        return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem("isAuthenticated");
    } catch (error) {
        // localStorage is not available or firebase error
    }
    setUser(null);
    router.push('/login');
  }, [router]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (loading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return <div className="flex items-center justify-center h-screen w-full bg-muted/40"><p>Loading...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, logout }}>
      {showSplashScreen && (
          <div
              className={cn(
                  'fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white text-2xl font-bold transition-opacity duration-500',
                  isFadingOut ? 'opacity-0' : 'opacity-100'
              )}
          >
              Created by Adil :)
          </div>
      )}
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
