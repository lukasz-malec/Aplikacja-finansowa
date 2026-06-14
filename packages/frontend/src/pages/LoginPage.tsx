import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TrendingUp } from "lucide-react";

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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-accent/10 rounded-xl border border-accent/20 mb-4">
            <TrendingUp size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold font-display text-text">BudgetApp</h1>
          <p className="text-text-muted text-sm mt-1">
            {isRegister ? "Stwórz konto" : "Witaj ponownie"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="jan@example.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Imię</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="Jan Kowalski"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-danger text-sm bg-danger/10 border border-danger/20 p-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover text-primary font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isRegister ? "Zarejestruj się" : "Zaloguj się"}
          </button>

          <p className="text-center text-sm text-text-muted">
            {isRegister ? "Masz już konto?" : "Nie masz konta?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              {isRegister ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}