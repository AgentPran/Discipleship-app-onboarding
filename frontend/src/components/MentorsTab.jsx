import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Clock,
  MapPin,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
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

const UPCOMING_MEETINGS = [
  {
    id: "meeting-1",
    topic: "Building a steady prayer rhythm",
    mentor: "Sarah Mitchell",
    category: "Spiritual growth",
    date: "Thu 21 May",
    time: "7:00 PM",
    place: "Online",
  },
  {
    id: "meeting-2",
    topic: "Reviewing first-month habits",
    mentor: "David Chen",
    category: "Habits",
    date: "Mon 25 May",
    time: "6:30 PM",
    place: "Church cafe",
  },
];

const PREVIOUS_MEETINGS = [
  {
    id: "previous-1",
    topic: "Getting started",
    mentor: "Sarah Mitchell",
    attendees: ["Sarah Mitchell", "You"],
    notes: "Talked about starting small, choosing one rhythm, and sharing progress before the next meeting.",
    action: "Choose one rhythm to practise this week",
    category: "Mentorship",
    date: "Mon 11 May",
    time: "6:00 PM",
    place: "Online",
  },
];

const HABIT_MENTOR_RECOMMENDATIONS = [
  {
    id: "rec-sarah",
    name: "Sarah Mitchell",
    role: "mentor",
    focus: "Prayer, reflection, spiritual growth",
    category: "Spiritual growth",
    private: false,
    contributions: 48,
    graduates: 7,
  },
  {
    id: "rec-david",
    name: "David Chen",
    role: "mentor",
    focus: "Consistency, Scripture, weekly accountability",
    category: "Habits",
    private: false,
    contributions: 31,
    graduates: 4,
  },
  {
    id: "rec-amara",
    name: "Amara Okafor",
    role: "mentor",
    focus: "Calling, service, and turning reflection into action",
    category: "Service",
    private: true,
    contributions: 22,
    graduates: 3,
  },
  {
    id: "rec-jonah",
    name: "Jonah Reed",
    role: "peer",
    focus: "New believer rhythms and shared accountability",
    category: "Habits",
    private: false,
    mentoredBy: "Sarah Mitchell",
    testimonies: 2,
  },
];

const DISCIPLESHIP_OPTIONS = [
  {
    id: "search-mentee",
    title: "Search and request",
    description: "Look for a mentor yourself and request discipleship as a mentee.",
  },
  {
    id: "invite-mentor",
    title: "Invite someone to follow",
    description: "Search for someone and invite them as a mentor.",
  },
  {
    id: "algorithm",
    title: "Algorithmic matching",
    description: "Use your profile, topics, and milestones to suggest a fit.",
  },
  {
    id: "pastoral",
    title: "Ask pastoral team",
    description: "Let the pastoral team prayerfully suggest a match.",
  },
];

const TODO_KEY = "discipleship_action_items";
const MILESTONES_KEY = "discipleship_milestones";

function addActionToHabitList(meeting) {
  const current = readStored(TODO_KEY, []);
  const item = {
    id: Date.now(),
    text: meeting.action || `Follow up from ${meeting.topic}`,
    source: `From meeting: ${meeting.topic}`,
    done: false,
  };
  localStorage.setItem(TODO_KEY, JSON.stringify([...current, item]));
}

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

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
  const [meetings, setMeetings] = useState(UPCOMING_MEETINGS);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingDraft, setMeetingDraft] = useState({
    withWho: "",
    personRole: "mentor",
    date: "",
    time: "",
    place: "",
    topic: "",
    milestone: "",
  });
  const [query, setQuery] = useState("");
  const [connectProfile, setConnectProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [sentConnections, setSentConnections] = useState({});
  const [connectionNotice, setConnectionNotice] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinOption, setJoinOption] = useState(null);
  const [previousMeetings, setPreviousMeetings] = useState(PREVIOUS_MEETINGS);
  const [selectedPreviousMeeting, setSelectedPreviousMeeting] = useState(null);
  const [addedActions, setAddedActions] = useState({});
  const loggedMilestones = readStored(MILESTONES_KEY, []);

  const sorted = useMemo(
    () => [...(matches || [])].sort((a, b) => b.score - a.score),
    [matches]
  );
  const profiles = useMemo(() => {
    const fromMatches = sorted.map((m) => ({
      id: m.mentor_id,
      name: m.name,
      role: "mentor",
      focus: topReason(m),
      category: m.shared_support?.[0] || "Mentorship",
      match: Math.round((m.score || 0) * 100),
      private: false,
      raw: m,
    }));
    const byName = new Map([...HABIT_MENTOR_RECOMMENDATIONS, ...fromMatches].map((p) => [p.name, p]));
    return [...byName.values()];
  }, [sorted]);
  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const addMeeting = () => {
    if (!meetingDraft.withWho.trim() || !meetingDraft.topic.trim()) return;
    setMeetings((current) => [
      ...current,
      {
        topic: meetingDraft.topic.trim(),
        mentor: meetingDraft.withWho.trim(),
        id: `meeting-${Date.now()}`,
        personRole: meetingDraft.personRole,
        category: meetingDraft.milestone || "Mentorship",
        date: meetingDraft.date || "Date TBC",
        time: meetingDraft.time || "Time TBC",
        place: meetingDraft.place || "Place TBC",
        milestone: meetingDraft.milestone,
      },
    ]);
    setMeetingDraft({ withWho: "", personRole: "mentor", date: "", time: "", place: "", topic: "", milestone: "" });
    setShowMeetingModal(false);
  };

  const sendConnection = () => {
    if (!connectProfile) return;
    const key = connectProfile.id || connectProfile.name;
    setSentConnections((current) => ({
      ...current,
      [key]: { status: "pending", message: connectMessage || "Connection request sent." },
    }));
    setConnectionNotice(`Request sent to ${connectProfile.name}.`);
    setTimeout(() => {
      setSentConnections((current) => {
        if (!current[key]) return current;
        return { ...current, [key]: { ...current[key], status: "approved" } };
      });
      setConnectionNotice(`${connectProfile.name} approved your request.`);
    }, 1800);
    setConnectMessage("");
    setConnectProfile(null);
  };

  return (
    <div className="px-4 pt-6 pb-32">
      <div className="msg-enter mb-4 px-1">
        <h1 className="text-3xl leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Discipleship
        </h1>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => setShowJoinModal(true)} className="primary-btn rounded-full px-3 py-2.5 text-xs font-medium inline-flex items-center justify-center gap-1.5">
            <Users size={14} /> Join discipleship group
          </button>
          <button onClick={() => setShowMeetingModal(true)} className="ghost-btn rounded-full px-3 py-2.5 text-xs font-medium inline-flex items-center justify-center gap-1.5">
            <Plus size={14} /> Add meeting
          </button>
        </div>
      </div>

      <MeetingSection
        title="Upcoming meetings"
        meetings={meetings}
        onDelete={(id) => setMeetings((current) => current.filter((meeting) => meeting.id !== id))}
      />
      <MeetingSection
        title="Previous meetings"
        meetings={previousMeetings}
        compact
        onSelect={setSelectedPreviousMeeting}
        onDelete={(id) => setPreviousMeetings((current) => current.filter((meeting) => meeting.id !== id))}
      />
      {connectionNotice && (
        <div className="msg-enter rounded-2xl p-3 mb-4 flex items-center justify-between gap-3"
          style={{ background: "rgba(232, 194, 107, 0.15)", border: "1px solid rgba(232, 194, 107, 0.35)" }}>
          <p className="text-[12px]" style={{ color: "#946A14" }}>{connectionNotice}</p>
          <button onClick={() => setConnectionNotice(null)} className="text-[11px]" style={{ color: "#946A14" }}>Dismiss</button>
        </div>
      )}

      <section className="msg-enter glass-card rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>
            Recommended profiles
          </p>
          <Sparkles size={16} color="#B5A0DD" />
        </div>
        <div className="flex items-center gap-2 mb-3 bg-white/80 rounded-full px-3 py-2 border border-purple-100">
          <Search size={14} color="#9B8FB5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mentor or peer by name"
            className="flex-1 bg-transparent text-sm placeholder:opacity-50"
            style={{ color: "#5A4E6B" }}
          />
        </div>
        <div className="space-y-2">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id || profile.name}
              profile={profile}
              sent={sentConnections[profile.id || profile.name]}
              onConnect={() => setConnectProfile(profile)}
              onDeleteRequest={() => setSentConnections((current) => {
                const next = { ...current };
                delete next[profile.id || profile.name];
                return next;
              })}
              onView={() => profile.raw ? onSelectMentor(profile.raw) : setViewProfile(profile)}
            />
          ))}
        </div>
      </section>

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

      {showMeetingModal && (
        <Modal title="Add meeting" onClose={() => setShowMeetingModal(false)}>
          <MeetingForm
            draft={meetingDraft}
            setDraft={setMeetingDraft}
            milestones={loggedMilestones}
            onSave={addMeeting}
            onCancel={() => setShowMeetingModal(false)}
          />
        </Modal>
      )}

      {connectProfile && (
        <Modal title={`Connect with ${connectProfile.name.split(" ")[0]}`} onClose={() => setConnectProfile(null)}>
          <ConnectForm
            profile={connectProfile}
            message={connectMessage}
            setMessage={setConnectMessage}
            onSend={sendConnection}
            onCancel={() => setConnectProfile(null)}
          />
        </Modal>
      )}

      {viewProfile && (
        <Modal title={viewProfile.private ? "Private profile" : viewProfile.name} onClose={() => setViewProfile(null)}>
          <ProfilePreview profile={viewProfile} />
        </Modal>
      )}

      {showJoinModal && (
        <Modal title="Join discipleship group" onClose={() => { setShowJoinModal(false); setJoinOption(null); }}>
          {!joinOption ? (
            <JoinOptions onSelect={setJoinOption} />
          ) : (
            <JoinOptionFlow
              option={joinOption}
              query={query}
              setQuery={setQuery}
              profiles={filteredProfiles}
              onConnect={setConnectProfile}
              onBack={() => setJoinOption(null)}
            />
          )}
        </Modal>
      )}

      {selectedPreviousMeeting && (
        <Modal title="Previous meeting" onClose={() => setSelectedPreviousMeeting(null)}>
          <PreviousMeetingDetail
            meeting={selectedPreviousMeeting}
            added={addedActions[selectedPreviousMeeting.id]}
            onAddAction={() => {
              addActionToHabitList(selectedPreviousMeeting);
              setAddedActions((current) => ({ ...current, [selectedPreviousMeeting.id]: true }));
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function ProfileCard({ profile, sent, onConnect, onDeleteRequest, onView }) {
  const status = typeof sent === "object" ? sent.status : sent ? "pending" : null;
  return (
    <div className="rounded-2xl bg-white/70 border border-purple-100 p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-full shrink-0 inline-flex items-center justify-center"
          style={{ width: 42, height: 42, background: "linear-gradient(135deg, #C9B8E8, #E8B5C5)", color: "#4A3F5C", fontWeight: 600 }}>
          {(profile.name || "?")[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium truncate" style={{ color: "#5A4E6B" }}>{profile.name}</p>
            <span className="badge rounded-full px-2 py-0.5 text-[10px] capitalize">{profile.role}</span>
          </div>
          <p className="text-[12px] leading-relaxed mt-1" style={{ color: "#7A6E89" }}>{profile.focus}</p>
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className="text-[11px]" style={{ color: "#9B8FB5" }}>
              {profile.match ? `${profile.match}% match · ` : ""}{profile.category}
            </span>
            <div className="flex gap-1.5">
              <button onClick={onView} className="ghost-btn rounded-full px-2.5 py-1 text-[11px]">
                {profile.private ? "Private" : "View"}
              </button>
              {status === "pending" ? (
                <button onClick={onDeleteRequest} className="ghost-btn rounded-full px-2.5 py-1 text-[11px]">Cancel request</button>
              ) : status === "approved" ? (
                <span className="badge rounded-full px-2.5 py-1 text-[11px]">Approved</span>
              ) : (
                <button onClick={onConnect} className="primary-btn rounded-full px-2.5 py-1 text-[11px]">Connect</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingForm({ draft, setDraft, milestones, onSave, onCancel }) {
  return (
    <div>
      <p className="text-[12px] leading-relaxed mb-3" style={{ color: "#7A6E89" }}>
        Add the basics. You can tidy details later.
      </p>
      <input
        value={draft.withWho}
        onChange={(e) => setDraft((d) => ({ ...d, withWho: e.target.value }))}
        placeholder="With who?"
        className="w-full bg-white/85 rounded-full border border-purple-100 px-4 py-2 text-sm mb-2"
        style={{ color: "#5A4E6B" }}
      />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={draft.personRole}
          onChange={(e) => setDraft((d) => ({ ...d, personRole: e.target.value }))}
          className="bg-white/85 rounded-full border border-purple-100 px-3 py-2 text-sm"
          style={{ color: "#5A4E6B" }}
        >
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
          <option value="peer">Peer</option>
        </select>
        <select
          value={draft.milestone}
          onChange={(e) => setDraft((d) => ({ ...d, milestone: e.target.value }))}
          className="bg-white/85 rounded-full border border-purple-100 px-3 py-2 text-sm"
          style={{ color: "#5A4E6B" }}
        >
          <option value="">No milestone</option>
          {milestones.map((milestone) => (
            <option key={milestone.id} value={milestone.title}>{milestone.title}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          className="bg-white/85 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
        <input type="time" value={draft.time} onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
          className="bg-white/85 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
      </div>
      <input
        value={draft.place}
        onChange={(e) => setDraft((d) => ({ ...d, place: e.target.value }))}
        placeholder="Place"
        className="w-full bg-white/85 rounded-full border border-purple-100 px-4 py-2 text-sm mb-2"
        style={{ color: "#5A4E6B" }}
      />
      <textarea
        value={draft.topic}
        onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
        placeholder="Topic"
        rows={3}
        className="w-full bg-white/85 rounded-2xl border border-purple-100 px-3 py-2 text-sm"
        style={{ color: "#5A4E6B" }}
      />
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="ghost-btn flex-1 py-2.5 rounded-full text-sm">Cancel</button>
        <button onClick={onSave} disabled={!draft.withWho.trim() || !draft.topic.trim()} className="primary-btn flex-1 py-2.5 rounded-full text-sm disabled:opacity-40">Save</button>
      </div>
    </div>
  );
}

function ConnectForm({ profile, message, setMessage, onSend, onCancel }) {
  return (
    <div>
      <p className="text-[13px] leading-relaxed" style={{ color: "#7A6E89" }}>
        Send a short request to connect with {profile.name}. This can be reviewed before it becomes a discipleship relationship.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a message..."
        rows={4}
        className="w-full bg-white/85 rounded-2xl border border-purple-100 px-3 py-2 text-sm mt-3"
        style={{ color: "#5A4E6B" }}
      />
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="ghost-btn flex-1 py-2.5 rounded-full text-sm">Cancel</button>
        <button onClick={onSend} className="primary-btn flex-1 py-2.5 rounded-full text-sm inline-flex items-center justify-center gap-1.5">
          Send <Send size={13} />
        </button>
      </div>
    </div>
  );
}

function ProfilePreview({ profile }) {
  if (profile.private) {
    return (
      <div className="text-center py-4">
        <div className="rounded-full mx-auto mb-3 inline-flex items-center justify-center"
          style={{ width: 64, height: 64, background: "linear-gradient(135deg, #C9B8E8, #E8B5C5)", color: "#4A3F5C", fontWeight: 600 }}>
          {(profile.name || "?")[0]}
        </div>
        <p className="text-[15px] font-medium" style={{ color: "#5A4E6B" }}>{profile.name}</p>
        <p className="text-[13px] leading-relaxed mt-2" style={{ color: "#7A6E89" }}>
          This person is in private mode. You can still send a connect request, but their full profile is hidden until they approve access.
        </p>
      </div>
    );
  }

  const isMentor = profile.role === "mentor";
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full inline-flex items-center justify-center"
          style={{ width: 58, height: 58, background: "linear-gradient(135deg, #C9B8E8, #E8B5C5)", color: "#4A3F5C", fontWeight: 600, fontSize: 20 }}>
          {(profile.name || "?")[0]}
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ color: "#5A4E6B" }}>{profile.name}</p>
          <p className="text-[11px] uppercase tracking-widest capitalize" style={{ color: "#9B8FB5" }}>{profile.role}</p>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed rounded-2xl bg-white/70 border border-purple-100 p-3" style={{ color: "#5A4E6B" }}>
        {profile.focus}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {isMentor ? (
          <>
            <StatPill label="Contributions" value={profile.contributions || 0} />
            <StatPill label="Graduates" value={profile.graduates || 0} />
          </>
        ) : (
          <>
            <StatPill label="Mentored by" value={profile.mentoredBy || "Pending"} />
            <StatPill label="Testimonies" value={profile.testimonies || 0} />
          </>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-purple-100 px-3 py-3">
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>{label}</p>
      <p className="text-[14px] font-medium mt-1 truncate" style={{ color: "#5A4E6B" }}>{value}</p>
    </div>
  );
}

function JoinOptions({ onSelect }) {
  return (
    <div className="space-y-2">
      {DISCIPLESHIP_OPTIONS.map((option) => (
        <button key={option.id} onClick={() => onSelect(option)}
          className="w-full text-left rounded-2xl bg-white/70 border border-purple-100 p-3">
          <p className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>{option.title}</p>
          <p className="text-[12px] leading-relaxed mt-1" style={{ color: "#7A6E89" }}>{option.description}</p>
        </button>
      ))}
    </div>
  );
}

function JoinOptionFlow({ option, query, setQuery, profiles, onConnect, onBack }) {
  if (option.id === "algorithm") {
    return (
      <div>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#7A6E89" }}>
          Based on your profile, habits, and milestones, these people look like strong next conversations.
        </p>
        <div className="space-y-2">
          {profiles.slice(0, 3).map((profile) => (
            <ProfileCard key={profile.id || profile.name} profile={profile} onConnect={() => onConnect(profile)} />
          ))}
        </div>
        <button onClick={onBack} className="ghost-btn w-full mt-4 py-2.5 rounded-full text-sm">Back</button>
      </div>
    );
  }

  if (option.id === "pastoral") {
    return (
      <div>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#7A6E89" }}>
          Tell the pastoral team what you are hoping for. They can suggest a mentor, mentee, or discipleship group.
        </p>
        <textarea rows={5} placeholder="What kind of support or discipleship relationship are you looking for?"
          className="w-full bg-white/85 rounded-2xl border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
        <div className="flex gap-2 mt-4">
          <button onClick={onBack} className="ghost-btn flex-1 py-2.5 rounded-full text-sm">Back</button>
          <button className="primary-btn flex-1 py-2.5 rounded-full text-sm">Send request</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#7A6E89" }}>
        {option.id === "invite-mentor"
          ? "Search someone you might invite to follow as a mentor."
          : "Search for a mentor and send a discipleship request."}
      </p>
      <div className="flex items-center gap-2 mb-3 bg-white/80 rounded-full px-3 py-2 border border-purple-100">
        <Search size={14} color="#9B8FB5" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name"
          className="flex-1 bg-transparent text-sm placeholder:opacity-50" style={{ color: "#5A4E6B" }} />
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto scroll">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id || profile.name} profile={profile} onConnect={() => onConnect(profile)} />
        ))}
      </div>
      <button onClick={onBack} className="ghost-btn w-full mt-4 py-2.5 rounded-full text-sm">Back</button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "#5A4E6B" }}>{title}</h2>
          <button onClick={onClose} className="ghost-btn h-8 w-8 rounded-full inline-flex items-center justify-center">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MeetingSection({ title, meetings, compact = false, onSelect, onDelete }) {
  return (
    <section className="msg-enter glass-card rounded-3xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>
          {title}
        </p>
        <CalendarDays size={17} color="#B5A0DD" />
      </div>
      <div className="space-y-2">
        {meetings.map((meeting) => (
          <div key={meeting.id || `${meeting.topic}-${meeting.date}`} className="rounded-2xl bg-white/70 border border-purple-100 p-3">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => onSelect && onSelect(meeting)}
                className="flex-1 text-left"
                disabled={!onSelect}
              >
                <p className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>{meeting.topic}</p>
                <p className="text-[12px] mt-1" style={{ color: "#7A6E89" }}>
                  {meeting.mentor} · {meeting.category}
                </p>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="badge shrink-0 rounded-full px-2 py-0.5 text-[10px]">
                  {meeting.date}
                </span>
                {onDelete && (
                  <button onClick={() => onDelete(meeting.id)} className="ghost-btn h-7 w-7 rounded-lg inline-flex items-center justify-center">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            {!compact && (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]" style={{ color: "#9B8FB5" }}>
                <span className="inline-flex items-center gap-1"><Clock size={11} /> {meeting.time}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={11} /> {meeting.place}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviousMeetingDetail({ meeting, added, onAddAction }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Meeting topic</p>
      <h3 className="text-lg font-medium mt-1" style={{ color: "#5A4E6B" }}>{meeting.topic}</h3>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>Attendees</p>
        <div className="flex flex-wrap gap-1.5">
          {(meeting.attendees || [meeting.mentor, "You"]).map((name) => (
            <span key={name} className="badge rounded-full px-2.5 py-1 text-[11px]">{name}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/70 border border-purple-100 p-3">
        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#9B8FB5" }}>Meeting notes</p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#5A4E6B" }}>{meeting.notes || "No notes added yet."}</p>
      </div>

      <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(255, 250, 232, 0.65)", border: "1px dashed rgba(232, 194, 107, 0.45)" }}>
        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#B89544" }}>Call for action</p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#5A4E6B" }}>{meeting.action || "Choose one follow-up before the next meeting."}</p>
        <button onClick={onAddAction} disabled={added} className="primary-btn mt-3 w-full py-2.5 rounded-full text-sm disabled:opacity-50">
          {added ? "Added to list" : "Add to list"}
        </button>
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
