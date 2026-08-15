import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi, wishlistApi, authApi, tokenStore, ApiUser, ApiProduct } from '../../lib/api';

export interface ProductVariant {
  size: string;
  price: number;
  mrp: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  image: string;
  images?: string[];
  price: number;
  mrp: number;
  weight: string;
  category: string;
  inStock: boolean;
  unit_type?: 'volume' | 'weight' | string;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
}

const GUEST_CART_KEY = 'sm_guest_cart';
const GUEST_WISHLIST_KEY = 'sm_guest_wishlist';

interface CartContextType {
  cartItems: CartItem[];
  cart: CartItem[]; // alias for cartItems for existing components
  wishlistIds: Set<string>;
  user: ApiUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  toggleWishlist: (product: { id: string | number }) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  syncGuestDataOnLogin: () => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to safely load guest cart from localStorage
const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper to safely save guest cart to localStorage
const saveGuestCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {}
};

// Helper to safely load guest wishlist from localStorage
const loadGuestWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper to safely save guest wishlist to localStorage
const saveGuestWishlist = (ids: string[]) => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {}
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const isAuthenticated = !!user;

  // Helper to map API cart items to CartItem format
  const mapApiCartToItems = (apiItems: any[]): CartItem[] => {
    return apiItems.map(item => ({
      id: String(item.productId),
      name: item.productName,
      brand: item.brand,
      image: item.imageUrl,
      price: item.price,
      mrp: item.mrp,
      weight: item.weight,
      category: '',
      inStock: true,
      quantity: item.quantity,
    }));
  };

  // Sync server state for logged-in user
  const fetchServerCartAndWishlist = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        cartApi.get(),
        wishlistApi.get()
      ]);

      if (cartRes.data?.items) {
        setCartItems(mapApiCartToItems(cartRes.data.items));
      }
      if (wishlistRes.data) {
        setWishlistIds(new Set(wishlistRes.data.map(item => String(item.productId))));
      }
    } catch (e) {
      console.error('Failed to fetch user cart/wishlist', e);
    }
  };

  // Sync guest data to backend upon successful sign-in
  const syncGuestDataOnLogin = async () => {
    const guestCart = loadGuestCart();
    const guestWishlist = loadGuestWishlist();

    // 1. Sync Cart
    if (guestCart.length > 0) {
      try {
        // Fetch current server cart first to merge properly
        const serverCartRes = await cartApi.get();
        const serverItems = serverCartRes.data?.items || [];
        
        // Build merged map (Key: productId)
        const itemMap = new Map<number, number>();
        for (const item of serverItems) {
          itemMap.set(item.productId, item.quantity);
        }

        for (const guestItem of guestCart) {
          const pid = Number(guestItem.id);
          if (!isNaN(pid)) {
            if (itemMap.has(pid)) {
              // Account already has it -> combine quantities
              itemMap.set(pid, (itemMap.get(pid) || 0) + guestItem.quantity);
            } else {
              // Account didn't have it -> preserve guest quantity
              itemMap.set(pid, guestItem.quantity);
            }
          }
        }

        const syncPayload = Array.from(itemMap.entries()).map(([productId, quantity]) => ({
          productId,
          quantity
        }));

        const syncRes = await cartApi.sync(syncPayload);
        if (syncRes.data?.items) {
          setCartItems(mapApiCartToItems(syncRes.data.items));
        }
      } catch (err) {
        console.error('Failed to sync guest cart to server:', err);
      }
    }

    // 2. Sync Wishlist
    if (guestWishlist.length > 0) {
      try {
        const serverWishlistRes = await wishlistApi.get();
        const serverIds = new Set((serverWishlistRes.data || []).map(w => String(w.productId)));

        for (const guestIdStr of guestWishlist) {
          const pid = Number(guestIdStr);
          if (!isNaN(pid) && !serverIds.has(guestIdStr)) {
            await wishlistApi.add(pid);
          }
        }
      } catch (err) {
        console.error('Failed to sync guest wishlist to server:', err);
      }
    }

    // Clear guest localStorage after successful sync
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_WISHLIST_KEY);

    // Refresh final server state
    await fetchServerCartAndWishlist();
  };

  // Initial Auth & Data Load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = tokenStore.get();
      if (token) {
        const res = await authApi.me();
        if (isMounted) {
          if (res.data) {
            setUser(res.data);
            await fetchServerCartAndWishlist();
          } else {
            // Invalid token
            tokenStore.clear();
            setUser(null);
            setCartItems(loadGuestCart());
            setWishlistIds(new Set(loadGuestWishlist()));
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setCartItems(loadGuestCart());
          setWishlistIds(new Set(loadGuestWishlist()));
        }
      }
      if (isMounted) setIsAuthLoading(false);
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUserData = async () => {
    const token = tokenStore.get();
    if (token) {
      const res = await authApi.me();
      if (res.data) {
        setUser(res.data);
        await syncGuestDataOnLogin();
      }
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    // On logout, load guest cart and wishlist (which should be empty or new session)
    setCartItems(loadGuestCart());
    setWishlistIds(new Set(loadGuestWishlist()));
  };

  // Cart Operations
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      let updated: CartItem[];
      if (existingItem) {
        updated = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { ...product, quantity }];
      }

      if (user) {
        // Sync with backend
        const syncPayload = updated.map(item => ({
          productId: Number(item.id),
          quantity: item.quantity,
        })).filter(item => !isNaN(item.productId));
        cartApi.sync(syncPayload);
      } else {
        // Persist locally for guest
        saveGuestCart(updated);
      }

      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      if (user) {
        const syncPayload = updated.map(item => ({
          productId: Number(item.id),
          quantity: item.quantity,
        })).filter(item => !isNaN(item.productId));
        cartApi.sync(syncPayload);
      } else {
        saveGuestCart(updated);
      }
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      if (user) {
        const syncPayload = updated.map(item => ({
          productId: Number(item.id),
          quantity: item.quantity,
        })).filter(item => !isNaN(item.productId));
        cartApi.sync(syncPayload);
      } else {
        saveGuestCart(updated);
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      cartApi.clear();
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Wishlist Operations
  const toggleWishlist = async (product: { id: string | number }) => {
    const idStr = String(product.id);
    const pid = Number(product.id);
    const isWishlisted = wishlistIds.has(idStr);

    // Optimistic UI update
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (isWishlisted) {
        next.delete(idStr);
      } else {
        next.add(idStr);
      }

      if (!user) {
        saveGuestWishlist(Array.from(next));
      }
      return next;
    });

    if (user && !isNaN(pid)) {
      const res = isWishlisted
        ? await wishlistApi.remove(pid)
        : await wishlistApi.add(pid);

      if (res.error) {
        // Rollback on error
        setWishlistIds(prev => {
          const rollback = new Set(prev);
          if (isWishlisted) {
            rollback.add(idStr);
          } else {
            rollback.delete(idStr);
          }
          return rollback;
        });
      }
    }
  };

  const isInWishlist = (productId: string | number) => {
    return wishlistIds.has(String(productId));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cart: cartItems,
        wishlistIds,
        user,
        isAuthenticated,
        isAuthLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toggleWishlist,
        isInWishlist,
        syncGuestDataOnLogin,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
