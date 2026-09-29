import { NavLink, useNavigate } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const { t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    color: isActive ? "var(--color-marigold)" : "var(--color-paper)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 4px",
  });

  return (
    <header style={{ background: "var(--color-night)" }}>
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68, gap: 16 }}
      >
        <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "var(--color-marigold)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiMapPin size={18} color="var(--color-night)" />
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--color-paper)" }}>
            {t("appName")}
          </span>
        </NavLink>

        <nav style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <NavLink to="/" style={linkStyle} end>
            {t("nav.planner")}
          </NavLink>
          <NavLink to="/assistant" style={linkStyle}>
            {t("nav.assistant")}
          </NavLink>
          <NavLink to="/emergency" style={linkStyle}>
            {t("nav.emergency")}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" style={linkStyle}>
              {t("nav.profile")}
            </NavLink>
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageToggle />
          {isAuthenticated ? (
            <button
              className="btn btn-ghost btn-sm"
              style={{ borderColor: "var(--color-line-dark)", color: "var(--color-paper)" }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              {t("nav.logout")}
            </button>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm" style={{ borderColor: "var(--color-line-dark)", color: "var(--color-paper)", textDecoration: "none" }}>
                {t("nav.login")}
              </NavLink>
              <NavLink to="/signup" className="btn btn-accent btn-sm" style={{ textDecoration: "none" }}>
                {t("nav.signup")}
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
