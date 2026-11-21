import { Link } from "@tanstack/react-router";
import { Bell, ShoppingCart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useStore } from "@/lib/store";

export function SiteHeader() {
  const { quote, setCartOpen, hydrated } = useStore();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-header">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-10">
        <Link to="/" className="font-display text-4xl tracking-tight">
          PIDELO
        </Link>
        <nav className="flex items-center gap-3 sm:gap-7">
          <Link to="/puestos" className="hidden font-bold hover:underline sm:inline" activeProps={{ className: "underline underline-offset-4 decoration-2" }}>
            Puestos
          </Link>
          <Link to="/pedidos" className="hidden font-bold hover:underline sm:inline" activeProps={{ className: "underline underline-offset-4 decoration-2" }}>
            Mis pedidos
          </Link>
          <Notifications />
          <button type="button" className="btn-cart" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="size-5" />
            <span className="hidden sm:inline">Carrito</span>
            {hydrated && quote.units > 0 && (
              <span key={quote.units} className="animate-pop grid min-w-6 place-items-center bg-primary px-1.5 text-sm text-primary-foreground">
                {quote.units}
              </span>
            )}
          </button>
        </nav>
      </div>
      <nav className="flex border-t-2 border-border bg-card sm:hidden">
        <Link to="/puestos" className="flex-1 py-2 text-center font-bold" activeProps={{ className: "bg-tag" }}>
          Puestos
        </Link>
        <Link to="/pedidos" className="flex-1 border-l-2 border-border py-2 text-center font-bold" activeProps={{ className: "bg-tag" }}>
          Mis pedidos
        </Link>
      </nav>
    </header>
  );
}

function Notifications() {
  const { notifications, markAllRead, hydrated } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Popover onOpenChange={(open) => !open && markAllRead()}>
      <PopoverTrigger asChild>
        <button type="button" className="btn-paper relative size-[52px] p-0" aria-label="Notificaciones">
          <Bell className="size-5" />
          {hydrated && unread > 0 && (
            <span className="absolute -right-2 -top-2 grid size-5 place-items-center border-2 border-border bg-accent text-xs font-bold">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-none border-2 border-border p-0 shadow-[6px_6px_0_0_var(--color-foreground)]">
        <p className="border-b-2 border-border px-4 py-3 font-display text-xl">Notificaciones</p>
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted-foreground">No tienes notificaciones.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-muted px-4 py-3 last:border-b-0">
                <p className="flex items-center gap-2 font-bold">
                  {!n.read && <span className="size-2 bg-accent" aria-label="Nueva" />}
                  {n.title}
                </p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
