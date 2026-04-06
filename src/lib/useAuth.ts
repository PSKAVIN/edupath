import { useEffect, useState } from "react";
import { useAuthState as useFirebaseAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { getMockUser, loginWithMockAuth, logoutMockAuth, type MockUser } from "./mockAuth";

// Flag to detect if Firebase auth is unavailable
let isFirebaseAuthUnavailable = false;

export function setFirebaseAuthUnavailable(unavailable: boolean) {
  isFirebaseAuthUnavailable = unavailable;
}

export function getFirebaseAuthUnavailable() {
  return isFirebaseAuthUnavailable;
}

export function useAuthState(): [user: any, loading: boolean, error: any] {
  const [firebaseUser, firebaseLoading, firebaseError] = useFirebaseAuthState(auth);
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we should use mock auth
    if (isFirebaseAuthUnavailable) {
      const stored = getMockUser();
      setMockUser(stored);
      setIsLoading(false);
    } else if (firebaseUser) {
      setMockUser(null);
      setIsLoading(false);
    } else if (!firebaseLoading) {
      setIsLoading(false);
    }
  }, [firebaseUser, firebaseLoading]);

  const user = isFirebaseAuthUnavailable ? mockUser : firebaseUser;
  const loading = isLoading || firebaseLoading;
  const error = firebaseError;

  return [user, loading, error];
}

export function useDemoLogin() {
  return async () => {
    return loginWithMockAuth();
  };
}

export function useDemoLogout() {
  return async () => {
    logoutMockAuth();
  };
}
