import type { WardrobeItem } from "@/types";

interface ItemModalProps {
  open: boolean;
  title: string;
  categories: string[];
  colorSuggestions: string[];
  draft: WardrobeItem | null;
  onClose: () => void;
  onChange: <K extends keyof WardrobeItem>(field: K, value: WardrobeItem[K]) => void;
  onPasteImage: (file: File) => void;
  onSave: () => void;
}

export function ItemModal({
  open,
  title,
  categories,
  colorSuggestions,
  draft,
  onClose,
  onChange,
  onPasteImage,
  onSave
}: ItemModalProps) {
  if (!open || !draft) return null;

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    event.preventDefault();
    onPasteImage(file);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="summary-title">{title}</div>
            <div className="summary-subtitle">先录核心信息，细项在卡片背面继续编辑</div>
          </div>
          <button className="icon-btn" type="button" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>

        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <label className="field">
            <span>单品名称</span>
            <input value={draft.name} onChange={(event) => onChange("name", event.target.value)} required />
          </label>

          <label className="field">
            <span>分类</span>
            <select value={draft.category} onChange={(event) => onChange("category", event.target.value)} required>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>颜色</span>
            <input
              value={draft.color}
              placeholder="可直接输入自定义颜色"
              onChange={(event) => onChange("color", event.target.value)}
            />
            <div className="field-help">可自由创建颜色名，保存后会自动进入筛选和色环统计。</div>
            <div className="suggestion-chip-row">
              {colorSuggestions.slice(0, 10).map((color) => (
                <button
                  key={color}
                  className="suggestion-chip"
                  type="button"
                  onClick={() => onChange("color", color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span>材质</span>
            <input value={draft.material} onChange={(event) => onChange("material", event.target.value)} />
          </label>

          <label className="field">
            <span>版型</span>
            <input value={draft.fit} onChange={(event) => onChange("fit", event.target.value)} />
          </label>

          <label className="field">
            <span>店铺</span>
            <input value={draft.store} onChange={(event) => onChange("store", event.target.value)} />
          </label>

          <label className="field field-full">
            <span>图片</span>
            <div className="paste-zone" tabIndex={0} onPaste={handlePaste}>
              <div className="paste-zone-copy">点这里后直接粘贴图片，或使用 Ctrl+V / Command+V</div>
              <div className="paste-zone-preview">
                {draft.imageData ? (
                  <img src={draft.imageData} alt="衣物预览" />
                ) : (
                  <div className="item-image-placeholder-text">粘贴后的图片会显示在这里</div>
                )}
              </div>
            </div>
          </label>

          <div className="modal-actions">
            <button className="ghost-btn" type="button" onClick={onClose}>
              取消
            </button>
            <button className="primary-btn" type="submit">
              保存衣物
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
