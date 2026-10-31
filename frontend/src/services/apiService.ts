import {
  ApiResponse,
  BackendProduct,
  BackendCategory,
  BackendCart,
  BackendReview,
  ProductFilterParams,
  ReviewRequest
} from '../types/api';
import { Product } from '../types/ecommerce';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '3000'
    ? '/api'
    : 'http://localhost:8000/api');

/**
 * Universal fetch wrapper with typed response and error handling
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    const body: ApiResponse<T> = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || `Request failed with status ${res.status}`);
    }
    return body.data;
  } catch (error: any) {
    // Re-throw with descriptive message
    throw new Error(error.message || 'Network error connecting to backend API');
  }
}

export const apiService = {
  /**
   * Healthcheck to verify FastAPI backend connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { method: 'GET' });
      if (res.ok) return true;
      const healthRes = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return healthRes.ok;
    } catch {
      return false;
    }
  },

  /**
   * Products API
   */
  async getProducts(params?: ProductFilterParams): Promise<BackendProduct[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All Departments') query.append('category', params.category);
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<BackendProduct[]>(`/products${qs}`);
  },

  async getProductById(id: number): Promise<BackendProduct> {
    return request<BackendProduct>(`/products/${id}`);
  },

  /**
   * Categories API
   */
  async getCategories(): Promise<BackendCategory[]> {
    return request<BackendCategory[]>('/categories');
  },

  /**
   * Cart API
   */
  async getCart(userId: string): Promise<BackendCart> {
    return request<BackendCart>(`/cart/${encodeURIComponent(userId)}`);
  },

  async addToCart(userId: string, productId: number, quantity = 1): Promise<BackendCart> {
    return request<BackendCart>(`/cart/${encodeURIComponent(userId)}/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  async updateCartItem(userId: string, productId: number, quantity: number): Promise<BackendCart> {
    return request<BackendCart>(`/cart/${encodeURIComponent(userId)}/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  async removeFromCart(userId: string, productId: number): Promise<BackendCart> {
    return request<BackendCart>(`/cart/${encodeURIComponent(userId)}/items/${productId}`, {
      method: 'DELETE'
    });
  },

  async clearCart(userId: string): Promise<void> {
    return request<void>(`/cart/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
  },

  /**
   * Reviews API
   */
  async getReviews(productId: number): Promise<BackendReview[]> {
    return request<BackendReview[]>(`/products/${productId}/reviews`);
  },

  async addReview(productId: number, req: ReviewRequest): Promise<BackendReview> {
    return request<BackendReview>(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }
};

/**
 * Adapter: Convert BackendProduct -> Frontend Product entity
 * seamlessly maps fields while providing full UI compatibility
 */
export function mapBackendProductToFrontend(bp: BackendProduct): Product {
  return {
    id: `backend-prod-${bp.id}`,
    asin: `B0${bp.id}BACKEND`,
    title: bp.name,
    brand: bp.tags && bp.tags.length > 0 ? bp.tags[0].toUpperCase() : 'Store Brand',
    category: (bp.category as any) || 'Electronics',
    price: bp.price,
    originalPrice: Math.round((bp.price * 1.15) * 100) / 100,
    rating: bp.rating || 4.5,
    reviewCount: bp.reviewsCount || 10,
    image: bp.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      bp.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    description: [bp.description || 'High quality product.'],
    features: bp.tags || ['In Stock', 'Fast Shipping', 'Verified Quality'],
    inStock: (bp.stockQuantity || 0) > 0,
    isPrime: true,
    bestSeller: (bp.rating || 0) >= 4.7,
    amazonChoice: (bp.reviewsCount || 0) > 50,
    kCoreInteractionCount: Math.max(100, (bp.reviewsCount || 1) * 3),
    coPurchasedAsins: [],
    similarAsins: [],
    twoTowerEmbeddingSimilarity: 0.95,
    recReason: `Curated match from catalog: ${bp.category}`,
    reviews: []
  };
}
