"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, FileText, CreditCard, Building2 } from "lucide-react";

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const statusTabs = ["ALL", "COMPLETED", "PENDING", "FAILED"] as const;

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const methodBadge: Record<string, { class: string; icon: React.ReactNode }> = {
  STRIPE: {
    class: "bg-violet-100 text-violet-700",
    icon: <CreditCard className="w-3 h-3" />,
  },
  BANK_TRANSFER: {
    class: "bg-blue-100 text-blue-700",
    icon: <Building2 className="w-3 h-3" />,
  },
};

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === "ALL" ? "" : `?status=${activeTab}`;
      const res = await fetch(`/api/admin/orders${statusParam}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-400 mt-1">View and manage all payment orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const method = methodBadge[order.paymentMethod] || {
                    class: "bg-gray-100 text-gray-600",
                    icon: null,
                  };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{order.userName}</p>
                        <p className="text-xs text-gray-400">{order.userEmail}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{order.plan}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        Rs. {order.amount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${method.class}`}>
                          {method.icon}
                          {order.paymentMethod === "BANK_TRANSFER" ? "Bank" : "Stripe"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
