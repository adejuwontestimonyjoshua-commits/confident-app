import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a growth advisor for Testimony, a Nigerian female entrepreneur selling "The Confident V Complete Bundle" — a women's feminine health ebook bundle priced at ₦8,500 on Selar.co. The bundle includes: the main guide (why toilet infections keep recurring + remedies), a Symptom Checker, a 7-Day Reset Protocol, a Foods That Fight reference card, and a Never Do This hygiene habit audit. Target audience: Nigerian women aged 18–45 dealing with recurring vaginal infections. Testimony has zero advertising budget and needs her first 20 sales through organic Facebook/Instagram marketing and free micro-influencer collaborations. Always give practical, specific, Nigeria-relevant advice. Be concise and actionable.`;

const OPPORTUNITIES = [
  { id: 1, title: "Facebook Group Organic Posting", demand: 9, competition: "Low", cost: "Free", successRate: 80, speed: "Days", action: "Find 10 Nigerian women's health Facebook groups and post your story today" },
  { id: 2, title: "Micro-Influencer Free Collab", demand: 9, competition: "Low", cost: "Free", successRate: 75, speed: "1–2 Weeks", action: "DM 5 influencers offering a free bundle copy in exchange for an honest post" },
  { id: 3, title: "WhatsApp Broadcast Campaign", demand: 8, competition: "Low", cost: "Free", successRate: 72, speed: "Days", action: "Broadcast to your contacts with a personal story + Selar link" },
  { id: 4, title: "TikTok Organic Video Series", demand: 9, competition: "Medium", cost: "Free", successRate: 65, speed: "2–3 Weeks", action: "Post 3 videos: '5 things ruining your feminine health' style content" },
  { id: 5, title: "Instagram Reels Education Series", demand: 8, competition: "Medium", cost: "Free", successRate: 65, speed: "2 Weeks", action: "Create 60-second reels on symptoms women ignore — link in bio to Selar" },
  { id: 6, title: "Selar Affiliate Activation", demand: 8, competition: "Low", cost: "Free", successRate: 60, speed: "1–2 Weeks", action: "Set up affiliates on Selar and recruit 5 women to promote for commission" },
  { id: 7, title: "Reddit Women's Communities", demand: 7, competition: "Low", cost: "Free", successRate: 55, speed: "2 Weeks", action: "Share educational posts in r/TheGirlSurvivalGuide, r/Healthyhooha" },
  { id: 8, title: "Email Outreach to Women Bloggers", demand: 7, competition: "Low", cost: "Free", successRate: 55, speed: "2–3 Weeks", action: "Find 10 Nigerian women's health bloggers and offer a free review copy" },
];

const QUICK_PROMPTS = [
  "Find me the top 5 Nigerian Facebook groups where women discuss health and infections — give me the exact group names to search",
  "Give me 5 viral content hooks for The Confident V that would stop Nigerian women from scrolling",
  "Write me a WhatsApp broadcast message to send to my contacts about The Confident V bundle",
  "What are the 3 highest-ROI actions I should take TODAY to get my first sale?",
  "Write a compelling Facebook group post about feminine infections that subtly promotes my bundle",
  "Give me a complete week-by-week plan to hit 20 sales with zero budget",
];

const CONTENT_TYPES = ["Facebook Post", "WhatsApp Message", "Instagram Caption", "DM Script", "TikTok Script", "Email"];
const TONES = ["Empathetic", "Urgent", "Story-based", "Educational", "Conversational"];
const PLATFORMS = ["Facebook", "Instagram", "TikTok", "WhatsApp", "YouTube", "Twitter/X"];
const STATUSES = ["To Contact", "Contacted", "Replied", "Agreed", "Posted", "Sale! 🎉"];
const STATUS_COLORS = { "To Contact": "#888", "Contacted": "#6b2d8b", "Replied": "#e6a817", "Agreed": "#2980b9", "Posted": "#27ae60", "Sale! 🎉": "#d4526a" };

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const store = {
  async get(key) { try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} },
};

// ─── CLAUDE API ───────────────────────────────────────────────────────────────
async function askClaude(userMessage, extra = "") {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT + extra,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Sorry, something went wrong. Please try again.";
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    brain: "M9.5 2a4.5 4.5 0 014.5 4.5v.5h1a3 3 0 013 3v.5a3 3 0 01-3 3h-1v3a2 2 0 01-2 2h-4a2 2 0 01-2-2v-3H5a3 3 0 01-3-3V10a3 3 0 013-3h1v-.5A4.5 4.5 0 019.5 2z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    pen: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    plus: "M12 5v14 M5 12h14",
    copy: "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-4-4H8z M14 2v4a2 2 0 002 2h4 M8 12h8 M8 16h4",
    send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    trash: "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18 M6 6l12 12",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
    target: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z M12 14a2 2 0 100-4 2 2 0 000 4z",
    chart: "M18 20V10 M12 20V4 M6 20v-6",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]?.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
    </svg>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [salesCount, setSalesCount] = useState(0);
  const [influencers, setInfluencers] = useState([]);
  const [researchHistory, setResearchHistory] = useState([]);
  const [savedContent, setSavedContent] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await store.get("sales"); if (s !== null) setSalesCount(s);
      const inf = await store.get("influencers"); if (inf) setInfluencers(inf);
      const rh = await store.get("research"); if (rh) setResearchHistory(rh);
      const sc = await store.get("content"); if (sc) setSavedContent(sc);
      setLoaded(true);
    })();
  }, []);

  const updateSales = async (n) => { setSalesCount(n); await store.set("sales", n); };
  const updateInfluencers = async (list) => { setInfluencers(list); await store.set("influencers", list); };
  const updateResearch = async (list) => { setResearchHistory(list); await store.set("research", list); };
  const updateContent = async (list) => { setSavedContent(list); await store.set("content", list); };

  if (!loaded) return (
    <div style={{ background: "#0f0f14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #6b2d8b", borderTopColor: "#d4526a", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#888", fontFamily: "sans-serif" }}>Loading Confident Five HQ...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "influencers", label: "Outreach", icon: "users" },
    { id: "research", label: "AI Brain", icon: "brain" },
    { id: "opportunities", label: "Opps", icon: "target" },
    { id: "content", label: "Content", icon: "pen" },
  ];

  return (
    <div style={{ background: "#0f0f14", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#f0f0f2", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1a24; } ::-webkit-scrollbar-thumb { background: #6b2d8b; border-radius: 2px; }
        * { box-sizing: border-box; }
        textarea, input, select { outline: none; font-family: inherit; }
        button { cursor: pointer; font-family: inherit; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6b2d8b 0%, #d4526a 100%)", padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", margin: 0 }}>AI Growth System</p>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Confident Five HQ</h1>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "6px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{salesCount}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.1em" }}>of 20 sales</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 12, background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min((salesCount / 20) * 100, 100)}%`, background: "rgba(255,255,255,0.9)", borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Tab content */}
      <div style={{ paddingBottom: 80, minHeight: "calc(100vh - 140px)" }}>
        {tab === "dashboard" && <Dashboard salesCount={salesCount} updateSales={updateSales} influencers={influencers} />}
        {tab === "influencers" && <Influencers influencers={influencers} updateInfluencers={updateInfluencers} />}
        {tab === "research" && <Research researchHistory={researchHistory} updateResearch={updateResearch} />}
        {tab === "opportunities" && <Opportunities />}
        {tab === "content" && <ContentStudio savedContent={savedContent} updateContent={updateContent} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#16161f", borderTop: "1px solid #2a2a35", display: "flex", zIndex: 200 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", color: tab === t.id ? "#d4526a" : "#555", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "color 0.2s" }}>
            <Icon name={t.icon} size={18} />
            <span style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 400, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ salesCount, updateSales, influencers }) {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const contacted = influencers.filter(i => i.status !== "To Contact").length;
  const replied = influencers.filter(i => ["Replied", "Agreed", "Posted", "Sale! 🎉"].includes(i.status)).length;

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await askClaude("Give me exactly 3 specific actions I should take TODAY to move closer to my first sale of The Confident V bundle. For each action, give: Action title, exactly what to do (be very specific), and why it will work. Format as 3 numbered items.");
      setPlan(res);
    } catch { setPlan("Failed to load. Check your connection and try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px 16px" }} className="fade-in">
      {/* Sale tracker */}
      <div style={{ background: "#1a1a24", borderRadius: 16, padding: 20, marginBottom: 16, border: "1px solid #2a2a35" }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sales Tracker</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => updateSales(Math.max(0, salesCount - 1))} style={{ width: 40, height: 40, borderRadius: "50%", background: "#2a2a35", border: "none", color: "#f0f0f2", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, background: "linear-gradient(90deg,#6b2d8b,#d4526a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{salesCount}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>sales of 20 goal · ₦{(salesCount * 8500).toLocaleString()} earned</div>
          </div>
          <button onClick={() => updateSales(salesCount + 1)} style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Influencers", value: influencers.length },
          { label: "Contacted", value: contacted },
          { label: "Replied", value: replied },
        ].map(s => (
          <div key={s.label} style={{ background: "#1a1a24", borderRadius: 12, padding: "14px 10px", textAlign: "center", border: "1px solid #2a2a35" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#d4526a" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's starter tip */}
      <div style={{ background: "linear-gradient(135deg, rgba(107,45,139,0.2), rgba(212,82,106,0.2))", border: "1px solid rgba(212,82,106,0.3)", borderRadius: 16, padding: 18, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Icon name="star" size={14} />
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#d4526a", fontWeight: 700 }}>Quick Win Today</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#e0e0e8" }}>Search Facebook for <strong style={{ color: "#fff" }}>"Nigerian Women Health"</strong>, <strong style={{ color: "#fff" }}>"Naija Ladies Forum"</strong>, and <strong style={{ color: "#fff" }}>"Nigerian Sisters Support"</strong>. Join 3 groups and post a relatable story about feminine infections — no selling, just your story. Drop the Selar link only in comments when people ask.</p>
      </div>

      {/* AI Daily Plan */}
      <div style={{ background: "#1a1a24", borderRadius: 16, padding: 18, border: "1px solid #2a2a35" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="zap" size={14} />
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b2d8b", fontWeight: 700 }}>AI Daily Plan</span>
          </div>
          <button onClick={generatePlan} disabled={loading} style={{ background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Thinking..." : "Generate Plan"}
          </button>
        </div>
        {plan ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#ccc", whiteSpace: "pre-wrap" }}>{plan}</p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#555", textAlign: "center", padding: "16px 0" }}>Tap "Generate Plan" for AI-powered actions tailored to your situation right now.</p>
        )}
      </div>
    </div>
  );
}

// ─── INFLUENCER TRACKER ────────────────────────────────────────────────────────
function Influencers({ influencers, updateInfluencers }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "Facebook", followers: "", niche: "", notes: "" });
  const [dmScripts, setDmScripts] = useState({});
  const [loadingDm, setLoadingDm] = useState({});
  const [filter, setFilter] = useState("All");

  const statusCounts = STATUSES.reduce((acc, s) => { acc[s] = influencers.filter(i => i.status === s).length; return acc; }, {});

  const addInfluencer = async () => {
    if (!form.name.trim()) return;
    const newList = [...influencers, { ...form, id: Date.now(), status: "To Contact", discountCode: form.name.toUpperCase().replace(/\s/g, "").slice(0, 6) + "10" }];
    await updateInfluencers(newList);
    setForm({ name: "", platform: "Facebook", followers: "", niche: "", notes: "" });
    setShowForm(false);
  };

  const updateStatus = async (id, status) => {
    const newList = influencers.map(i => i.id === id ? { ...i, status } : i);
    await updateInfluencers(newList);
  };

  const deleteInfluencer = async (id) => {
    await updateInfluencers(influencers.filter(i => i.id !== id));
  };

  const getDmScript = async (inf) => {
    setLoadingDm(p => ({ ...p, [inf.id]: true }));
    try {
      const res = await askClaude(`Write a short, friendly DM to send to ${inf.name}, a ${inf.platform} creator in the ${inf.niche || "women's lifestyle"} niche with ${inf.followers || "a few thousand"} followers. Offer them a FREE copy of The Confident V Complete Bundle (valued at ₦8,500) in exchange for sharing their honest experience with their audience. Make it feel personal, not spammy. Keep it under 120 words. Don't include any placeholder brackets — write it as a real message ready to send.`);
      setDmScripts(p => ({ ...p, [inf.id]: res }));
    } catch { setDmScripts(p => ({ ...p, [inf.id]: "Failed to generate. Try again." })); }
    setLoadingDm(p => ({ ...p, [inf.id]: false }));
  };

  const filtered = filter === "All" ? influencers : influencers.filter(i => i.status === filter);

  return (
    <div style={{ padding: "20px 16px" }} className="fade-in">
      {/* Stats pipeline */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {["All", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 99, border: `1px solid ${filter === s ? "#d4526a" : "#2a2a35"}`, background: filter === s ? "rgba(212,82,106,0.15)" : "#1a1a24", color: filter === s ? "#d4526a" : "#888", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
            {s} {s !== "All" ? `(${statusCounts[s] || 0})` : `(${influencers.length})`}
          </button>
        ))}
      </div>

      {/* Add button */}
      <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Icon name="plus" size={16} /> Add Influencer
      </button>

      {/* Add form */}
      {showForm && (
        <div style={{ background: "#1a1a24", borderRadius: 16, padding: 18, marginBottom: 16, border: "1px solid #2a2a35" }} className="fade-in">
          {[
            { key: "name", placeholder: "Full name or handle", label: "Name *" },
            { key: "followers", placeholder: "e.g. 5000", label: "Followers" },
            { key: "niche", placeholder: "e.g. women's health, lifestyle", label: "Niche" },
            { key: "notes", placeholder: "Any notes about them", label: "Notes" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: "#0f0f14", border: "1px solid #2a2a35", borderRadius: 8, padding: "10px 12px", color: "#f0f0f2", fontSize: 14 }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>Platform</label>
            <select value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} style={{ width: "100%", background: "#0f0f14", border: "1px solid #2a2a35", borderRadius: 8, padding: "10px 12px", color: "#f0f0f2", fontSize: 14 }}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#2a2a35", border: "none", color: "#888", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 600 }}>Cancel</button>
            <button onClick={addInfluencer} style={{ flex: 2, background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700 }}>Add to Tracker</button>
          </div>
        </div>
      )}

      {/* Influencer cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#555" }}>
          <Icon name="users" size={40} />
          <p style={{ marginTop: 12, fontSize: 14 }}>No influencers yet. Add your first one above!</p>
        </div>
      ) : filtered.map(inf => (
        <div key={inf.id} style={{ background: "#1a1a24", borderRadius: 16, padding: 16, marginBottom: 12, border: "1px solid #2a2a35" }} className="fade-in">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{inf.name}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10, background: "rgba(107,45,139,0.3)", color: "#b08ed6", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{inf.platform}</span>
                {inf.followers && <span style={{ fontSize: 10, background: "#2a2a35", color: "#888", borderRadius: 99, padding: "2px 8px" }}>{Number(inf.followers).toLocaleString()} followers</span>}
              </div>
            </div>
            <button onClick={() => deleteInfluencer(inf.id)} style={{ background: "none", border: "none", color: "#555", padding: 4 }}><Icon name="trash" size={14} /></button>
          </div>

          {inf.niche && <p style={{ margin: "0 0 10px", fontSize: 12, color: "#888" }}>Niche: {inf.niche}</p>}

          {/* Discount code */}
          <div style={{ background: "#0f0f14", borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#888" }}>Discount code:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e6a817", fontFamily: "monospace" }}>{inf.discountCode}</span>
          </div>

          {/* Status selector */}
          <select value={inf.status} onChange={e => updateStatus(inf.id, e.target.value)} style={{ width: "100%", background: "#0f0f14", border: `1px solid ${STATUS_COLORS[inf.status] || "#2a2a35"}`, borderRadius: 8, padding: "8px 12px", color: STATUS_COLORS[inf.status] || "#f0f0f2", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* DM Script button */}
          <button onClick={() => getDmScript(inf)} disabled={loadingDm[inf.id]} style={{ width: "100%", background: "rgba(107,45,139,0.2)", border: "1px solid #6b2d8b", color: "#b08ed6", borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 600, marginBottom: dmScripts[inf.id] ? 10 : 0 }}>
            {loadingDm[inf.id] ? "Writing your DM..." : "✍️ Generate DM Script"}
          </button>

          {dmScripts[inf.id] && (
            <div style={{ background: "#0f0f14", borderRadius: 8, padding: 12, marginTop: 4 }} className="fade-in">
              <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.7, color: "#ccc" }}>{dmScripts[inf.id]}</p>
              <button onClick={() => navigator.clipboard?.writeText(dmScripts[inf.id])} style={{ background: "none", border: "1px solid #2a2a35", color: "#888", borderRadius: 6, padding: "5px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                <Icon name="copy" size={11} /> Copy
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── AI RESEARCH ──────────────────────────────────────────────────────────────
function Research({ researchHistory, updateResearch }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setLoading(true);
    setInput("");
    try {
      const res = await askClaude(q);
      const newHistory = [{ id: Date.now(), question: q, answer: res }, ...researchHistory];
      await updateResearch(newHistory.slice(0, 20));
    } catch { }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px 16px" }} className="fade-in">
      <p style={{ margin: "0 0 14px", fontSize: 12, color: "#888" }}>Ask anything about growing your sales, finding customers, or creating content.</p>

      {/* Quick prompts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {QUICK_PROMPTS.map((p, i) => (
          <button key={i} onClick={() => ask(p)} disabled={loading} style={{ background: "#1a1a24", border: "1px solid #2a2a35", color: "#ccc", borderRadius: 10, padding: "10px 14px", fontSize: 12, textAlign: "left", lineHeight: 1.5 }}>
            ⚡ {p}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder="Ask anything..." style={{ flex: 1, background: "#1a1a24", border: "1px solid #2a2a35", borderRadius: 10, padding: "11px 14px", color: "#f0f0f2", fontSize: 14 }} />
        <button onClick={() => ask()} disabled={loading || !input.trim()} style={{ background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 10, padding: "11px 16px", opacity: loading || !input.trim() ? 0.6 : 1 }}>
          <Icon name="send" size={16} />
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "24px", color: "#888", fontSize: 13 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #6b2d8b", borderTopColor: "#d4526a", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
          Researching for you...
        </div>
      )}

      {researchHistory.map(item => (
        <div key={item.id} style={{ background: "#1a1a24", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #2a2a35" }} className="fade-in">
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b2d8b", fontWeight: 700, background: "rgba(107,45,139,0.1)", padding: "6px 10px", borderRadius: 6 }}>Q: {item.question}</p>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#ccc", whiteSpace: "pre-wrap" }}>{item.answer}</p>
        </div>
      ))}

      {researchHistory.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "#555" }}>
          <Icon name="brain" size={40} />
          <p style={{ marginTop: 12, fontSize: 14 }}>Tap any quick prompt above or ask your own question</p>
        </div>
      )}
    </div>
  );
}

// ─── OPPORTUNITIES ─────────────────────────────────────────────────────────────
function Opportunities() {
  const [opps, setOpps] = useState(OPPORTUNITIES);
  const [loading, setLoading] = useState(false);

  const discoverMore = async () => {
    setLoading(true);
    try {
      const res = await askClaude(`Give me 3 NEW growth opportunities for selling The Confident V bundle that I haven't tried yet. For each give: Title, why it works for Nigerian women's health products, exact first action to take, estimated success rate (as a %), competition level (Low/Medium/High), cost (Free or amount), and speed to first result. Format clearly.`);
      const newOpp = { id: Date.now(), title: "AI Discovery", demand: "?", competition: "See below", cost: "Free", successRate: "?", speed: "Varies", action: res, isAi: true };
      setOpps(p => [newOpp, ...p]);
    } catch { }
    setLoading(false);
  };

  const demandColor = (d) => d >= 8 ? "#27ae60" : d >= 6 ? "#e6a817" : "#d4526a";

  return (
    <div style={{ padding: "20px 16px" }} className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Ranked by success probability</p>
        <button onClick={discoverMore} disabled={loading} style={{ background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="refresh" size={12} /> {loading ? "Finding..." : "Discover More"}
        </button>
      </div>

      {opps.map((opp, idx) => (
        <div key={opp.id} style={{ background: "#1a1a24", borderRadius: 14, padding: 16, marginBottom: 12, border: "1px solid #2a2a35" }} className="fade-in">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6b2d8b,#d4526a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{idx + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{opp.title}</div>
              {!opp.isAi && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, background: "rgba(39,174,96,0.15)", color: demandColor(opp.demand), borderRadius: 99, padding: "2px 7px", fontWeight: 700 }}>Demand {opp.demand}/10</span>
                  <span style={{ fontSize: 10, background: "#2a2a35", color: "#888", borderRadius: 99, padding: "2px 7px" }}>{opp.competition} competition</span>
                  <span style={{ fontSize: 10, background: "rgba(230,168,23,0.15)", color: "#e6a817", borderRadius: 99, padding: "2px 7px", fontWeight: 700 }}>{opp.successRate}% success</span>
                  <span style={{ fontSize: 10, background: "rgba(107,45,139,0.2)", color: "#b08ed6", borderRadius: 99, padding: "2px 7px" }}>{opp.speed}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ background: "#0f0f14", borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.7, whiteSpace: opp.isAi ? "pre-wrap" : "normal" }}>
              {opp.isAi ? "🤖 " : "→ "}{opp.action}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CONTENT STUDIO ───────────────────────────────────────────────────────────
function ContentStudio({ savedContent, updateContent }) {
  const [type, setType] = useState("Facebook Post");
  const [tone, setTone] = useState("Empathetic");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setGenerated("");
    try {
      const res = await askClaude(`Write a ${type} in a ${tone} tone to promote The Confident V Complete Bundle (₦8,500 on Selar.co). The content should speak directly to Nigerian women who experience recurring vaginal infections. Make it feel real, relatable, and human — not like an advertisement. If it's a post, make it shareable. If it's a DM, make it personal. If it's a script, make it conversational. Include a subtle call to action at the end. Do not include placeholder brackets like [your name] — write it ready to use.`);
      setGenerated(res);
    } catch { setGenerated("Generation failed. Please try again."); }
    setLoading(false);
  };

  const save = async () => {
    if (!generated) return;
    const newList = [{ id: Date.now(), type, tone, content: generated }, ...savedContent];
    await updateContent(newList.slice(0, 30));
  };

  const copy = () => {
    navigator.clipboard?.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteContent = async (id) => {
    await updateContent(savedContent.filter(c => c.id !== id));
  };

  return (
    <div style={{ padding: "20px 16px" }} className="fade-in">
      {/* Selectors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Content Type</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", background: "#1a1a24", border: "1px solid #2a2a35", borderRadius: 8, padding: "9px 10px", color: "#f0f0f2", fontSize: 13 }}>
            {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: "100%", background: "#1a1a24", border: "1px solid #2a2a35", borderRadius: 8, padding: "9px 10px", color: "#f0f0f2", fontSize: 13 }}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#6b2d8b,#d4526a)", border: "none", color: "#fff", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Writing your content..." : "✨ Generate Content"}
      </button>

      {loading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: 13 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #6b2d8b", borderTopColor: "#d4526a", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
          Writing your {type}...
        </div>
      )}

      {generated && (
        <div style={{ background: "#1a1a24", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #2a2a35" }} className="fade-in">
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 10, background: "rgba(107,45,139,0.3)", color: "#b08ed6", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>{type}</span>
            <span style={{ fontSize: 10, background: "#2a2a35", color: "#888", borderRadius: 99, padding: "2px 8px" }}>{tone}</span>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.8, color: "#e0e0e8", whiteSpace: "pre-wrap" }}>{generated}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copy} style={{ flex: 1, background: copied ? "rgba(39,174,96,0.2)" : "#2a2a35", border: `1px solid ${copied ? "#27ae60" : "#3a3a45"}`, color: copied ? "#27ae60" : "#ccc", borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon name={copied ? "check" : "copy"} size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={save} style={{ flex: 1, background: "rgba(107,45,139,0.2)", border: "1px solid #6b2d8b", color: "#b08ed6", borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon name="star" size={12} /> Save
            </button>
          </div>
        </div>
      )}

      {/* Saved content */}
      {savedContent.length > 0 && (
        <>
          <p style={{ margin: "0 0 10px", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Saved Content ({savedContent.length})</p>
          {savedContent.map(c => (
            <div key={c.id} style={{ background: "#1a1a24", borderRadius: 12, padding: 14, marginBottom: 10, border: "1px solid #2a2a35" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, background: "rgba(107,45,139,0.3)", color: "#b08ed6", borderRadius: 99, padding: "2px 8px" }}>{c.type}</span>
                  <span style={{ fontSize: 10, background: "#2a2a35", color: "#888", borderRadius: 99, padding: "2px 8px" }}>{c.tone}</span>
                </div>
                <button onClick={() => deleteContent(c.id)} style={{ background: "none", border: "none", color: "#555", padding: 2 }}><Icon name="trash" size={12} /></button>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#aaa", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{c.content.slice(0, 200)}{c.content.length > 200 ? "..." : ""}</p>
              <button onClick={() => navigator.clipboard?.writeText(c.content)} style={{ background: "none", border: "1px solid #2a2a35", color: "#666", borderRadius: 6, padding: "4px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="copy" size={10} /> Copy full
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
