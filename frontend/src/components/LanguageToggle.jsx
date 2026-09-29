import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Choose language"
      style={{
        display: "inline-flex",
        border: "1.5px solid var(--color-line-dark)",
        borderRadius: "var(--radius-pill)",
        padding: 3,
        gap: 2,
      }}
    >
      {[
        { code: "en", label: "EN" },
        { code: "hi", label: "हिं" },
      ].map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLanguage(opt.code)}
          style={{
            border: "none",
            borderRadius: "var(--radius-pill)",
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            background: language === opt.code ? "var(--color-marigold)" : "transparent",
            color: language === opt.code ? "var(--color-night)" : "var(--color-paper)",
          }}
          aria-pressed={language === opt.code}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
