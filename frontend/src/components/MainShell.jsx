import React, { useState, useEffect } from "react";
import { Backdrop, GLOBAL_STYLE } from "./Visual.jsx";
import TabBar from "./TabBar.jsx";
import HomeTab from "./HomeTab.jsx";
import MentorsTab from "./MentorsTab.jsx";
import CommunityTab from "./CommunityTab.jsx";
import DiscoverTab from "./DiscoverTab.jsx";
import ProfileTab from "./ProfileTab.jsx";
import MentorRequestsTab from "./MentorRequestsTab.jsx";
import MentorMenteesTab from "./MentorMenteesTab.jsx";
import AdminQueueTab from "./AdminQueueTab.jsx";
import AdminMenteesTab from "./AdminMenteesTab.jsx";
import AdminMentorsTab from "./AdminMentorsTab.jsx";
import AdminReportsTab from "./AdminReportsTab.jsx";

export default function MainShell({
  userData,
  matches,
  matchesLoading,
  requestStatus,
  onSendRequest,
  onLoadMatches,
  onRestart,
  onSwitchRole,
  demoRole = "mentee",
  initialTab = "journey",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Reset active tab whenever the role changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [demoRole, initialTab]);

  const sharedProfileProps = { userData, demoRole, onRestart, onSwitchRole };

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />

        <main className="relative z-10 flex-1 overflow-y-auto scroll">
          {/* ── Mentee tabs ── */}
          {activeTab === "journey" && demoRole === "mentee" && (
            <HomeTab
              userData={userData}
              matches={matches}
              matchesLoading={matchesLoading}
              onGoToMentors={() => setActiveTab("mentors")}
            />
          )}
          {activeTab === "mentors" && demoRole === "mentee" && (
            <MentorsTab
              userData={userData}
              matches={matches}
              matchesLoading={matchesLoading}
              requestStatus={requestStatus}
              onSendRequest={onSendRequest}
              onLoadMatches={onLoadMatches}
            />
          )}
          {activeTab === "community" && <CommunityTab />}
          {activeTab === "discover" && <DiscoverTab />}

          {/* ── Mentor tabs ── */}
          {activeTab === "journey" && demoRole === "mentor" && (
            <MentorJourneyPlaceholder />
          )}
          {activeTab === "requests" && demoRole === "mentor" && (
            <MentorRequestsTab />
          )}
          {activeTab === "mentees" && demoRole === "mentor" && (
            <MentorMenteesTab />
          )}

          {/* ── Admin tabs ── */}
          {activeTab === "queue" && demoRole === "admin" && (
            <AdminQueueTab />
          )}
          {activeTab === "mentees" && demoRole === "admin" && (
            <AdminMenteesTab />
          )}
          {activeTab === "mentors" && demoRole === "admin" && (
            <AdminMentorsTab />
          )}
          {activeTab === "reports" && demoRole === "admin" && (
            <AdminReportsTab />
          )}

          {/* ── Profile tab (all roles) ── */}
          {activeTab === "profile" && (
            <ProfileTab {...sharedProfileProps} />
          )}
        </main>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} role={demoRole} />
      </div>
    </div>
  );
}

function MentorJourneyPlaceholder() {
  return (
    <div className="px-5 pt-8 pb-32 text-center">
      <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#9B8FB5" }}>
        Your journey
      </p>
      <h2 className="text-2xl font-light mb-3" style={{ color: "#5A4E6B" }}>
        Habit tracking &amp; milestones
      </h2>
      <p className="text-[13px] leading-relaxed" style={{ color: "#7A6E89" }}>
        Coming in a future layer — your growth dashboard will live here.
      </p>
    </div>
  );
}
