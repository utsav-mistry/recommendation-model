import React, { useState } from 'react';
import { Send, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white select-none mt-20 pt-16 pb-6">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        {/* Col 1: Brand & Subscribe (Figma template) */}
        <div className="space-y-4">
          <h4 className="text-xl font-bold tracking-tight text-white">
            Exclusive<span className="text-[#db4444]">.</span>
          </h4>
          <p className="font-medium text-white text-sm">Subscribe</p>
          <p className="text-xs text-gray-400">Get 10% off your first 20-core catalog order</p>
          <form onSubmit={handleSubscribe} className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent border border-white rounded-md py-2 px-3 text-xs text-white placeholder:text-gray-500 outline-none focus:border-[#db4444]"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white hover:text-[#db4444] transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subscribed && (
            <p className="text-[11px] text-emerald-400">Subscribed successfully!</p>
          )}
        </div>

        {/* Col 2: Support */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-base">Support</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Support for the Amazon 2023 catalogue demo.
          </p>
        </div>

        {/* Col 3: Account */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-base">Account</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#" className="hover:text-white transition">My Account</a></li>
            <li><a href="#" className="hover:text-white transition">Login / Register</a></li>
            <li><a href="#" className="hover:text-white transition">Cart &amp; Orders</a></li>
            <li><a href="#" className="hover:text-white transition">Wishlist</a></li>
            <li><a href="#" className="hover:text-white transition">Shop All</a></li>
          </ul>
        </div>

        {/* Col 4: Quick Link */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-base">Quick Link</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms Of Use</a></li>
            <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Col 5: Data source */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-base">Data source</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <span>Amazon 2023 catalogue</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar with Back to Top */}
      <div className="max-w-[1400px] mx-auto px-4 mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p className="text-center sm:text-left">
          &copy; Copyright Rimel 2022 • Powered by Amazon 2023 Recommendation Engine
        </p>

        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition cursor-pointer self-center"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
