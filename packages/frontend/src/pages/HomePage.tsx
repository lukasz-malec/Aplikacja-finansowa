import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Tags, Wallet, Target, Bot, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const tiles = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "#1db954" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transakcje", color: "#3b82f6" },
  { to: "/categories", icon: Tags, label: "Kategorie", color: "#f5a623" },
  { to: "/budgets", icon: Wallet, label: "Budżety", color: "#e74c3c" },
  { to: "/goals", icon: Target, label: "Cele", color: "#ec4899" },
  { to: "/advisor", icon: Bot, label: "Doradca AI", color: "#8b5cf6" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={logout}
        className="fixed top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-text-muted text-sm font-medium hover:text-danger hover:border-danger/30 hover:bg-danger/10 transition-all duration-300"
      >
        <LogOut size={40} />
        Wyloguj
      </button>

      <div className="grid grid-cols-3 gap-4">
        {tiles.map((tile, i) => (
          <button
            key={tile.to}
            onClick={() => navigate(tile.to)}
            className="tile-icon group relative overflow-hidden rounded-2xl border border-border bg-surface w-28 h-28 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.05] hover:border-transparent hover:shadow-xl active:scale-[0.95]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="tile-bg absolute inset-0 opacity-0 transition-opacity duration-300"
              style={{ backgroundColor: tile.color }}
            />
            <tile.icon
              size={30}
              className="relative z-10 transition-all duration-300"
              style={{ color: tile.color }}
            />
            <span className="relative z-10 text-[11px] font-medium text-transparent group-hover:text-white transition-all duration-300 select-none">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}