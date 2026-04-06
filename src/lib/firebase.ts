import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Check if config has placeholders
const isPlaceholder = firebaseConfig.apiKey === "placeholder";

if (isPlaceholder) {
  console.warn("Firebase is using placeholder configuration. Please complete the Firebase setup in the AI Studio UI to enable database and authentication features.");
}

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Auth and Firestore instances
// Using getAuth(app) is the standard way to ensure it's tied to the correct app instance
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Configure persistence and handle auth errors
let authUnavailable = false;

try {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    // Suppress the unauthorized-domain error in development
    if (error?.code === "auth/unauthorized-domain") {
      authUnavailable = true;
      console.warn("ℹ️ Firebase Auth requires domain configuration. Use demo login to continue development.");
      
      // Export flag for use in app
      if (typeof window !== "undefined") {
        (window as any).__FIREBASE_AUTH_UNAVAILABLE__ = true;
      }
    } else {
      console.warn("Firebase persistence setup warning:", error?.code);
    }
  });
} catch (error: any) {
  if (error?.code !== "auth/unauthorized-domain") {
    console.warn("Firebase auth initialization warning:", error);
  } else {
    authUnavailable = true;
  }
}

export const isAuthUnavailable = () => authUnavailable;

// Suppress unauthorized domain errors from global error handlers
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = String(args[0]);
    if (errorStr.includes("auth/unauthorized-domain")) {
      // Suppressed in development
      return;
    }
    originalError.apply(console, args);
  };
}

// Test connection to Firestore if not using placeholders
if (!isPlaceholder) {
  import("firebase/firestore").then(({ doc, getDocFromCache }) => {
    getDocFromCache(doc(db, "_test_connection_", "ping")).catch(() => {
      // Ignore cache errors, this is just to trigger initialization
    });
  });
}
