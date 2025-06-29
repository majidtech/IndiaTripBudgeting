import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// The configuration is considered valid only if the essential keys are present and not just empty strings.
let isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId;

let app: FirebaseApp;
let auth: Auth;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    isFirebaseConfigured = false;
    app = {} as FirebaseApp;
    auth = {} as Auth;
  }
} else {
  // Log a warning if not configured, useful for debugging.
  if (typeof window === 'undefined') {
    console.warn("Firebase is not configured. Google SSO will be disabled. Please check your .env file.");
  }
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

export { app, auth, isFirebaseConfigured };
