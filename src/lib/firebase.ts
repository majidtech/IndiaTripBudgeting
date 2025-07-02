import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// This const checks if the user has provided all the necessary variables.
const hasAllKeys =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.storageBucket &&
  !!firebaseConfig.messagingSenderId &&
  !!firebaseConfig.appId;

// We only try to initialize if all keys are present.
if (hasAllKeys) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed. Please check your credentials in the .env file.", error);
    // If initialization fails, we ensure auth is null to prevent crashes.
    app = null;
    auth = null;
    db = null;
  }
} else {
  // This warning will appear in the server console during build/SSR.
  if (typeof window === 'undefined') {
    console.warn("Firebase is not configured. Google SSO will be disabled. Please provide Firebase credentials in your .env file.");
  }
}

const isFirebaseConfigured = !!auth && !!db;

export { app, auth, db, isFirebaseConfigured };
