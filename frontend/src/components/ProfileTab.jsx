import React from "react";
import { RotateCcw } from "lucide-react";

export default function ProfileTab({ userData, onRestart }) {
  const name = userData?.name || "Friend";
  const initial = name.trim()[0]?.toUpperCase() || "?";

  return (
    <div className="px-5 pt-6 pb-32">
      <div className="msg-enter text-center mb-5">
        <div className="rounded-full inline-flex items-center justify-center mb-3"
          style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 32, fontWeight: 500,
            boxShadow: "0 8px 24px -6px rgba(180, 140, 180, 0.4)",
          }}>
          {initial}
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "#5A4E6B" }}>{name}</h1>
        <p className="text-[12px] mt-0.5 uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Mentee</p>
      </div>

      <div className="glass-card rounded-3xl p-4">
        <Section title="Where you are" items={userData?.lifeStage} variant="purple" />
        <Section title="Faith journey" items={userData?.faith} variant="purple" />
        <Section title="Looking for support in" items={userData?.support} variant="gold" />
        <Section title="Strengths" items={userData?.strengths} variant="purple" />
        <Section title="Interests" items={userData?.interests} variant="purple" />

        {userData?.description && (
          <div className="mt-4 pt-4 border-t border-purple-100">
            <h4 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>About you</h4>
            <p className="text-[13.5px] italic leading-relaxed" style={{ color: "#5A4E6B" }}>
              "{userData.description}"
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button onClick={onRestart}
          className="ghost-btn w-full py-3 rounded-full text-xs uppercase tracking-widest inline-flex items-center justify-center gap-1.5">
          <RotateCcw size={12} /> Restart profile
        </button>
        <p className="text-[10px] text-center mt-2" style={{ color: "#9B8FB5" }}>
          Editing in place coming soon.
        </p>
      </div>
    </div>
  );
}

function Section({ title, items, variant }) {
  if (!items || items.length === 0) return null;
  const styles = variant === "gold"
    ? { background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }
    : { background: "rgba(201, 184, 232, 0.22)", border: "1px solid rgba(155, 143, 181, 0.22)", color: "#5A4E6B" };
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#9B8FB5" }}>{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full" style={styles}>{s}</span>
        ))}
      </div>
    </div>
  );
}
