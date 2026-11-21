// Catálogo de PIDELO: puestos, productos y promociones del mes.
const FLUENT = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets";
const emoji = (folder: string, file: string) => `${FLUENT}/${encodeURIComponent(folder)}/3D/${file}_3d.png`;

export const EMOJI = {
  saltena: emoji("Dumpling", "dumpling"),
  cheese: emoji("Cheese wedge", "cheese_wedge"),
  croissant: emoji("Croissant", "croissant"),
  cup: emoji("Cup with straw", "cup_with_straw"),
  box: emoji("Beverage box", "beverage_box"),
  meat: emoji("Cut of meat", "cut_of_meat"),
  bone: emoji("Meat on bone", "meat_on_bone"),
  hotdog: emoji("Hot dog", "hot_dog"),
  poultry: emoji("Poultry leg", "poultry_leg"),
  tropical: emoji("Tropical drink", "tropical_drink"),
  pizza: emoji("Pizza", "pizza"),
  spaghetti: emoji("Spaghetti", "spaghetti"),
  salad: emoji("Green salad", "green_salad"),
  burger: emoji("Hamburger", "hamburger"),
  fries: emoji("French fries", "french_fries"),
  sandwich: emoji("Sandwich", "sandwich"),
  sushi: emoji("Sushi", "sushi"),
  bento: emoji("Bento box", "bento_box"),
  riceball: emoji("Rice ball", "rice_ball"),
  shrimp: emoji("Fried shrimp", "fried_shrimp"),
  ramen: emoji("Steaming bowl", "steaming_bowl"),
  tea: emoji("Hot beverage", "hot_beverage"),
  softIce: emoji("Soft ice cream", "soft_ice_cream"),
  iceCream: emoji("Ice cream", "ice_cream"),
  shortcake: emoji("Shortcake", "shortcake"),
  cupcake: emoji("Cupcake", "cupcake"),
  bubbleTea: emoji("Bubble tea", "bubble_tea"),
  chocolate: emoji("Chocolate bar", "chocolate_bar"),
} as const;

export type Category = "saltenas" | "parrilla" | "pizza" | "hamburguesas" | "sushi" | "postres";

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "saltenas", label: "Salteñas" },
  { id: "parrilla", label: "Parrilla" },
  { id: "pizza", label: "Pizza" },
  { id: "hamburguesas", label: "Hamburguesas" },
  { id: "sushi", label: "Sushi" },
  { id: "postres", label: "Postres" },
];

export type StallColor = "yellow" | "green" | "blue" | "pink" | "orange" | "red";

/** Promociones: siempre se evalúan sobre el subtotal de UN puesto. */
export type Promotion =
  | { kind: "percent"; percent: number; minSubtotal: number }
  | { kind: "fixed"; amount: number; minSubtotal: number }
  | { kind: "freeDelivery"; minSubtotal: number };

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  section: string;
}

export interface Stall {
  id: string;
  slug: string;
  number: string;
  name: string;
  category: Category;
  categoryLabel: string;
  rating: number;
  minutes: number;
  /** Tarifa de envío del puesto en Bs (0 = envío gratis). */
  deliveryFee: number;
  color: StallColor;
  image: string;
  promotion: Promotion | null;
  products: Product[];
}

export const STALLS: Stall[] = [
  {
    id: "s01",
    slug: "saltenas",
    number: "01",
    name: "Salteñas El Buen Sabor",
    category: "saltenas",
    categoryLabel: "Salteñas",
    rating: 4.8,
    minutes: 25,
    deliveryFee: 0,
    color: "yellow",
    image: EMOJI.saltena,
    promotion: { kind: "percent", percent: 20, minSubtotal: 0 },
    products: [
      { id: "s01-pollo", name: "Salteña de pollo", description: "Jugosa, con papa y arveja", price: 9, image: EMOJI.saltena, section: "Populares" },
      { id: "s01-carne", name: "Salteña de carne", description: "Receta de la casa, ligeramente picante", price: 9, image: EMOJI.saltena, section: "Populares" },
      { id: "s01-queso", name: "Salteña de queso", description: "Queso fundido y cebolla", price: 8, image: EMOJI.cheese, section: "Populares" },
      { id: "s01-tucumana", name: "Tucumana", description: "Frita y crocante, con ají", price: 10, image: EMOJI.croissant, section: "Populares" },
      { id: "s01-api", name: "Api con pastel", description: "Api morado caliente y pastel", price: 12, image: EMOJI.cup, section: "Bebidas" },
      { id: "s01-mocochinchi", name: "Refresco de mocochinchi", description: "Bien frío", price: 8, image: EMOJI.box, section: "Bebidas" },
    ],
  },
  {
    id: "s02",
    slug: "parrilla",
    number: "02",
    name: "Parrilla Don Gaucho",
    category: "parrilla",
    categoryLabel: "Parrilla",
    rating: 4.6,
    minutes: 40,
    deliveryFee: 10,
    color: "orange",
    image: EMOJI.meat,
    promotion: null,
    products: [
      { id: "s02-churrasco", name: "Churrasco", description: "Con arroz, papa y ensalada", price: 45, image: EMOJI.meat, section: "Populares" },
      { id: "s02-costilla", name: "Costilla de res", description: "Al carbón, con yuca", price: 55, image: EMOJI.bone, section: "Populares" },
      { id: "s02-pollo", name: "Cuarto de pollo", description: "A la brasa, con papas fritas", price: 30, image: EMOJI.poultry, section: "Populares" },
      { id: "s02-choripan", name: "Choripán", description: "Chorizo chuquisaqueño y llajua", price: 18, image: EMOJI.hotdog, section: "Populares" },
      { id: "s02-chicha", name: "Chicha de maní", description: "Vaso de 500 ml", price: 10, image: EMOJI.tropical, section: "Bebidas" },
    ],
  },
  {
    id: "s03",
    slug: "pizza",
    number: "03",
    name: "Pizzería Il Cóndor",
    category: "pizza",
    categoryLabel: "Pizza",
    rating: 4.7,
    minutes: 35,
    deliveryFee: 8,
    color: "green",
    image: EMOJI.pizza,
    promotion: { kind: "freeDelivery", minSubtotal: 100 },
    products: [
      { id: "s03-margarita", name: "Pizza margarita", description: "Tomate, mozzarella y albahaca", price: 55, image: EMOJI.pizza, section: "Pizzas" },
      { id: "s03-pepperoni", name: "Pizza pepperoni", description: "Doble pepperoni", price: 65, image: EMOJI.pizza, section: "Pizzas" },
      { id: "s03-valluna", name: "Pizza valluna", description: "Chorizo, locoto y queso criollo", price: 70, image: EMOJI.pizza, section: "Pizzas" },
      { id: "s03-lasana", name: "Lasaña boloñesa", description: "Porción familiar", price: 45, image: EMOJI.spaghetti, section: "Pastas" },
      { id: "s03-ensalada", name: "Ensalada César", description: "Pollo, crutones y parmesano", price: 30, image: EMOJI.salad, section: "Pastas" },
    ],
  },
  {
    id: "s04",
    slug: "hamburguesas",
    number: "04",
    name: "Burger Andina",
    category: "hamburguesas",
    categoryLabel: "Hamburguesas",
    rating: 4.5,
    minutes: 30,
    deliveryFee: 7,
    color: "blue",
    image: EMOJI.burger,
    promotion: { kind: "percent", percent: 15, minSubtotal: 0 },
    products: [
      { id: "s04-clasica", name: "Hamburguesa clásica", description: "Carne, queso, lechuga y tomate", price: 30, image: EMOJI.burger, section: "Populares" },
      { id: "s04-doble", name: "Doble queso", description: "Dos carnes y cheddar", price: 40, image: EMOJI.burger, section: "Populares" },
      { id: "s04-lomito", name: "Sándwich de lomito", description: "Lomo, huevo y palta", price: 35, image: EMOJI.sandwich, section: "Populares" },
      { id: "s04-papas", name: "Papas fritas", description: "Porción grande", price: 15, image: EMOJI.fries, section: "Acompañamientos" },
      { id: "s04-hotdog", name: "Hot dog andino", description: "Con papas al hilo", price: 20, image: EMOJI.hotdog, section: "Acompañamientos" },
    ],
  },
  {
    id: "s05",
    slug: "sushi",
    number: "05",
    name: "Sushi Illimani",
    category: "sushi",
    categoryLabel: "Sushi",
    rating: 4.6,
    minutes: 45,
    deliveryFee: 9,
    color: "red",
    image: EMOJI.sushi,
    promotion: null,
    products: [
      { id: "s05-california", name: "Roll California", description: "10 piezas, cangrejo y palta", price: 48, image: EMOJI.sushi, section: "Rolls" },
      { id: "s05-ebi", name: "Ebi tempura roll", description: "Langostino crocante", price: 52, image: EMOJI.shrimp, section: "Rolls" },
      { id: "s05-bento", name: "Bento del día", description: "Arroz, pollo teriyaki y gyozas", price: 55, image: EMOJI.bento, section: "Platos" },
      { id: "s05-onigiri", name: "Onigiri", description: "Relleno de atún", price: 18, image: EMOJI.riceball, section: "Platos" },
      { id: "s05-ramen", name: "Ramen", description: "Caldo de cerdo y huevo marinado", price: 45, image: EMOJI.ramen, section: "Platos" },
      { id: "s05-te", name: "Té verde", description: "Caliente", price: 10, image: EMOJI.tea, section: "Bebidas" },
    ],
  },
  {
    id: "s06",
    slug: "postres",
    number: "06",
    name: "Heladería Tunari",
    category: "postres",
    categoryLabel: "Postres",
    rating: 4.9,
    minutes: 20,
    deliveryFee: 6,
    color: "pink",
    image: EMOJI.softIce,
    promotion: { kind: "fixed", amount: 8, minSubtotal: 50 },
    products: [
      { id: "s06-milkshake", name: "Milkshake", description: "Frutilla, chocolate o vainilla", price: 25, image: EMOJI.bubbleTea, section: "Populares" },
      { id: "s06-copa", name: "Copa Tunari", description: "Tres bolas, crema y galleta", price: 22, image: EMOJI.iceCream, section: "Populares" },
      { id: "s06-cono", name: "Cono suave", description: "Vainilla o mixto", price: 10, image: EMOJI.softIce, section: "Populares" },
      { id: "s06-torta", name: "Torta de frutilla", description: "Porción", price: 18, image: EMOJI.shortcake, section: "Pastelería" },
      { id: "s06-cupcake", name: "Cupcake", description: "Chocolate con chispas", price: 12, image: EMOJI.cupcake, section: "Pastelería" },
      { id: "s06-brownie", name: "Brownie", description: "Con nueces", price: 14, image: EMOJI.chocolate, section: "Pastelería" },
    ],
  },
];

export const getStallBySlug = (slug: string) => STALLS.find((s) => s.slug === slug);
export const getStallById = (id: string) => STALLS.find((s) => s.id === id);

export function findProduct(productId: string): { stall: Stall; product: Product } | undefined {
  for (const stall of STALLS) {
    const product = stall.products.find((p) => p.id === productId);
    if (product) return { stall, product };
  }
  return undefined;
}

/** Cupones de demostración. */
export const COUPONS: Record<string, { label: string; amount: number }> = {
  PIDELO5: { label: "Cupón PIDELO5", amount: 5 },
};

export const STALL_SURFACE: Record<StallColor, string> = {
  yellow: "bg-stall-yellow text-on-light",
  green: "bg-stall-green text-on-dark",
  blue: "bg-stall-blue text-on-dark",
  pink: "bg-stall-pink text-on-light",
  orange: "bg-stall-orange text-on-light",
  red: "bg-stall-red text-on-dark",
};

export function promoTitle(p: Promotion): string {
  if (p.kind === "percent") return `${p.percent} % de descuento`;
  if (p.kind === "fixed") return `Bs ${p.amount} menos`;
  return "Envío gratis";
}

export function promoDescription(p: Promotion, stallName: string): string {
  if (p.kind === "percent")
    return p.minSubtotal > 0
      ? `En tu pedido de ${stallName} desde Bs ${p.minSubtotal}`
      : `En todo tu pedido de ${stallName}`;
  return `En ${stallName} desde Bs ${p.minSubtotal}`;
}
