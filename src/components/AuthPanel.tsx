import { useMemo, useState } from "react";

type AuthMode = "password" | "signup" | "magic";

interface AuthPanelProps {
  loading?: boolean;
  onSendMagicLink: (email: string) => Promise<void>;
  onSignInWithPassword: (email: string, password: string) => Promise<void>;
  onSignUpWithPassword: (email: string, password: string) => Promise<void>;
  onContinueLocal?: () => void;
}

const MODE_LABELS: Array<{ key: AuthMode; label: string }> = [
  { key: "password", label: "密码登录" },
  { key: "signup", label: "注册账号" },
  { key: "magic", label: "邮箱链接" }
];

export function AuthPanel({
  loading = false,
  onSendMagicLink,
  onSignInWithPassword,
  onSignUpWithPassword,
  onContinueLocal
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitLabel = useMemo(() => {
    if (mode === "signup") return submitting ? "注册中..." : "注册并连接云端";
    if (mode === "magic") return submitting ? "发送中..." : "发送登录链接";
    return submitting ? "登录中..." : "使用密码登录";
  }, [mode, submitting]);

  function resetFeedback(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextEmail = email.trim();
    if (!nextEmail) {
      setError("请先输入邮箱。");
      return;
    }

    if ((mode === "password" || mode === "signup") && !password.trim()) {
      setError("请输入密码。");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("密码至少需要 6 位。");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致。");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (mode === "magic") {
        await onSendMagicLink(nextEmail);
        setMessage("登录链接已经发到你的邮箱。打开最新那封邮件里的链接后，电脑和手机就会同步同一份衣橱数据。");
      } else if (mode === "signup") {
        await onSignUpWithPassword(nextEmail, password);
        setMessage("账号已经创建。之后你就可以直接用邮箱和密码登录，不用再反复发送邮件。");
      } else {
        await onSignInWithPassword(nextEmail, password);
        setMessage("正在登录云端衣橱…");
      }
    } catch (submitError) {
      let nextMessage = submitError instanceof Error ? submitError.message : "登录失败。";
      if (/rate limit/i.test(nextMessage)) {
        nextMessage = "登录邮件发送太频繁了。你可以先进入本地模式继续使用，等一段时间后再回来连接云端。";
      }
      setError(nextMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-badge">Wardrobe Cloud</div>
        <h1>连接你的电子衣橱</h1>
        <p>
          本地模式会一直保留。你现在可以继续本地整理，也可以使用邮箱+密码连接 Supabase，
          之后手机和电脑就会自动同步同一份衣橱数据。
        </p>

        <div className="auth-mode-switch" role="tablist" aria-label="登录方式">
          {MODE_LABELS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`auth-mode-btn${mode === option.key ? " active" : ""}`}
              onClick={() => resetFeedback(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

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

          {mode === "password" || mode === "signup" ? (
            <label className="field">
              <span>密码</span>
              <input
                type="password"
                value={password}
                placeholder="至少 6 位"
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading || submitting}
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <label className="field">
              <span>确认密码</span>
              <input
                type="password"
                value={confirmPassword}
                placeholder="再次输入密码"
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading || submitting}
              />
            </label>
          ) : null}

          <button className="primary-btn auth-submit" type="submit" disabled={loading || submitting}>
            {submitLabel}
          </button>

          {onContinueLocal ? (
            <button className="ghost-btn auth-submit auth-secondary-btn" type="button" onClick={onContinueLocal}>
              先进入本地模式
            </button>
          ) : null}
        </form>

        {message ? <div className="auth-message success">{message}</div> : null}
        {error ? <div className="auth-message error">{error}</div> : null}

        <div className="auth-note">
          推荐以后优先使用 <strong>邮箱 + 密码</strong> 登录。只有第一次注册，或者你主动选择“邮箱链接”时，
          才需要依赖邮件跳转。
        </div>
      </section>
    </div>
  );
}
