import { COUPONS, findProduct, type Promotion, type Stall, type Product, getStallById } from "./data";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface QuotedLine {
  product: Product;
  qty: number;
  lineTotal: number;
}

export interface StallQuote {
  stall: Stall;
  lines: QuotedLine[];
  units: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  promoApplied: boolean;
  /** Bs que faltan para activar la promoción del puesto (0 si ya aplica o no hay). */
  missingForPromo: number;
}

export interface CartQuote {
  stalls: StallQuote[];
  units: number;
  /** Un pedido por cada puesto distinto en el carrito. */
  orderCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function formatBs(n: number) {
  return `Bs ${n.toFixed(2)}`;
}

function applyPromotion(promo: Promotion | null, subtotal: number, baseDelivery: number) {
  if (!promo || subtotal <= 0) return { discount: 0, delivery: baseDelivery, applied: false, missing: 0 };
  const reached = subtotal >= promo.minSubtotal;
  const missing = reached ? 0 : round(promo.minSubtotal - subtotal);
  if (!reached) return { discount: 0, delivery: baseDelivery, applied: false, missing };
  if (promo.kind === "percent")
    return { discount: round((subtotal * promo.percent) / 100), delivery: baseDelivery, applied: true, missing };
  if (promo.kind === "fixed")
    return { discount: Math.min(promo.amount, subtotal), delivery: baseDelivery, applied: true, missing };
  return { discount: 0, delivery: 0, applied: true, missing };
}

export function quoteStall(stall: Stall, lines: QuotedLine[]): StallQuote {
  const subtotal = round(lines.reduce((s, l) => s + l.lineTotal, 0));
  const units = lines.reduce((s, l) => s + l.qty, 0);
  const promo = applyPromotion(stall.promotion, subtotal, stall.deliveryFee);
  return {
    stall,
    lines,
    units,
    subtotal,
    discount: promo.discount,
    delivery: promo.delivery,
    total: round(subtotal - promo.discount + promo.delivery),
    promoApplied: promo.applied,
    missingForPromo: promo.missing,
  };
}

/** Cotiza el carrito completo: promociones y envío se calculan por puesto. */
export function quoteCart(lines: CartLine[], couponCode: string | null = null): CartQuote {
  const byStall = new Map<string, QuotedLine[]>();
  for (const line of lines) {
    if (line.qty <= 0) continue;
    const found = findProduct(line.productId);
    if (!found) continue;
    const list = byStall.get(found.stall.id) ?? [];
    list.push({ product: found.product, qty: line.qty, lineTotal: round(found.product.price * line.qty) });
    byStall.set(found.stall.id, list);
  }

  const stalls: StallQuote[] = [];
  for (const [stallId, stallLines] of byStall) {
    const stall = getStallById(stallId);
    if (stall) stalls.push(quoteStall(stall, stallLines));
  }
  stalls.sort((a, b) => a.stall.number.localeCompare(b.stall.number));

  const subtotal = round(stalls.reduce((s, q) => s + q.subtotal, 0));
  const discount = round(stalls.reduce((s, q) => s + q.discount, 0));
  const delivery = round(stalls.reduce((s, q) => s + q.delivery, 0));
  const beforeCoupon = round(subtotal - discount + delivery);

  const normalized = couponCode?.trim().toUpperCase() || null;
  const coupon = normalized ? COUPONS[normalized] : undefined;
  const couponDiscount = coupon && beforeCoupon > 0 ? Math.min(coupon.amount, beforeCoupon) : 0;

  return {
    stalls,
    units: stalls.reduce((s, q) => s + q.units, 0),
    orderCount: stalls.length,
    subtotal,
    discount,
    delivery,
    couponCode: coupon ? normalized : null,
    couponDiscount,
    total: round(beforeCoupon - couponDiscount),
  };
}

export function isValidCoupon(code: string) {
  return Boolean(COUPONS[code.trim().toUpperCase()]);
}
