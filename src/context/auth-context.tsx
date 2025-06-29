'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

// Simplified user type, no longer need Firebase User
type SimpleUser = {
  username: string;
};

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (showSplashScreen) {
      const fadeTimer = setTimeout(() => setIsFadingOut(true), 2000);
      const hideTimer = setTimeout(() => {
        setShowSplashScreen(false);
        setIsFadingOut(false);
      }, 2500);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showSplashScreen]);

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuthenticated) {
        setUser({ username: "OK-Family-2025" });
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
    setLoading(false);
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

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("isAuthenticated");
    } catch (error) {
      // localStorage is not available
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {showSplashScreen && (
          <div
              className={cn(
                  'fixed inset-0 z-[9999] flex items-center justify-center text-white text-2xl font-bold transition-opacity duration-500',
                  isFadingOut ? 'opacity-0' : 'opacity-100'
              )}
              style={{ backgroundColor: 'black' }}
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
