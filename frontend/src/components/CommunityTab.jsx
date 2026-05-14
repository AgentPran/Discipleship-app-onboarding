import React from "react";
import {
  CalendarDays,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

const EVENTS = [
  { title: "Worship and prayer night", date: "Fri 22 May", time: "7:00 PM", place: "Main sanctuary" },
  { title: "New believers lunch", date: "Sun 24 May", time: "12:30 PM", place: "Church cafe" },
  { title: "Serve day", date: "Sat 30 May", time: "9:30 AM", place: "Community hall" },
];

const PRAYERS = [
  { name: "Naomi", request: "Praying for peace before an important family conversation.", count: 12 },
  { name: "Daniel", request: "Asking God for wisdom in a job decision this week.", count: 8 },
  { name: "A friend", request: "Healing and strength after a hard season.", count: 19 },
];

const TESTIMONIES = [
  { name: "Maya", body: "I joined a small group last month and finally feel known again." },
  { name: "Leo", body: "My mentor helped me rebuild a simple prayer rhythm. It feels possible now." },
];

const GROUPS = [
  "Bible study",
  "Young adults",
  "Creative worship",
  "Missions",
  "Marriage",
  "Prayer",
];

export default function CommunityTab() {
  return (
    <div className="px-5 pt-6 pb-32 space-y-5">
      <div className="msg-enter px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Community</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Life together
        </h1>
      </div>

      <Section title="Upcoming events" icon={CalendarDays}>
        <div className="space-y-2.5">
          {EVENTS.map((event) => (
            <div key={event.title} className="rounded-2xl p-3 bg-white/70 border border-purple-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-medium" style={{ color: "#5A4E6B" }}>{event.title}</h3>
                  <p className="text-[12px] mt-1" style={{ color: "#7A6E89" }}>{event.date} · {event.time}</p>
                </div>
                <span className="text-[10px] rounded-full px-2 py-1 bg-purple-50 shrink-0" style={{ color: "#7A6E89" }}>Going?</span>
              </div>
              <p className="text-[12px] mt-2 inline-flex items-center gap-1" style={{ color: "#9B8FB5" }}>
                <MapPin size={12} /> {event.place}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Prayer requests" icon={HeartHandshake}>
        <div className="space-y-2.5">
          {PRAYERS.map((prayer) => (
            <div key={prayer.request} className="rounded-2xl p-3 bg-white/70 border border-purple-100">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{prayer.name}</h3>
                <span className="text-[11px]" style={{ color: "#9B8FB5" }}>{prayer.count} praying</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "#7A6E89" }}>{prayer.request}</p>
              <button className="ghost-btn rounded-full px-3 py-1.5 text-[11px] mt-3">I prayed</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Testimonies" icon={Sparkles}>
        <div className="space-y-2.5">
          {TESTIMONIES.map((testimony) => (
            <div key={testimony.name} className="rounded-2xl p-3 bg-white/70 border border-purple-100">
              <h3 className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{testimony.name}</h3>
              <p className="text-[12px] leading-relaxed mt-1" style={{ color: "#7A6E89" }}>{testimony.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Interest groups" icon={Users}>
        <div className="grid grid-cols-2 gap-2">
          {GROUPS.map((group) => (
            <button key={group} className="rounded-2xl p-3 bg-white/70 border border-purple-100 text-left">
              <span className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{group}</span>
              <span className="block text-[11px] mt-1" style={{ color: "#9B8FB5" }}>View group</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[15px] font-medium" style={{ color: "#5A4E6B" }}>{title}</h2>
        <Icon size={17} strokeWidth={1.6} style={{ color: "#B5A0DD" }} />
      </div>
      {children}
    </section>
  );
}
