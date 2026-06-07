import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await register(email, name, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-text">💰 BudgetApp</h1>
          <p className="text-text-muted mt-2">
            {isRegister ? "Stwórz konto" : "Zaloguj się"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-text mb-1">Imię</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>

          {error && (
            <p className="text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isRegister ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          {isRegister ? "Masz już konto?" : "Nie masz konta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-accent hover:underline font-medium"
          >
            {isRegister ? "Zaloguj się" : "Zarejestruj się"}
          </button>
        </p>
      </div>
    </div>
  );
}