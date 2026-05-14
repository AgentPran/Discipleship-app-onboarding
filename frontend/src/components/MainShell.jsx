import React, { useState } from "react";
import { Backdrop, GLOBAL_STYLE } from "./Visual.jsx";
import TabBar from "./TabBar.jsx";
import HomeTab from "./HomeTab.jsx";
import MentorsTab from "./MentorsTab.jsx";
import CommunityTab from "./CommunityTab.jsx";
import DiscoverTab from "./DiscoverTab.jsx";
import ProfileTab from "./ProfileTab.jsx";

export default function MainShell({
  userData,
  matches,
  matchesLoading,
  requestStatus,
  onSendRequest,
  onLoadMatches,
  onRestart,
  initialTab = "journey",
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />

        <main className="relative z-10 flex-1 overflow-y-auto scroll">
          {activeTab === "journey" && (
            <HomeTab
              userData={userData}
              matches={matches}
              matchesLoading={matchesLoading}
              onGoToMentors={() => setActiveTab("mentors")}
            />
          )}

          {activeTab === "mentors" && (
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
          {activeTab === "discover"  && <DiscoverTab />}

          {activeTab === "profile" && (
            <ProfileTab userData={userData} onRestart={onRestart} />
          )}
        </main>

        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
