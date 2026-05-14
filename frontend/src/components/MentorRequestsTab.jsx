import React, { useEffect, useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

const COMPONENT_LABEL = {
  support_match:     "What they need ↔ what you give",
  description_sim:   "Story & posture similarity",
  strengths_overlap: "Shared character strengths",
  interests_overlap: "Shared interests",
  category_overlap:  "Shared themes & topics",
  stage_proximity:   "Right level of ahead-ness",
};

export default function MentorRequestsTab() {
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.myRequests();
      const pending = (data.requests || []).filter(
        (r) => r.status === "shared_with_mentor" || r.status === "pending"
      );
      setRequests(pending);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (requestId, action) => {
    try {
      await api.mentorDecision(requestId, action);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(`Could not record decision: ${err.message}`);
    }
  };

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Mentor</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Mentorship <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>requests</span>
        </h1>
        <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
          The pastoral team has shared these with you. Take your time.
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="dove-bob inline-block"><DoveIcon size={40} /></div>
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>Loading requests…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(220,80,80,0.08)", color: "#A03030" }}>
          <p className="text-sm">{error}</p>
          <button onClick={load} className="ghost-btn mt-3 px-4 py-2 rounded-full text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && requests?.length === 0 && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>
            No requests waiting right now. The pastoral team will be in touch when someone is a good fit.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(requests || []).map((req) => (
          <RequestCard key={req.id} req={req} onDecision={handleDecision} />
        ))}
      </div>
    </div>
  );
}

function RequestCard({ req, onDecision }) {
  const [expanded, setExpanded] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [deciding, setDeciding] = useState(false);

  const pct = Math.round((req.match_score || 0) * 100);
  const name = req.other_name || "Someone";
  const initial = (name[0] || "?").toUpperCase();

  const handleAccept = async () => {
    setDeciding(true);
    await onDecision(req.id, "accept");
    setDeciding(false);
  };

  const handleDecline = async () => {
    setDeciding(true);
    await onDecision(req.id, "decline", declineReason.trim() || null);
    setDeciding(false);
    setShowDecline(false);
    setDeclineReason("");
  };

  return (
    <div className="mentor-card rounded-3xl p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 20, fontWeight: 500,
          }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[16px] font-semibold truncate" style={{ color: "#5A4E6B" }}>{name}</h3>
            <span className="text-[11px] tabular-nums shrink-0" style={{ color: "#9B8FB5" }}>{pct}% match</span>
          </div>
          {req.other_life_stage?.length > 0 && (
            <p className="text-[12px] mt-0.5" style={{ color: "#7A6E89" }}>
              {req.other_life_stage.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Support areas */}
      {req.other_support_areas?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {req.other_support_areas.map((s) => (
            <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full"
              style={{ background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Mentee's message */}
      {req.message && (
        <div className="rounded-2xl p-3 mb-3"
          style={{ background: "rgba(218,201,232,0.18)", border: "1px solid rgba(155,143,181,0.2)" }}>
          <p className="text-[12.5px] italic leading-relaxed" style={{ color: "#5A4E6B" }}>
            "{req.message}"
          </p>
        </div>
      )}

      {/* Why the pastoral team shared this */}
      {req.match_explanation && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] uppercase tracking-widest"
            style={{ color: "#9B8FB5" }}
          >
            Why the pastoral team shared this
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="mt-2">
              <ComponentBars components={req.match_explanation.components || {}} />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!showDecline ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowDecline(true)}
            disabled={deciding}
            className="ghost-btn flex-1 py-2.5 rounded-full text-sm"
          >
            Gently decline
          </button>
          <button
            onClick={handleAccept}
            disabled={deciding}
            className="primary-btn flex-[2] py-2.5 rounded-full text-sm font-medium inline-flex items-center justify-center gap-1.5"
          >
            {deciding ? "Saving…" : <><Check size={14} /> Accept</>}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-3" style={{ background: "rgba(218,201,232,0.12)", border: "1px solid rgba(155,143,181,0.2)" }}>
          <p className="text-[12px] mb-2" style={{ color: "#5A4E6B" }}>
            That's okay. A reason helps the pastoral team learn — it's optional and stays private.
          </p>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={2}
            placeholder="Optional reason…"
            disabled={deciding}
            className="w-full bg-white/85 rounded-xl p-2.5 border border-purple-200/50 text-[12px] placeholder:opacity-40 leading-relaxed mb-2"
            style={{ color: "#5A4E6B" }}
          />
          <div className="flex gap-2">
            <button onClick={() => setShowDecline(false)} disabled={deciding}
              className="ghost-btn flex-1 py-2 rounded-full text-xs">
              Cancel
            </button>
            <button onClick={handleDecline} disabled={deciding}
              className="ghost-btn flex-[2] py-2 rounded-full text-xs inline-flex items-center justify-center gap-1"
              style={{ color: "#7A6E89" }}>
              <X size={12} /> {deciding ? "Declining…" : "Confirm decline"}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation after accept */}
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
