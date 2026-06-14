import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ id: string; email: string; name: string }>("/auth/me")
      .then((data) => setUser({ id: data.id, email: data.email, name: data.name }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User }>("/auth/login", { email, password });
    setUser(data.user);
  };

  const register = async (email: string, name: string, password: string) => {
    const data = await api.post<{ user: User }>("/auth/register", { email, name, password });
    setUser(data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}