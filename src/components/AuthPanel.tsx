import { useState } from "react";

interface AuthPanelProps {
  loading?: boolean;
  onSendMagicLink: (email: string) => Promise<void>;
}

export function AuthPanel({ loading = false, onSendMagicLink }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("请先输入邮箱");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await onSendMagicLink(nextEmail);
      setMessage("登录链接已发送到你的邮箱，点开后就能在手机和电脑上同步同一份衣橱。");
    } catch (submitError) {
      const nextMessage = submitError instanceof Error ? submitError.message : "发送登录链接失败";
      setError(nextMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">Wardrobe Cloud</div>
        <h1>登录你的电子衣橱</h1>
        <p>
          现在这版已经支持 GitHub Pages + Supabase Free。
          你只需要用同一个邮箱登录，手机和电脑就会同步显示同一份衣橱数据。
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>邮箱</span>
            <input
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading || submitting}
            />
          </label>

          <button className="primary-btn auth-submit" type="submit" disabled={loading || submitting}>
            {submitting ? "发送中..." : "发送登录链接"}
          </button>
        </form>

        {message ? <div className="auth-message success">{message}</div> : null}
        {error ? <div className="auth-message error">{error}</div> : null}

        <div className="auth-note">
          第一次部署后，你还需要在 Supabase 的 Authentication 里把 GitHub Pages 域名加入 Redirect URLs。
        </div>
      </section>
    </div>
  );
}
