import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { promoTitle } from "@/lib/data";
import { formatBs, isValidCoupon, type CartQuote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { FoodImage } from "./FoodImage";
import { QtyControl } from "./QtyControl";

export function CartSheet() {
  const { cartOpen, setCartOpen, quote } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 border-l-2 border-border bg-card p-0 sm:max-w-md">
        <div className="border-b-2 border-border bg-header px-6 py-5">
          <SheetTitle className="font-display text-3xl font-normal">Tu carrito</SheetTitle>
          <SheetDescription className="text-sm font-semibold text-foreground">
            {quote.units === 0
              ? "Aún no agregaste productos"
              : `${quote.units} ${quote.units === 1 ? "producto" : "productos"} · ${quote.orderCount} ${
                  quote.orderCount === 1 ? "pedido" : "pedidos"
                }`}
          </SheetDescription>
        </div>
        {quote.units === 0 ? <EmptyCart onClose={() => setCartOpen(false)} /> : <CartBody quote={quote} />}
      </SheetContent>
    </Sheet>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <ShoppingCart className="size-12" />
      <p className="font-display text-2xl">Tu carrito está vacío</p>
      <p className="text-muted-foreground">Elige un puesto y agrega lo que se te antoje.</p>
      <Link to="/puestos" className="btn-ink mt-3" onClick={onClose}>
        Ver puestos
      </Link>
    </div>
  );
}

function CartBody({ quote }: { quote: CartQuote }) {
  const { setQty, remove, setCartOpen } = useStore();
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {quote.orderCount > 1 && (
          <p className="border-b-2 border-border bg-tag px-6 py-3 text-sm font-semibold">
            Productos de {quote.orderCount} puestos: cada puesto prepara y envía su propio pedido.
          </p>
        )}
        {quote.stalls.map((sq) => (
          <section key={sq.stall.id} className="border-b-2 border-border px-6 pb-4 pt-5">
            <h3 className="flex items-center gap-2 text-xl">
              <FoodImage src={sq.stall.image} className="size-6" /> {sq.stall.name}
            </h3>
            <ul>
              {sq.lines.map((l) => (
                <li key={l.product.id} className="flex items-start justify-between gap-3 border-b border-muted py-3 last:border-b-0">
                  <div>
                    <p className="font-bold">{l.product.name}</p>
                    <p className="text-muted-foreground">{formatBs(l.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <QtyControl qty={l.qty} label={l.product.name} onChange={(q) => setQty(l.product.id, q)} />
                    <button type="button" className="link-ink text-sm" onClick={() => remove(l.product.id)}>
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {sq.stall.promotion &&
              (sq.promoApplied ? (
                <p className="mt-2 font-semibold text-success">
                  Promo: {promoTitle(sq.stall.promotion)}
                  {sq.discount > 0 ? ` (-${formatBs(sq.discount)})` : ""}
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold">
                  Te faltan {formatBs(sq.missingForPromo)} para: {promoTitle(sq.stall.promotion)}
                </p>
              ))}
            <p className="mt-1 text-muted-foreground">
              Subtotal {formatBs(sq.subtotal)} · {sq.delivery === 0 ? "Envío gratis" : `Envío ${formatBs(sq.delivery)}`}
            </p>
          </section>
        ))}
      </div>
      <div className="border-t-2 border-border bg-background px-6 py-5">
        <CouponForm />
        <Totals quote={quote} />
        <Link to="/checkout" className="btn-ink mt-5 w-full py-4" onClick={() => setCartOpen(false)}>
          Ir a pagar
        </Link>
      </div>
    </>
  );
}

function CouponForm() {
  const { couponInput, applyCoupon, quote } = useStore();
  const [code, setCode] = useState(couponInput ?? "");
  const [error, setError] = useState<string | null>(null);
  if (quote.couponCode) {
    return (
      <div className="flex items-center justify-between border-2 border-border bg-card px-4 py-3">
        <span className="font-semibold text-success">Cupón {quote.couponCode} aplicado</span>
        <button type="button" className="link-ink text-sm" onClick={() => applyCoupon(null)}>
          Quitar
        </button>
      </div>
    );
  }
  return (
    <form
      className="mb-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return;
        if (isValidCoupon(code)) {
          applyCoupon(code.trim().toUpperCase());
          setError(null);
        } else setError("Ese cupón no es válido.");
      }}
    >
      <div className="flex gap-3">
        <input
          className="field"
          placeholder="Cupón de descuento"
          value={code}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
        />
        <button type="submit" className="btn-paper px-6">
          Aplicar
        </button>
      </div>
      {error && <p className="mt-1 text-sm font-semibold text-destructive">{error}</p>}
    </form>
  );
}

export function Totals({ quote }: { quote: CartQuote }) {
  return (
    <dl className="mt-4 space-y-2 text-lg">
      <Row label="Subtotal" value={formatBs(quote.subtotal)} />
      <Row label="Promociones" value={quote.discount > 0 ? `-${formatBs(quote.discount)}` : formatBs(0)} />
      {quote.couponDiscount > 0 && <Row label="Cupón" value={`-${formatBs(quote.couponDiscount)}`} />}
      <Row label="Envío" value={quote.delivery === 0 ? "Gratis" : formatBs(quote.delivery)} />
      <div className="flex items-baseline justify-between border-t-2 border-border pt-3">
        <dt className="font-display text-3xl">Total</dt>
        <dd className="font-display text-3xl">{formatBs(quote.total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
