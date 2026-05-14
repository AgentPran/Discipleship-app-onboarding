import React, { useEffect, useState } from "react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

const STATUS_CONFIG = {
  admin_review:       { label: "Request pending",      bg: "rgba(232, 194, 107, 0.2)",  border: "rgba(232, 194, 107, 0.4)",  color: "#946A14" },
  shared_with_mentor: { label: "With mentor",          bg: "rgba(201, 184, 232, 0.22)", border: "rgba(155, 143, 181, 0.3)",  color: "#5A4E6B" },
  accepted:           { label: "In mentoring",         bg: "rgba(163, 196, 155, 0.25)", border: "rgba(123, 165, 130, 0.4)",  color: "#2E6B3E" },
  declined:           { label: "Request declined",     bg: "rgba(220, 80, 80, 0.08)",   border: "rgba(220, 80, 80, 0.2)",    color: "#A03030" },
  cancelled:          { label: "Request cancelled",    bg: "rgba(220, 80, 80, 0.08)",   border: "rgba(220, 80, 80, 0.2)",    color: "#A03030" },
  in_relationship:    { label: "In mentoring",         bg: "rgba(163, 196, 155, 0.25)", border: "rgba(123, 165, 130, 0.4)",  color: "#2E6B3E" },
  no_profile:         { label: "Awaiting profile",     bg: "rgba(218, 201, 232, 0.15)", border: "rgba(155, 143, 181, 0.2)",  color: "#9B8FB5" },
  awaiting_match:     { label: "Awaiting match",       bg: "rgba(218, 201, 232, 0.15)", border: "rgba(155, 143, 181, 0.2)",  color: "#9B8FB5" },
};

function resolveStatus(user) {
  if (user.in_relationship) return "in_relationship";
  if (!user.life_stage?.length && !user.support_areas?.length) return "no_profile";
  if (!user.latest_request_status) return "awaiting_match";
  return user.latest_request_status;
}

export default function AdminMenteesTab() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminUsers("mentee");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Pastoral Team</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          All <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>mentees</span>
        </h1>
        {users && (
          <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
            {users.length} {users.length === 1 ? "person" : "people"} in the system
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="dove-bob inline-block"><DoveIcon size={40} /></div>
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>Loading…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(220,80,80,0.08)", color: "#A03030" }}>
          <p className="text-sm">{error}</p>
          <button onClick={load} className="ghost-btn mt-3 px-4 py-2 rounded-full text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && users?.length === 0 && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>No mentees in the system yet.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {(users || []).map((user) => {
          const statusKey = resolveStatus(user);
          const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.awaiting_match;
          const initial = (user.name[0] || "?").toUpperCase();

          return (
            <div key={user.user_id} className="glass-card rounded-2xl p-3 flex items-center gap-3">
              <div className="rounded-full flex items-center justify-center shrink-0"
                style={{
                  width: 40, height: 40,
                  background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
                  color: "white", fontSize: 16, fontWeight: 500,
                }}>
                {initial}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate" style={{ color: "#5A4E6B" }}>{user.name}</p>
                {user.life_stage?.length > 0 && (
                  <p className="text-[11px] truncate" style={{ color: "#9B8FB5" }}>{user.life_stage.join(" · ")}</p>
                )}
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full shrink-0 text-center"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
