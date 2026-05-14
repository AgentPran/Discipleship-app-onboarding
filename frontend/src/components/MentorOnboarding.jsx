import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Send, ArrowRight, Check, Plus, X,
  ChevronLeft, SkipForward,
} from "lucide-react";
import { DoveIcon, DoveHero, Backdrop, GLOBAL_STYLE } from "./Visual.jsx";

const CONVERSATION = [
  {
    id: "welcome", type: "intro",
    message: "Hello, friend. I'm here to help you find someone who can walk this journey with you. Let's begin gently.",
    cta: "Begin",
  },
  {
    id: "name", type: "text",
    message: "First — what shall I call you?",
    field: "name", placeholder: "Your first name", skippable: true,
  },
  {
    id: "email", type: "text",
    message: "Your email?",
    field: "email", placeholder: "you@example.com", skippable: true,
  },
  {
    id: "lifeStage", type: "multi",
    message: "Where would you say you are in life right now? Pick what fits, or add your own.",
    field: "lifeStage", min: 1, max: 2,
    options: [
      "Studying or graduating", "Starting my career", "Figuring things out",
      "Marriage & coupledom", "Parenthood", "Mid-career",
      "Empty nester", "Stepping into vocation", "Getting settled", "Retired",
    ],
    skippable: true,
  },
  {
    id: "support", type: "multi",
    message: "What kind of support are you hoping a mentor could offer you? Choose any that feel right, or add your own.",
    subtitle: "Pick 1–4.",
    field: "support", min: 1, max: 4,
    options: [
      "Spiritual growth", "Leadership", "Relationships & marriage",
      "Career & finances", "Service & mission", "Healing & personal life",
    ],
    skippable: true,
  },
  {
    id: "strengths", type: "multi",
    message: "These are the threads of who you are. Which feel most like you? You can also add your own.",
    subtitle: "Choose 5–7 that resonate most.",
    field: "strengths", min: 5, max: 7,
    options: [
      "Creativity", "Curiosity", "Love of learning", "Perspective",
      "Bravery", "Perseverance", "Honesty", "Zest for life",
      "Kindness", "Capacity to love", "Social intelligence", "Teamwork",
      "Fairness", "Leadership", "Forgiveness", "Humility",
      "Prudence", "Self-discipline", "Gratitude", "Hope",
      "Humor", "Spirituality", "Appreciation of beauty", "Wisdom",
    ],
    skippable: true,
  },
  {
    id: "faith", type: "multi",
    message: "And where are you in your faith journey? Pick or add your own.",
    subtitle: "Choose anything that feels true.",
    field: "faith", min: 1, max: 3,
    options: [
      "Exploring faith", "New believer", "Growing believer",
      "I love to serve", "I disciple others",
      "I can guide others to faith", "I lead other disciplers",
    ],
    skippable: true,
  },
  {
    id: "interests", type: "multi",
    message: "What do you love doing? Pick anything that brings you life — or add your own.",
    subtitle: "Choose 3–8.",
    field: "interests", min: 3, max: 8,
    options: [
      "Reading", "Music", "Cooking", "Hiking", "Art", "Sports", "Travel",
      "Photography", "Writing", "Gardening", "Yoga", "Movies",
      "Coffee", "Tea", "Dancing", "Crafts", "Volunteering",
      "Worship music", "Board games", "Fitness",
    ],
    skippable: true,
  },
  {
    id: "description", type: "longtext",
    message: (d) => `Almost there${d.name ? `, ${d.name}` : ""}. Tell me a little about yourself in your own words — it helps your mentor really know you.`,
    field: "description",
    example: "I'm a 28-year-old graphic designer trying to figure out where God's calling me next. I love deep conversations over coffee and honest people who'll speak truth in love. I'm hoping to find someone who's walked through career uncertainty themselves.",
    placeholder: "Start writing here...",
    skippable: true,
  },
  {
    id: "complete", type: "done",
    message: (d) => `Beautiful${d.name ? `, ${d.name}` : ""}. Your profile is complete — you can keep refining it whenever you like.`,
  },
];

export default function MentorOnboarding({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [userData, setUserData] = useState({});
  const [textValue, setTextValue] = useState("");
  const [picks, setPicks] = useState([]);
  const [customAdd, setCustomAdd] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hasCalledComplete, setHasCalledComplete] = useState(false);
  const scrollRef = useRef(null);

  const step = CONVERSATION[stepIdx];
  const totalSteps = CONVERSATION.length;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [history, isTyping]);

  const handleFinish = () => {
    if (hasCalledComplete) return;
    setHasCalledComplete(true);
    onComplete && onComplete(userData);
  };

  const pushBotMessage = (text, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setHistory((h) => [...h, { sender: "bot", content: text, id: Date.now() + Math.random() }]);
      setIsTyping(false);
    }, delay);
  };
  const resolveMessage = (msg, data) => (typeof msg === "function" ? msg(data) : msg);

  const startConversation = () => {
    setShowIntro(false);
    setStepIdx(1);
    setTimeout(() => pushBotMessage(resolveMessage(CONVERSATION[1].message, userData), 400), 300);
  };

  const advance = (cur, displayed, stored) => {
    setHistory((h) => [...h, {
      sender: "user", content: displayed, kind: cur.type,
      chips: cur.type === "multi" ? (Array.isArray(stored) ? stored : []) : null,
      id: Date.now() + Math.random(),
    }]);
    const nextData = { ...userData, [cur.field]: stored };
    setUserData(nextData);
    setTextValue(""); setPicks([]); setCustomAdd("");
    const nextIdx = stepIdx + 1;
    setStepIdx(nextIdx);
    if (nextIdx < CONVERSATION.length) {
      pushBotMessage(resolveMessage(CONVERSATION[nextIdx].message, nextData), 1100);
    }
  };

  const handleSubmit = (raw) => {
    const cur = CONVERSATION[stepIdx];
    if (cur.type === "multi") advance(cur, picks.join(" · "), [...picks]);
    else advance(cur, raw, raw);
  };
  const handleSkip = () => {
    const cur = CONVERSATION[stepIdx];
    advance(cur, "(skipped)", cur.type === "multi" ? [] : "");
  };

  const goBack = () => {
    if (stepIdx <= 1 || isTyping) return;
    const prevIdx = stepIdx - 1;
    const prevStep = CONVERSATION[prevIdx];
    setHistory((h) => {
      const copy = [...h];
      while (copy.length && copy[copy.length - 1].sender === "bot") copy.pop();
      while (copy.length && copy[copy.length - 1].sender === "user") { copy.pop(); break; }
      return copy;
    });
    const prevAnswer = userData[prevStep.field];
    if (prevStep.type === "multi") {
      setPicks(Array.isArray(prevAnswer) ? [...prevAnswer] : []);
      setTextValue("");
    } else {
      setTextValue(typeof prevAnswer === "string" ? prevAnswer : "");
      setPicks([]);
    }
    setCustomAdd("");
    setUserData((d) => { const c = { ...d }; delete c[prevStep.field]; return c; });
    setStepIdx(prevIdx);
  };

  const togglePick = (label) => {
    setPicks((p) => {
      if (p.includes(label)) return p.filter((x) => x !== label);
      if (step.max && p.length >= step.max) return p;
      return [...p, label];
    });
  };
  const addCustomChip = () => {
    const val = customAdd.trim();
    if (!val) return;
    if (picks.includes(val)) { setCustomAdd(""); return; }
    if (step.max && picks.length >= step.max) return;
    setPicks((p) => [...p, val]);
    setCustomAdd("");
  };

  const canSubmit = useMemo(() => {
    if (!step) return false;
    if (step.type === "text" || step.type === "longtext") return textValue.trim().length > 0;
    if (step.type === "multi") return picks.length >= (step.min || 1);
    return false;
  }, [step, textValue, picks]);

  const isDone = stepIdx >= CONVERSATION.length - 1 && !showIntro;
  const canGoBack = !showIntro && !isDone && !isTyping && stepIdx > 1;
  const canSkip = step?.skippable && !isTyping && !isDone;

  return (
    <div className="app-root">
      <style>{GLOBAL_STYLE}</style>
      <div className="phone-shell">
        <Backdrop />

        <header className="relative z-10 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <DoveIcon size={26} />
            <div>
              <div className="text-base font-semibold leading-none" style={{ color: "#5A4E6B" }}>Discipleship</div>
              <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#9B8FB5" }}>Walk with a mentor</div>
            </div>
          </div>
          {!showIntro && !isDone && (
            <div className="flex items-center gap-2 w-28">
              <div className="progress-track flex-1">
                <div className="progress-fill" style={{ width: `${(stepIdx / (totalSteps - 1)) * 100}%` }} />
              </div>
              <span className="text-[10px] tabular-nums" style={{ color: "#9B8FB5" }}>{stepIdx}/{totalSteps - 1}</span>
            </div>
          )}
        </header>

        {showIntro && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-10">
            <div className="intro-enter">
              <div className="dove-bob mb-2"><DoveHero /></div>
              <h1 className="text-4xl mb-3 leading-tight" style={{ color: "#5A4E6B", fontWeight: 300, letterSpacing: "-0.01em" }}>
                Be <em style={{ fontStyle: "italic", fontWeight: 400, color: "#B5A0DD" }}>known</em>,<br />before you're matched.
              </h1>
              <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: "#7A6E89" }}>
                A few gentle questions. No forms. Just a conversation about who you are and what you need.
              </p>
              <button onClick={startConversation} className="primary-btn px-8 py-3.5 rounded-full text-sm uppercase tracking-widest font-medium inline-flex items-center gap-2">
                Begin <ArrowRight size={15} />
              </button>
              <p className="text-[11px] mt-5" style={{ color: "#9B8FB5" }}>About 3 minutes · skip anything you'd rather not answer</p>
            </div>
          </div>
        )}

        {!showIntro && (
          <main className="relative z-10 flex-1 flex flex-col min-h-0">
            <div ref={scrollRef} className="scroll flex-1 overflow-y-auto px-4">
              <div className="py-5 space-y-4">
                {history.map((m) => (<MessageBubble key={m.id} message={m} />))}
                {isTyping && (
                  <div className="msg-enter flex items-end gap-2">
                    <DoveIcon size={22} />
                    <div className="bubble-bot rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                  </div>
                )}
                {isDone && (
                  <div className="msg-enter text-center py-6 px-4">
                    <div className="dove-bob inline-block mb-4"><DoveHero /></div>
                    <button
                      onClick={handleFinish}
                      disabled={hasCalledComplete}
                      className="primary-btn px-10 py-3.5 rounded-full text-sm uppercase tracking-widest font-medium inline-flex items-center gap-2"
                    >
                      {hasCalledComplete ? "Saving…" : (<>Finish profile <ArrowRight size={15} /></>)}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isDone && !isTyping && step && (
              <div className="px-4 pb-5 pt-2 shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  {canGoBack ? (
                    <button onClick={goBack} className="back-btn rounded-full px-3 py-1 inline-flex items-center gap-1 uppercase">
                      <ChevronLeft size={12} /> Edit previous
                    </button>
                  ) : <span />}
                  <div className="flex items-center gap-2">
                    {step.subtitle && (<span className="text-[11px]" style={{ color: "#9B8FB5" }}>{step.subtitle}</span>)}
                    {canSkip && (
                      <button onClick={handleSkip} className="skip-btn rounded-full px-2.5 py-1 inline-flex items-center gap-1 uppercase">
                        Skip <SkipForward size={11} />
                      </button>
                    )}
                  </div>
                </div>

                {step.type === "multi" && (
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-3 max-h-44 overflow-y-auto scroll">
                      {step.options.map((opt) => {
                        const selected = picks.includes(opt);
                        return (
                          <button key={opt} onClick={() => togglePick(opt)}
                            className={`chip ${selected ? "selected" : ""} px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5`}>
                            {opt}{selected && <Check size={13} />}
                          </button>
                        );
                      })}
                      {picks.filter((p) => !step.options.includes(p)).map((custom) => (
                        <button key={custom} onClick={() => togglePick(custom)}
                          className="chip selected px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                          {custom} <X size={13} />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-3 bg-white/80 rounded-full pl-4 pr-1.5 py-1.5 border border-purple-200/50">
                      <input value={customAdd} onChange={(e) => setCustomAdd(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomChip(); } }}
                        placeholder="Add your own…"
                        className="flex-1 bg-transparent text-sm py-1 placeholder:opacity-50" style={{ color: "#5A4E6B" }} />
                      <button onClick={addCustomChip} disabled={!customAdd.trim()}
                        className="ghost-btn w-7 h-7 rounded-full inline-flex items-center justify-center disabled:opacity-30">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: "#9B8FB5" }}>
                        {picks.length} selected{step.min && ` · min ${step.min}`}
                      </span>
                      <button onClick={() => handleSubmit(picks)} disabled={!canSubmit}
                        className="primary-btn px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5">
                        Continue <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {step.type === "text" && (
                  <div className="flex items-center gap-2 bg-white/85 rounded-full pl-4 pr-1.5 py-1.5 border border-purple-200/50">
                    <input value={textValue} onChange={(e) => setTextValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit(textValue.trim())}
                      placeholder={step.placeholder} autoFocus
                      className="flex-1 bg-transparent text-sm py-1.5 placeholder:opacity-50" style={{ color: "#5A4E6B" }} />
                    <button onClick={() => canSubmit && handleSubmit(textValue.trim())} disabled={!canSubmit}
                      className="primary-btn w-9 h-9 rounded-full inline-flex items-center justify-center shrink-0">
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {step.type === "longtext" && (
                  <div>
                    {step.example && (
                      <div className="example-card rounded-2xl p-3 mb-2.5">
                        <div className="text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: "#B89544" }}>
                          ✦ Example
                        </div>
                        <p className="text-[12.5px] leading-relaxed italic" style={{ color: "#7A6E89" }}>"{step.example}"</p>
                      </div>
                    )}
                    <div className="bg-white/85 rounded-2xl p-3 border border-purple-200/50">
                      <textarea value={textValue} onChange={(e) => setTextValue(e.target.value)}
                        placeholder={step.placeholder} rows={4}
                        className="w-full bg-transparent text-sm placeholder:opacity-50 leading-relaxed" style={{ color: "#5A4E6B" }} />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-100/50">
                        <span className="text-[10px]" style={{ color: "#9B8FB5" }}>{textValue.length} characters</span>
                        <button onClick={() => canSubmit && handleSubmit(textValue.trim())} disabled={!canSubmit}
                          className="primary-btn px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                          Continue <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  if (message.sender === "bot") {
    return (
      <div className="msg-enter flex items-end gap-2 max-w-[88%]">
        <div className="shrink-0 mb-1"><DoveIcon size={22} /></div>
        <div className="bubble-bot rounded-2xl rounded-bl-md px-4 py-3">
          <p className="text-[14.5px] leading-relaxed" style={{ color: "#5A4E6B" }}>{message.content}</p>
        </div>
      </div>
    );
  }
  const skipped = message.content === "(skipped)";
  return (
    <div className="msg-enter flex justify-end">
      <div className={`bubble-user rounded-2xl rounded-br-md px-4 py-3 max-w-[85%] ${skipped ? "opacity-60" : ""}`}>
        {message.chips && message.chips.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {message.chips.map((c) => (
              <span key={c} className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(255, 255, 255, 0.55)", border: "1px solid rgba(255, 255, 255, 0.6)", color: "#4A3F5C" }}>{c}</span>
            ))}
          </div>
        ) : (
          <p className={`text-[14px] leading-relaxed whitespace-pre-wrap ${skipped ? "italic" : ""}`}>{message.content}</p>
        )}
      </div>
    </div>
  );
}
