import { lazy, Suspense, useState } from "react";
import { ClientOnly, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { promoTitle } from "@/lib/data";
import { formatBs } from "@/lib/pricing";
import { newCheckoutId, useStore } from "@/lib/store";
import { FoodImage } from "@/components/pidelo/FoodImage";

const DeliveryMap = lazy(() => import("@/components/pidelo/DeliveryMap"));

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Confirmar pedido — PIDELO" },
      { name: "description", content: "Indica tus datos y dónde recibir tu pedido de PIDELO." },
      { property: "og:title", content: "Confirmar pedido — PIDELO" },
      { property: "og:description", content: "Último paso antes de recibir tu comida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[67]\d{7}$/, "Escribe un celular de 8 dígitos que empiece en 6 o 7"),
  address: z.string().trim().min(5, "Escribe tu dirección").max(200),
  reference: z.string().trim().max(200),
  point: z.tuple([z.number(), z.number()], { message: "Marca en el mapa dónde recibir tu pedido" }),
});

type Errors = Partial<Record<"name" | "phone" | "address" | "reference" | "point", string | undefined>>;

function CheckoutPage() {
  const { quote, hydrated, placePurchase } = useStore();
  const navigate = useNavigate();
  // Un identificador por intento de compra: pulsar dos veces o reintentar no duplica pedidos.
  const [checkoutId] = useState(newCheckoutId);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", reference: "" });
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [locating, setLocating] = useState(false);

  if (!hydrated) return <div className="pt-12" />;

  if (quote.units === 0) {
    return (
      <div className="pt-12">
        <h1 className="text-5xl">Confirmar pedido</h1>
        <div className="panel mt-8 max-w-lg p-8">
          <p className="font-display text-2xl">Tu carrito está vacío</p>
          <p className="mt-1 text-muted-foreground">Agrega productos antes de confirmar.</p>
          <Link to="/puestos" className="btn-ink mt-5">
            Ver puestos
          </Link>
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoint([pos.coords.latitude, pos.coords.longitude]);
        setErrors((er) => ({ ...er, point: undefined }));
        setLocating(false);
      },
      () => {
        toast.error("No pudimos obtener tu ubicación. Toca el mapa para marcarla.");
        setLocating(false);
      },
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const parsed = schema.safeParse({ ...form, point });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setSubmitting(true);
    const { point: p, ...rest } = parsed.data;
    const purchase = placePurchase(checkoutId, { ...rest, lat: p[0], lng: p[1] });
    if (purchase) {
      toast.success("¡Pedido confirmado!");
      navigate({ to: "/pedidos" });
    } else setSubmitting(false);
  };

  return (
    <div className="pt-12">
      <h1 className="text-5xl">Confirmar pedido</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_450px]">
        <form onSubmit={submit} noValidate className="space-y-5">
          <Field label="Nombre" error={errors.name}>
            <input className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Teléfono" error={errors.phone}>
            <input className="field" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} />
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-muted-foreground">Toca el mapa para marcar dónde recibir tu pedido</p>
              <button type="button" className="btn-paper text-sm" onClick={useMyLocation} disabled={locating}>
                {locating ? "Buscando…" : "Usar mi ubicación"}
              </button>
            </div>
            <div className="relative z-0 border-2 border-border">
              <ClientOnly fallback={<div className="h-[350px] bg-muted" />}>
                <Suspense fallback={<div className="h-[350px] bg-muted" />}>
                  <DeliveryMap
                    point={point}
                    onPick={(lat, lng) => {
                      setPoint([lat, lng]);
                      setErrors((er) => ({ ...er, point: undefined }));
                    }}
                  />
                </Suspense>
              </ClientOnly>
            </div>
            {errors.point ? (
              <p className="mt-1 text-sm font-semibold text-destructive">{errors.point}</p>
            ) : point ? (
              <p className="mt-1 text-sm font-semibold text-success">Ubicación marcada ✓</p>
            ) : null}
          </div>
          <Field label="Dirección" error={errors.address}>
            <input className="field" autoComplete="street-address" placeholder="Calle, número, zona" value={form.address} onChange={set("address")} aria-invalid={Boolean(errors.address)} />
          </Field>
          <Field label="Referencia (opcional)" error={errors.reference}>
            <input className="field" placeholder="Ej.: portón verde, frente a la plaza" value={form.reference} onChange={set("reference")} />
          </Field>
          <button type="submit" className="btn-ink w-full py-4 text-lg" disabled={submitting}>
            {submitting ? "Confirmando…" : `Confirmar pedido · ${formatBs(quote.total)}`}
          </button>
        </form>

        <aside className="panel h-fit p-6 lg:sticky lg:top-24">
          {quote.stalls.map((sq) => (
            <section key={sq.stall.id} className="border-b border-muted pb-4 mb-4 last:mb-0">
              <h2 className="flex items-center gap-2 text-xl">
                <FoodImage src={sq.stall.image} className="size-6" /> {sq.stall.name}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {sq.lines.map((l) => (
                  <li key={l.product.id} className="flex justify-between">
                    <span>
                      {l.qty} × {l.product.name}
                    </span>
                    <span>{formatBs(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              {sq.promoApplied && sq.stall.promotion && (
                <p className="mt-3 text-sm font-semibold text-success">
                  Promo: {promoTitle(sq.stall.promotion)}
                  {sq.discount > 0 ? ` (-${formatBs(sq.discount)})` : ""}
                </p>
              )}
              <p className="mt-2 flex justify-between">
                <span>Envío</span>
                <span>{sq.delivery === 0 ? "Gratis" : formatBs(sq.delivery)}</span>
              </p>
              <p className="mt-1 flex justify-between">
                <span>Total del pedido</span>
                <span>{formatBs(sq.total)}</span>
              </p>
            </section>
          ))}
          {quote.couponDiscount > 0 && (
            <p className="flex justify-between font-semibold text-success">
              <span>Cupón {quote.couponCode}</span>
              <span>-{formatBs(quote.couponDiscount)}</span>
            </p>
          )}
          <div className="mt-4 flex items-baseline justify-between border-t-2 border-border pt-4">
            <span className="font-display text-3xl">Total general</span>
            <span className="font-display text-3xl">{formatBs(quote.total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm font-semibold text-destructive">{error}</span>}
    </label>
  );
}
