import {
  FastApiProduct,
  ProductPage,
  ProductFilterParams,
  AuthResponse,
  AuthUser
} from '../types/api';
import { Product } from '../types/ecommerce';

const FASTAPI_ROOT_URL =
  import.meta.env.VITE_FASTAPI_API_URL ||
  'http://localhost:8001';
const FASTAPI_BASE_URL = `${FASTAPI_ROOT_URL}/api`;

async function fastApiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || `FastAPI request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  async signup(email: string, password: string, displayName: string): Promise<AuthResponse> {
    return fastApiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName })
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return fastApiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async getCurrentUser(token: string): Promise<AuthUser> {
    const response = await fastApiRequest<{ user: AuthUser }>(
      `/auth/me?token=${encodeURIComponent(token)}`
    );
    return response.user;
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
    image,
    additionalImages: fp.images.slice(1),
    description: fp.description.length ? fp.description : ['No description available.'],
    features: fp.features,
    inStock: true,
    isPrime: false,
    bestSeller: false,
    amazonChoice: false,
    kCoreInteractionCount: fp.review_count,
    coPurchasedAsins: [],
    similarAsins: [],
    twoTowerEmbeddingSimilarity: fp.recommendation_score,
    recReason: fp.recommendation_score !== undefined
      ? 'Recommended from the trained Amazon item-item model.'
      : 'Amazon catalogue product',
    reviews: []
  };
}
