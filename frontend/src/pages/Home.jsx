import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import MicButton from "../components/MicButton";
import JourneyResult from "../components/JourneyResult";

// Turns a spoken sentence like "Kashmere Gate to IGI Airport" / "Noida se Rajiv Chowk"
// into { from, to }. If no separator is found, the whole phrase is treated as the destination.
function parseSpeech(text) {
  const parts = text.split(/\s+(?:to|se|से)\s+/i);
  if (parts.length >= 2) return { from: parts[0].trim(), to: parts.slice(1).join(" ").trim() };
  return { to: text.trim() };
}
const clean = (text) => text.replace(/[.।]$/, "").trim();

export default function Home() {
  const { t } = useLanguage();
  const [hubs, setHubs] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [priority, setPriority] = useState("balanced");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/journey/hubs").then(({ data }) => setHubs(data.hubs)).catch(() => {});
  }, []);

  const onVoice = useCallback((text) => {
    const parsed = parseSpeech(clean(text));
    if (parsed.from) setFrom(parsed.from);
    if (parsed.to) setTo(parsed.to);
  }, []);
  const onVoiceFrom = useCallback((text) => setFrom(clean(text)), []);
  const onVoiceTo = useCallback((text) => setTo(clean(text)), []);

  async function submit(e) {
    e.preventDefault();
    setError(""); setPlan(null); setLoading(true);
    try {
      const { data } = await api.post("/journey/plan", { from, to, priority });
      setPlan(data.plan);
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally { setLoading(false); }
  }

  const priorities = [["cheapest", "home.priorityCheapest"], ["balanced", "home.priorityBalanced"], ["fastest", "home.priorityFastest"]];

  return (
    <>
      <section style={{ background: "var(--color-night)", color: "var(--color-paper)", padding: "56px 0 72px" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)" }}>{t("home.heroTitle")}</h1>
            <p style={{ marginTop: 18, fontSize: 18, opacity: 0.85, maxWidth: 480 }}>{t("home.heroSubtitle")}</p>
            <p style={{ marginTop: 22, fontSize: 14, color: "var(--color-marigold)", fontWeight: 600 }}>{t("home.supportedCity")}</p>
          </div>

          <form onSubmit={submit} className="ticket" style={{ color: "var(--color-ink)" }}>
            <div className="ticket-stub" />
            <div className="ticket-body">
              <div className="field">
                <label htmlFor="from">{t("home.fromLabel")}</label>
                <div className="row gap-8">
                  <input id="from" list="hub-list" style={{ flex: 1 }} value={from} onChange={(e) => setFrom(e.target.value)} placeholder={t("home.fromPlaceholder")} required />
                  <MicButton onResult={onVoiceFrom} size="sm" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="to">{t("home.toLabel")}</label>
                <div className="row gap-8">
                  <input id="to" list="hub-list" style={{ flex: 1 }} value={to} onChange={(e) => setTo(e.target.value)} placeholder={t("home.toPlaceholder")} required />
                  <MicButton onResult={onVoiceTo} size="sm" />
                </div>
              </div>
              <datalist id="hub-list">{hubs.map((h) => <option key={h.id} value={h.name} />)}</datalist>

              <p className="text-muted" style={{ fontSize: 13, marginBottom: 8, fontWeight: 600 }}>{t("home.priorityLabel")}</p>
              <div className="row gap-8" style={{ marginBottom: 20, flexWrap: "wrap" }}>
                {priorities.map(([val, key]) => (
                  <button type="button" key={val} onClick={() => setPriority(val)} className="btn btn-sm"
                    style={{ background: priority === val ? "var(--color-night)" : "transparent", color: priority === val ? "var(--color-paper)" : "var(--color-night)", border: "1.5px solid var(--color-line)" }}>
                    {t(key)}
                  </button>
                ))}
              </div>

              <button className="btn btn-accent" style={{ width: "100%" }} disabled={loading}>{loading ? t("home.planning") : t("home.planButton")}</button>
              <div className="row gap-8" style={{ marginTop: 14, justifyContent: "center" }}>
                <MicButton onResult={onVoice} size="sm" />
                <span className="text-muted" style={{ fontSize: 13 }}>{t("home.tryVoice")}</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      <main className="container" style={{ padding: "0 20px 60px" }}>
        {error && <div className="banner-error" style={{ marginTop: 28 }}>{error}</div>}
        <JourneyResult plan={plan} />
        {!plan && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 18, marginBottom: 14 }}>{t("home.supportedHubsTitle")}</h3>
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              {hubs.map((h) => (
                <button key={h.id} className="btn btn-ghost btn-sm" onClick={() => (from ? setTo(h.name) : setFrom(h.name))}>{h.name}</button>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
