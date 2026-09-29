import { useState } from "react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";

export default function Emergency() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const helplines = { police: "100", ambulance: "108", womenHelpline: "1091", disaster: "112" };

  async function search(e) {
    e.preventDefault();
    setError(""); setInfo(null);
    try {
      const { data } = await api.get(`/emergency/${encodeURIComponent(query)}`);
      setInfo(data);
    } catch (err) { setError(err.response?.data?.message || t("common.error")); }
  }

  return (
    <main className="container" style={{ padding: "36px 20px", maxWidth: 780 }}>
      <h1 style={{ fontSize: 30 }}>{t("emergency.title")}</h1>
      <p className="text-muted" style={{ margin: "8px 0 24px" }}>{t("emergency.subtitle")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        {Object.entries(helplines).map(([k, num]) => (
          <a key={k} href={`tel:${num}`} style={{ textDecoration: "none", background: "var(--color-night)", color: "var(--color-paper)", padding: "18px 20px", borderRadius: 4 }}>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{t(`emergency.${k}`)}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--color-marigold)" }}>{num}</div>
          </a>
        ))}
      </div>

      <form onSubmit={search} className="row gap-8" style={{ marginBottom: 20 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("emergency.searchPlaceholder")} required
          style={{ flex: 1, padding: "12px 14px", border: "1.5px solid var(--color-line)", borderRadius: 4, fontSize: 15 }} />
        <button className="btn btn-primary">{t("emergency.search")}</button>
      </form>
      {error && <div className="banner-error">{error}</div>}
      {info && (
        <div className="ticket"><div className="ticket-stub" /><div className="ticket-body">
          <h3 style={{ fontSize: 20, marginBottom: 12 }}>{info.hub}</h3>
          <p>🚓 <strong>{t("emergency.police")}:</strong> {info.emergency?.police}</p>
          <p style={{ marginTop: 6 }}>🏥 <strong>Hospital:</strong> {info.emergency?.hospital}</p>
        </div></div>
      )}
    </main>
  );
}
