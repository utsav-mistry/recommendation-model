import { UserProfile } from '../types/ecommerce';

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'user_alex_tech',
    name: 'Alex Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    persona: 'Audiophile & Tech Enthusiast',
    purchaseHistoryCount: 42,
    recentCategories: ['Audio & Headphones', 'Electronics', 'Computers & Accessories'],
    favoriteBrands: ['Sony', 'Bose', 'Apple', 'Anker'],
    recommendedCategory: 'Audio & Headphones',
    activeBio: 'Regular buyer in Amazon 2023 Electronics (20-core). Prefers high-fidelity noise cancellation and Thunderbolt peripherals.',
  },
  {
    id: 'user_sarah_home',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    persona: 'Smart Home & Productivity Specialist',
    purchaseHistoryCount: 38,
    recentCategories: ['Smart Home', 'Computers & Accessories'],
    favoriteBrands: ['Philips Hue', 'Amazon Echo', 'Logitech', 'Ring'],
    recommendedCategory: 'Smart Home',
    activeBio: 'Focuses on automated lighting, ergonomic desk setups, and mesh Wi-Fi network hardware.',
  },
  {
    id: 'user_david_gamer',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    persona: 'Gamer & Creator',
    purchaseHistoryCount: 51,
    recentCategories: ['Computers & Accessories', 'Wearables', 'Audio & Headphones'],
    favoriteBrands: ['Logitech G', 'Razer', 'Garmin', 'Sony'],
    recommendedCategory: 'Computers & Accessories',
    activeBio: 'High activity user with heavy preference for low-latency mechanical peripherals and 4K streaming capture.',
  },
];
