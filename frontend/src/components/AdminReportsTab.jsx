import React, { useEffect, useState } from "react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

export default function AdminReportsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminReports();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-5 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Pastoral Team</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Reports &amp; <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>metrics</span>
        </h1>
        <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
          A snapshot of your community's mentoring health.
        </p>
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

      {stats && (
        <>
          {/* Primary stat grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard
              value={stats.total_mentees}
              label="Mentees"
              sub="in the community"
              accent="#C9B8E8"
            />
            <StatCard
              value={stats.total_mentors}
              label="Mentors"
              sub="serving"
              accent="#E8B5C5"
            />
            <StatCard
              value={stats.total_active_pairs}
              label="Active pairings"
              sub="relationships"
              accent="#A3C49B"
            />
            <StatCard
              value={stats.pending_in_queue}
              label="In queue"
              sub="awaiting review"
              accent="#F5C9A8"
            />
          </div>

          {/* Secondary metrics */}
          <div className="glass-card rounded-3xl p-4 space-y-4">
            <MetricRow
              label="Pairings this month"
              value={stats.pairings_this_month}
              unit="new"
            />
            <div className="border-t border-purple-100" />
            <MetricRow
              label="Decline rate"
              value={`${stats.decline_rate}%`}
              unit=""
              note="of requests declined by mentors"
            />
          </div>

          <div className="mt-4 rounded-2xl p-3"
            style={{ background: "rgba(218,201,232,0.12)", border: "1px solid rgba(155,143,181,0.15)" }}>
            <p className="text-[11px] leading-relaxed" style={{ color: "#9B8FB5" }}>
              Trend charts, average time to pairing, and cell-level breakdowns are coming in the next layer.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ value, label, sub, accent }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <div className="text-4xl font-light mb-1" style={{ color: "#5A4E6B" }}>{value ?? "—"}</div>
      <p className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{label}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "#9B8FB5" }}>{sub}</p>
      <div className="mt-2 mx-auto rounded-full" style={{ width: 32, height: 3, background: accent }} />
    </div>
  );
}

function MetricRow({ label, value, unit, note }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{label}</p>
        {note && <p className="text-[10px]" style={{ color: "#9B8FB5" }}>{note}</p>}
      </div>
      <p className="text-[22px] font-light tabular-nums" style={{ color: "#B5A0DD" }}>
        {value}{unit && <span className="text-[12px] ml-1" style={{ color: "#9B8FB5" }}>{unit}</span>}
      </p>
    </div>
  );
}
