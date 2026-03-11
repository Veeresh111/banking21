import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getToken, getUser, setAuth } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => ({
    token: getToken(),
    user: getUser(),
  }));

  const login = (token, user) => {
    setAuth(token, user);
    setAuthState({ token, user });
  };

  const logout = () => {
    clearAuth();
    setAuthState({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      ...authState,
      isAuthed: Boolean(authState.token),
      login,
      logout,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
