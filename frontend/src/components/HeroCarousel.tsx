import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface HeroSlide {
  id: string;
  brandLogo: string;
  brandName: string;
  title: string;
  discountHighlight: string;
  image: string;
  category: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    brandLogo: '🎧',
    brandName: 'Sony 1000X Series',
    title: 'Industry Leading Noise Cancellation',
    discountHighlight: 'Up to 15% off Voucher',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category: 'Audio & Headphones'
  },
  {
    id: 'slide-2',
    brandLogo: '💻',
    brandName: 'Pro Creator & Workstation',
    title: 'Ultra-Precision Mechanical Setup',
    discountHighlight: 'Up to 20% off Voucher',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    category: 'Computers & Accessories'
  },
  {
    id: 'slide-3',
    brandLogo: '💡',
    brandName: 'Philips Hue Ambiance',
    title: 'Automated Smart Living & Lighting',
    discountHighlight: 'Save $40 on Starter Kits',
    image: 'https://images.unsplash.com/photo-1550524514-9b2512db75b8?auto=format&fit=crop&w=800&q=80',
    category: 'Smart Home'
  }
];

interface HeroCarouselProps {
  onSelectCategory: (cat: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    { name: 'Audio & Headphones', hasSubmenu: true },
    { name: 'Computers & Accessories', hasSubmenu: true },
    { name: 'Electronics', hasSubmenu: false },
    { name: 'Smart Home', hasSubmenu: false },
    { name: 'Cameras & Photography', hasSubmenu: false },
    { name: 'Wearables & Fitness', hasSubmenu: false },
    { name: 'Health & Personal Care', hasSubmenu: false }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-4 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Figma Vertical Category Menu (3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between pr-4 border-r border-gray-200 text-sm">
          <div className="space-y-4 pt-2">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="flex items-center justify-between text-gray-800 hover:text-[#db4444] cursor-pointer group transition py-0.5"
              >
                <span className="font-medium group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </span>
                {cat.hasSubmenu && (
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#db4444]" />
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#f5f5f5] rounded-lg text-xs text-gray-600 space-y-1">
            <span className="font-bold text-gray-900 block">Amazon 2023 20-Core</span>
            <p className="text-[11px] leading-tight">
              K-core pruned dense product graphs for high-affinity candidate recommendations.
            </p>
          </div>
        </div>

        {/* Right Side: Figma Showcase Hero Banner (9 cols) */}
        <div className="lg:col-span-9">
          <div className="relative bg-black text-white rounded-md overflow-hidden min-h-[340px] sm:min-h-[380px] p-6 sm:p-12 flex flex-col justify-between">
            {/* Slide Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Text & CTA */}
              <div className="md:col-span-7 space-y-4 z-10">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{slide.brandLogo}</span>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-gray-300">
                    {slide.brandName}
                  </span>
                </div>

                {/* Big Headline */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  {slide.discountHighlight}
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-md">
                  {slide.title} • Verified 20-core customer interactions with dense Two-Tower retrieval signals.
                </p>

                {/* Shop Now CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectCategory(slide.category)}
                    className="inline-flex items-center gap-2 text-white font-bold text-xs sm:text-sm pb-1 border-b-2 border-white hover:border-[#db4444] hover:text-[#db4444] transition cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Image Showcase */}
              <div className="md:col-span-5 flex items-center justify-center relative">
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl transform scale-110" />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Indicator Dots */}
            <div className="flex items-center justify-center gap-2 pt-6">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide
                      ? 'w-7 bg-[#db4444]'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
