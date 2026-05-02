import type { WardrobeItem } from "@/types";

interface StyleProfileCardProps {
  title: string;
  description: string;
  palette: Array<{ label: string; swatch: string }>;
  stores: string[];
  keywords: string[];
  featuredItems: Array<WardrobeItem | null>;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
}

export function StyleProfileCard({
  title,
  description,
  palette,
  stores,
  keywords,
  featuredItems,
  onTitleChange,
  onDescriptionChange,
  onSave
}: StyleProfileCardProps) {
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <article className="measure-card card style-note-card refined-style-card">
      <div className="measure-card-title">
        <span className="mini-icon">风</span>
        <strong>风格名片</strong>
      </div>

      <div className="style-profile-shell">
        <div className="style-moodboard">
          <div className="style-outfit-grid">
            {featuredItems.map((item, index) => (
              <div key={`${item?.id || "placeholder"}-${index}`} className={`style-outfit-slot slot-${index + 1}`}>
                {item?.imageData ? (
                  <img src={item.imageData} alt={item.name} />
                ) : (
                  <div className="style-outfit-placeholder">{item?.category || "单品"}</div>
                )}
              </div>
            ))}
          </div>

          <div className="style-palette-column">
            {palette.map((entry) => (
              <div key={entry.label} className="style-palette-swatch" style={{ background: entry.swatch }} title={entry.label} />
            ))}
          </div>
        </div>

        <div className="style-profile-body">
          <label className="field">
            <span>主风格</span>
            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              onBlur={onSave}
              onKeyDown={handleInputKeyDown}
            />
          </label>

          <div className="style-info-list">
            <div className="style-info-row">
              <span className="style-info-icon">⌂</span>
              <div>
                <div className="style-info-label">主风格</div>
                <div className="style-info-value">{title || "简约通勤"}</div>
              </div>
            </div>
            <div className="style-info-row">
              <span className="style-info-icon">◔</span>
              <div>
                <div className="style-info-label">色彩偏好</div>
                <div className="style-info-value">{palette.map((entry) => entry.label).join(" / ")}</div>
              </div>
            </div>
            <div className="style-info-row">
              <span className="style-info-icon">⌘</span>
              <div>
                <div className="style-info-label">常穿品牌</div>
                <div className="style-info-value">{stores.join(" / ")}</div>
              </div>
            </div>
            <div className="style-info-row">
              <span className="style-info-icon">✦</span>
              <div>
                <div className="style-info-label">关键词</div>
                <div className="style-info-value">{keywords.join("、")}</div>
              </div>
            </div>
          </div>

          <label className="field">
            <span>风格描述</span>
            <textarea
              rows={4}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              onBlur={onSave}
              onKeyDown={handleTextareaKeyDown}
            />
          </label>

          <div className="style-chip-row">
            {keywords.slice(0, 5).map((keyword) => (
              <span key={keyword} className="tiny-tag">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
