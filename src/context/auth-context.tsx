'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, UserCredential } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { loginAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | { username: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authorizedEmails = [
  'AbdulAdil.usa@gmail.com',
  'majid.usa@gmail.com',
  'shabana.usa@gmail.com',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | { username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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
    // If firebase is not configured or initialization failed, don't set up the listener.
    if (!isFirebaseConfigured || !auth) {
      // Handle only non-Firebase auth if not configured
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
      return;
    }

    // Original logic for when Firebase IS configured and initialized
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            // Check if the signed-in user is authorized
            if (firebaseUser.email && authorizedEmails.map(e => e.toLowerCase()).includes(firebaseUser.email.toLowerCase())) {
                setUser(firebaseUser);
            } else {
                // If not authorized, sign them out and set user to null
                signOut(auth);
                setUser(null);
            }
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
    if (!isFirebaseConfigured || !auth) {
      toast({
        title: "Google Sign-In Is Not Available",
        description: "The application's Firebase credentials have not been configured correctly.",
        variant: "destructive",
      });
      return false;
    }

    const provider = new GoogleAuthProvider();
    try {
        const result: UserCredential = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        // Check if the signed-in user is authorized
        if (firebaseUser.email && authorizedEmails.map(e => e.toLowerCase()).includes(firebaseUser.email.toLowerCase())) {
            setShowSplashScreen(true);
            return true;
        } else {
            // If not authorized, sign them out immediately
            await signOut(auth);
            return false;
        }
    } catch (error) {
        console.error("Google sign-in error", error);
        return false;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      if (isFirebaseConfigured && auth && auth.currentUser) {
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
