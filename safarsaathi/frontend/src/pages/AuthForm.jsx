import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { t } = useLanguage();
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = isSignup ? await signup(form) : await login(form);
    if (res.success) navigate("/"); else setError(res.message);
  }

  return (
    <main className="container" style={{ padding: "48px 20px", maxWidth: 520 }}>
      <form onSubmit={submit} className="ticket">
        <div className="ticket-stub" />
        <div className="ticket-body">
          <h1 style={{ fontSize: 28 }}>{t(isSignup ? "auth.signupTitle" : "auth.loginTitle")}</h1>
          <p className="text-muted" style={{ margin: "8px 0 24px" }}>{t(isSignup ? "auth.signupSubtitle" : "auth.loginSubtitle")}</p>
          {error && <div className="banner-error" role="alert">{error}</div>}
          {isSignup && (
            <div className="field"><label htmlFor="name">{t("auth.nameLabel")}</label>
              <input id="name" value={form.name} onChange={update("name")} required minLength={2} autoComplete="name" /></div>
          )}
          <div className="field"><label htmlFor="email">{t("auth.emailLabel")}</label>
            <input id="email" type="email" value={form.email} onChange={update("email")} required autoComplete="email" /></div>
          <div className="field"><label htmlFor="password">{t("auth.passwordLabel")}</label>
            <input id="password" type="password" value={form.password} onChange={update("password")} required minLength={isSignup ? 8 : 1} autoComplete={isSignup ? "new-password" : "current-password"} />
            {isSignup && <span className="text-muted" style={{ fontSize: 12 }}>{t("auth.passwordHint")}</span>}</div>
          {isSignup && (
            <div className="field"><label htmlFor="phone">{t("auth.phoneLabel")}</label>
              <input id="phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" /></div>
          )}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>{t(isSignup ? "auth.signupButton" : "auth.loginButton")}</button>
          <p className="text-muted" style={{ marginTop: 18, fontSize: 14, textAlign: "center" }}>
            {t(isSignup ? "auth.haveAccount" : "auth.noAccount")}{" "}
            <Link to={isSignup ? "/login" : "/signup"} style={{ color: "var(--color-teal)", fontWeight: 600 }}>{t(isSignup ? "nav.login" : "nav.signup")}</Link>
          </p>
        </div>
      </form>
    </main>
  );
}
