// Mock authentication for development when Firebase is not properly configured

const MOCK_USER_KEY = "edupath-mock-user";

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

const DEFAULT_MOCK_USER: MockUser = {
  uid: "dev-user-123",
  email: "dev@example.com",
  displayName: "Dev User",
  photoURL: "https://ui-avatars.com/api/?name=Dev+User&background=random",
};

export function setMockUser(user: MockUser | null) {
  if (user) {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
  }
}

export function getMockUser(): MockUser | null {
  try {
    const stored = localStorage.getItem(MOCK_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function loginWithMockAuth(): MockUser {
  const user = DEFAULT_MOCK_USER;
  setMockUser(user);
  return user;
}

export function logoutMockAuth() {
  setMockUser(null);
}

export function getDefaultMockUser(): MockUser {
  return DEFAULT_MOCK_USER;
}
