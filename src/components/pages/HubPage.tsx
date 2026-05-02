import { useEffect, useMemo, useState } from "react";
import type { AppData, ClosetGroupKey, PurchaseCandidate, PurchaseAssistantResult, SharedState } from "@/types";
import { GROUPS, buildLegendRows, buildPurchaseAssistantResult, normalizeClosetGroupKey } from "@/utils/wardrobe";

interface HubPageProps {
  data: AppData;
  shared: SharedState;
  categoryGroups: Partial<Record<string, ClosetGroupKey>>;
  onSaveCategories: (rows: Array<{ original: string; value: string; group: ClosetGroupKey }>) => void;
  onSaveStoreNotes: (notes: Record<string, string>) => void;
}

interface CategoryDraftRow {
  id: string;
  original: string;
  value: string;
  group: ClosetGroupKey;
}

interface LegendStatRow {
  label: string;
  value: number;
  color: string;
}

const emptyCandidate: PurchaseCandidate = {
  name: "",
  category: "",
  color: "",
  material: "",
  fit: "",
  store: ""
};

function createDraftId() {
  return `category-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createCategoryDrafts(categories: string[], categoryGroups: Partial<Record<string, ClosetGroupKey>>): CategoryDraftRow[] {
  return categories.map((category) => ({
    id: createDraftId(),
    original: category,
    value: category,
    group: categoryGroups[category] ? normalizeClosetGroupKey(categoryGroups[category]) : "tops"
  }));
}

export function HubPage({ data, shared, categoryGroups, onSaveCategories, onSaveStoreNotes }: HubPageProps) {
  const [candidate, setCandidate] = useState<PurchaseCandidate>(emptyCandidate);
  const [assistantResult, setAssistantResult] = useState<PurchaseAssistantResult | null>(null);
  const [categoryDrafts, setCategoryDrafts] = useState<CategoryDraftRow[]>(() =>
    createCategoryDrafts(data.profile.categories, categoryGroups)
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [storeNotesDraft, setStoreNotesDraft] = useState<Record<string, string>>(data.profile.storeNotes || {});

  useEffect(() => {
    setCategoryDrafts(createCategoryDrafts(data.profile.categories, categoryGroups));
  }, [data.profile.categories, categoryGroups]);

  useEffect(() => {
    setStoreNotesDraft(data.profile.storeNotes || {});
  }, [data.profile.storeNotes]);

  const colorLegend = useMemo(() => buildLegendRows(data.items, "color"), [data.items]);
  const storeLegend = useMemo(() => buildLegendRows(data.items, "store"), [data.items]);
  const candidateColorSuggestions = useMemo(
    () =>
      Array.from(new Set(data.items.map((item) => item.color).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-CN")),
    [data.items]
  );
  const storeMemoRows = useMemo(() => storeLegend.slice(0, 8), [storeLegend]);

  function updateDraftValue(id: string, value: string) {
    setCategoryDrafts((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
  }

  function updateDraftGroup(id: string, group: ClosetGroupKey) {
    setCategoryDrafts((current) => current.map((item) => (item.id === id ? { ...item, group } : item)));
  }

  function addDraft() {
    setCategoryDrafts((current) => [...current, { id: createDraftId(), original: "", value: "", group: "tops" }]);
  }

  function removeDraft(id: string) {
    const nextRows = categoryDrafts.filter((item) => item.id !== id);
    setCategoryDrafts(nextRows);
    commitCategorySettings(nextRows);
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  function handleAnalyze(event: React.FormEvent) {
    event.preventDefault();
    setAssistantResult(buildPurchaseAssistantResult(data, candidate));
  }

  function commitCategorySettings(rows = categoryDrafts) {
    const normalizedRows = rows.map(({ original, value, group }) => ({
      original,
      value: value.trim(),
      group
    }));
    const nextCategories = normalizedRows.map((row) => row.value).filter(Boolean);

    const nextGroups = normalizedRows.reduce<Partial<Record<string, ClosetGroupKey>>>((result, row) => {
      if (row.value) result[row.value] = row.group;
      return result;
    }, {});

    if (
      JSON.stringify(nextCategories) === JSON.stringify(data.profile.categories) &&
      JSON.stringify(nextGroups) === JSON.stringify(categoryGroups)
    ) {
      return;
    }

    onSaveCategories(normalizedRows);
  }

  function moveDraft(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const sourceIndex = categoryDrafts.findIndex((item) => item.id === sourceId);
    const targetIndex = categoryDrafts.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextRows = [...categoryDrafts];
    const [moved] = nextRows.splice(sourceIndex, 1);
    nextRows.splice(targetIndex, 0, moved);
    setCategoryDrafts(nextRows);
    commitCategorySettings(nextRows);
  }

  function handleStoreNoteChange(store: string, value: string) {
    setStoreNotesDraft((current) => ({ ...current, [store]: value }));
  }

  function commitStoreNotes() {
    onSaveStoreNotes(storeNotesDraft);
  }

  function handleStoreNoteKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <section className="tab-panel active">
      <div className="hub-two-column">
        <div className="hub-column hub-column-left">
          <div className="hub-card-subtle hub-column-meta">
            {shared.enabled ? `共享模式 · ${shared.dataFile || "wardrobe-shared-store.json"}` : "本地模式 · 数据自动保存在当前浏览器"}
          </div>

          <RingStatCard
            title="颜色占比"
            rows={colorLegend}
            description="按你真实录入的全部颜色汇总，不再截断成少量类别。"
          />

          <StoreStatCard
            title="店铺占比"
            rows={storeLegend}
            storeNotes={storeNotesDraft}
            onChangeNote={handleStoreNoteChange}
            onCommitNotes={commitStoreNotes}
            onKeyDown={handleStoreNoteKeyDown}
            visibleMemoRows={storeMemoRows}
          />
        </div>

        <div className="hub-column hub-column-right">
          <article className="hub-card card category-settings-card">
            <div className="hub-card-header">
              <span className="mini-icon">类</span>
              <strong>分类管理</strong>
            </div>

            <div className="category-manager category-manager-rich">
              {categoryDrafts.map((category, index) => (
                <div
                  key={category.id}
                  className="category-row category-row-rich"
                  draggable
                  onDragStart={() => setDraggingId(category.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggingId) return;
                    moveDraft(draggingId, category.id);
                    setDraggingId(null);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                >
                  <button className="drag-handle" type="button" aria-label="拖动排序">
                    ⋮⋮
                  </button>
                  <div className="category-index">{index + 1}</div>
                  <input
                    type="text"
                    value={category.value}
                    onChange={(event) => updateDraftValue(category.id, event.target.value)}
                    onBlur={() => commitCategorySettings()}
                    onKeyDown={handleDraftKeyDown}
                  />
                  <select
                    className="category-group-select"
                    value={category.group}
                    onChange={(event) => updateDraftGroup(category.id, event.target.value as ClosetGroupKey)}
                  >
                    {GROUPS.filter((group: (typeof GROUPS)[number]) => group.key !== "all").map(
                      (group: (typeof GROUPS)[number]) => (
                        <option key={group.key} value={group.key}>
                          {group.label}
                        </option>
                      )
                    )}
                  </select>
                  <button className="icon-btn" type="button" aria-label="删除分类" onClick={() => removeDraft(category.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="category-actions">
              <button className="ghost-btn" type="button" onClick={addDraft}>
                新增分类
              </button>
              <button className="primary-btn" type="button" onClick={() => commitCategorySettings()}>
                保存分类
              </button>
            </div>
          </article>

          <article className="hub-card card hub-assistant">
            <div className="hub-card-header">
              <span className="mini-icon">购</span>
              <strong>衣物购买分析</strong>
            </div>

            <form className="assistant-form" onSubmit={handleAnalyze}>
              <label className="field">
                <span>单品名称</span>
                <input value={candidate.name} onChange={(event) => setCandidate((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="field">
                <span>分类</span>
                <select value={candidate.category} onChange={(event) => setCandidate((current) => ({ ...current, category: event.target.value }))}>
                  <option value="">请选择分类</option>
                  {data.profile.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>颜色</span>
                <input
                  list="candidateColorSuggestions"
                  value={candidate.color}
                  onChange={(event) => setCandidate((current) => ({ ...current, color: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>材质</span>
                <input value={candidate.material} onChange={(event) => setCandidate((current) => ({ ...current, material: event.target.value }))} />
              </label>
              <label className="field">
                <span>版型</span>
                <input value={candidate.fit} onChange={(event) => setCandidate((current) => ({ ...current, fit: event.target.value }))} />
              </label>
              <label className="field">
                <span>店铺</span>
                <input value={candidate.store} onChange={(event) => setCandidate((current) => ({ ...current, store: event.target.value }))} />
              </label>
              <button className="primary-btn field-full" type="submit">
                分析
              </button>
            </form>

            <datalist id="candidateColorSuggestions">
              {candidateColorSuggestions.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>

            <div className="assistant-result">
              {assistantResult ? (
                <>
                  <div className={`assistant-verdict ${assistantResult.level}`}>{assistantResult.title}</div>
                  <div className="assistant-note">{assistantResult.note}</div>
                  {assistantResult.similarItems.length ? (
                    assistantResult.similarItems.map((item) => (
                      <div key={item.id} className="assistant-note">
                        相似单品：{item.name} · {item.color || "未设颜色"} · {item.fit || "未设版型"}
                      </div>
                    ))
                  ) : (
                    <div className="assistant-note">还没有找到特别接近的单品。</div>
                  )}
                </>
              ) : (
                <div className="assistant-note">输入候选单品后，可以快速判断是否重复购买、是否值得补位。</div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function RingStatCard({
  title,
  rows,
  description
}: {
  title: string;
  rows: LegendStatRow[];
  description: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="ring-stat-card luxe-ring-card">
      <div className="ring-stat-head">{title}</div>
      <div className="ring-stat-caption">{description}</div>
      <div className="ring-stat-body ring-stat-body-luxe">
        <DonutChart rows={rows} total={total} />
        <div className="luxe-legend-grid" aria-label={`${title}图例`}>
          {rows.map((row) => (
            <div key={row.label} className="luxe-legend-pill" title={`${row.label} ${row.value}件`}>
              <span className="legend-dot" style={{ background: row.color }} />
              <span className="luxe-legend-label">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreStatCard({
  title,
  rows,
  storeNotes,
  onChangeNote,
  onCommitNotes,
  onKeyDown,
  visibleMemoRows
}: {
  title: string;
  rows: LegendStatRow[];
  storeNotes: Record<string, string>;
  onChangeNote: (store: string, value: string) => void;
  onCommitNotes: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  visibleMemoRows: LegendStatRow[];
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="ring-stat-card luxe-ring-card">
      <div className="ring-stat-head">{title}</div>
      <div className="ring-stat-caption">一边看店铺占比，一边记下版型、尺码、踩雷点和回购印象。</div>
      <div className="ring-stat-body ring-stat-body-luxe store-stat-layout">
        <DonutChart rows={rows} total={total} />
        <div className="luxe-legend-grid" aria-label={`${title}图例`}>
          {rows.map((row) => (
            <div key={row.label} className="luxe-legend-pill" title={`${row.label} ${row.value}件`}>
              <span className="legend-dot" style={{ background: row.color }} />
              <span className="luxe-legend-label">{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="store-memo-board">
        <div className="store-memo-header">
          <strong>店铺备忘录</strong>
          <button className="ghost-btn store-memo-save" type="button" onClick={onCommitNotes}>
            保存备忘
          </button>
        </div>
        <div className="store-memo-grid">
          {visibleMemoRows.map((row) => (
            <label key={row.label} className="store-note-row">
              <span className="store-note-title">
                <span className="legend-dot" style={{ background: row.color }} />
                <span>{row.label}</span>
                <em>{row.value}件</em>
              </span>
              <input
                type="text"
                value={storeNotes[row.label] || ""}
                placeholder="例如：偏修身、裤长合适、慎买浅色"
                onChange={(event) => onChangeNote(row.label, event.target.value)}
                onBlur={onCommitNotes}
                onKeyDown={onKeyDown}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonutChart({ rows, total }: { rows: LegendStatRow[]; total: number }) {
  const size = 168;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="luxe-donut-wrap">
      <svg className="luxe-donut" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(223, 215, 203, 0.88)"
          strokeWidth={strokeWidth}
        />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {rows.map((row) => {
            const dash = total > 0 ? (row.value / total) * circumference : 0;
            const segment = (
              <circle
                key={row.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={row.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return segment;
          })}
        </g>
      </svg>
      <div className="luxe-donut-center">
        <strong>{total}</strong>
        <span>件</span>
      </div>
    </div>
  );
}
