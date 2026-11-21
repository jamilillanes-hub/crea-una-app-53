import { describe, expect, it } from "vitest";
import { quoteCart } from "@/lib/pricing";

const pollo = { productId: "s01-pollo", qty: 1 };
const shake = (qty: number) => ({ productId: "s06-milkshake", qty });

describe("Cotización del carrito PIDELO", () => {
  it("salteña de pollo + 1 milkshake totaliza Bs 38.20", () => {
    const q = quoteCart([pollo, shake(1)]);
    expect(q.total).toBe(38.2);
    expect(q.discount).toBe(1.8);
    expect(q.delivery).toBe(6);
  });

  it("2 milkshakes (Bs 50) activan los Bs 8 de Heladería Tunari: total Bs 55.20", () => {
    const q = quoteCart([pollo, shake(2)]);
    const tunari = q.stalls.find((s) => s.stall.id === "s06");
    expect(tunari?.discount).toBe(8);
    expect(q.total).toBe(55.2);
  });

  it("volver a 1 milkshake retira el descuento de la heladería", () => {
    const tunari = quoteCart([pollo, shake(1)]).stalls.find((s) => s.stall.id === "s06");
    expect(tunari?.discount).toBe(0);
    expect(tunari?.missingForPromo).toBe(25);
  });

  it("el contador cuenta unidades y se genera un pedido por puesto", () => {
    const q = quoteCart([pollo, shake(2)]);
    expect(q.units).toBe(3);
    expect(q.orderCount).toBe(2);
  });

  it("Salteñas El Buen Sabor aplica 20 % sobre su propio subtotal (Bs 36 → Bs 28.80)", () => {
    const q = quoteCart([
      { productId: "s01-pollo", qty: 1 },
      { productId: "s01-queso", qty: 1 },
      { productId: "s01-carne", qty: 1 },
      { productId: "s01-tucumana", qty: 1 },
    ]);
    expect(q.discount).toBe(7.2);
    expect(q.total).toBe(28.8);
  });

  it("Pizzería Il Cóndor tiene envío gratis solo desde Bs 100", () => {
    expect(quoteCart([{ productId: "s03-margarita", qty: 1 }]).delivery).toBe(8);
    expect(quoteCart([{ productId: "s03-margarita", qty: 2 }]).delivery).toBe(0);
  });
});
