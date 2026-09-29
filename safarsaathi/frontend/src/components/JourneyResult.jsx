import { useLanguage } from "../context/LanguageContext";

function fareText(fare) {
  if (fare === null || fare === undefined) return null;
  if (Array.isArray(fare)) return `₹${fare[0]}–${fare[1]}`;
  return `₹${fare}`;
}

export default function JourneyResult({ plan }) {
  const { t, isHindi } = useLanguage();
  if (!plan) return null;

  const stageColor = { first_mile: "var(--color-marigold)", main_transport: "var(--color-teal)", last_mile: "var(--color-night)" };

  return (
    <div className="ticket" style={{ marginTop: 28 }}>
      <div className="ticket-stub" />
      <div className="ticket-body">
        <p className="text-muted" style={{ fontSize: 13, fontWeight: 600 }}>{t("home.resultTitle")}</p>
        <h2 style={{ fontSize: 26, margin: "6px 0 22px" }}>
          {plan.from} <span style={{ color: "var(--color-marigold-deep)" }}>→</span> {plan.to}
        </h2>

        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {plan.steps.map((step, i) => (
            <li key={i} style={{ display: "flex", gap: 16, paddingBottom: 20, position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: stageColor[step.stage], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {step.icon}
                </span>
                {i < plan.steps.length - 1 && <span style={{ flex: 1, width: 0, borderLeft: "2px dashed var(--color-line)", marginTop: 4 }} />}
              </div>
              <div>
                <p style={{ fontWeight: 500 }}>{isHindi ? step.instruction_hi : step.instruction_en}</p>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                  {[fareText(step.approxFareINR), step.approxTimeMin ? `${step.approxTimeMin} min` : null, step.notes].filter(Boolean).join("  •  ")}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div style={{ borderTop: "2px dashed var(--color-line)", paddingTop: 18, display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div>
            <p className="text-muted" style={{ fontSize: 13 }}>{t("home.totalFare")}</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>₹{plan.totalFareEstimateINR.min}–{plan.totalFareEstimateINR.max}</p>
          </div>
          {plan.totalTimeEstimateMin && (
            <div>
              <p className="text-muted" style={{ fontSize: 13 }}>{t("home.totalTime")}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>~{plan.totalTimeEstimateMin} min</p>
            </div>
          )}
        </div>

        {plan.emergencyInfo?.atDestination && (
          <div className="banner-info" style={{ marginTop: 20, marginBottom: 0 }}>
            <strong>{t("home.emergencyNearDest")}:</strong> {t("emergency.police")} – {plan.emergencyInfo.atDestination.police}; Hospital – {plan.emergencyInfo.atDestination.hospital}
          </div>
        )}
      </div>
    </div>
  );
}
