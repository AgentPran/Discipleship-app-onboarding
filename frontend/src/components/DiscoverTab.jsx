import React from "react";
import { Compass, BookOpen, Headphones, Sparkle } from "lucide-react";

export default function DiscoverTab() {
  return (
    <div className="px-5 pt-6 pb-32">
      <div className="msg-enter mb-6">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Discover</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          What might <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>meet</span> you today.
        </h1>
      </div>

      <div className="msg-enter glass-card rounded-3xl p-6 text-center mb-3">
        <Compass size={36} strokeWidth={1.5} style={{ color: "#B5A0DD", margin: "0 auto 12px" }} />
        <h2 className="text-base mb-1" style={{ color: "#5A4E6B", fontWeight: 500 }}>Coming soon</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: "#7A6E89" }}>
          Readings, prayers, and gentle guides tailored to your season —
          chosen by the pastoral team to meet you where you are.
        </p>
      </div>

      <div className="space-y-2.5 mt-4">
        <FeatureRow icon={BookOpen}   title="Daily reflection"  body="A short reading paired with your season." />
        <FeatureRow icon={Sparkle}    title="Guided exercises"  body="Lectio, examen, breath prayers — your way in." />
        <FeatureRow icon={Headphones} title="Audio companions"  body="When reading feels like too much." />
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, body }) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
      <div className="shrink-0 rounded-full w-9 h-9 flex items-center justify-center"
        style={{ background: "rgba(201, 184, 232, 0.25)", color: "#5A4E6B" }}>
        <Icon size={18} strokeWidth={1.6} />
      </div>
      <div>
        <h3 className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>{title}</h3>
        <p className="text-[12px] mt-0.5" style={{ color: "#7A6E89" }}>{body}</p>
      </div>
    </div>
  );
}
