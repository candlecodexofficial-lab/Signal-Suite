import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ProductVersion = "indicator" | "strategy";

export interface CartItem {
  indicatorId: number;
  name: string;
  slug: string;
  price: string;
  duration: number;
  isTrial: boolean;
  version: ProductVersion;
}

export function computeStrategyPrice(indicatorPrice: string): string {
  const p = parseFloat(indicatorPrice);
  if (p === 0) return "499";
  return Math.round(p * 1.35).toString();
}

export function computeTrialPrice(version: ProductVersion): string {
  return version === "strategy" ? Math.round(5250 * 1.35).toString() : "5250";
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "duration" | "isTrial" | "version"> & { version?: ProductVersion }) => void;
  addTrial: (item: Omit<CartItem, "duration" | "isTrial" | "version"> & { version?: ProductVersion }) => void;
  removeItem: (indicatorId: number) => void;
  updateDuration: (indicatorId: number, duration: number) => void;
  clearCart: () => void;
  totalPrice: number;
  itemCount: number;
  isInCart: (indicatorId: number) => boolean;
  getCartItem: (indicatorId: number) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "duration" | "isTrial" | "version"> & { version?: ProductVersion }) => {
    setItems((prev) => {
      if (prev.some((i) => i.indicatorId === item.indicatorId)) return prev;
      return [...prev, { ...item, version: item.version ?? "indicator", duration: 1, isTrial: false }];
    });
  }, []);

  const addTrial = useCallback((item: Omit<CartItem, "duration" | "isTrial" | "version"> & { version?: ProductVersion }) => {
    setItems((prev) => {
      if (prev.some((i) => i.indicatorId === item.indicatorId)) return prev;
      const version: ProductVersion = item.version ?? "indicator";
      return [...prev, { ...item, version, price: computeTrialPrice(version), duration: 1, isTrial: true }];
    });
  }, []);

  const removeItem = useCallback((indicatorId: number) => {
    setItems((prev) => prev.filter((i) => i.indicatorId !== indicatorId));
  }, []);

  const updateDuration = useCallback((indicatorId: number, duration: number) => {
    setItems((prev) =>
      prev.map((i) => (i.indicatorId === indicatorId ? { ...i, duration } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalPrice = items.reduce((sum, item) => {
    if (item.isTrial) return sum + parseFloat(item.price);
    return sum + parseFloat(item.price) * item.duration;
  }, 0);

  const itemCount = items.length;

  const isInCart = useCallback(
    (indicatorId: number) => items.some((i) => i.indicatorId === indicatorId),
    [items]
  );

  const getCartItem = useCallback(
    (indicatorId: number) => items.find((i) => i.indicatorId === indicatorId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, addTrial, removeItem, updateDuration, clearCart, totalPrice, itemCount, isInCart, getCartItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
