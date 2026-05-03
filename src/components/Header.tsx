import clsx from "clsx";
import type { AppTab, SaveState } from "@/types";

interface HeaderProps {
  activeTab: AppTab;
  saveState: SaveState;
  sharedEnabled: boolean;
  canConnectCloud?: boolean;
  onTabChange: (tab: AppTab) => void;
  onImport: () => void;
  onCopyShareUrl: () => void;
  onCopyShareCommand: () => void;
  onExport: () => void;
  onOpenAuth?: () => void;
}

const tabs: Array<{ key: AppTab; label: string }> = [
  { key: "home", label: "首页" },
  { key: "closet", label: "衣橱" },
  { key: "hub", label: "工具页" }
];

export function Header({
  activeTab,
  saveState,
  sharedEnabled,
  canConnectCloud = false,
  onTabChange,
  onImport,
  onCopyShareUrl,
  onCopyShareCommand,
  onExport,
  onOpenAuth
}: HeaderProps) {
  const saveLabel =
    saveState === "saving"
      ? "自动保存中"
      : saveState === "error"
        ? "保存异常"
        : sharedEnabled
          ? "云端已连接"
          : "本地模式已开启";

  const actions = [
    { label: "导入", title: "导入数据", onClick: onImport, glyph: <ImportGlyph /> },
    { label: "分享", title: "复制分享链接", onClick: onCopyShareUrl, glyph: <ShareGlyph /> },
    { label: "命令", title: "复制启动命令", onClick: onCopyShareCommand, glyph: <CommandGlyph /> },
    { label: "导出", title: "导出 JSON", onClick: onExport, glyph: <ExportGlyph /> }
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">衣</span>
        <div className="brand-copy">
          <strong>南江的衣橱</strong>
          <span>归档、筛选、统计、购买判断</span>
        </div>
      </div>

      <nav className="top-tabs" aria-label="页面切换">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={clsx("tab-btn", activeTab === tab.key && "active")}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="top-actions-with-status">
        <div className="topbar-tool-cluster" aria-label="快捷工具">
          {actions.map((action) => (
            <button
              key={action.label}
              className="icon-btn export-icon-btn topbar-tool-btn"
              type="button"
              title={action.title}
              aria-label={action.title}
              onClick={action.onClick}
            >
              {action.glyph}
            </button>
          ))}
        </div>

        {canConnectCloud && onOpenAuth ? (
          <button className="ghost-btn cloud-connect-btn" type="button" onClick={onOpenAuth}>
            连接云端
          </button>
        ) : null}

        <span className="save-indicator" data-state={saveState}>
          <span className="status-dot" />
          {saveLabel}
        </span>
      </div>
    </header>
  );
}

function ImportGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5v9.2" />
      <path d="m8.7 10.8 3.3 3.3 3.3-3.3" />
      <path d="M5.2 18.4h13.6" />
      <path d="M6 18.4v1.1c0 .8.6 1.5 1.5 1.5h9c.8 0 1.5-.6 1.5-1.5v-1.1" />
    </svg>
  );
}

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.4 14.6 14.8 9.2" />
      <path d="M9 9.3H7.2A3.2 3.2 0 0 0 4 12.5a3.2 3.2 0 0 0 3.2 3.2H9" />
      <path d="M15 9.3h1.8a3.2 3.2 0 1 1 0 6.4H15" />
    </svg>
  );
}

function CommandGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="14" rx="3.2" />
      <path d="m8.2 10.1 3 2-3 2" />
      <path d="M13.2 15h2.8" />
    </svg>
  );
}

function ExportGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14.2V5" />
      <path d="m15.2 11-3.2 3.2L8.8 11" />
      <path d="M5 18.2h14" />
      <path d="M6.2 18.2v1.1c0 .9.7 1.6 1.6 1.6h8.4c.9 0 1.6-.7 1.6-1.6v-1.1" />
    </svg>
  );
}
