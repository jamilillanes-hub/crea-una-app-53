import { Minus, Plus } from "lucide-react";

export function QtyControl({ qty, onChange, label }: { qty: number; onChange: (qty: number) => void; label: string }) {
  return (
    <div className="qty h-11" role="group" aria-label={`Cantidad de ${label}`}>
      <button type="button" aria-label={`Quitar una unidad de ${label}`} onClick={() => onChange(qty - 1)}>
        <Minus className="size-4" />
      </button>
      <output aria-live="polite">{qty}</output>
      <button type="button" aria-label={`Agregar una unidad de ${label}`} onClick={() => onChange(qty + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
