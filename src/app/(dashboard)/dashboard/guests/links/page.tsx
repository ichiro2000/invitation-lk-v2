"use client";

import { useState, useEffect } from "react";
import { Users, Copy, Check, MessageCircle, ExternalLink, Loader2, Search } from "lucide-react";

type Guest = { id: string; name: string; whatsapp: string | null; inviteType: string; headCount: number; rsvpStatus: string; personalLink: string | null; linkOpened: boolean; inviteSent: boolean };

const inviteLabels: Record<string, string> = { TO_YOU: "To You", TO_YOU_BOTH: "To You Both", TO_YOUR_FAMILY: "To Your Family" };
const rsvpColors: Record<string, string> = { PENDING: "bg-amber-100 text-amber-700", ACCEPTED: "bg-green-100 text-green-700", DECLINED: "bg-red-100 text-red-700", MAYBE: "bg-blue-100 text-blue-700" };

export default function GuestLinksPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/guests").then(r => r.json()).then(d => setGuests(d.guests || [])).finally(() => setLoading(false));
  }, []);

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const filtered = guests.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guest List & Links</h1>
        <p className="text-gray-400 mt-1">{guests.length} guests added</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guests..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 bg-gray-50/50" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">{guests.length === 0 ? "No guests added yet" : "No results"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">WhatsApp</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Invite Type</th>
                  <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Head Count</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">RSVP</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{g.name}</td>
                    <td className="px-4 py-3">
                      {g.whatsapp ? (
                        <a href={`https://wa.me/${g.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {g.whatsapp}
                        </a>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inviteLabels[g.inviteType]}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold">{g.headCount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rsvpColors[g.rsvpStatus]}`}>{g.rsvpStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {g.personalLink && (
                        <button onClick={() => copyLink(g.personalLink!, g.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          {copied === g.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
