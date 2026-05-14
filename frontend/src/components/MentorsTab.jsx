import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, Clock, Send, X } from "lucide-react";
import { DoveIcon } from "./Visual.jsx";

const SUPPORT_ICON = {
  "Spiritual growth": "✦",
  "Leadership": "◇",
  "Relationships & marriage": "❀",
  "Career & finances": "▲",
  "Service & mission": "◯",
  "Healing & personal life": "♡",
};

const COMPONENT_LABEL = {
  support_match:     "What you need ↔ what they give",
  description_sim:   "Story & posture similarity",
  strengths_overlap: "Shared character strengths",
  interests_overlap: "Shared interests",
  category_overlap:  "Shared themes & topics",
  stage_proximity:   "Right level of ahead-ness",
};

function topReason(match) {
  if (match.shared_support?.length) {
    return `Offers what you need: ${match.shared_support.slice(0, 2).join(", ")}`;
  }
  const entries = Object.entries(match.components || {})
    .filter(([k]) => k !== "stage_proximity")
    .sort((a, b) => b[1] - a[1]);
  const [k] = entries[0] || [];
  const labels = {
    description_sim:   "Similar story and posture",
    strengths_overlap: "You share core character strengths",
    interests_overlap: "You share interests",
    category_overlap:  "You're wrestling with similar things",
    support_match:     "Their gifts match your needs",
  };
  return labels[k] || "A thoughtful fit";
}

export default function MentorsTab({
  userData, matches, matchesLoading, requestStatus, onSendRequest, onLoadMatches,
}) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (matches === null && !matchesLoading) onLoadMatches();
  }, [matches, matchesLoading, onLoadMatches]);

  if (selected) {
    return (
      <MentorDetailContent
        mentor={selected}
        alreadyRequested={!!requestStatus[selected.mentor_id]}
        onBack={() => setSelected(null)}
        onSendRequest={onSendRequest}
      />
    );
  }

  return (
    <MatchesList
      userData={userData}
      matches={matches}
      matchesLoading={matchesLoading}
      requestStatus={requestStatus}
      onSelectMentor={setSelected}
    />
  );
}

/* ─────────────────────────────────────────────────── */
function MatchesList({ userData, matches, matchesLoading, requestStatus, onSelectMentor }) {
  const sorted = useMemo(
    () => [...(matches || [])].sort((a, b) => b.score - a.score),
    [matches]
  );

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Mentors</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Who might <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>walk</span> with you
        </h1>
        <p className="text-[12px] mt-2" style={{ color: "#9B8FB5" }}>
          Ranked by how your stories, gifts and needs align.
        </p>
      </div>

      {matchesLoading && (
        <div className="text-center py-12">
          <div className="dove-bob inline-block"><DoveIcon size={40} /></div>
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>Reading your story…</p>
          <p className="text-[11px] mt-1" style={{ color: "#9B8FB5" }}>The first match takes a moment.</p>
        </div>
      )}

      {!matchesLoading && sorted.length === 0 && matches !== null && (
        <div className="text-center py-12 px-4">
          <DoveIcon size={48} />
          <p className="text-sm mt-3" style={{ color: "#7A6E89" }}>
            We didn't find a mentor who matched everything you said.
            The pastoral team will look at your profile and reach out.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((m, i) => {
          const status = requestStatus[m.mentor_id];
          const pct = Math.round((m.score || 0) * 100);
          return (
            <div key={m.mentor_id}
              className="mentor-card msg-enter rounded-3xl p-4"
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => onSelectMentor(m)}>
              <div className="flex items-center gap-3">
                <ScoreRing pct={pct} initial={(m.name || "?")[0]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[16px] font-semibold truncate" style={{ color: "#5A4E6B" }}>{m.name}</h3>
                    <span className="text-[11px] tabular-nums shrink-0" style={{ color: "#9B8FB5" }}>{pct}% match</span>
                  </div>
                  <p className="text-[12.5px] mt-0.5 leading-snug" style={{ color: "#7A6E89" }}>{topReason(m)}</p>
                </div>
              </div>

              {(m.shared_support?.length > 0 || m.shared_strengths?.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(m.shared_support || []).slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(201, 184, 232, 0.22)", border: "1px solid rgba(155, 143, 181, 0.22)", color: "#5A4E6B" }}>
                      {SUPPORT_ICON[s] || "·"} {s}
                    </span>
                  ))}
                  {(m.shared_strengths || []).slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                {status ? (
                  <span className="badge text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <Clock size={10} /> Request with pastoral team
                  </span>
                ) : <span />}
                <span className="text-[12px] inline-flex items-center gap-1" style={{ color: "#B5A0DD" }}>
                  View profile <ArrowRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreRing({ pct, initial }) {
  return (
    <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
      <div className="score-ring rounded-full w-full h-full flex items-center justify-center" style={{ "--pct": `${pct}%` }}>
        <div className="rounded-full flex items-center justify-center"
          style={{ width: 46, height: 46, background: "white", color: "#5A4E6B", fontSize: 18, fontWeight: 500 }}>
          {initial.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
function MentorDetailContent({ mentor, onBack, onSendRequest, alreadyRequested }) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const pct = Math.round((mentor.score || 0) * 100);

  const handleSend = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onSendRequest(mentor.mentor_id, message.trim());
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Couldn't send the request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-3 pb-32">
      <button onClick={onBack} className="back-btn rounded-full px-3 py-1 inline-flex items-center gap-1 uppercase mb-4">
        <ChevronLeft size={12} /> Back to matches
      </button>

      <div className="msg-enter text-center mb-4">
        <div className="rounded-full inline-flex items-center justify-center mb-3"
          style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 32, fontWeight: 500,
            boxShadow: "0 8px 24px -6px rgba(180, 140, 180, 0.4)",
          }}>
          {(mentor.name || "?")[0].toUpperCase()}
        </div>
        <h2 className="text-xl font-semibold" style={{ color: "#5A4E6B" }}>{mentor.name}</h2>
        <p className="text-[12px] mt-1" style={{ color: "#9B8FB5" }}>{pct}% match for you</p>
      </div>

      {alreadyRequested && (
        <div className="msg-enter rounded-2xl p-3 mb-4 flex items-center gap-2"
          style={{ background: "rgba(232, 194, 107, 0.15)", border: "1px solid rgba(232, 194, 107, 0.35)" }}>
          <Clock size={16} style={{ color: "#946A14" }} />
          <p className="text-[13px]" style={{ color: "#946A14" }}>Your request is with the pastoral team for review.</p>
        </div>
      )}

      <Section title="Why this might work">
        <ComponentBars components={mentor.components || {}} />
      </Section>

      {mentor.shared_support?.length > 0 && (
        <Section title="Shared support areas"><Chips items={mentor.shared_support} variant="purple" /></Section>
      )}
      {mentor.shared_strengths?.length > 0 && (
        <Section title="Shared character strengths"><Chips items={mentor.shared_strengths} variant="gold" /></Section>
      )}
      {mentor.shared_interests?.length > 0 && (
        <Section title="Shared interests"><Chips items={mentor.shared_interests} variant="purple" /></Section>
      )}
      {mentor.shared_categories?.length > 0 && (
        <Section title="Themes that overlap">
          <Chips items={mentor.shared_categories.map((c) => c.replace(/_/g, " "))} variant="gold" />
        </Section>
      )}

      {!alreadyRequested && (
        <div className="mt-6">
          <button onClick={() => setShowModal(true)}
            className="primary-btn w-full py-3.5 rounded-full text-sm font-medium uppercase tracking-widest inline-flex items-center justify-center gap-2">
            Send mentorship request <Send size={14} />
          </button>
          <p className="text-[11px] text-center mt-2.5" style={{ color: "#9B8FB5" }}>
            Reviewed by the pastoral team before it reaches {mentor.name.split(" ")[0]}.
          </p>
        </div>
      )}

      {showModal && (
        <div className="modal-bg" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#5A4E6B" }}>
                  Reach out to {mentor.name.split(" ")[0]}
                </h3>
                <p className="text-[12px] mt-1" style={{ color: "#9B8FB5" }}>
                  A short note helps the team understand why this might be a fit.
                </p>
              </div>
              <button onClick={() => !submitting && setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
              placeholder="What drew you to them? What are you hoping for?"
              className="w-full bg-white/85 rounded-2xl p-3 border border-purple-200/50 text-sm placeholder:opacity-50 leading-relaxed"
              style={{ color: "#5A4E6B" }}
              disabled={submitting} />
            <div className="rounded-2xl p-3 mt-3 flex items-start gap-2"
              style={{ background: "rgba(218, 201, 232, 0.18)", border: "1px solid rgba(155, 143, 181, 0.2)" }}>
              <DoveIcon size={20} />
              <p className="text-[12px] leading-relaxed" style={{ color: "#5A4E6B" }}>
                Your request will be reviewed by the pastoral team first.
                They'll share it with {mentor.name.split(" ")[0]} when it feels like a good fit.
              </p>
            </div>
            {error && (
              <div className="text-[12px] mt-3 px-3 py-2 rounded-lg"
                style={{ background: "rgba(220, 80, 80, 0.08)", color: "#A03030" }}>{error}</div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} disabled={submitting}
                className="ghost-btn flex-1 py-3 rounded-full text-sm">Cancel</button>
              <button onClick={handleSend} disabled={submitting}
                className="primary-btn flex-[2] py-3 rounded-full text-sm font-medium inline-flex items-center justify-center gap-1.5">
                {submitting ? "Sending…" : (<>Send to pastoral team <Send size={13} /></>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <h4 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>{title}</h4>
      {children}
    </div>
  );
}

function Chips({ items, variant }) {
  const styles = variant === "gold"
    ? { background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }
    : { background: "rgba(201, 184, 232, 0.22)", border: "1px solid rgba(155, 143, 181, 0.22)", color: "#5A4E6B" };
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="text-[12px] px-2.5 py-1 rounded-full capitalize" style={styles}>{s}</span>
      ))}
    </div>
  );
}

function ComponentBars({ components }) {
  const order = ["support_match", "description_sim", "strengths_overlap", "interests_overlap", "category_overlap", "stage_proximity"];
  return (
    <div className="space-y-2">
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
