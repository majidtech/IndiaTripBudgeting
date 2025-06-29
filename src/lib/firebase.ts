import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Define placeholders for when Firebase is not configured
const unconfiguredApp = {} as FirebaseApp;
const unconfiguredAuth = {} as Auth;

let app: FirebaseApp;
let auth: Auth;
let isFirebaseConfigured: boolean;

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // The configuration is considered valid only if the essential keys are present.
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    isFirebaseConfigured = true;
  } else {
    // If config is incomplete, treat as not configured.
    throw new Error("Firebase configuration is incomplete. Check your .env file.");
  }
} catch (error) {
  // If any error occurs during initialization, fall back to the unconfigured state.
  if (typeof window === 'undefined') { // Log only on the server
    console.warn("Firebase initialization failed. Google SSO will be disabled.", (error as Error).message);
  }
  app = unconfiguredApp;
  auth = unconfiguredAuth;
  isFirebaseConfigured = false;
}

export { app, auth, isFirebaseConfigured };
