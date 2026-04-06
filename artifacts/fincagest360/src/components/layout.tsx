import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Tractor,
  Map,
  Sprout,
  Wheat,
  CircleDollarSign,
  Users,
  WalletCards,
  Package,
  CalendarClock
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fincas", label: "Fincas", icon: Tractor },
  { href: "/lotes", label: "Lotes", icon: Map },
  { href: "/produccion", label: "Producción", icon: Sprout },
  { href: "/cosecha", label: "Cosecha", icon: Wheat },
  { href: "/finanzas", label: "Finanzas", icon: CircleDollarSign },
  { href: "/nomina", label: "Nómina", icon: WalletCards },
  { href: "/empleados", label: "Empleados", icon: Users },
  { href: "/insumos", label: "Insumos", icon: Package },
  { href: "/jornadas", label: "Jornadas", icon: CalendarClock },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">FincaGest360</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                data-testid={`nav-link-${item.href.replace('/', '') || 'home'}`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">AD</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none text-sidebar-foreground">Admin</span>
                <span className="text-xs text-muted-foreground">admin@fincagest.com</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4 md:hidden">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">FincaGest360</span>
          </div>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            Plataforma de Gestión Agrícola
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
