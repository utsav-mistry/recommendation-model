import React from 'react';
import { ClipboardList, X } from 'lucide-react';
import { OrderSummary } from '../types/api';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  orders: OrderSummary[];
  onClose: () => void;
}

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({ isOpen, orders, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <aside className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <ClipboardList className="w-5 h-5" /> Purchase history
          </div>
          <button onClick={onClose} aria-label="Close purchase history"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!orders.length ? (
            <div className="text-center text-sm text-gray-500 py-16">No simulated purchases yet.</div>
          ) : orders.map((order) => (
            <div key={order.id} className="rounded border border-gray-200 p-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Order #{order.id}</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(`${order.created_at}Z`).toLocaleString()} · {order.order_status.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
