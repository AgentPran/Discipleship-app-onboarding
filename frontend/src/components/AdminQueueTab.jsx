import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Share2, X, Search } from "lucide-react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

const COMPONENT_LABEL = {
  support_match:     "What they need ↔ what mentor gives",
  description_sim:   "Story & posture similarity",
  strengths_overlap: "Shared character strengths",
  interests_overlap: "Shared interests",
  category_overlap:  "Shared themes & topics",
  stage_proximity:   "Right level of ahead-ness",
};

export default function AdminQueueTab() {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminQueue();
      setQueue(data.queue || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleShare = async (requestId) => {
    await api.adminShareRequest(requestId);
    setQueue((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleCancel = async (requestId) => {
    await api.adminCancelRequest(requestId);
    setQueue((prev) => prev.filter((r) => r.id !== requestId));
  };

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Pastoral Team</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Review <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>queue</span>
        </h1>
        <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
          {queue?.length > 0
            ? `${queue.length} request${queue.length > 1 ? "s" : ""} awaiting your review — oldest first.`
            : "Requests awaiting your review, oldest first."}
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="dove-bob inline-block"><DoveIcon size={40} /></div>
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>Loading queue…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(220,80,80,0.08)", color: "#A03030" }}>
          <p className="text-sm">{error}</p>
          <button onClick={load} className="ghost-btn mt-3 px-4 py-2 rounded-full text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && queue?.length === 0 && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>
            Queue is clear — all requests have been reviewed.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {(queue || []).map((item) => (
          <QueueCard
            key={item.id}
            item={item}
            onShare={handleShare}
            onCancel={handleCancel}
          />
        ))}
      </div>
    </div>
  );
}

function QueueCard({ item, onShare, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [acting, setActing] = useState(false);

  const pct = Math.round((item.match_score || 0) * 100);
  const createdAt = item.created_at
    ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";

  const handleShare = async () => {
    setActing(true);
    try { await onShare(item.id); } catch (e) { alert(e.message); }
    setActing(false);
  };

  const handleCancel = async () => {
    setActing(true);
    try { await onCancel(item.id); } catch (e) { alert(e.message); }
    setActing(false);
    setShowCancel(false);
  };

  return (
    <div className="glass-card rounded-3xl p-4">
      {/* Date + score badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>{createdAt}</span>
        <span className="badge text-[11px] px-2.5 py-0.5 rounded-full">{pct}% match</span>
      </div>

      {/* Mentee → Mentor layout */}
      <div className="flex items-center gap-2 mb-3">
        <PersonMini user={item.mentee} label="Mentee" />
        <ArrowRight size={16} style={{ color: "#C9B8E8", flexShrink: 0 }} />
        <PersonMini user={item.mentor} label="Mentor" showCapacity />
      </div>

      {/* Mentee's message */}
      {item.message && (
        <div className="rounded-2xl p-3 mb-3"
          style={{ background: "rgba(218,201,232,0.18)", border: "1px solid rgba(155,143,181,0.2)" }}>
          <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "#9B8FB5" }}>Their note</p>
          <p className="text-[12.5px] italic leading-relaxed" style={{ color: "#5A4E6B" }}>"{item.message}"</p>
        </div>
      )}

      {/* Match explanation */}
      {item.match_explanation && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] uppercase tracking-widest"
            style={{ color: "#9B8FB5" }}
          >
            Match breakdown
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="mt-2">
              <ComponentBars components={item.match_explanation.components || {}} />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!showCancel && !showSuggest && (
        <div className="flex gap-2">
          <button onClick={() => setShowCancel(true)} disabled={acting}
            className="ghost-btn flex-1 py-2.5 rounded-full text-xs inline-flex items-center justify-center gap-1"
            style={{ color: "#A03030" }}>
            <X size={12} /> Decline
          </button>
          <button onClick={() => setShowSuggest(true)} disabled={acting}
            className="ghost-btn flex-1 py-2.5 rounded-full text-xs inline-flex items-center justify-center gap-1">
            <Search size={12} /> Reassign
          </button>
          <button onClick={handleShare} disabled={acting}
            className="primary-btn flex-[2] py-2.5 rounded-full text-xs font-medium inline-flex items-center justify-center gap-1.5">
            {acting ? "Sharing…" : <><Share2 size={12} /> Share with mentor</>}
          </button>
        </div>
      )}

      {showCancel && (
        <div className="rounded-2xl p-3" style={{ background: "rgba(220,80,80,0.06)", border: "1px solid rgba(220,80,80,0.15)" }}>
          <p className="text-[12px] mb-2" style={{ color: "#5A4E6B" }}>
            Decline this request? It will be marked cancelled and the mentee will need to request again.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowCancel(false)} disabled={acting}
              className="ghost-btn flex-1 py-2 rounded-full text-xs">
              Back
            </button>
            <button onClick={handleCancel} disabled={acting}
              className="ghost-btn flex-[2] py-2 rounded-full text-xs"
              style={{ color: "#A03030", borderColor: "rgba(220,80,80,0.3)" }}>
              {acting ? "Declining…" : "Confirm decline"}
            </button>
          </div>
        </div>
      )}

      {showSuggest && (
        <div className="rounded-2xl p-3" style={{ background: "rgba(218,201,232,0.12)", border: "1px solid rgba(155,143,181,0.2)" }}>
          <p className="text-[12px] leading-relaxed" style={{ color: "#5A4E6B" }}>
            Mentor search and reassignment is coming in the next version.
            For now, decline this request and guide the mentee to a different match.
          </p>
          <button onClick={() => setShowSuggest(false)}
            className="ghost-btn mt-2 px-4 py-1.5 rounded-full text-xs">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function PersonMini({ user, label, showCapacity }) {
  if (!user) return <div className="flex-1" />;
  const initial = (user.name[0] || "?").toUpperCase();
  const capacity = showCapacity && user.capacity != null
    ? `${user.current_load ?? 0}/${user.capacity} mentees`
    : null;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "#9B8FB5" }}>{label}</p>
      <div className="flex items-center gap-2">
        <div className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 14, fontWeight: 500,
          }}>
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: "#5A4E6B" }}>{user.name}</p>
          {capacity && <p className="text-[10px]" style={{ color: "#9B8FB5" }}>{capacity}</p>}
          {!capacity && user.life_stage?.length > 0 && (
            <p className="text-[10px] truncate" style={{ color: "#9B8FB5" }}>{user.life_stage[0]}</p>
          )}
        </div>
      </div>
      {user.support_areas?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {user.support_areas.slice(0, 2).map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(201,184,232,0.22)", border: "1px solid rgba(155,143,181,0.22)", color: "#5A4E6B" }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentBars({ components }) {
  const order = ["support_match", "description_sim", "strengths_overlap", "interests_overlap", "category_overlap", "stage_proximity"];
  return (
    <div className="space-y-2 mt-1">
      {order.map((k) => {
        const v = components[k] || 0;
        const pct = Math.round(v * 100);
        return (
          <div key={k}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span style={{ color: "#5A4E6B" }}>{COMPONENT_LABEL[k]}</span>
              <span className="tabular-nums" style={{ color: "#9B8FB5" }}>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
