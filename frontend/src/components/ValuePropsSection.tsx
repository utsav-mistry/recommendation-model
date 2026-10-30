import React from 'react';
import { Truck, Headphones, ShieldCheck } from 'lucide-react';

export const ValuePropsSection: React.FC = () => {
  const items = [
    {
      icon: Truck,
      title: 'FREE AND FAST DELIVERY',
      subtitle: 'Free delivery for all orders over $140 with Prime 1-day guarantee'
    },
    {
      icon: Headphones,
      title: '24/7 CUSTOMER SERVICE',
      subtitle: 'Friendly 24/7 customer support and live chat assistance'
    },
    {
      icon: ShieldCheck,
      title: 'MONEY BACK GUARANTEE',
      subtitle: 'We return money within 30 days on all 20-core verified items'
    }
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col items-center space-y-3">
              {/* Double circle icon badge */}
              <div className="w-20 h-20 rounded-full bg-neutral-200/80 flex items-center justify-center p-2">
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center shadow-md">
                  <Icon className="w-7 h-7" />
                </div>
              </div>
              <h4 className="text-base font-bold text-gray-900 tracking-wider">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
