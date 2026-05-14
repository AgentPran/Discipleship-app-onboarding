import React, { useEffect, useState } from "react";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { DoveIcon, DoveHero, Backdrop, GLOBAL_STYLE } from "./Visual.jsx";

const LOADING_LINES = [
  "Listening to your story…",
  "Looking for paths that have crossed yours…",
  "Reading hearts, not just keywords…",
  "Finding souls who've walked similar roads…",
];

export function LoadingView({ message }) {
  const [idx, setIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LOADING_LINES.length), 2200);
    const c = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, []);
  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="dove-bob mb-3"><DoveHero animated /></div>
          <p className="text-base mt-2 transition-opacity" style={{ color: "#5A4E6B" }} key={message || idx}>
            {message || LOADING_LINES[idx]}
          </p>
          <p className="text-[11px] mt-6" style={{ color: "#9B8FB5" }}>
            {seconds < 15
              ? "Just a moment…"
              : seconds < 45
              ? `Still working… (${seconds}s) — the ML model is loading.`
              : `Taking longer than usual (${seconds}s). Check the backend logs.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorView({ message, onRetry, onReset }) {
  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
          <DoveIcon size={48} />
          <h2 className="text-xl font-semibold mt-4 mb-2" style={{ color: "#5A4E6B" }}>Something went sideways</h2>
          <p className="text-[13px] leading-relaxed mb-1 max-w-xs" style={{ color: "#7A6E89" }}>{message}</p>
          <p className="text-[11px] mt-2 mb-6 max-w-xs" style={{ color: "#9B8FB5" }}>
            Make sure the backend is running: <code>cd backend && docker compose up</code>
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button onClick={onRetry} className="primary-btn py-3 rounded-full text-sm font-medium">
              Try again
            </button>
            <button onClick={onReset} className="ghost-btn py-2 rounded-full text-xs inline-flex items-center justify-center gap-1.5">
              <RotateCcw size={11} /> Start over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RequestSentView({ mentorName, onBack }) {
  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
          <div className="intro-enter">
            <div className="dove-bob mb-3"><DoveHero /></div>
            <h2 className="text-2xl mb-3 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300 }}>
              Your request is <em style={{ color: "#B5A0DD", fontWeight: 400 }}>on its way</em>.
            </h2>
            <p className="text-sm leading-relaxed mb-2 max-w-xs mx-auto" style={{ color: "#7A6E89" }}>
              The pastoral team will look at your match with {mentorName.split(" ")[0]} and reach out soon.
            </p>
            <p className="text-[12px] mt-1 mb-8 max-w-xs mx-auto" style={{ color: "#9B8FB5" }}>
              You'll hear from us by email when there's an update.
            </p>
            <button onClick={onBack} className="primary-btn px-8 py-3 rounded-full text-sm uppercase tracking-widest font-medium inline-flex items-center gap-2">
              <ChevronLeft size={14} /> Back to your matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
