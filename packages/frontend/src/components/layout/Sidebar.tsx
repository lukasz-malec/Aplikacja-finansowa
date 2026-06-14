import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  Target,
  Bot,
  LogOut,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Strona główna" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transakcje" },
  { to: "/categories", icon: Tags, label: "Kategorie" },
  { to: "/budgets", icon: Wallet, label: "Budżety" },
  { to: "/goals", icon: Target, label: "Cele" },
  { to: "/advisor", icon: Bot, label: "Doradca AI" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-light border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/10 rounded-lg">
            <TrendingUp size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-text tracking-tight">BudgetApp</h1>
            <p className="text-xs text-text-muted">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full"
        >
          <LogOut size={18} />
          Wyloguj
        </button>
      </div>
    </aside>
  );
}