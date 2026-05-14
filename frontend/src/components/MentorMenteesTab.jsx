import React, { useEffect, useState } from "react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

export default function MentorMenteesTab() {
  const [rels, setRels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.myRelationships();
      setRels(data.relationships || []);
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
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Mentor</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Who you're <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>walking</span> with
        </h1>
        <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
          Your active mentoring relationships.
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

      {!loading && !error && rels?.length === 0 && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>
            No active mentoring relationships yet. Accept a request to begin walking with someone.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {(rels || []).map((rel) => (
          <MenteeCard key={rel.relationship_id} rel={rel} />
        ))}
      </div>
    </div>
  );
}

function MenteeCard({ rel }) {
  const name = rel.name || "Someone";
  const initial = (name[0] || "?").toUpperCase();

  const since = rel.started_at
    ? new Date(rel.started_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="mentor-card rounded-3xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 20, fontWeight: 500,
          }}>
          {initial}
        </div>
        <div className="flex-1">
          <h3 className="text-[16px] font-semibold" style={{ color: "#5A4E6B" }}>{name}</h3>
          {since && (
            <p className="text-[11px] mt-0.5" style={{ color: "#9B8FB5" }}>Walking together since {since}</p>
          )}
        </div>
      </div>

      {rel.support_areas?.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#9B8FB5" }}>
            What they're working through
          </p>
          <div className="flex flex-wrap gap-1.5">
            {rel.support_areas.map((s) => (
              <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-3"
        style={{ background: "rgba(218,201,232,0.12)", border: "1px solid rgba(155,143,181,0.15)" }}>
        <p className="text-[11px]" style={{ color: "#9B8FB5" }}>
          Notes &amp; check-in tools are coming in the next layer.
        </p>
      </div>
    </div>
  );
}
