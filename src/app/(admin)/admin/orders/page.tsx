"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, FileText, CreditCard, Building2, Eye, X,
  Image as ImageIcon, Clock, CheckCircle, XCircle, Download,
} from "lucide-react";

interface OrderBankTransfer {
  id: string;
  status: string;
  adminNotes: string | null;
}

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  bankTransfer: OrderBankTransfer | null;
}

const statusTabs = ["ALL", "COMPLETED", "PENDING", "FAILED"] as const;

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const methodBadge: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
  STRIPE: {
    class: "bg-violet-100 text-violet-700",
    label: "Stripe",
    icon: <CreditCard className="w-3 h-3" />,
  },
  PAYHERE: {
    class: "bg-emerald-100 text-emerald-700",
    label: "PayHere",
    icon: <CreditCard className="w-3 h-3" />,
  },
  BANK_TRANSFER: {
    class: "bg-blue-100 text-blue-700",
    label: "Bank",
    icon: <Building2 className="w-3 h-3" />,
  },
};

const transferStatusBadge: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
  PENDING_REVIEW: {
    class: "bg-amber-100 text-amber-700",
    label: "Review",
    icon: <Clock className="w-3 h-3" />,
  },
  APPROVED: {
    class: "bg-green-100 text-green-700",
    label: "Approved",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  REJECTED: {
    class: "bg-red-100 text-red-700",
    label: "Rejected",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [viewImageLoading, setViewImageLoading] = useState(false);
  const [viewImageError, setViewImageError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTransferId, setRejectTransferId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // Fetch a single receipt only when the admin clicks View. The list
  // endpoint no longer returns receiptImage, so pulling the data URL
  // on-demand keeps the orders page fast even with lots of rows.
  const openReceipt = useCallback(async (bankTransferId: string) => {
    setViewImage(null);
    setViewImageError(null);
    setViewImageLoading(true);
    try {
      const res = await fetch(
        `/api/admin/bank-transfers/${bankTransferId}/receipt`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.receiptImage) {
        setViewImageError(data.error || "Couldn't load receipt");
        return;
      }
      setViewImage(data.receiptImage);
    } catch {
      setViewImageError("Couldn't load receipt");
    } finally {
      setViewImageLoading(false);
    }
  }, []);

  const closeReceipt = useCallback(() => {
    setViewImage(null);
    setViewImageLoading(false);
    setViewImageError(null);
  }, []);

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

  const handleTransferAction = async (
    transferId: string,
    action: "approve" | "reject",
    adminNotes?: string,
  ) => {
    setActionLoading(transferId);
    try {
      await fetch(`/api/admin/bank-transfers/${transferId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes }),
      });
      setRejectTransferId(null);
      setRejectNotes("");
      await fetchOrders();
    } catch {
      console.error("Failed to update transfer");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleExport = () => {
    const params = new URLSearchParams();
    if (activeTab !== "ALL") params.set("status", activeTab);
    params.set("format", "csv");
    window.location.href = `/api/admin/orders?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-400 mt-1">View and manage all payment orders.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-rose-200 hover:text-rose-600 text-sm font-medium text-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
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
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const method = methodBadge[order.paymentMethod] || {
                    class: "bg-gray-100 text-gray-600",
                    label: order.paymentMethod,
                    icon: null,
                  };
                  const bt = order.bankTransfer;
                  const transferStatus = bt ? transferStatusBadge[bt.status] : null;

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
                          {method.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[order.status] || "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                          </span>
                          {transferStatus && (
                            <span className={`inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${transferStatus.class}`}>
                              {transferStatus.icon}
                              {transferStatus.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        {bt ? (
                          <button
                            onClick={() => openReceipt(bt.id)}
                            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {bt && bt.status === "PENDING_REVIEW" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTransferAction(bt.id, "approve")}
                              disabled={actionLoading === bt.id}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === bt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                            </button>
                            <button
                              onClick={() => setRejectTransferId(bt.id)}
                              disabled={actionLoading === bt.id}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : bt?.adminNotes ? (
                          <p className="text-xs text-gray-400 max-w-[200px] truncate" title={bt.adminNotes}>
                            Note: {bt.adminNotes}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {(viewImage || viewImageLoading || viewImageError) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeReceipt}>
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Receipt Image
              </p>
              <button onClick={closeReceipt} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {viewImageLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />
              </div>
            ) : viewImageError ? (
              <p className="text-sm text-red-600 py-8 text-center">
                {viewImageError}
              </p>
            ) : viewImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={viewImage} alt="Receipt" className="w-full rounded-xl" />
            ) : null}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTransferId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRejectTransferId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 mb-4">Reject Transfer</h3>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectTransferId(null); setRejectNotes(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransferAction(rejectTransferId, "reject", rejectNotes)}
                disabled={actionLoading === rejectTransferId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectTransferId ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
