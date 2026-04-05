"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Users, Search } from "lucide-react";

interface User {
  id: string;
  yourName: string | null;
  partnerName: string | null;
  email: string;
  phone: string | null;
  plan: string;
  role: string;
  createdAt: string;
}

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-blue-100 text-blue-700",
  STANDARD: "bg-amber-100 text-amber-700",
  PREMIUM: "bg-rose-100 text-rose-700",
};

const roleBadge: Record<string, string> = {
  CUSTOMER: "bg-gray-100 text-gray-600",
  ADMIN: "bg-violet-100 text-violet-700",
};

const plans = ["FREE", "BASIC", "STANDARD", "PREMIUM"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planLoading, setPlanLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/users${searchParam}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setPlanLoading(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
      );
    } catch {
      console.error("Failed to update user plan");
    } finally {
      setPlanLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-400 mt-1">Manage registered users and their subscription plans.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{user.yourName || "—"}</p>
                      {user.partnerName && (
                        <p className="text-xs text-gray-400">& {user.partnerName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{user.email}</td>
                    <td className="px-5 py-4 text-gray-500">{user.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.plan}
                          onChange={(e) => handlePlanChange(user.id, e.target.value)}
                          disabled={planLoading === user.id}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${planBadge[user.plan] || "bg-gray-100 text-gray-600"}`}
                        >
                          {plans.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {planLoading === user.id && (
                          <Loader2 className="w-3 h-3 text-rose-600 animate-spin" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge[user.role] || "bg-gray-100 text-gray-600"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
