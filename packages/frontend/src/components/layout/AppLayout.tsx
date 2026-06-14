import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, LogOut, ArrowLeft } from "lucide-react";

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-primary">
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-primary-light/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft size={18} />
              <Home size={18} />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
      )}
      <main className={`max-w-4xl mx-auto px-6 ${isHome ? "py-8" : "pt-22 pb-8"}`}>
        <Outlet />
      </main>
    </div>
  );
}