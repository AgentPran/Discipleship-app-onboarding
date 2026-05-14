import React, { useEffect, useState } from "react";
import { DoveIcon } from "./Visual.jsx";
import { api } from "../api.js";

export default function AdminMentorsTab() {
  const [mentors, setMentors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminUsers("mentor");
      setMentors(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (mentorId) => {
    setToggling(mentorId);
    try {
      const result = await api.adminToggleAccepting(mentorId);
      setMentors((prev) =>
        prev.map((m) =>
          m.user_id === mentorId ? { ...m, accepting_new: result.accepting_new } : m
        )
      );
    } catch (err) {
      alert(`Could not toggle: ${err.message}`);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Pastoral Team</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          All <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>mentors</span>
        </h1>
        {mentors && (
          <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
            {mentors.length} mentors · toggle availability as needed
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

      {!loading && !error && mentors?.length === 0 && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>No mentors in the system yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {(mentors || []).map((mentor) => {
          const initial = (mentor.name[0] || "?").toUpperCase();
          const load_count = mentor.current_load ?? 0;
          const capacity = mentor.capacity ?? 3;
          const full = load_count >= capacity;
          const accepting = mentor.accepting_new !== false;
          const isToggling = toggling === mentor.user_id;

          return (
            <div key={mentor.user_id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: 44, height: 44,
                    background: accepting
                      ? "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)"
                      : "rgba(200,190,215,0.4)",
                    color: "white", fontSize: 17, fontWeight: 500,
                  }}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate" style={{ color: "#5A4E6B" }}>{mentor.name}</p>
                  <p className="text-[11px]" style={{ color: "#9B8FB5" }}>
                    {load_count}/{capacity} mentees
                    {full && " · at capacity"}
                  </p>
                </div>

                {/* Accepting toggle */}
                <button
                  onClick={() => handleToggle(mentor.user_id)}
                  disabled={isToggling}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                  style={
                    accepting
                      ? {
                          background: "rgba(163, 196, 155, 0.25)",
                          border: "1px solid rgba(123, 165, 130, 0.4)",
                          color: "#2E6B3E",
                        }
                      : {
                          background: "rgba(220,80,80,0.08)",
                          border: "1px solid rgba(220,80,80,0.25)",
                          color: "#A03030",
                        }
                  }
                >
                  {isToggling ? "…" : accepting ? "Accepting" : "Paused"}
                </button>
              </div>

              {/* Capacity bar */}
              <div className="progress-track mb-2" style={{ height: "4px" }}>
                <div
                  className="progress-fill"
                  style={{
                    width: capacity > 0 ? `${Math.round((load_count / capacity) * 100)}%` : "0%",
                    background: full ? "#E89BAE" : undefined,
                  }}
                />
              </div>

              {mentor.can_support?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mentor.can_support.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,184,232,0.22)", border: "1px solid rgba(155,143,181,0.22)", color: "#5A4E6B" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
