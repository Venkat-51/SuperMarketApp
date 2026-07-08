/**
 * SuperMarket APP — API Client
 * All communication with the ASP.NET Core backend at http://localhost:5000
 */

const BASE_URL = 'http://localhost:5000/api';

// ── Token management ──────────────────────────────────────────────────────────
export const tokenStore = {
  get: () => localStorage.getItem('sm_token'),
  set: (token: string) => localStorage.setItem('sm_token', token),
  clear: () => localStorage.removeItem('sm_token'),
};

// ── Base fetch with auth ──────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const body = await res.text();
    let json: any = null;

    if (body) {
      try {
        json = JSON.parse(body);
      } catch {
        json = null;
      }
    }

    if (!res.ok) {
      return {
        data: null,
        error: json?.error ?? json?.title ?? (body || `HTTP ${res.status}`),
      };
    }

    return { data: json as T, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiProduct {
  id: number;
  name: string;
  brand?: string;
  imageUrl: string;
  price: number;
  mrp: number;
  weight: string;
  category: string;
  inStock: boolean;
  discountPercent: number;
}

export interface ApiCategory { id: number; name: string; icon: string; }

export interface ApiOrder {
  id: number;
  status: string;
  paymentMethod: string;
  paymentId?: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
  address?: ApiAddress;
  items: ApiOrderItem[];
}

export interface ApiOrderItem {
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  mrp: number;
  weight: string;
  quantity: number;
}

export interface ApiAddress {
  id: number; label: string; line1: string;
  city: string; state: string; pincode: string; isDefault: boolean;
}

export interface ApiCartResponse {
  items: ApiCartItem[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface ApiCartItem {
  productId: number; productName: string; brand?: string;
  imageUrl: string; price: number; mrp: number; weight: string; quantity: number;
}

export interface CouponValidation {
  isValid: boolean; error?: string; code?: string;
  discountType?: string; discountValue: number; discount: number; finalTotal: number;
}

export interface ApiUser {
  id: number;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (phone: string) =>
    apiFetch<{ message: string; otp: string }>('/auth/send-otp', {
      method: 'POST', body: JSON.stringify({ phone }),
    }),

  verifyOtp: async (phone: string, otp: string, name?: string) => {
    const result = await apiFetch<{ token: string; user: ApiUser }>(
      '/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ phone, otp, name }) }
    );
    if (result.data?.token) tokenStore.set(result.data.token);
    return result;
  },

  me: () => apiFetch<ApiUser>('/auth/me'),

  updateProfile: (payload: { name: string; email?: string }) =>
    apiFetch<ApiUser>('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),

  logout: () => { tokenStore.clear(); },
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: { category?: string; search?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search)   q.set('search', params.search);
    if (params?.page)     q.set('page', String(params.page));
    return apiFetch<{ products: ApiProduct[]; total: number }>(`/products?${q}`);
  },

  get: (id: number) => apiFetch<ApiProduct>(`/products/${id}`),

  categories: () => apiFetch<ApiCategory[]>('/categories'),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  place: (payload: {
    items: { productId: number; quantity: number }[];
    addressId?: number;
    paymentMethod: string;
    paymentId?: string;
    razorpayOrderId?: string;
    couponCode?: string;
  }) => apiFetch<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  list: () => apiFetch<ApiOrder[]>('/orders'),

  get: (id: number) => apiFetch<ApiOrder>(`/orders/${id}`),

  cancel: (id: number) =>
    apiFetch<{ message: string }>(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createOrder: (amount: number) =>
    apiFetch<{ orderId: string; amount: number; currency: string; keyId: string }>(
      '/payments/create-order',
      { method: 'POST', body: JSON.stringify({ amount }) }
    ),

  verify: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) =>
    apiFetch<{ message: string; paymentId: string }>(
      '/payments/verify',
      { method: 'POST', body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) }
    ),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => apiFetch<ApiCartResponse>('/cart'),

  sync: (items: { productId: number; quantity: number }[]) =>
    apiFetch<ApiCartResponse>('/cart/sync', { method: 'POST', body: JSON.stringify({ items }) }),

  clear: () => apiFetch<null>('/cart', { method: 'DELETE' }),
};

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addressesApi = {
  list: () => apiFetch<ApiAddress[]>('/addresses'),

  add: (payload: { label: string; line1: string; city: string; state: string; pincode: string; isDefault?: boolean }) =>
    apiFetch<ApiAddress>('/addresses', { method: 'POST', body: JSON.stringify(payload) }),

  delete: (id: number) => apiFetch<null>(`/addresses/${id}`, { method: 'DELETE' }),
};

// ── Coupons ───────────────────────────────────────────────────────────────────
export const couponsApi = {
  validate: (code: string, orderTotal: number) =>
    apiFetch<CouponValidation>('/coupons/validate', {
      method: 'POST', body: JSON.stringify({ code, orderTotal }),
    }),
};

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => apiFetch<{ productId: number; product: ApiProduct; addedAt: string }[]>('/wishlist'),
  add: (productId: number) => apiFetch<{ message: string }>(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId: number) => apiFetch<null>(`/wishlist/${productId}`, { method: 'DELETE' }),
};
