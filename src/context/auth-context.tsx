'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginAction } from '@/lib/actions';
import { NamePromptDialog } from '@/components/name-prompt-dialog';

type AppUser = {
  username: string;
  name: string | null;
};

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (username: string, password:string) => Promise<boolean>;
  logout: () => void;
  setUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNamePromptOpen, setNamePromptOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const setUserName = useCallback((name: string) => {
    try {
      localStorage.setItem('userName', name);
    } catch (error) {
      // localStorage not available
    }
    setUser(prev => prev ? { ...prev, name } : null);
    setNamePromptOpen(false);
  }, []);

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuthenticated) {
        const savedName = localStorage.getItem('userName');
        setUser({ username: "OK-Family-2025", name: savedName });
        if (!savedName) {
          setNamePromptOpen(true);
        }
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
      router.push("/");

      try {
        localStorage.setItem("isAuthenticated", "true");
        const savedName = localStorage.getItem('userName');
        setUser({ username: "OK-Family-2025", name: savedName });

        if (!savedName) {
          setNamePromptOpen(true);
        }
      } catch (error) {
        setUser({ username: "OK-Family-2025", name: null });
        setNamePromptOpen(true);
      }
      
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userName");
    } catch (error) {
      // localStorage is not available
    }
    setUser(null);
    router.push('/grouplogin');
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === '/grouplogin' || pathname === '/signup';
    if (!user && !isAuthPage) {
      router.push('/grouplogin');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isAuthPage = pathname === '/grouplogin' || pathname === '/signup';
  if (loading || (!user && !isAuthPage) || (user && isAuthPage)) {
    return <div className="flex items-center justify-center h-screen w-full bg-muted/40"><p>Loading...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUserName }}>
      <NamePromptDialog isOpen={isNamePromptOpen} onSaveName={setUserName} />
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
