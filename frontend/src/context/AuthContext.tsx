import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import {
  getStoredUser,
  logout as clearAuth,
  saveAuth,
  type AuthUser,
} from "../services/auth";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<AuthUser | null>(
    getStoredUser()
  );

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );

  const setSession = (
    nextToken: string,
    nextUser: AuthUser
  ) => {
    saveAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const signOut = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
