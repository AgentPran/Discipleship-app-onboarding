import React, { useState, useEffect, useRef } from "react";
import MentorOnboarding from "./components/MentorOnboarding.jsx";
import MainShell from "./components/MainShell.jsx";
import { LoadingView, ErrorView } from "./components/Views.jsx";
import { api } from "./api.js";

const ROLE_DEFAULT_TAB = {
  mentee: "journey",
  mentor: "requests",
  admin: "queue",
};

function isBackendUnavailable(err) {
  return /Couldn't reach the backend|Failed to fetch|NetworkError/i.test(err?.message || "");
}

/**
 * App state machine:
 *   onboarding   → conversational profile builder
 *   preparing    → signup + saveProfile (brief loading screen)
 *   main         → MainShell with the 5 bottom-nav tabs
 *   error        → error screen with retry/reset
 */
export default function App() {
  const [view, setView] = useState("onboarding");
  const [userData, setUserData] = useState(null);
  const [matches, setMatches] = useState(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState({});
  const [error, setError] = useState(null);
  const [initialTab, setInitialTab] = useState("journey");
  const [demoRole, setDemoRole] = useState("mentee");
  const matchFetchInFlight = useRef(false);

  // Restore mentee session on refresh (always resets to mentee role)
  useEffect(() => {
    api.restoreMenteeOnRefresh();
    if (!api.isAuthenticated()) return;

    const cachedProfile = api.cachedProfile();
    const cachedMatches = api.cachedMatches();
    if (cachedProfile) {
      setUserData({
        name: cachedProfile.name,
        email: "",
        lifeStage: cachedProfile.life_stage,
        faith: cachedProfile.faith_stage,
        support: cachedProfile.support_areas,
        strengths: cachedProfile.strengths,
        interests: cachedProfile.interests,
        description: cachedProfile.description,
      });
      if (cachedMatches) setMatches(cachedMatches);
      setRequestStatus(api.cachedRequests());
      setDemoRole("mentee");
      setView("main");
    }
  }, []);

  const fetchMatches = async () => {
    if (matchFetchInFlight.current) return;
    matchFetchInFlight.current = true;
    setMatchesLoading(true);
    try {
      const result = await api.findMatches(10);
      setMatches(result);
    } catch (err) {
      console.error("Match fetch failed:", err);
      setMatches([]);
    } finally {
      setMatchesLoading(false);
      matchFetchInFlight.current = false;
    }
  };

  const handleOnboardingComplete = async (data) => {
    setUserData(data);
    setView("preparing");
    try {
      await api.signupMentee({ email: data.email, name: data.name });
      await api.saveProfile(data);
      setDemoRole("mentee");
      setInitialTab("journey");
      setView("main");
      fetchMatches();
    } catch (err) {
      console.error(err);
      if (isBackendUnavailable(err)) {
        setDemoRole("mentee");
        setInitialTab("journey");
        setMatches([]);
        setRequestStatus({});
        setView("main");
        return;
      }
      setError(err.message);
      setView("error");
    }
  };

  const handleRetry = async () => {
    setError(null);
    setView("preparing");
    try {
      if (!api.isAuthenticated() && userData) {
        await api.signupMentee({ email: userData.email, name: userData.name });
        await api.saveProfile(userData);
      }
      setView("main");
      fetchMatches();
    } catch (err) {
      setError(err.message);
      setView("error");
    }
  };

  const handleReset = () => {
    api.reset();
    setView("onboarding");
    setUserData(null);
    setMatches(null);
    setMatchesLoading(false);
    setRequestStatus({});
    setError(null);
    setDemoRole("mentee");
  };

  const handleSendRequest = async (mentorId, message) => {
    await api.sendRequest({ mentorId, message });
    setRequestStatus((s) => ({ ...s, [mentorId]: { status: "admin_review" } }));
  };

  const handleSwitchRole = async (role) => {
    try {
      await api.switchRole(role);
      setDemoRole(role);
      setInitialTab(ROLE_DEFAULT_TAB[role] || "journey");
    } catch (err) {
      console.error("Role switch failed:", err.message);
      // Surface to user via a brief alert — adequate for a demo context
      alert(`Could not switch role: ${err.message}`);
    }
  };

  switch (view) {
    case "onboarding":
      return <MentorOnboarding onComplete={handleOnboardingComplete} />;

    case "preparing":
      return <LoadingView message="Setting up your space…" />;

    case "main":
      return (
        <MainShell
          userData={userData}
          matches={matches}
          matchesLoading={matchesLoading}
          requestStatus={requestStatus}
          onSendRequest={handleSendRequest}
          onLoadMatches={fetchMatches}
          onRestart={handleReset}
          onSwitchRole={handleSwitchRole}
          demoRole={demoRole}
          initialTab={initialTab}
        />
      );

    case "error":
      return (
        <ErrorView
          message={error || "Something went wrong."}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      );

    default:
      return null;
  }
}
