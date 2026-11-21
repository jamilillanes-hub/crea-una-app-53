import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { quoteCart, type CartLine, type CartQuote } from "./pricing";

export interface Customer {
  name: string;
  phone: string;
  address: string;
  reference: string;
  lat: number;
  lng: number;
}

/** Pedido que recibe cada puesto. */
export interface StallOrder {
  id: string;
  stallId: string;
  stallName: string;
  stallNumber: string;
  stallImage: string;
  etaMinutes: number;
  lines: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
}

/** Compra global del cliente: agrupa uno o varios pedidos. */
export interface Purchase {
  id: string;
  createdAt: number;
  customer: Customer;
  subtotal: number;
  discount: number;
  delivery: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  orders: StallOrder[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

interface Store {
  hydrated: boolean;
  lines: CartLine[];
  quote: CartQuote;
  couponInput: string | null;
  qtyOf: (productId: string) => number;
  add: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  purchases: Purchase[];
  placePurchase: (checkoutId: string, customer: Customer) => Purchase | null;
  notifications: AppNotification[];
  markAllRead: () => void;
}

const StoreContext = createContext<Store | null>(null);

const KEYS = {
  cart: "pidelo.cart",
  coupon: "pidelo.coupon",
  purchases: "pidelo.purchases",
  notifications: "pidelo.notifications",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const welcome = (): AppNotification => ({
  id: "welcome",
  title: "Promociones del mes",
  body: "4 puestos tienen descuentos o envío gratis hasta fin de mes.",
  createdAt: Date.now(),
  read: false,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponInput, setCouponInput] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setLines(read(KEYS.cart, []));
    setCouponInput(read(KEYS.coupon, null));
    setPurchases(read(KEYS.purchases, []));
    setNotifications(read(KEYS.notifications, [welcome()]));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEYS.cart, JSON.stringify(lines));
    localStorage.setItem(KEYS.coupon, JSON.stringify(couponInput));
    localStorage.setItem(KEYS.purchases, JSON.stringify(purchases));
    localStorage.setItem(KEYS.notifications, JSON.stringify(notifications));
  }, [hydrated, lines, couponInput, purchases, notifications]);

  const quote = useMemo(() => quoteCart(lines, couponInput), [lines, couponInput]);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.productId !== productId);
      const exists = prev.some((l) => l.productId === productId);
      return exists
        ? prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
        : [...prev, { productId, qty }];
    });
  }, []);

  const add = useCallback((productId: string) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === productId);
      return found
        ? prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { productId, qty: 1 }];
    });
  }, []);

  const placePurchase = useCallback(
    (checkoutId: string, customer: Customer): Purchase | null => {
      // Idempotencia: un mismo checkoutId nunca genera dos compras.
      const existing = purchases.find((p) => p.id === checkoutId);
      if (existing) return existing;
      const q = quoteCart(lines, couponInput);
      if (q.stalls.length === 0) return null;
      const purchase: Purchase = {
        id: checkoutId,
        createdAt: Date.now(),
        customer,
        subtotal: q.subtotal,
        discount: q.discount,
        delivery: q.delivery,
        couponCode: q.couponCode,
        couponDiscount: q.couponDiscount,
        total: q.total,
        orders: q.stalls.map((s) => ({
          id: `${checkoutId}-${s.stall.number}`,
          stallId: s.stall.id,
          stallName: s.stall.name,
          stallNumber: s.stall.number,
          stallImage: s.stall.image,
          etaMinutes: s.stall.minutes,
          lines: s.lines.map((l) => ({
            name: l.product.name,
            qty: l.qty,
            unitPrice: l.product.price,
            lineTotal: l.lineTotal,
          })),
          subtotal: s.subtotal,
          discount: s.discount,
          delivery: s.delivery,
          total: s.total,
        })),
      };
      setPurchases((prev) => (prev.some((p) => p.id === checkoutId) ? prev : [purchase, ...prev]));
      setNotifications((prev) => [
        {
          id: uid("n"),
          title: "¡Pedido recibido!",
          body:
            purchase.orders.length > 1
              ? `Tu compra se dividió en ${purchase.orders.length} pedidos, uno por puesto.`
              : `${purchase.orders[0]?.stallName ?? "El puesto"} ya está preparando tu pedido.`,
          createdAt: Date.now(),
          read: false,
        },
        ...prev,
      ]);
      setLines([]);
      setCouponInput(null);
      return purchase;
    },
    [purchases, lines, couponInput],
  );

  const value: Store = {
    hydrated,
    lines,
    quote,
    couponInput,
    qtyOf: (id) => lines.find((l) => l.productId === id)?.qty ?? 0,
    add,
    setQty,
    remove: (id) => setQty(id, 0),
    clear: () => setLines([]),
    applyCoupon: setCouponInput,
    cartOpen,
    setCartOpen,
    purchases,
    placePurchase,
    notifications,
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function newCheckoutId() {
  return uid("C");
}
