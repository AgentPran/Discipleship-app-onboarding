import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  Flag,
  Gift,
  LineChart,
  PartyPopper,
  Plus,
  Send,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { DoveIcon } from "./Visual.jsx";

const DAYS = [
  { short: "M", label: "Mon" },
  { short: "T", label: "Tue" },
  { short: "W", label: "Wed" },
  { short: "T", label: "Thu" },
  { short: "F", label: "Fri" },
  { short: "S", label: "Sat" },
  { short: "S", label: "Sun" },
];

const MOODS = [
  "Peaceful", "Joyful", "Hopeful", "Grateful", "Focused", "Restless",
  "Tired", "Heavy", "Anxious", "Lonely", "Stuck", "Overwhelmed",
];

const VERSES = {
  Peaceful: ["John 14:27", "Peace I leave with you; my peace I give you."],
  Joyful: ["Nehemiah 8:10", "The joy of the Lord is your strength."],
  Hopeful: ["Romans 15:13", "May the God of hope fill you with all joy and peace."],
  Grateful: ["Psalm 107:1", "Give thanks to the Lord, for he is good."],
  Focused: ["Proverbs 16:3", "Commit to the Lord whatever you do."],
  Restless: ["Matthew 11:28", "Come to me, all you who are weary and burdened."],
  Tired: ["Isaiah 40:31", "Those who hope in the Lord will renew their strength."],
  Heavy: ["Psalm 34:18", "The Lord is close to the brokenhearted."],
  Anxious: ["Philippians 4:6-7", "Do not be anxious about anything."],
  Lonely: ["Deuteronomy 31:8", "He will never leave you nor forsake you."],
  Stuck: ["Isaiah 43:19", "See, I am doing a new thing."],
  Overwhelmed: ["Psalm 61:2", "Lead me to the rock that is higher than I."],
};

const HABITS_KEY = "discipleship_habits";
const LOGS_KEY = "discipleship_habit_logs";
const REFLECTIONS_KEY = "discipleship_reflection_records";
const MILESTONES_KEY = "discipleship_milestones";
const NOTIFIED_KEY = "discipleship_habit_notifications";
const TODO_KEY = "discipleship_action_items";

const STARTER_HABITS = [
  { id: 1, name: "Prayer", category: "Spiritual growth", days: [0, 1, 2, 3, 4], reminder: true, reminderTime: "08:00" },
  { id: 2, name: "Scripture", category: "Spiritual growth", days: [0, 2, 4], reminder: true, reminderTime: "20:00" },
  { id: 3, name: "Serve someone", category: "Service", days: [5], reminder: false, reminderTime: "10:00" },
];

const STARTER_MILESTONES = [
  {
    id: 1,
    title: "Get baptised",
    detail: "Prepare for baptism and choose a date with church leadership.",
    shareProgress: true,
    testimony: "",
    status: "In progress",
    supporters: ["Sarah Mitchell"],
    celebrated: false,
    appreciation: "",
    steps: [
      { id: 101, text: "Join baptism course", done: false },
      { id: 102, text: "Share testimony draft with mentor", done: false },
      { id: 103, text: "Confirm baptism date", done: false },
      { id: 104, text: "Celebrate baptism day", done: false },
    ],
  },
  {
    id: 2,
    title: "30 days of rhythm",
    detail: "Keep one simple weekly habit pattern for a month.",
    shareProgress: true,
    testimony: "",
    status: "Next",
    supporters: ["David Chen"],
    celebrated: false,
    appreciation: "",
    steps: [
      { id: 201, text: "Choose two core habits", done: true },
      { id: 202, text: "Review progress with supporter", done: false },
    ],
  },
];

const MILESTONE_WIZARD_STEPS = [
  {
    id: "topic",
    question: "What milestone are you working towards?",
    hint: "It can be big or small — what matters is that it means something to you.",
    type: "text",
    field: "title",
    placeholder: "e.g. Get baptised, lead a cell group, finish a course...",
    required: true,
  },
  {
    id: "why",
    question: "Why is this important to you?",
    hint: "This stays with you as a reminder of the deeper reason.",
    type: "textarea",
    field: "detail",
    placeholder: "Write what comes to your heart...",
    required: false,
  },
  {
    id: "steps",
    question: "What steps will get you there?",
    hint: "We've started you with four. Fill in any that fit your journey.",
    type: "steps",
    field: "steps",
    required: false,
  },
  {
    id: "supporters",
    question: "Who would you like to walk alongside you?",
    hint: "Your mentor, a peer — anyone who'll pray with you for this.",
    type: "supporters",
    field: "supporters",
    required: false,
  },
  {
    id: "share",
    question: "Would you like them to see your progress?",
    hint: "So they can support you better and celebrate when you get there.",
    type: "boolean",
    field: "shareProgress",
    required: false,
  },
];

const EMPTY_WIZARD = {
  title: "",
  detail: "",
  steps: [
    { id: "w1", text: "", done: false },
    { id: "w2", text: "", done: false },
    { id: "w3", text: "", done: false },
    { id: "w4", text: "", done: false },
  ],
  supporters: [],
  shareProgress: true,
  supporterInput: "",
};

const CONFETTI_DOTS = [
  { left: 5,  color: "#C9B8E8", size: 8,  delay: 0,    duration: 0.9,  round: false },
  { left: 12, color: "#E8B5C5", size: 6,  delay: 0.1,  duration: 1.0,  round: true  },
  { left: 20, color: "#F4D079", size: 10, delay: 0.05, duration: 0.85, round: false },
  { left: 28, color: "#B5E8C9", size: 7,  delay: 0.2,  duration: 0.95, round: true  },
  { left: 36, color: "#C9B8E8", size: 5,  delay: 0.15, duration: 1.1,  round: false },
  { left: 44, color: "#F4D079", size: 9,  delay: 0,    duration: 0.8,  round: true  },
  { left: 52, color: "#E8B5C5", size: 7,  delay: 0.25, duration: 0.9,  round: false },
  { left: 60, color: "#B5A0DD", size: 6,  delay: 0.1,  duration: 1.0,  round: true  },
  { left: 68, color: "#F5C9A8", size: 8,  delay: 0.05, duration: 0.88, round: false },
  { left: 76, color: "#C9B8E8", size: 5,  delay: 0.2,  duration: 0.95, round: true  },
  { left: 84, color: "#F4D079", size: 9,  delay: 0.15, duration: 1.0,  round: false },
  { left: 92, color: "#E89BAE", size: 7,  delay: 0,    duration: 0.85, round: true  },
  { left: 8,  color: "#B5E8C9", size: 6,  delay: 0.3,  duration: 0.9,  round: false },
  { left: 22, color: "#F5C9A8", size: 8,  delay: 0.35, duration: 1.05, round: true  },
  { left: 38, color: "#E8B5C5", size: 5,  delay: 0.4,  duration: 0.9,  round: false },
  { left: 55, color: "#C9B8E8", size: 10, delay: 0.3,  duration: 0.8,  round: true  },
  { left: 70, color: "#F4D079", size: 6,  delay: 0.35, duration: 1.0,  round: false },
  { left: 88, color: "#B5A0DD", size: 8,  delay: 0.25, duration: 0.92, round: true  },
];

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Peace";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Peace";
}

function getDayIndex(dateKey) {
  return (new Date(`${dateKey}T12:00:00`).getDay() + 6) % 7;
}

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lastNDays(count, offset = 0) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - offset - (count - 1 - index));
    return todayKey(date);
  });
}

function toggleNumber(items, value) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value].sort((a, b) => a - b);
}

function getFrequency(dayCount) {
  if (dayCount === 0) return "No days set";
  if (dayCount === 7) return "Daily";
  return `${dayCount}x / week`;
}

const emptyHabit = {
  name: "",
  category: "Spiritual growth",
  days: [0, 1, 2, 3, 4],
  reminder: true,
  reminderTime: "08:00",
};

export default function HomeTab({ userData }) {
  const name = userData?.name?.split(" ")[0] || "there";
  const today = todayKey();
  const [view, setView] = useState("habits");
  const [habits, setHabits] = useState(() => readStored(HABITS_KEY, STARTER_HABITS));
  const [logs, setLogs] = useState(() => readStored(LOGS_KEY, {}));
  const [reflections, setReflections] = useState(() => readStored(REFLECTIONS_KEY, {}));
  const [actionItems, setActionItems] = useState(() => readStored(TODO_KEY, []));
  const [milestones, setMilestones] = useState(() => readStored(MILESTONES_KEY, STARTER_MILESTONES));
  const [habitDraft, setHabitDraft] = useState(emptyHabit);
  const [supporterDrafts, setSupporterDrafts] = useState({});
  const [stepDrafts, setStepDrafts] = useState({});
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  const todaysReflection = reflections[today] || { mood: "", note: "", recorded: false };
  const [reflectionDraft, setReflectionDraft] = useState(todaysReflection);

  useEffect(() => setReflectionDraft(todaysReflection), [today, todaysReflection.mood, todaysReflection.note, todaysReflection.recorded]);
  useEffect(() => localStorage.setItem(HABITS_KEY, JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem(LOGS_KEY, JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections)), [reflections]);
  useEffect(() => localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones)), [milestones]);
  useEffect(() => localStorage.setItem(TODO_KEY, JSON.stringify(actionItems)), [actionItems]);

  useEffect(() => {
    const clearExpiredReflection = () => {
      const current = readStored(REFLECTIONS_KEY, {});
      const recordedAt = current[today]?.recordedAt;
      if (!recordedAt) return;
      const age = Date.now() - new Date(recordedAt).getTime();
      if (age >= 12 * 60 * 60 * 1000) {
        const next = { ...current };
        delete next[today];
        setReflections(next);
      }
    };
    clearExpiredReflection();
    const timer = setInterval(clearExpiredReflection, 60000);
    return () => clearInterval(timer);
  }, [today]);

  useEffect(() => {
    if (notificationStatus !== "granted") return undefined;

    const notifyDueHabits = () => {
      const now = new Date();
      const dayIndex = (now.getDay() + 6) % 7;
      const time = now.toTimeString().slice(0, 5);
      const sent = readStored(NOTIFIED_KEY, {});

      habits.forEach((habit) => {
        const key = `${todayKey()}-${habit.id}-${habit.reminderTime}`;
        const due = habit.reminder && habit.days.includes(dayIndex) && habit.reminderTime === time && !sent[key];
        if (due) {
          new Notification(`Time for ${habit.name}`, {
            body: "Open your dashboard when you're ready to log it.",
          });
          sent[key] = true;
        }
      });

      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(sent));
    };

    notifyDueHabits();
    const timer = setInterval(notifyDueHabits, 30000);
    return () => clearInterval(timer);
  }, [habits, notificationStatus]);

  const loggedToday = habits.filter((habit) => logs[today]?.[habit.id]).length;
  const insightData = useMemo(() => buildInsights({ habits, logs, reflections }), [habits, logs, reflections]);
  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);

  const saveReflection = () => {
    setReflections((current) => ({
      ...current,
      [today]: { ...reflectionDraft, recorded: true, recordedAt: new Date().toISOString() },
    }));
  };

  const clearReflection = () => {
    setReflections((current) => {
      const next = { ...current };
      delete next[today];
      return next;
    });
    setReflectionDraft({ mood: "", note: "", recorded: false });
    setShowReflectionModal(false);
  };

  const addHabit = () => {
    const habitName = habitDraft.name.trim();
    if (!habitName) return;
    setHabits((current) => [...current, { ...habitDraft, id: Date.now(), name: habitName }]);
    setHabitDraft(emptyHabit);
    setShowHabitModal(false);
  };

  const addMilestone = (wizardData) => {
    const title = wizardData.title.trim();
    if (!title) return;
    const steps = wizardData.steps
      .filter((s) => s.text.trim())
      .map((s, i) => ({ id: Date.now() + i, text: s.text.trim(), done: false }));
    setMilestones((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        detail: wizardData.detail.trim(),
        shareProgress: wizardData.shareProgress,
        testimony: "",
        status: "Next",
        supporters: wizardData.supporters,
        celebrated: false,
        appreciation: "",
        steps,
      },
    ]);
    setShowMilestoneModal(false);
  };

  const updateMilestone = (id, patch) => {
    setMilestones((current) => current.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addSupporter = (id) => {
    const supporter = (supporterDrafts[id] || "").trim();
    if (!supporter) return;
    setMilestones((current) =>
      current.map((m) => (m.id === id ? { ...m, supporters: [...m.supporters, supporter] } : m))
    );
    setSupporterDrafts((current) => ({ ...current, [id]: "" }));
  };

  const addStep = (id) => {
    const text = (stepDrafts[id] || "").trim();
    if (!text) return;
    setMilestones((current) =>
      current.map((m) => (m.id === id ? { ...m, steps: [...m.steps, { id: Date.now(), text, done: false }] } : m))
    );
    setStepDrafts((current) => ({ ...current, [id]: "" }));
  };

  const toggleStep = (milestoneId, stepId) => {
    setMilestones((current) =>
      current.map((m) =>
        m.id === milestoneId
          ? { ...m, steps: m.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) }
          : m
      )
    );
  };

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") {
      setNotificationStatus("unsupported");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  return (
    <div className="px-5 pt-6 pb-32 space-y-5">
      <header className="msg-enter flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <DoveIcon size={28} />
          <div>
            <p className="text-lg font-semibold leading-none" style={{ color: "#5A4E6B" }}>Discipleship</p>
            <p className="text-[11px] mt-1" style={{ color: "#9B8FB5" }}>{getGreeting()}, {name}</p>
          </div>
        </div>
        <div className="rounded-full px-3 py-1 text-[11px] bg-white/70 border border-purple-100" style={{ color: "#7A6E89" }}>
          {loggedToday}/{habits.length} logged
        </div>
      </header>

      <TopNav view={view} setView={setView} />

      {view === "habits" && (
        <>
          <ReflectionRecorder
            draft={reflectionDraft}
            saved={todaysReflection}
            setDraft={setReflectionDraft}
            onSave={saveReflection}
            onOpen={() => setShowReflectionModal(true)}
            onClear={clearReflection}
          />
          <section className="msg-enter glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Weekly habits</p>
                <h2 className="text-xl font-medium mt-1" style={{ color: "#5A4E6B" }}>Set days and log today</h2>
              </div>
              <button onClick={() => setShowHabitModal(true)} className="primary-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5">
                <Plus size={14} /> Add habit
              </button>
            </div>
            <ActionList
              items={actionItems}
              onToggle={(id) => setActionItems((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item))}
              onDelete={(id) => setActionItems((items) => items.filter((item) => item.id !== id))}
            />
            <HabitTable
              habits={habits}
              logs={logs[today] || {}}
              onToggleDay={(habitId, day) => setHabits((current) => current.map((h) => h.id === habitId ? { ...h, days: toggleNumber(h.days, day) } : h))}
              onLog={(habitId) => setLogs((current) => ({ ...current, [today]: { ...(current[today] || {}), [habitId]: !current[today]?.[habitId] } }))}
              onRemove={(habitId) => setHabits((current) => current.filter((h) => h.id !== habitId))}
            />
          </section>
        </>
      )}

      {view === "milestones" && (
        <MilestonesScreen
          milestones={milestones}
          onAddClick={() => setShowMilestoneModal(true)}
          onSelect={setSelectedMilestoneId}
          onUpdate={updateMilestone}
          onDelete={(id) => setMilestones((current) => current.filter((m) => m.id !== id))}
          supporterDrafts={supporterDrafts}
          setSupporterDrafts={setSupporterDrafts}
          stepDrafts={stepDrafts}
          setStepDrafts={setStepDrafts}
          onAddSupporter={addSupporter}
          onAddStep={addStep}
          onToggleStep={toggleStep}
        />
      )}

      {view === "insights" && <InsightsScreen data={insightData} />}

      {showHabitModal && (
        <Modal title="Add habit" onClose={() => setShowHabitModal(false)}>
          <HabitForm
            draft={habitDraft}
            setDraft={setHabitDraft}
            onAdd={addHabit}
            onCancel={() => setShowHabitModal(false)}
            notificationStatus={notificationStatus}
            onEnableNotifications={enableNotifications}
          />
        </Modal>
      )}

      {showMilestoneModal && (
        <Modal title="New milestone" onClose={() => setShowMilestoneModal(false)}>
          <MilestoneWizard
            onDone={addMilestone}
            onCancel={() => setShowMilestoneModal(false)}
          />
        </Modal>
      )}

      {showReflectionModal && (
        <Modal title="Daily reflection" onClose={() => setShowReflectionModal(false)}>
          <ReflectionDetail reflection={todaysReflection} onClear={clearReflection} />
        </Modal>
      )}

      {selectedMilestone && (
        <Modal title={selectedMilestone.title || "Milestone"} onClose={() => setSelectedMilestoneId(null)}>
          <EditableMilestone
            milestone={selectedMilestone}
            onUpdate={updateMilestone}
            onDelete={(id) => {
              setMilestones((current) => current.filter((m) => m.id !== id));
              setSelectedMilestoneId(null);
            }}
            supporterDrafts={supporterDrafts}
            setSupporterDrafts={setSupporterDrafts}
            stepDrafts={stepDrafts}
            setStepDrafts={setStepDrafts}
            onAddSupporter={addSupporter}
            onAddStep={addStep}
            onToggleStep={toggleStep}
          />
        </Modal>
      )}
    </div>
  );
}

function buildInsights({ habits, logs, reflections }) {
  const thisWeek = lastNDays(7);
  const previousWeek = lastNDays(7, 7);
  const habitRates = habits.map((habit) => {
    const planned = thisWeek.filter((date) => habit.days.includes(getDayIndex(date)));
    const completed = planned.filter((date) => logs[date]?.[habit.id]).length;
    const rate = planned.length ? Math.round((completed / planned.length) * 100) : 0;
    return { ...habit, planned: planned.length, completed, rate };
  });

  return {
    moodsThisWeek: thisWeek.map((date) => ({ date, mood: reflections[date]?.mood || "" })),
    moodsPreviousWeek: previousWeek.map((date) => ({ date, mood: reflections[date]?.mood || "" })),
    consistent: habitRates.filter((habit) => habit.rate >= 70),
    inconsistent: habitRates.filter((habit) => habit.rate < 70),
  };
}

function TopNav({ view, setView }) {
  const items = [
    { id: "habits", label: "Habits", icon: CalendarDays },
    { id: "milestones", label: "Milestones", icon: Flag },
    { id: "insights", label: "Insights", icon: LineChart },
  ];

  return (
    <nav className="msg-enter grid grid-cols-3 gap-1 rounded-2xl bg-white/70 border border-purple-100 p-1 sticky top-2 z-20 backdrop-blur">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={`rounded-xl py-2 text-xs font-medium inline-flex items-center justify-center gap-1.5 ${view === id ? "primary-btn" : ""}`}
          style={view === id ? undefined : { color: "#7A6E89" }}
        >
          <Icon size={13} /> {label}
        </button>
      ))}
    </nav>
  );
}

function ReflectionRecorder({ draft, saved, setDraft, onSave, onOpen, onClear }) {
  const recorded = saved.recorded;
  const verse = VERSES[saved.mood || draft.mood] || ["Psalm 23:3", "He refreshes my soul."];

  if (recorded) {
    return (
      <section className="msg-enter glass-card rounded-3xl p-3">
        <div className="flex items-center gap-3">
          <button onClick={onOpen} className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 bg-white/70">
            <img src="/heart-check.svg" alt="" className="h-full w-full object-cover" />
          </button>
          <button onClick={onOpen} className="min-w-0 flex-1 text-left">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Daily reflection</p>
            <p className="text-[13px] font-medium truncate" style={{ color: "#5A4E6B" }}>{saved.mood}</p>
            <p className="text-[11px] leading-snug mt-0.5" style={{ color: "#7A6E89" }}>{verse[0]} · {verse[1]}</p>
          </button>
          <button onClick={onClear} className="ghost-btn rounded-full px-2.5 py-1 text-[11px] shrink-0">Clear</button>
        </div>
      </section>
    );
  }

  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>Daily reflection</p>
      <h2 className="text-lg font-medium" style={{ color: "#5A4E6B" }}>How are you feeling?</h2>
      <div className="grid grid-cols-4 gap-1.5 mt-3">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => setDraft((current) => ({ ...current, mood }))}
            className={`chip px-2 py-1 rounded-full text-[11px] ${draft.mood === mood ? "selected" : ""}`}
          >
            {mood}
          </button>
        ))}
      </div>
      <textarea
        value={draft.note || ""}
        onChange={(e) => setDraft((current) => ({ ...current, note: e.target.value }))}
        placeholder="Record a short reflection..."
        rows={2}
        className="mt-3 w-full rounded-2xl bg-white/75 border border-purple-100 px-3 py-2 text-sm placeholder:opacity-50"
        style={{ color: "#5A4E6B" }}
      />
      <button onClick={onSave} disabled={!draft.mood} className="primary-btn mt-2 px-4 py-2 rounded-full text-sm inline-flex items-center gap-1.5 disabled:opacity-30">
        <Check size={14} /> Record reflection
      </button>
    </section>
  );
}

function ReflectionDetail({ reflection, onClear }) {
  const verse = VERSES[reflection.mood] || ["Psalm 23:3", "He refreshes my soul."];
  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-purple-100 mb-4">
        <img src="/heart-check.svg" alt="" className="w-full h-32 object-cover" />
      </div>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>You recorded</p>
      <h3 className="text-xl font-medium mt-1" style={{ color: "#5A4E6B" }}>{reflection.mood || "A reflection"}</h3>
      {reflection.note && (
        <p className="text-[14px] leading-relaxed mt-3 rounded-2xl bg-white/70 border border-purple-100 p-3" style={{ color: "#5A4E6B" }}>
          {reflection.note}
        </p>
      )}
      <div className="mt-4 rounded-2xl p-3" style={{ background: "rgba(255, 250, 232, 0.65)", border: "1px dashed rgba(232, 194, 107, 0.45)" }}>
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#B89544" }}>{verse[0]}</p>
        <p className="text-[14px] leading-relaxed mt-1" style={{ color: "#5A4E6B" }}>{verse[1]}</p>
      </div>
      <button onClick={onClear} className="ghost-btn w-full mt-4 py-2.5 rounded-full text-sm">Clear reflection</button>
    </div>
  );
}

function ActionList({ items, onToggle, onDelete }) {
  if (!items.length) return null;
  return (
    <div className="mb-4 rounded-2xl bg-white/70 border border-purple-100 p-3">
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>To-do list</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center gap-2 rounded-xl px-2 py-2 bg-white/70 ${item.done ? "opacity-45" : ""}`}>
            <button onClick={() => onToggle(item.id)} className={`h-5 w-5 rounded-md inline-flex items-center justify-center border ${item.done ? "primary-btn border-transparent" : "border-purple-200"}`}>
              {item.done && <Check size={12} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] truncate ${item.done ? "line-through" : ""}`} style={{ color: "#5A4E6B" }}>{item.text}</p>
              {item.source && <p className="text-[10px] truncate" style={{ color: "#9B8FB5" }}>{item.source}</p>}
            </div>
            <button onClick={() => onDelete(item.id)} className="ghost-btn h-7 w-7 rounded-lg inline-flex items-center justify-center">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitTable({ habits, logs, onToggleDay, onLog, onRemove }) {
  return (
    <div className="overflow-x-auto scroll -mx-1 px-1">
      <div className="min-w-[430px]">
        <div className="grid grid-cols-[120px_54px_repeat(7,30px)_34px] gap-1.5 items-center mb-2">
          <div className="text-[11px]" style={{ color: "#9B8FB5" }}>Habit</div>
          <div className="text-center text-[11px]" style={{ color: "#9B8FB5" }}>Log</div>
          {DAYS.map((day) => <div key={day.label} className="text-center text-[11px]" style={{ color: "#9B8FB5" }}>{day.short}</div>)}
          <div />
        </div>
        <div className="space-y-2">
          {habits.map((habit) => {
            const done = !!logs[habit.id];
            return (
            <div key={habit.id} className={`grid grid-cols-[120px_54px_repeat(7,30px)_34px] gap-1.5 items-center transition-opacity ${done ? "opacity-40" : ""}`}>
              <div>
                <p className={`text-[13px] font-medium truncate ${done ? "line-through" : ""}`} style={{ color: "#5A4E6B" }}>{habit.name}</p>
                <p className={`text-[10px] ${done ? "line-through" : ""}`} style={{ color: "#9B8FB5" }}>{getFrequency(habit.days.length)} {habit.reminder ? `at ${habit.reminderTime}` : ""}</p>
              </div>
              <button onClick={() => onLog(habit.id)} className={`h-8 rounded-xl text-xs font-medium ${logs[habit.id] ? "primary-btn" : "ghost-btn"}`}>
                {logs[habit.id] ? "Done" : "Log"}
              </button>
              {DAYS.map((day, index) => {
                const selected = habit.days.includes(index);
                return (
                  <button key={day.label} onClick={() => onToggleDay(habit.id, index)}
                    className={`h-7 w-7 rounded-lg inline-flex items-center justify-center ${selected ? "primary-btn" : "bg-white/75 border border-purple-100"}`}>
                    {selected && <Check size={12} />}
                  </button>
                );
              })}
              <button onClick={() => onRemove(habit.id)} className="ghost-btn h-8 w-8 rounded-xl inline-flex items-center justify-center">
                <Trash2 size={13} />
              </button>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

function HabitForm({ draft, setDraft, onAdd, onCancel, notificationStatus, onEnableNotifications }) {
  return (
    <div>
      <input
        value={draft.name}
        onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))}
        placeholder="Habit name"
        className="w-full bg-white/70 rounded-full border border-purple-100 px-4 py-2 text-sm placeholder:opacity-50"
        style={{ color: "#5A4E6B" }}
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <select value={draft.category} onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
          className="bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }}>
          <option>Spiritual growth</option><option>Habits</option><option>Service</option><option>Leadership</option><option>Relationships</option>
        </select>
        <input type="time" value={draft.reminderTime} onChange={(e) => setDraft((current) => ({ ...current, reminderTime: e.target.value }))}
          className="bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {DAYS.map((day, index) => (
          <button key={day.label} onClick={() => setDraft((current) => ({ ...current, days: toggleNumber(current.days, index) }))}
            className={`h-8 w-8 rounded-xl text-xs ${draft.days.includes(index) ? "primary-btn" : "bg-white/75 border border-purple-100"}`}>
            {day.short}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100/70">
        <label className="inline-flex items-center gap-2 text-[12px]" style={{ color: "#7A6E89" }}>
          <input type="checkbox" checked={draft.reminder} onChange={(e) => setDraft((current) => ({ ...current, reminder: e.target.checked }))} />
          Reminder
        </label>
        <button onClick={onEnableNotifications} className="ghost-btn rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-1">
          <Bell size={12} /> {notificationStatus === "granted" ? "Enabled" : "Enable"}
        </button>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onCancel} className="ghost-btn flex-1 py-2.5 rounded-full text-sm">Cancel</button>
        <button onClick={onAdd} disabled={!draft.name.trim()} className="primary-btn flex-1 py-2.5 rounded-full text-sm disabled:opacity-30">Save</button>
      </div>
    </div>
  );
}

function getWizardAnswer(data, step) {
  if (step.type === "text" || step.type === "textarea") return data[step.field]?.trim() || null;
  if (step.type === "steps") {
    const filled = data.steps.filter((s) => s.text.trim());
    return filled.length ? `${filled.length} step${filled.length !== 1 ? "s" : ""} added` : null;
  }
  if (step.type === "supporters") return data.supporters.length ? data.supporters.join(", ") : null;
  if (step.type === "boolean") return data.shareProgress ? "Yes, let them see" : "Keep it private";
  return null;
}

function MilestoneWizard({ onDone, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    ...EMPTY_WIZARD,
    steps: EMPTY_WIZARD.steps.map((s) => ({ ...s })),
  });

  const current = MILESTONE_WIZARD_STEPS[step];
  const isLast = step === MILESTONE_WIZARD_STEPS.length - 1;
  const canProceed = !current.required || data.title.trim().length > 0;

  const goNext = () => (isLast ? onDone(data) : setStep((s) => s + 1));
  const goBack = () => (step === 0 ? onCancel() : setStep((s) => s - 1));

  return (
    <div>
      <div className="progress-track mb-5">
        <div className="progress-fill" style={{ width: `${((step + 1) / MILESTONE_WIZARD_STEPS.length) * 100}%` }} />
      </div>

      {step > 0 && (
        <div className="space-y-1.5 mb-4 max-h-[96px] overflow-y-auto scroll">
          {MILESTONE_WIZARD_STEPS.slice(0, step).map((s) => {
            const answer = getWizardAnswer(data, s);
            if (!answer) return null;
            return (
              <div key={s.id} className="flex justify-end">
                <span className="bubble-user rounded-2xl rounded-tr-sm px-3 py-1.5 text-[12px] inline-block max-w-[80%]">
                  {answer}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="bubble-bot rounded-2xl rounded-tl-sm px-4 py-3 mb-4 msg-enter" key={`q-${step}`}>
        <p className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>{current.question}</p>
        {current.hint && (
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#9B8FB5" }}>{current.hint}</p>
        )}
      </div>

      <div className="mb-5 msg-enter" key={`i-${step}`}>
        <WizardInput step={current} data={data} setData={setData} />
      </div>

      <div className="flex items-center justify-between">
        <button onClick={goBack} className="back-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5">
          <ChevronLeft size={12} /> {step === 0 ? "Cancel" : "Back"}
        </button>
        <div className="flex items-center gap-2">
          {!current.required && (
            <button onClick={goNext} className="skip-btn rounded-full px-3 py-2 text-xs">Skip</button>
          )}
          <button
            onClick={goNext}
            disabled={!canProceed}
            className="primary-btn rounded-full px-4 py-2 text-xs disabled:opacity-30 inline-flex items-center gap-1.5"
          >
            {isLast ? "Done" : "Continue"} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function WizardInput({ step, data, setData }) {
  if (step.type === "text") {
    return (
      <input
        value={data[step.field] || ""}
        autoFocus
        onChange={(e) => setData((d) => ({ ...d, [step.field]: e.target.value }))}
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
        placeholder={step.placeholder}
        className="w-full bg-white/70 rounded-2xl border border-purple-100 px-4 py-3 text-sm placeholder:opacity-50"
        style={{ color: "#5A4E6B" }}
      />
    );
  }

  if (step.type === "textarea") {
    return (
      <textarea
        value={data[step.field] || ""}
        onChange={(e) => setData((d) => ({ ...d, [step.field]: e.target.value }))}
        placeholder={step.placeholder}
        rows={3}
        className="w-full rounded-2xl bg-white/70 border border-purple-100 px-4 py-3 text-sm placeholder:opacity-50"
        style={{ color: "#5A4E6B" }}
      />
    );
  }

  if (step.type === "steps") {
    return (
      <div className="space-y-2">
        {data.steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-full inline-flex items-center justify-center text-[11px] font-medium shrink-0"
              style={{ background: "rgba(181, 160, 221, 0.2)", color: "#7A6E89" }}
            >
              {i + 1}
            </span>
            <input
              value={s.text}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  steps: d.steps.map((st, idx) => (idx === i ? { ...st, text: e.target.value } : st)),
                }))
              }
              placeholder={`Step ${i + 1}...`}
              className="flex-1 bg-white/70 rounded-xl border border-purple-100 px-3 py-2 text-sm placeholder:opacity-50"
              style={{ color: "#5A4E6B" }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (step.type === "supporters") {
    const addSupporter = () => {
      if (!data.supporterInput?.trim()) return;
      setData((d) => ({
        ...d,
        supporters: [...d.supporters, d.supporterInput.trim()],
        supporterInput: "",
      }));
    };
    return (
      <div>
        {data.supporters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {data.supporters.map((name) => (
              <span key={name} className="badge rounded-full px-2.5 py-1 text-[11px] inline-flex items-center gap-1">
                {name}
                <button
                  onClick={() => setData((d) => ({ ...d, supporters: d.supporters.filter((s) => s !== name) }))}
                  className="opacity-60 hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={data.supporterInput || ""}
            onChange={(e) => setData((d) => ({ ...d, supporterInput: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSupporter(); } }}
            placeholder="Type a name, press Enter or +"
            className="flex-1 bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm placeholder:opacity-50"
            style={{ color: "#5A4E6B" }}
          />
          <button onClick={addSupporter} className="primary-btn h-9 w-9 rounded-full inline-flex items-center justify-center shrink-0">
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (step.type === "boolean") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => setData((d) => ({ ...d, shareProgress: val }))}
            className={`chip rounded-2xl px-4 py-3 text-[13px] flex items-center justify-center gap-1.5 ${data.shareProgress === val ? "selected" : ""}`}
          >
            {data.shareProgress === val && <Check size={14} />}
            {val ? "Yes, let them see" : "Keep it private"}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

function MilestonesScreen(props) {
  const { milestones, onAddClick, onSelect } = props;
  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Milestones</p>
          <h2 className="text-xl font-medium mt-1" style={{ color: "#5A4E6B" }}>Growth stages</h2>
        </div>
        <button onClick={onAddClick} className="primary-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5">
          <Plus size={14} /> Add milestone
        </button>
      </div>
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} onClick={() => onSelect(milestone.id)} />
        ))}
      </div>
    </section>
  );
}

function MilestoneCard({ milestone, onClick }) {
  const stage = milestoneStage(milestone);
  const done = milestone.steps.filter((s) => s.done).length;
  const total = milestone.steps.length || 1;
  const progress = Math.round((done / total) * 100);

  return (
    <button onClick={onClick} className="w-full text-left rounded-3xl bg-white/75 border border-purple-100 p-3 relative overflow-hidden">
      <div className="absolute right-3 top-3 flex -space-x-2">
        {milestone.supporters.slice(0, 3).map((supporter) => (
          <span key={supporter} className="h-7 w-7 rounded-full border-2 border-white inline-flex items-center justify-center text-[10px] font-medium"
            style={{ background: "linear-gradient(135deg, #C9B8E8, #E8B5C5)", color: "#4A3F5C" }}>
            {supporter.split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </span>
        ))}
      </div>

      <div className="flex gap-3 pr-16">
        <TreeVisual stage={stage} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium truncate" style={{ color: "#5A4E6B" }}>{milestone.title}</p>
          <p className="text-[12px] leading-snug mt-1 line-clamp-2" style={{ color: "#7A6E89" }}>{milestone.detail}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px]" style={{ color: "#9B8FB5" }}>
              <span>{MILESTONE_STAGE_LABELS[stage]}</span>
              <span>{done}/{milestone.steps.length} steps</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-purple-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #B5A0DD, #E89BAE)" }} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

const STAGE_IMAGES = [
  "/stage-seed.png",
  "/stage-sprout.png",
  "/stage-tree.png",
  "/stage-harvest.png",
];
const MILESTONE_STAGE_LABELS = ["Level 1: Started", "Level 2: Growing", "Level 3: Almost there", "Level 4: Achieved"];

function TreeVisual({ stage, large = false }) {
  const cls = large ? "h-32 w-32 rounded-3xl" : "h-20 w-20 rounded-2xl";
  return (
    <div className={`${cls} overflow-hidden border border-purple-100 shrink-0`}>
      <img
        src={STAGE_IMAGES[stage]}
        alt={MILESTONE_STAGE_LABELS[stage]}
        className="h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

function milestoneStage(milestone) {
  const total = milestone.steps.length;
  const done = milestone.steps.filter((s) => s.done).length;
  if (milestone.celebrated || (total > 0 && done === total)) return 3;
  if (done >= Math.ceil(total * 0.65) && total > 0) return 2;
  if (done > 0 || milestone.status === "In progress") return 1;
  return 0;
}

function CelebrationBurst() {
  return (
    <div className="relative h-20 overflow-hidden pointer-events-none">
      {CONFETTI_DOTS.map((d, i) => (
        <div
          key={i}
          className="confetti-dot"
          style={{
            left: `${d.left}%`,
            top: 0,
            width: d.size,
            height: d.size,
            background: d.color,
            borderRadius: d.round ? "50%" : "2px",
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function EditableMilestone({
  milestone,
  onUpdate,
  onDelete,
  supporterDrafts,
  setSupporterDrafts,
  stepDrafts,
  setStepDrafts,
  onAddSupporter,
  onAddStep,
  onToggleStep,
}) {
  const [celebratePhase, setCelebratePhase] = useState(null);
  const [testimony, setTestimony] = useState(milestone.testimony || "");
  const [appreciation, setAppreciation] = useState(milestone.appreciation || "");

  const stage = milestoneStage(milestone);
  const completedSteps = milestone.steps.filter((s) => s.done).length;
  const allStepsDone = milestone.steps.length > 0 && completedSteps === milestone.steps.length;

  useEffect(() => {
    if (celebratePhase !== "confetti") return undefined;
    const t = setTimeout(() => setCelebratePhase("testimony"), 2000);
    return () => clearTimeout(t);
  }, [celebratePhase]);

  const finishCelebration = () => {
    onUpdate(milestone.id, { celebrated: true, status: "Done", testimony, appreciation });
    setCelebratePhase(null);
  };

  if (celebratePhase === "confetti") {
    return (
      <div className="text-center py-2">
        <CelebrationBurst />
        <div className="flex justify-center mt-2 mb-4">
          <TreeVisual stage={3} large />
        </div>
        <p className="text-xl leading-snug" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Level 4: Achieved.
        </p>
        <p className="text-[13px] mt-1 mb-5" style={{ color: "#9B8FB5" }}>
          <em style={{ color: "#B5A0DD" }}>{milestone.title}</em> is complete.
        </p>
        <button
          onClick={() => setCelebratePhase("testimony")}
          className="primary-btn px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"
        >
          Continue <ArrowRight size={14} />
        </button>
        <div className="mt-3">
          <button
            onClick={() => setCelebratePhase(null)}
            className="back-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={12} /> Back
          </button>
        </div>
      </div>
    );
  }

  if (celebratePhase === "testimony") {
    return (
      <div>
        <div className="bubble-bot rounded-2xl rounded-tl-sm px-4 py-3 mb-4 msg-enter">
          <p className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>
            What a moment to celebrate.
          </p>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "#9B8FB5" }}>
            Would you like to record your testimony — what happened through this milestone?
          </p>
        </div>
        <textarea
          value={testimony}
          onChange={(e) => setTestimony(e.target.value)}
          placeholder="Share what God did through this..."
          rows={4}
          className="w-full rounded-2xl bg-white/70 border border-purple-100 px-4 py-3 text-sm placeholder:opacity-50 mb-4"
          style={{ color: "#5A4E6B" }}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCelebratePhase("confetti")}
            className="back-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={12} /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTestimony(""); setCelebratePhase("appreciate"); }}
              className="skip-btn rounded-full px-3 py-2 text-xs"
            >
              Skip
            </button>
            <button
              onClick={() => setCelebratePhase("appreciate")}
              className="primary-btn rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              Save <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (celebratePhase === "appreciate") {
    return (
      <div>
        <div className="bubble-bot rounded-2xl rounded-tl-sm px-4 py-3 mb-4 msg-enter">
          <p className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>
            Your supporters walked this with you.
          </p>
          <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "#9B8FB5" }}>
            How would you like to show appreciation?
          </p>
        </div>
        <div className="space-y-2 mb-5">
          {[["Send a thank you note", Send], ["Gift", Gift], ["Invite for meet & eat", Utensils]].map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setAppreciation((a) => (a === label ? "" : label))}
              className={`w-full rounded-2xl py-3 px-4 text-[13px] inline-flex items-center gap-3 ${appreciation === label ? "primary-btn" : "ghost-btn"}`}
            >
              <Icon size={16} />
              {label}
              {appreciation === label && <Check size={14} className="ml-auto" />}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCelebratePhase("testimony")}
            className="back-btn rounded-full px-3 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <ChevronLeft size={12} /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAppreciation(""); finishCelebration(); }}
              className="skip-btn rounded-full px-3 py-2 text-xs"
            >
              Skip
            </button>
            <button
              onClick={finishCelebration}
              className="primary-btn rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              Done <Check size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-3xl bg-white/70 border border-purple-100 p-3 mb-3">
        <div className="flex gap-3">
          <TreeVisual stage={stage} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>{MILESTONE_STAGE_LABELS[stage]}</p>
            <p className="text-[13px] mt-1" style={{ color: "#7A6E89" }}>
              {completedSteps}/{milestone.steps.length} steps completed
            </p>
            {milestone.celebrated && milestone.testimony && (
              <p className="text-[11px] mt-1.5 italic leading-relaxed" style={{ color: "#9B8FB5" }}>
                &ldquo;{milestone.testimony}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/70 border border-purple-100 p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <input value={milestone.title} onChange={(e) => onUpdate(milestone.id, { title: e.target.value })}
              className="w-full bg-transparent text-[15px] font-medium" style={{ color: "#5A4E6B" }} />
            <textarea value={milestone.detail} onChange={(e) => onUpdate(milestone.id, { detail: e.target.value })}
              rows={2} className="w-full bg-white/65 rounded-xl border border-purple-100 px-3 py-2 text-[12px]" style={{ color: "#7A6E89" }} />
          </div>
          <button onClick={() => onDelete(milestone.id)} className="ghost-btn h-8 w-8 rounded-xl inline-flex items-center justify-center">
            <Trash2 size={13} />
          </button>
        </div>

        <div className="mt-3 rounded-2xl bg-white/65 border border-purple-100 p-3">
          <div className="grid grid-cols-4 gap-2">
            {MILESTONE_STAGE_LABELS.map((label, index) => (
              <div key={label} className={`rounded-xl px-2 py-2 text-center ${index <= stage ? "primary-btn" : "bg-white/80 border border-purple-100"}`}>
                <div className="text-[9px] leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {allStepsDone && !milestone.celebrated && (
          <div
            className="mt-3 rounded-2xl p-4 text-center celebrate-scale"
            style={{ background: "rgba(255, 250, 232, 0.7)", border: "1px dashed rgba(232, 194, 107, 0.5)" }}
          >
            <p className="text-[12px] font-medium mb-2.5" style={{ color: "#946A14" }}>
              All steps complete!
            </p>
            <button
              onClick={() => setCelebratePhase("confetti")}
              className="primary-btn px-5 py-2.5 rounded-full text-sm inline-flex items-center gap-2"
            >
              <PartyPopper size={14} /> Celebrate achievement
            </button>
          </div>
        )}

        {milestone.celebrated && (
          <div className="mt-3 rounded-2xl p-3" style={{ background: "rgba(255, 250, 232, 0.65)", border: "1px dashed rgba(232, 194, 107, 0.45)" }}>
            <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "#B89544" }}>Completed</p>
            {milestone.appreciation ? (
              <p className="text-[12px]" style={{ color: "#5A4E6B" }}>
                Appreciation sent: <strong>{milestone.appreciation}</strong>
              </p>
            ) : (
              <div>
                <p className="text-[12px] mb-2" style={{ color: "#5A4E6B" }}>Show appreciation to your supporters:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[["Thank you", Send], ["Gift", Gift], ["Meet & eat", Utensils]].map(([label, Icon]) => (
                    <button key={label} onClick={() => onUpdate(milestone.id, { appreciation: label })}
                      className={`rounded-xl py-2 text-[11px] inline-flex items-center justify-center gap-1 ${milestone.appreciation === label ? "primary-btn" : "ghost-btn"}`}>
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!allStepsDone && !milestone.celebrated && (
          <div className="mt-3">
            <select value={milestone.status} onChange={(e) => onUpdate(milestone.id, { status: e.target.value })}
              className="w-full bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }}>
              <option>Next</option><option>In progress</option><option>Stuck</option><option>Done</option>
            </select>
          </div>
        )}

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>Supporters</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {milestone.supporters.map((supporter) => (
              <span key={supporter} className="badge rounded-full px-2 py-0.5 text-[10px]">{supporter}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={supporterDrafts[milestone.id] || ""} onChange={(e) => setSupporterDrafts((current) => ({ ...current, [milestone.id]: e.target.value }))}
              placeholder="Add mentor or peer" className="flex-1 bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
            <button onClick={() => onAddSupporter(milestone.id)} className="primary-btn h-9 w-9 rounded-full inline-flex items-center justify-center"><Plus size={14} /></button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>Steps</p>
          <div className="space-y-1.5">
            {milestone.steps.map((step) => (
              <button key={step.id} onClick={() => onToggleStep(milestone.id, step.id)}
                className="w-full text-left rounded-xl bg-white/65 border border-purple-100 px-3 py-2 flex items-center gap-2" style={{ color: "#5A4E6B" }}>
                <span className={`h-5 w-5 rounded-md inline-flex items-center justify-center border ${step.done ? "primary-btn border-transparent" : "border-purple-200"}`}>
                  {step.done && <Check size={12} />}
                </span>
                <span className={`text-[12px] ${step.done ? "line-through opacity-60" : ""}`}>{step.text}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={stepDrafts[milestone.id] || ""} onChange={(e) => setStepDrafts((current) => ({ ...current, [milestone.id]: e.target.value }))}
              placeholder="Add step, e.g. Baptism course" className="flex-1 bg-white/70 rounded-full border border-purple-100 px-3 py-2 text-sm" style={{ color: "#5A4E6B" }} />
            <button onClick={() => onAddStep(milestone.id)} className="primary-btn h-9 w-9 rounded-full inline-flex items-center justify-center"><Plus size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsScreen({ data }) {
  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-[10px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Insights</p><h2 className="text-xl font-medium mt-1" style={{ color: "#5A4E6B" }}>Weekly patterns</h2></div>
        <LineChart size={22} color="#B5A0DD" />
      </div>
      <InsightMoodStrip title="This week" items={data.moodsThisWeek} />
      <InsightMoodStrip title="Previous week" items={data.moodsPreviousWeek} />
      <div className="mt-4 grid grid-cols-1 gap-3">
        <InsightList title="Consistent with" habits={data.consistent} empty="No habits above 70% yet." />
        <InsightList title="Needs attention" habits={data.inconsistent} empty="Nothing is falling behind this week." />
      </div>
    </section>
  );
}

function InsightMoodStrip({ title, items }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>{title}</p>
      <div className="grid grid-cols-7 gap-1">
        {items.map((item) => (
          <div key={item.date} className="rounded-xl bg-white/70 border border-purple-100 px-1 py-2 text-center">
            <p className="text-[10px]" style={{ color: "#9B8FB5" }}>{DAYS[getDayIndex(item.date)].short}</p>
            <p className="text-[10px] mt-1 truncate" style={{ color: item.mood ? "#5A4E6B" : "#C8BED8" }}>{item.mood || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightList({ title, habits, empty }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-purple-100 p-3">
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9B8FB5" }}>{title}</p>
      {habits.length === 0 ? <p className="text-[12px]" style={{ color: "#7A6E89" }}>{empty}</p> : habits.map((habit) => (
        <div key={habit.id} className="mb-2 last:mb-0">
          <div className="flex justify-between gap-2 text-[12px]" style={{ color: "#5A4E6B" }}><span>{habit.name}</span><span>{habit.rate}%</span></div>
          <div className="mt-1 h-1.5 rounded-full bg-purple-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${habit.rate}%`, background: "linear-gradient(90deg, #B5A0DD, #E89BAE)" }} /></div>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "#5A4E6B" }}>{title}</h2>
          <button onClick={onClose} className="ghost-btn h-8 w-8 rounded-full inline-flex items-center justify-center"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
