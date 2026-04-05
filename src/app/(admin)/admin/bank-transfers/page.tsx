"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Eye, CheckCircle, XCircle, Clock, X, Image as ImageIcon } from "lucide-react";

interface BankTransfer {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: number;
  bankReference: string | null;
  receiptUrl: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const statusTabs = ["ALL", "PENDING_REVIEW", "APPROVED", "REJECTED"] as const;

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusBadge: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminBankTransfersPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === "ALL" ? "" : `?status=${activeTab}`;
      const res = await fetch(`/api/admin/bank-transfers${statusParam}`);
      const data = await res.json();
      setTransfers(data.transfers || []);
    } catch {
      console.error("Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleAction = async (id: string, action: "approve" | "reject", adminNotes?: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/bank-transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes }),
      });
      setRejectId(null);
      setRejectNotes("");
      await fetchTransfers();
    } catch {
      console.error("Failed to update transfer");
    } finally {
      setActionLoading(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Bank Transfer Requests</h1>
        <p className="text-gray-400 mt-1">Review and manage bank transfer payment submissions.</p>
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
            {statusLabels[tab] || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No transfers found.</p>
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
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{t.userName}</p>
                      <p className="text-xs text-gray-400">{t.userEmail}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{t.plan}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">Rs. {t.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(t.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setViewImage(t.receiptUrl)}
                        className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[t.status] || "bg-gray-100 text-gray-600"}`}>
                        {t.status === "PENDING_REVIEW" && <Clock className="w-3 h-3" />}
                        {t.status === "APPROVED" && <CheckCircle className="w-3 h-3" />}
                        {t.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {statusLabels[t.status] || t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {t.status === "PENDING_REVIEW" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(t.id, "approve")}
                            disabled={actionLoading === t.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                          </button>
                          <button
                            onClick={() => setRejectId(t.id)}
                            disabled={actionLoading === t.id}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {t.adminNotes && (
                        <p className="text-xs text-gray-400 mt-1">Note: {t.adminNotes}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewImage(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Receipt Image
              </p>
              <button onClick={() => setViewImage(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewImage} alt="Receipt" className="w-full rounded-xl" />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRejectId(null)}>
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
                onClick={() => { setRejectId(null); setRejectNotes(""); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectId, "reject", rejectNotes)}
                disabled={actionLoading === rejectId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectId ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
