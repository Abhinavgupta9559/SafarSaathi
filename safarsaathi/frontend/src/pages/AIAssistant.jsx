import { useState, useRef, useEffect, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import MicButton from "../components/MicButton";

export default function AIAssistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([{ role: "assistant", content: t("ai.greeting") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = useCallback(async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/ai/ask", { message, history });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("common.error") }]);
    } finally { setLoading(false); }
  }, [input, loading, messages, t]);

  // Voice: speak the question and it is sent straight to the AI.
  const onVoice = useCallback((text) => send(text), [send]);

  return (
    <main className="container" style={{ padding: "36px 20px", maxWidth: 780 }}>
      <h1 style={{ fontSize: 30 }}>{t("ai.title")}</h1>
      <p className="text-muted" style={{ margin: "8px 0 20px" }}>{t("ai.subtitle")}</p>

      <div className="ticket" style={{ minHeight: 420 }}>
        <div className="ticket-stub" />
        <div className="ticket-body" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
          <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 14, maxHeight: 460, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", whiteSpace: "pre-wrap",
                background: m.role === "user" ? "var(--color-night)" : "var(--color-teal-soft)",
                color: m.role === "user" ? "var(--color-paper)" : "var(--color-ink)",
                padding: "12px 16px", borderRadius: 14, fontSize: 15, lineHeight: 1.55,
              }}>{m.content}</div>
            ))}
            {loading && <div className="text-muted" style={{ fontSize: 14 }}>{t("ai.thinking")}</div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="row gap-8"
            style={{ padding: 16, borderTop: "2px dashed var(--color-line)" }}>
            <MicButton onResult={onVoice} />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("ai.placeholder")}
              style={{ flex: 1, padding: "12px 14px", border: "1.5px solid var(--color-line)", borderRadius: 4, fontSize: 15 }} />
            <button className="btn btn-accent" disabled={loading || !input.trim()}><FiSend /> {t("ai.send")}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
