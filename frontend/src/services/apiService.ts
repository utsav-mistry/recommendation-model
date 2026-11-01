import {
  FastApiProduct,
  ProductPage,
  ProductFilterParams,
  AuthResponse,
  AuthUser,
  UserProductList,
  Order,
  OrderSummary
} from '../types/api';
import { Product } from '../types/ecommerce';

const FASTAPI_ROOT_URL =
  import.meta.env.VITE_FASTAPI_API_URL ||
  'http://localhost:8000';
const FASTAPI_BASE_URL = `${FASTAPI_ROOT_URL}/api`;

async function fastApiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const res = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as {
      detail?: string;
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message || body?.detail || `FastAPI request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  async signup(email: string, password: string, name: string, age: number): Promise<AuthResponse> {
    return fastApiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, age })
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return fastApiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getCurrentUser(token: string): Promise<AuthUser> {
    const response = await fastApiRequest<{ user: AuthUser }>('/auth/me', undefined, token);
    return response.user;
  },

  async logout(token: string): Promise<void> {
    await fastApiRequest('/auth/logout', { method: 'POST' }, token);
  },

  /**
   * FastAPI catalogue API
   */
  async getProducts(params?: ProductFilterParams & { page?: number; pageSize?: number }): Promise<ProductPage> {
    const query = new URLSearchParams();
    query.append('page', String(params?.page || 1));
    query.append('page_size', String(params?.pageSize || 48));
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All Departments') query.append('category', params.category);
    if (params?.minPrice !== undefined) query.append('min_price', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('max_price', String(params.maxPrice));
    if (params?.minRating !== undefined) query.append('min_rating', String(params.minRating));
    if (params?.store) query.append('store', params.store);
    if (params?.sort) query.append('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fastApiRequest<ProductPage>(`/products${qs}`);
  },

  async getProductById(parentAsin: string): Promise<FastApiProduct> {
    return fastApiRequest<FastApiProduct>(`/products/${encodeURIComponent(parentAsin)}`);
  },

  async getCategories(): Promise<Array<{ name: string; label: string; product_count: number }>> {
    return fastApiRequest('/categories');
  },

  async getGlobalRecommendations(limit = 8): Promise<FastApiProduct[]> {
    const response = await fastApiRequest<{ items: FastApiProduct[] }>(
      `/recommendations/global?limit=${limit}`
    );
    return response.items;
  },

  async getCategoryRecommendations(category: string, limit = 8): Promise<FastApiProduct[]> {
    const response = await fastApiRequest<{ items: FastApiProduct[] }>(
      `/recommendations/category/${encodeURIComponent(category)}?limit=${limit}`
    );
    return response.items;
  },

  async getSimilarRecommendations(productIds: string[], limit = 8): Promise<FastApiProduct[]> {
    const response = await fastApiRequest<{ items: FastApiProduct[] }>('/recommendations/similar', {
      method: 'POST',
      body: JSON.stringify({ product_ids: productIds, limit })
    });
    return response.items;
  },

  async getPersonalizedRecommendations(token: string, limit = 8): Promise<{
    items: FastApiProduct[];
    personalized: boolean;
    has_history: boolean;
  }> {
    return fastApiRequest<{
      items: FastApiProduct[];
      personalized: boolean;
      has_history: boolean;
    }>(`/recommendations/personalized?limit=${limit}`, undefined, token);
  },

    async getRecentlyViewed(token: string, limit = 8): Promise<FastApiProduct[]> {
      const response = await fastApiRequest<{ items: FastApiProduct[] }>(
        `/history/products?limit=${limit}`,
        undefined,
        token
      );
      return response.items;
    },

  async getWishlist(token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>('/wishlist', undefined, token);
  },

  async addWishlist(parentAsin: string, token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>(`/wishlist/${encodeURIComponent(parentAsin)}`, {
      method: 'POST'
    }, token);
  },

  async removeWishlist(parentAsin: string, token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>(`/wishlist/${encodeURIComponent(parentAsin)}`, {
      method: 'DELETE'
    }, token);
  },

  async getCart(token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>('/cart', undefined, token);
  },

  async addCart(parentAsin: string, quantity: number, token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>(`/cart/${encodeURIComponent(parentAsin)}`, {
      method: 'POST',
      body: JSON.stringify({ quantity })
    }, token);
  },

  async updateCart(parentAsin: string, quantity: number, token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>(`/cart/${encodeURIComponent(parentAsin)}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }, token);
  },

  async removeCart(parentAsin: string, token: string): Promise<UserProductList> {
    return fastApiRequest<UserProductList>(`/cart/${encodeURIComponent(parentAsin)}`, {
      method: 'DELETE'
    }, token);
  },

  async recordEvent(
    event: {
      event_type: string;
      parent_asin?: string;
      search_query?: string;
      category?: string;
      metadata?: Record<string, string | number | boolean>;
    },
    token: string
  ): Promise<void> {
    await fastApiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    }, token);
  },

  async checkout(token: string): Promise<Order> {
    return fastApiRequest<Order>('/orders/checkout', { method: 'POST' }, token);
  },

  async getOrders(token: string): Promise<OrderSummary[]> {
    const response = await fastApiRequest<{ items: OrderSummary[] }>('/orders', undefined, token);
    return response.items;
  },

  async getOrder(orderId: number, token: string): Promise<Order> {
    return fastApiRequest<Order>(`/orders/${orderId}`, undefined, token);
  },

};

export function mapFastApiProductToFrontend(fp: FastApiProduct): Product {
  const image = fp.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
  return {
    id: fp.parent_asin,
    asin: fp.parent_asin,
    title: fp.title,
    brand: fp.brand || fp.store || 'Amazon Marketplace',
    category: fp.category,
    price: fp.price ?? 0,
    rating: fp.rating,
    reviewCount: fp.review_count,
    ratingDistribution: fp.rating_distribution,
    image,
    additionalImages: fp.images.slice(1),
    description: fp.description.length ? fp.description : ['No description available.'],
    features: fp.features,
    inStock: fp.price !== null && fp.price > 0,
    isPrime: false,
    bestSeller: false,
    amazonChoice: false,
    kCoreInteractionCount: fp.review_count,
    coPurchasedAsins: [],
    similarAsins: [],
    reviews: []
  };
}
