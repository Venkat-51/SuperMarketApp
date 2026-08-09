/**
 * SuperMarket APP — API Client
 * All communication with the ASP.NET Core backend at http://localhost:5000
 */

// Normalize: strip trailing slash, then ensure it ends with /api
const BASE_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  return `http://${window.location.hostname}:5000/api`;
})();

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
      if (res.status === 401) {
        tokenStore.clear();
        return {
          data: null,
          error: json?.error ?? 'Please log in to continue.',
        };
      }
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

export interface ApiReview {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const result = await apiFetch<{ token: string; user: ApiUser }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    if (result.data?.token) tokenStore.set(result.data.token);
    return result;
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    const result = await apiFetch<{ token: string; user: ApiUser }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password, phone }) }
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

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getForProduct: (productId: number) => apiFetch<ApiReview[]>(`/reviews/product/${productId}`),
  getForUser: () => apiFetch<ApiReview[]>('/reviews/user'),
  add: (payload: { productId: number; rating: number; comment?: string }) =>
    apiFetch<ApiReview>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminOverviewStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  todayOrders: number;
  todayRevenue: number;
  categoryDistribution: { category: string; count: number }[];
  salesOverTime: { date: string; revenue: number; orders: number }[];
}

export interface AdminProductDto extends ApiProduct {
  sku?: string;
  subcategory?: string;
  description?: string;
  unit?: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
}

export interface AdminOrderDto {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  userPhone: string;
  status: string;
  paymentMethod: string;
  paymentId?: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
  itemsCount: number;
  address?: ApiAddress;
  items: ApiOrderItem[];
}

export interface AdminUserDto {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  ordersCount: number;
  totalSpent: number;
}

export const adminApi = {
  getStats: () => apiFetch<AdminOverviewStats>('/admin/stats'),

  getProducts: (params?: { search?: string; category?: string; brand?: string; stockStatus?: string; isActive?: boolean; sortBy?: string; page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.brand) q.set('brand', params.brand);
    if (params?.stockStatus) q.set('stockStatus', params.stockStatus);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    if (params?.page) q.set('page', String(params.page));
    if (params?.pageSize) q.set('pageSize', String(params.pageSize));
    return apiFetch<{ products: AdminProductDto[]; total: number; page: number; pageSize: number }>(`/admin/products?${q}`);
  },

  createProduct: (payload: Partial<AdminProductDto>) =>
    apiFetch<AdminProductDto>('/admin/products', { method: 'POST', body: JSON.stringify(payload) }),

  updateProduct: (id: number, payload: Partial<AdminProductDto>) =>
    apiFetch<AdminProductDto>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  updateStock: (id: number, stockQuantity: number) =>
    apiFetch<AdminProductDto>(`/admin/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify(stockQuantity) }),

  toggleActive: (id: number) =>
    apiFetch<AdminProductDto>(`/admin/products/${id}/toggle-active`, { method: 'PATCH' }),

  deleteProduct: (id: number) =>
    apiFetch<{ message?: string }>(`/admin/products/${id}`, { method: 'DELETE' }),

  bulkImport: (products: any[]) =>
    apiFetch<{ importedCount: number; errorCount: number; errors: string[] }>('/admin/products/bulk-import', { method: 'POST', body: JSON.stringify({ products }) }),

  getOrders: (params?: { search?: string; status?: string; page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.pageSize) q.set('pageSize', String(params.pageSize));
    return apiFetch<{ orders: AdminOrderDto[]; total: number; page: number; pageSize: number }>(`/admin/orders?${q}`);
  },

  updateOrderStatus: (id: number, status: string, paymentStatus?: string) =>
    apiFetch<{ message: string; status: string }>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, paymentStatus }) }),

  getUsers: (params?: { search?: string; page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.pageSize) q.set('pageSize', String(params.pageSize));
    return apiFetch<{ users: AdminUserDto[]; total: number; page: number; pageSize: number }>(`/admin/users?${q}`);
  },

  getUserDetail: (id: number) =>
    apiFetch<AdminUserDto & { completedOrders: number; cancelledOrders: number; orders: any[] }>(`/admin/users/${id}`),

  updateUserStatus: (id: number, isActive: boolean, role?: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive, role }) }),
};
