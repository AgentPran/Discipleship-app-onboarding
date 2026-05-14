import React from "react";
import { Footprints, Sparkles, Users, Compass, UserCircle2 } from "lucide-react";

const TABS = [
  { id: "journey",   label: "Journey",   icon: Footprints },
  { id: "mentors",   label: "Mentors",   icon: Sparkles },
  { id: "community", label: "Community", icon: Users },
  { id: "discover",  label: "Discover",  icon: Compass },
  { id: "profile",   label: "Profile",   icon: UserCircle2 },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="tab-bar-shell">
      <div className="tab-bar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`tab-btn ${activeTab === id ? "active" : ""}`}
            aria-label={label}
          >
            <span className="tab-pill" aria-hidden="true" />
            <span className="tab-icon-wrap">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
