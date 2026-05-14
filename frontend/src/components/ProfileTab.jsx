import React, { useState } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";

const ROLE_LABELS = {
  mentee: { label: "Mentee", sub: "Seeking a mentor" },
  mentor: { label: "Mentor", sub: "Sarah Mitchell" },
  admin:  { label: "Admin",  sub: "Pastoral Team" },
};

export default function ProfileTab({ userData, demoRole = "mentee", onRestart, onSwitchRole }) {
  const [switching, setSwitching] = useState(null);
  const [profile, setProfile] = useState({
    displayName: demoRole === "mentor" ? "Sarah Mitchell" : (userData?.name || "Friend"),
    privateMode: false,
    mentoredBy: "Sarah Mitchell",
    graduatedFrom: "Foundations discipleship",
    testimoniesBlessed: 2,
    contributions: 48,
    graduates: 7,
    bio: userData?.description || "",
  });
  const [testimonyDraft, setTestimonyDraft] = useState("");
  const [testimonies, setTestimonies] = useState([
    "Shared how daily prayer helped me stay grounded.",
    "Encouraged a new believer through my baptism story.",
  ]);

  const handleSwitch = async (role) => {
    if (role === demoRole || switching) return;
    setSwitching(role);
    try {
      await onSwitchRole(role);
    } finally {
      setSwitching(null);
    }
  };

  // Profile data is from the mentee session; mentor/admin show their role card
  const name = demoRole === "mentee"
    ? (profile.displayName || userData?.name || "Friend")
    : (profile.displayName || ROLE_LABELS[demoRole]?.sub || ROLE_LABELS[demoRole]?.label);
  const initial = (name.trim()[0] || "?").toUpperCase();
  const roleLabel = ROLE_LABELS[demoRole] || ROLE_LABELS.mentee;

  return (
    <div className="px-5 pt-6 pb-32">
      <div className="msg-enter text-center mb-5">
        <div
          className="rounded-full inline-flex items-center justify-center mb-3"
          style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%)",
            color: "white", fontSize: 32, fontWeight: 500,
            boxShadow: "0 8px 24px -6px rgba(180, 140, 180, 0.4)",
          }}
        >
          {initial}
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: "#5A4E6B" }}>
          {demoRole === "mentee" ? (userData?.name || "Friend") : roleLabel.sub}
        </h1>
        <p className="text-[12px] mt-0.5 uppercase tracking-widest" style={{ color: "#9B8FB5" }}>
          {roleLabel.label}
        </p>
      </div>

      {demoRole === "mentee" && (
        <div className="glass-card rounded-3xl p-4 mb-4">
          <Section title="Where you are" items={userData?.lifeStage} variant="purple" />
          <Section title="Faith journey" items={userData?.faith} variant="purple" />
          <Section title="Looking for support in" items={userData?.support} variant="gold" />
          <Section title="Strengths" items={userData?.strengths} variant="purple" />
          <Section title="Interests" items={userData?.interests} variant="purple" />

          {userData?.description && (
            <div className="mt-4 pt-4 border-t border-purple-100">
              <h4 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>
                About you
              </h4>
              <p className="text-[13.5px] italic leading-relaxed" style={{ color: "#5A4E6B" }}>
                "{userData.description}"
              </p>
            </div>
          )}
        </div>
      )}

      <div className="glass-card rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>
            Profile details
          </h4>
          <label className="inline-flex items-center gap-2 text-[11px]" style={{ color: "#7A6E89" }}>
            <input
              type="checkbox"
              checked={profile.privateMode}
              onChange={(e) => setProfile((p) => ({ ...p, privateMode: e.target.checked }))}
            />
            Private mode
          </label>
        </div>
        <input
          value={profile.displayName}
          onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
          placeholder="Display name"
          className="w-full bg-white/75 rounded-full border border-purple-100 px-4 py-2 text-sm mb-2"
          style={{ color: "#5A4E6B" }}
        />
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          placeholder="Short profile bio"
          rows={3}
          className="w-full bg-white/75 rounded-2xl border border-purple-100 px-3 py-2 text-sm"
          style={{ color: "#5A4E6B" }}
        />

        {demoRole === "mentor" ? (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <NumberField label="Contributions" value={profile.contributions} onChange={(v) => setProfile((p) => ({ ...p, contributions: v }))} />
            <NumberField label="Graduates" value={profile.graduates} onChange={(v) => setProfile((p) => ({ ...p, graduates: v }))} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 mt-3">
              <TextField label="Mentored by" value={profile.mentoredBy} onChange={(v) => setProfile((p) => ({ ...p, mentoredBy: v }))} />
              <TextField label="Graduated from" value={profile.graduatedFrom} onChange={(v) => setProfile((p) => ({ ...p, graduatedFrom: v }))} />
              <NumberField label="People blessed by testimonies" value={profile.testimoniesBlessed} onChange={(v) => setProfile((p) => ({ ...p, testimoniesBlessed: v }))} />
            </div>
            <div className="mt-4">
              <h4 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>
                Testimonies shared
              </h4>
              <div className="space-y-1.5 mb-2">
                {testimonies.map((t, idx) => (
                  <div key={`${t}-${idx}`} className="rounded-xl bg-white/70 border border-purple-100 px-3 py-2 flex items-center gap-2">
                    <p className="text-[12px] flex-1" style={{ color: "#5A4E6B" }}>{t}</p>
                    <button onClick={() => setTestimonies((items) => items.filter((_, i) => i !== idx))} className="ghost-btn h-7 w-7 rounded-lg inline-flex items-center justify-center">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={testimonyDraft}
                  onChange={(e) => setTestimonyDraft(e.target.value)}
                  placeholder="Add testimony note"
                  className="flex-1 bg-white/75 rounded-full border border-purple-100 px-3 py-2 text-sm"
                  style={{ color: "#5A4E6B" }}
                />
                <button
                  onClick={() => {
                    if (!testimonyDraft.trim()) return;
                    setTestimonies((items) => [...items, testimonyDraft.trim()]);
                    setTestimonyDraft("");
                  }}
                  className="primary-btn h-9 w-9 rounded-full inline-flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </>
        )}
        <button className="primary-btn w-full mt-4 py-2.5 rounded-full text-sm inline-flex items-center justify-center gap-1.5">
          <Save size={13} /> Save profile
        </button>
      </div>

      {/* Role switcher — demo affordance */}
      <div className="glass-card rounded-3xl p-4 mb-4">
        <h4 className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "#9B8FB5" }}>
          Demo — view as
        </h4>
        <div className="flex gap-2">
          {(["mentee", "mentor", "admin"]).map((r) => {
            const active = r === demoRole;
            const loading = switching === r;
            return (
              <button
                key={r}
                onClick={() => handleSwitch(r)}
                disabled={!!switching}
                className="flex-1 py-2 rounded-2xl text-[12px] font-medium capitalize transition-all"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, #B5A0DD 0%, #E89BAE 100%)",
                        color: "white",
                        boxShadow: "0 4px 12px -4px rgba(180, 140, 180, 0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(155,143,181,0.25)",
                        color: switching ? "#C0B8CC" : "#5A4E6B",
                      }
                }
              >
                {loading ? "…" : r}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] mt-2.5 leading-relaxed" style={{ color: "#9B8FB5" }}>
          Switches to the demo {
            demoRole === "mentee" ? "mentor (Sarah Mitchell) or admin (Pastoral Team)" :
            demoRole === "mentor" ? "admin or back to your mentee account" :
            "mentor or back to your mentee account"
          } account. Logs in with pre-seeded credentials.
        </p>
      </div>

      {demoRole === "mentee" && (
        <div className="mt-2">
          <button
            onClick={onRestart}
            className="ghost-btn w-full py-3 rounded-full text-xs uppercase tracking-widest inline-flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={12} /> Restart profile
          </button>
          <p className="text-[10px] text-center mt-2" style={{ color: "#9B8FB5" }}>
            Editing in place coming soon.
          </p>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label>
      <span className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: "#9B8FB5" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/75 rounded-full border border-purple-100 px-3 py-2 text-sm"
        style={{ color: "#5A4E6B" }}
      />
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label>
      <span className="block text-[10px] uppercase tracking-widest mb-1" style={{ color: "#9B8FB5" }}>{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-white/75 rounded-full border border-purple-100 px-3 py-2 text-sm"
        style={{ color: "#5A4E6B" }}
      />
    </label>
  );
}

function Section({ title, items, variant }) {
  if (!items || items.length === 0) return null;
  const styles =
    variant === "gold"
      ? { background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }
      : { background: "rgba(201, 184, 232, 0.22)", border: "1px solid rgba(155, 143, 181, 0.22)", color: "#5A4E6B" };
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#9B8FB5" }}>
        {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full" style={styles}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
