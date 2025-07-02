'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginAction } from '@/lib/actions';
import { NamePromptDialog } from '@/components/name-prompt-dialog';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';

export type AppUser = {
  username: string;
  name: string | null;
  isAdmin: boolean;
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
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
          // If we think we're logged in, we MUST confirm by signing into Firebase.
          if (isFirebaseConfigured && auth) {
            try {
              // This promise resolves when sign-in is complete.
              await signInAnonymously(auth);
            } catch (error) {
              console.error("Automatic Firebase anonymous sign-in failed on reload:", error);
              // If Firebase sign-in fails, we are not truly authenticated.
              setUser(null);
              setLoading(false);
              return;
            }
          }
          
          // Now that Firebase auth is confirmed (if configured), set the user state.
          const savedName = localStorage.getItem('userName');
          const savedUsername = localStorage.getItem('username') || "OK-Family-2025";
          const isAdmin = localStorage.getItem('isAdmin') === 'true';
          const appUser = { username: savedUsername, name: savedName, isAdmin };
          
          setUser(appUser);

          if (!savedName && !isAdmin) {
            setNamePromptOpen(true);
          }

        } else {
          setUser(null);
        }
      } catch (error) {
        // localStorage might not be available
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await loginAction(username, password);
    if (result.success) {
      // Sign in to Firebase Anonymously
      if (isFirebaseConfigured && auth) {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Firebase anonymous sign-in failed:", error);
          // This is a critical failure for data saving.
        }
      }

      router.push("/");

      try {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);
        localStorage.setItem("isAdmin", String(result.isAdmin || false));
        
        const savedName = localStorage.getItem('userName');
        const finalName = result.isAdmin ? 'Admin' : savedName;
        
        setUser({ username, name: finalName, isAdmin: !!result.isAdmin });

        if (!finalName && !result.isAdmin) {
          setNamePromptOpen(true);
        }
      } catch (error) {
        setUser({ username, name: null, isAdmin: !!result.isAdmin });
        if(!result.isAdmin) {
          setNamePromptOpen(true);
        }
      }
      
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(async () => {
    // Sign out from Firebase
    if (isFirebaseConfigured && auth?.currentUser) {
      await signOut(auth);
    }
    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userName");
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
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
