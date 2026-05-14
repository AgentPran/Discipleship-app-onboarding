import React from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  HandHeart,
  Package,
  Plane,
} from "lucide-react";

const COURSES = [
  { title: "Foundations of faith", meta: "4 weeks · New believers", tag: "Course" },
  { title: "Prayer rhythms", meta: "Self-paced · Spiritual growth", tag: "Course" },
  { title: "Bible overview", meta: "6 sessions · Scripture", tag: "Course" },
];

const TRAININGS = [
  { title: "How to disciple someone", meta: "Mentor training" },
  { title: "Listening and pastoral care", meta: "Care team training" },
  { title: "Sharing your testimony", meta: "Practical workshop" },
];

const MISSIONS = [
  { title: "Local outreach team", date: "Every Saturday", place: "City centre" },
  { title: "Food bank support", date: "Wednesdays", place: "Community hub" },
  { title: "Summer mission trip", date: "July 2026", place: "Applications open" },
];

const PRODUCTS = [
  { title: "Discipleship journal", meta: "Reflection pages and habit tracker" },
  { title: "Prayer cards", meta: "Scripture prompts for the week" },
  { title: "Bible study guide", meta: "For small groups and mentors" },
];

export default function DiscoverTab() {
  return (
    <div className="px-5 pt-6 pb-32 space-y-5">
      <div className="msg-enter px-1">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>Discover</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Grow and go
        </h1>
      </div>

      <section className="msg-enter glass-card rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-11 h-11 flex items-center justify-center shrink-0"
            style={{ background: "rgba(201, 184, 232, 0.25)", color: "#5A4E6B" }}>
            <Compass size={20} strokeWidth={1.6} />
          </div>
          <div>
            <h2 className="text-[15px] font-medium" style={{ color: "#5A4E6B" }}>Recommended for you</h2>
            <p className="text-[12px] mt-0.5" style={{ color: "#7A6E89" }}>
              Courses, trainings, mission opportunities, and resources for your next step.
            </p>
          </div>
        </div>
      </section>

      <ResourceSection title="Courses" icon={BookOpen} items={COURSES} />
      <ResourceSection title="Trainings" icon={GraduationCap} items={TRAININGS} />
      <MissionSection />
      <ResourceSection title="Christian products" icon={Package} items={PRODUCTS} />
    </div>
  );
}

function ResourceSection({ title, icon: Icon, items }) {
  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[15px] font-medium" style={{ color: "#5A4E6B" }}>{title}</h2>
        <Icon size={17} strokeWidth={1.6} style={{ color: "#B5A0DD" }} />
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <button key={item.title} className="w-full rounded-2xl p-3 bg-white/70 border border-purple-100 text-left flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{item.title}</h3>
              <p className="text-[11px] mt-1" style={{ color: "#9B8FB5" }}>{item.meta}</p>
            </div>
            <ArrowRight size={15} style={{ color: "#B5A0DD" }} />
          </button>
        ))}
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="msg-enter glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[15px] font-medium" style={{ color: "#5A4E6B" }}>Missions</h2>
        <Plane size={17} strokeWidth={1.6} style={{ color: "#B5A0DD" }} />
      </div>
      <div className="space-y-2.5">
        {MISSIONS.map((mission) => (
          <div key={mission.title} className="rounded-2xl p-3 bg-white/70 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="rounded-full w-8 h-8 flex items-center justify-center shrink-0"
                style={{ background: "rgba(232, 194, 107, 0.18)", color: "#946A14" }}>
                <HandHeart size={15} strokeWidth={1.6} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-medium" style={{ color: "#5A4E6B" }}>{mission.title}</h3>
                <p className="text-[11px] mt-1" style={{ color: "#9B8FB5" }}>{mission.date} · {mission.place}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
