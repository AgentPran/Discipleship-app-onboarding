import { useMemo } from "react";

export function DoveIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22 28 Q14 16, 28 18 Q32 22, 30 30 L24 32 Z" fill="#F5F0F8" stroke="#9B8FB5" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M16 38 Q14 30, 22 28 L38 28 Q48 30, 46 38 Q42 44, 30 44 Q20 42, 16 38 Z" fill="white" stroke="#9B8FB5" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M14 36 L6 34 L8 40 L14 40 Z" fill="#F5F0F8" stroke="#9B8FB5" strokeWidth="0.8" strokeLinejoin="round" />
      <circle cx="44" cy="26" r="6" fill="white" stroke="#9B8FB5" strokeWidth="0.8" />
      <circle cx="46" cy="24.5" r="1" fill="#5A4E6B" />
      <path d="M28 32 Q32 22, 42 26 Q40 36, 32 38 Z" fill="#F8F5FB" stroke="#9B8FB5" strokeWidth="0.8" strokeLinejoin="round" />
      <polygon points="50,26 54,27 50,28" fill="#E8A968" stroke="#9B8FB5" strokeWidth="0.4" />
      <path d="M53 26 Q58 24, 60 21" stroke="#7BA582" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="23" rx="2" ry="1.2" fill="#A3C49B" transform="rotate(-30 56 23)" />
      <ellipse cx="59" cy="21" rx="1.5" ry="0.9" fill="#A3C49B" transform="rotate(-45 59 21)" />
    </svg>
  );
}

export function DoveHero() {
  return (
    <svg width="160" height="160" viewBox="0 0 200 200" fill="none">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF4E8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#F4D079" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F4D079" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDE5F2" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#halo)" />
      <path d="M50 110 L20 100 L24 122 L48 120 Z" fill="url(#bodyGrad)" stroke="#9B8FB5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M48 120 Q44 96, 64 88 L120 84 Q148 92, 144 116 Q138 132, 110 134 Q70 130, 48 120 Z" fill="url(#bodyGrad)" stroke="#9B8FB5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M70 96 Q72 50, 110 40 Q142 44, 150 68 Q124 76, 108 96 Z" fill="url(#bodyGrad)" stroke="#9B8FB5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M90 60 Q108 56, 130 60" stroke="#C9B8E8" strokeWidth="1" fill="none" />
      <path d="M88 72 Q108 68, 134 72" stroke="#C9B8E8" strokeWidth="1" fill="none" />
      <path d="M88 84 Q108 80, 138 84" stroke="#C9B8E8" strokeWidth="1" fill="none" />
      <circle cx="138" cy="80" r="14" fill="url(#bodyGrad)" stroke="#9B8FB5" strokeWidth="1.5" />
      <circle cx="142" cy="76" r="1.8" fill="#5A4E6B" />
      <polygon points="150,80 158,82 150,84" fill="#E8A968" stroke="#9B8FB5" strokeWidth="0.8" />
      <path d="M156 80 Q170 72, 174 60" stroke="#7BA582" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="166" cy="72" rx="4.5" ry="2.5" fill="#A3C49B" stroke="#7BA582" strokeWidth="0.6" transform="rotate(-30 166 72)" />
      <ellipse cx="172" cy="64" rx="3.5" ry="2" fill="#A3C49B" stroke="#7BA582" strokeWidth="0.6" transform="rotate(-45 172 64)" />
      <circle cx="175" cy="60" r="1.5" fill="#7B9D74" />
    </svg>
  );
}

export function Sparkles({ count = 20 }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1.5,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 2,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="sparkle"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Backdrop() {
  return (
    <>
      <div className="wash" style={{ top: "-40px", left: "-40px", width: 200, height: 200, background: "#F8D7DD" }} />
      <div className="wash" style={{ top: "30%", right: "-50px", width: 180, height: 180, background: "#DAC9E8" }} />
      <div className="wash" style={{ bottom: "10%", left: "-30px", width: 160, height: 160, background: "#F5C9A8" }} />
      <Sparkles count={20} />
    </>
  );
}

/* Re-usable global styles for all screens */
export const GLOBAL_STYLE = `
  .app-root {
    min-height: 100vh; width: 100%;
    display: flex; align-items: stretch; justify-content: center;
    background:
      radial-gradient(ellipse at 30% 15%, rgba(248, 215, 221, 0.55) 0%, transparent 50%),
      radial-gradient(ellipse at 75% 25%, rgba(218, 201, 232, 0.5) 0%, transparent 55%),
      radial-gradient(ellipse at 20% 75%, rgba(255, 230, 215, 0.5) 0%, transparent 55%),
      radial-gradient(ellipse at 85% 85%, rgba(196, 219, 236, 0.5) 0%, transparent 55%),
      linear-gradient(180deg, #FBF4F7 0%, #F5EEF5 50%, #F8F2F5 100%);
  }
  .phone-shell {
    width: 100%; max-width: 440px; min-height: 100vh;
    position: relative; display: flex; flex-direction: column; overflow: hidden;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(255, 240, 240, 0.6) 0%, transparent 60%),
      radial-gradient(ellipse at 0% 50%, rgba(230, 218, 245, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 100% 100%, rgba(196, 219, 236, 0.4) 0%, transparent 60%),
      #FDFAFB;
  }
  @media (min-width: 480px) {
    .phone-shell {
      min-height: auto; height: 90vh; max-height: 880px;
      margin: 2rem 0; border-radius: 36px;
      box-shadow: 0 30px 80px -20px rgba(120, 100, 150, 0.25),
                  0 0 0 1px rgba(155, 143, 181, 0.1);
    }
  }
  .sparkle {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, #F4D079 0%, rgba(244, 208, 121, 0) 70%);
    animation: twinkle ease-in-out infinite; pointer-events: none;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50%      { opacity: 1; transform: scale(1.4); }
  }
  .wash { position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none; opacity: 0.6; }

  .bubble-bot {
    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px);
    border: 1px solid rgba(155, 143, 181, 0.15);
    box-shadow: 0 4px 16px -6px rgba(120, 100, 150, 0.15);
  }
  .bubble-user {
    background: linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%);
    color: #4A3F5C;
    box-shadow: 0 4px 14px -4px rgba(200, 165, 200, 0.4);
  }
  .chip {
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(155, 143, 181, 0.2);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer; font-size: 14px; min-height: 38px;
  }
  .chip:hover { background: white; border-color: rgba(155, 143, 181, 0.4); }
  .chip.selected {
    background: linear-gradient(135deg, #C9B8E8 0%, #E8B5C5 100%);
    color: #4A3F5C; border-color: transparent; font-weight: 500;
  }
  .primary-btn {
    background: linear-gradient(135deg, #B5A0DD 0%, #E89BAE 100%);
    color: white; transition: all 0.2s ease;
    box-shadow: 0 4px 14px -4px rgba(180, 140, 180, 0.4);
  }
  .primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px -4px rgba(180, 140, 180, 0.5);
  }
  .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .ghost-btn {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(155, 143, 181, 0.25);
    color: #5A4E6B; transition: all 0.2s ease;
  }
  .ghost-btn:hover { background: white; }
  .back-btn {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(155, 143, 181, 0.2);
    color: #7A6E89; transition: all 0.2s ease;
    font-size: 11px; letter-spacing: 0.04em;
  }
  .back-btn:hover { background: white; color: #5A4E6B; }
  .skip-btn {
    background: transparent;
    color: #9B8FB5; transition: all 0.2s ease;
    font-size: 11px; letter-spacing: 0.04em;
  }
  .skip-btn:hover { color: #5A4E6B; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #9B8FB5; animation: bounce 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.15s; }
  .dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%           { transform: translateY(-4px); opacity: 1; }
  }
  .msg-enter { animation: msgIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .intro-enter { animation: introIn 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  @keyframes introIn { from { opacity: 0; transform: scale(0.94) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .dove-bob { animation: bob 4s ease-in-out infinite; }
  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .progress-track { height: 3px; background: rgba(155, 143, 181, 0.15); border-radius: 3px; overflow: hidden; }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #C9B8E8, #E89BAE, #F5C9A8);
    transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); border-radius: 3px;
  }
  textarea, input { outline: none; } textarea { resize: none; }
  .scroll::-webkit-scrollbar { width: 4px; }
  .scroll::-webkit-scrollbar-thumb { background: rgba(155, 143, 181, 0.2); border-radius: 2px; }
  .example-card { background: rgba(255, 250, 232, 0.7); border: 1px dashed rgba(232, 194, 107, 0.5); }
  .summary-card,
  .mentor-card {
    background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 40px -16px rgba(120, 100, 150, 0.25);
  }
  .mentor-card { cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .mentor-card:hover { transform: translateY(-2px); box-shadow: 0 20px 48px -16px rgba(120, 100, 150, 0.32); }

  .score-ring {
    background: conic-gradient(#B5A0DD var(--pct, 0%), rgba(155, 143, 181, 0.15) var(--pct, 0%));
  }
  .badge {
    background: rgba(232, 194, 107, 0.2);
    border: 1px solid rgba(232, 194, 107, 0.4);
    color: #946A14;
  }

  .modal-bg {
    position: absolute; inset: 0;
    background: rgba(90, 78, 107, 0.45);
    backdrop-filter: blur(6px);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 30;
    animation: fadeIn 0.25s ease both;
  }
  @media (min-width: 480px) {
    .modal-bg { align-items: center; }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-sheet {
    background: white;
    width: 100%; max-width: 440px;
    border-radius: 28px 28px 0 0;
    padding: 24px 20px 24px;
    animation: slideUp 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  @media (min-width: 480px) {
    .modal-sheet { border-radius: 28px; max-width: 380px; }
  }
  @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* ─── iOS Liquid Glass — bottom nav ─── */
  .tab-bar-shell {
    position: absolute;
    left: 12px; right: 12px;
    bottom: max(14px, env(safe-area-inset-bottom));
    z-index: 30;
    pointer-events: none;
  }
  .tab-bar {
    pointer-events: auto;
    display: flex; align-items: stretch;
    padding: 8px 6px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.38) 100%);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border-radius: 32px;
    border: 0.5px solid rgba(255, 255, 255, 0.6);
    box-shadow:
      0 16px 40px -8px rgba(120, 100, 150, 0.28),
      0 0 0 0.5px rgba(155, 143, 181, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -1px 0 rgba(155, 143, 181, 0.08);
  }
  .tab-btn {
    flex: 1; position: relative;
    background: transparent; border: none; cursor: pointer;
    padding: 7px 0 5px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    color: rgba(122, 110, 137, 0.65);
    transition: color 0.25s ease, transform 0.2s ease;
  }
  .tab-btn:active { transform: scale(0.94); }
  .tab-btn:hover { color: rgba(90, 78, 107, 0.85); }
  .tab-btn.active { color: #4A3F5C; }
  .tab-pill {
    position: absolute;
    top: 2px; left: 50%;
    transform: translateX(-50%) scale(0.7);
    width: 50px; height: 30px;
    border-radius: 15px;
    background: linear-gradient(135deg, rgba(201, 184, 232, 0.95) 0%, rgba(232, 181, 197, 0.88) 100%);
    box-shadow:
      0 3px 10px -2px rgba(180, 140, 180, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    z-index: 0;
  }
  .tab-btn.active .tab-pill {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  .tab-icon-wrap { position: relative; z-index: 1; }
  .tab-label {
    font-size: 10px; letter-spacing: 0.02em; font-weight: 500;
    position: relative; z-index: 1;
  }

  /* ─── Liquid Glass — generic card variant ─── */
  .glass-card {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 0.5px solid rgba(255, 255, 255, 0.65);
    box-shadow:
      0 8px 24px -8px rgba(120, 100, 150, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }
`;
