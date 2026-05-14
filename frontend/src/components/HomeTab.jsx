import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { DoveIcon } from "./Visual.jsx";

const REFLECTIONS = [
  { text: "Two are better than one, because they have a good reward for their toil.", source: "Ecclesiastes 4:9" },
  { text: "As iron sharpens iron, so one person sharpens another.",                   source: "Proverbs 27:17" },
  { text: "Carry each other's burdens, and in this way you will fulfill the law of Christ.", source: "Galatians 6:2" },
  { text: "Where two or three gather in my name, there am I with them.",              source: "Matthew 18:20" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Peace to you";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Peace to you";
}

export default function HomeTab({ userData, matches, matchesLoading, onGoToMentors }) {
  const name = userData?.name?.split(" ")[0] || "friend";
  const greeting = getGreeting();
  const reflection = useMemo(() => REFLECTIONS[new Date().getDay() % REFLECTIONS.length], []);

  const matchCount = matches?.length ?? 0;
  const hasMatches = matches !== null && !matchesLoading;

  return (
    <div className="px-5 pt-6 pb-32 space-y-5">
      {/* Greeting */}
      <div className="msg-enter">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "#9B8FB5" }}>{greeting}</p>
        <h1 className="text-3xl mt-1 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
          Hello <span style={{ color: "#B5A0DD", fontStyle: "italic", fontWeight: 400 }}>{name}</span>.
        </h1>
      </div>

      {/* Reflection */}
      <div className="msg-enter rounded-3xl p-4"
        style={{ background: "rgba(255, 250, 232, 0.6)", border: "1px dashed rgba(232, 194, 107, 0.45)" }}>
        <div className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "#B89544" }}>
          ✦ Today's reflection
        </div>
        <p className="text-[14px] italic leading-relaxed" style={{ color: "#5A4E6B" }}>
          "{reflection.text}"
        </p>
        <p className="text-[11px] mt-2" style={{ color: "#9B8FB5" }}>— {reflection.source}</p>
      </div>

      {/* Matches CTA */}
      <button onClick={onGoToMentors}
        className="msg-enter w-full text-left rounded-3xl p-5 transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(201, 184, 232, 0.95) 0%, rgba(232, 181, 197, 0.92) 100%)",
          boxShadow: "0 12px 36px -8px rgba(180, 140, 180, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(74, 63, 92, 0.7)" }}>
              {matchesLoading ? "Working" : hasMatches ? "Your matches" : "When you're ready"}
            </div>
            <h2 className="text-[20px] mt-1 leading-tight font-medium" style={{ color: "#4A3F5C" }}>
              {matchesLoading
                ? "Listening to your story…"
                : hasMatches && matchCount > 0
                ? `${matchCount} ${matchCount === 1 ? "mentor" : "mentors"} who might walk with you`
                : hasMatches && matchCount === 0
                ? "The team will reach out about a fit"
                : "Tap Mentors to see who's been listening"}
            </h2>
          </div>
          <div className="dove-bob shrink-0"><DoveIcon size={32} /></div>
        </div>
        <p className="text-[13px] leading-relaxed mt-2" style={{ color: "rgba(74, 63, 92, 0.8)" }}>
          {matchesLoading
            ? "Finding people whose journey rhymes with yours."
            : hasMatches && matchCount > 0
            ? "Each was chosen because their gifts, season, and story align with yours."
            : "Take your time. There's no rush."}
        </p>
        <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: "#4A3F5C" }}>
          {matchesLoading ? "…" : (<>View mentors <ArrowRight size={14} /></>)}
        </div>
      </button>

      {/* Journey at a glance */}
      {userData && (userData.lifeStage?.length > 0 || userData.support?.length > 0) && (
        <div className="msg-enter">
          <div className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: "#9B8FB5" }}>
            Your journey in your own words
          </div>
          <div className="glass-card rounded-3xl p-4">
            {userData.lifeStage?.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] mb-1.5" style={{ color: "#7A6E89" }}>Where you are</div>
                <div className="flex flex-wrap gap-1.5">
                  {userData.lifeStage.map((s) => (
                    <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(201, 184, 232, 0.22)", border: "1px solid rgba(155, 143, 181, 0.22)", color: "#5A4E6B" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {userData.support?.length > 0 && (
              <div>
                <div className="text-[11px] mb-1.5" style={{ color: "#7A6E89" }}>Looking for support in</div>
                <div className="flex flex-wrap gap-1.5">
                  {userData.support.map((s) => (
                    <span key={s} className="text-[12px] px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(232, 194, 107, 0.16)", border: "1px solid rgba(232, 194, 107, 0.3)", color: "#946A14" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
