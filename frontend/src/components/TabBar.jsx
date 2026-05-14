import React from "react";
import {
  Footprints, Sparkles, Users, Compass, UserCircle2,
  Inbox, Users2, ClipboardList, Star, BarChart2,
} from "lucide-react";

const TABS_BY_ROLE = {
  mentee: [
    { id: "journey",   label: "Journey",   icon: Footprints },
    { id: "mentors",   label: "Mentorship", icon: Sparkles },
    { id: "community", label: "Community", icon: Users },
    { id: "discover",  label: "Discover",  icon: Compass },
    { id: "profile",   label: "Profile",   icon: UserCircle2 },
  ],
  mentor: [
    { id: "journey",   label: "Journey",   icon: Footprints },
    { id: "requests",  label: "Requests",  icon: Inbox },
    { id: "mentees",   label: "Mentees",   icon: Users2 },
    { id: "discover",  label: "Discover",  icon: Compass },
    { id: "profile",   label: "Profile",   icon: UserCircle2 },
  ],
  admin: [
    { id: "queue",     label: "Queue",     icon: ClipboardList },
    { id: "mentees",   label: "Mentees",   icon: Users },
    { id: "mentors",   label: "Mentors",   icon: Star },
    { id: "reports",   label: "Reports",   icon: BarChart2 },
    { id: "profile",   label: "Profile",   icon: UserCircle2 },
  ],
};

export default function TabBar({ activeTab, onTabChange, role = "mentee" }) {
  const tabs = TABS_BY_ROLE[role] || TABS_BY_ROLE.mentee;
  return (
    <div className="tab-bar-shell">
      <div className="tab-bar">
        {tabs.map(({ id, label, icon: Icon }) => (
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
