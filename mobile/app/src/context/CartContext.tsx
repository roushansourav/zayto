import React from 'react';

export type CartItem = {
  id: string; // unique per menu item + modifiers (future)
  name: string;
  price_cents: number;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  subtotal_cents: number;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const CartContext = React.createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = React.useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const clone = [...prev];
        clone[idx] = { ...clone[idx], qty: clone[idx].qty + qty };
        return clone;
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = React.useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);

  const updateQty = React.useCallback((id: string, qty: number) => setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))), []);

  const clear = React.useCallback(() => setItems([]), []);

  const subtotal_cents = React.useMemo(() => items.reduce((s, i) => s + i.price_cents * i.qty, 0), [items]);

  const value = React.useMemo<CartCtx>(() => ({ items, subtotal_cents, addItem, removeItem, updateQty, clear }), [items, subtotal_cents, addItem, removeItem, updateQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
