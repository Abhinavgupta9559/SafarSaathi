import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/journey/history").then(({ data }) => setHistory(data.history)).catch(() => {});
  }, []);

  return (
    <main className="container" style={{ padding: "36px 20px", maxWidth: 780 }}>
      <h1 style={{ fontSize: 30 }}>{t("profile.title")}</h1>
      <div className="ticket" style={{ margin: "20px 0 32px" }}><div className="ticket-stub" /><div className="ticket-body">
        <h3 style={{ fontSize: 22 }}>{user?.name}</h3>
        <p className="text-muted" style={{ marginTop: 4 }}>{user?.email}{user?.phone ? ` • ${user.phone}` : ""}</p>
      </div></div>

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>{t("profile.recentJourneys")}</h2>
      {history.length === 0 ? <p className="text-muted">{t("profile.noJourneys")}</p> : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
          {history.map((j) => (
            <li key={j.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", padding: "14px 18px", borderRadius: 4 }}>
              <strong>{j.from}</strong> → <strong>{j.to}</strong>
              <span className="text-muted" style={{ marginLeft: 10, fontSize: 13 }}>{new Date(j.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
