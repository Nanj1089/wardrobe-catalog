import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  FAVORITE_OPTIONS,
  GROUPS,
  SEASON_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  WEAR_OPTIONS
} from "../../data/defaultData";
import type { AppData, ClosetFilters, ClosetGroupKey, ItemStatus, WardrobeItem } from "@/types";
import {
  buildReminderRows,
  categoriesForGroup,
  createItemMetaStyle,
  getFilteredItems,
  resolveGroupForCategory
} from "@/utils/wardrobe";

interface ClosetPageProps {
  data: AppData;
  categoryGroups: Partial<Record<string, ClosetGroupKey>>;
  filters: ClosetFilters;
  filteredItems: WardrobeItem[];
  allItems: WardrobeItem[];
  colorOptions: string[];
  materialOptions: string[];
  fitOptions: string[];
  onFilterChange: (patch: Partial<ClosetFilters>) => void;
  onClearFilters: () => void;
  onOpenNewItem: () => void;
  onOpenEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, patch: Partial<WardrobeItem>, message?: string) => void;
  onExport: () => void;
}

export function ClosetPage({
  data,
  categoryGroups,
  filters,
  filteredItems,
  colorOptions,
  materialOptions,
  fitOptions,
  onFilterChange,
  onClearFilters,
  onOpenNewItem,
  onOpenEditItem,
  onDeleteItem,
  onUpdateItem,
  onExport
}: ClosetPageProps) {
  const [flippedIds, setFlippedIds] = useState<string[]>([]);

  const sidebarItems = useMemo(
    () => getFilteredItems(data, { ...filters, group: "all", category: "" }, categoryGroups),
    [data, filters, categoryGroups]
  );
  const categories = useMemo(
    () => categoriesForGroup(data, filters.group, categoryGroups),
    [data, filters.group, categoryGroups]
  );
  const reminders = useMemo(() => buildReminderRows(filteredItems), [filteredItems]);
  const missingImages = useMemo(() => data.items.filter((item) => !item.imageData).length, [data.items]);
  const idleItems = useMemo(() => data.items.filter((item) => item.status === "闲置").length, [data.items]);

  const summary = useMemo(
    () => [
      ["总数", sidebarItems.length],
      ["当前筛选", filteredItems.length],
      ["高喜爱", filteredItems.filter((item) => item.favorite >= 4).length],
      ["有图片", filteredItems.filter((item) => Boolean(item.imageData)).length]
    ],
    [sidebarItems.length, filteredItems]
  );

  const activeChips = [
    filters.category ? `分类 · ${filters.category}` : "",
    filters.color ? `颜色 · ${filters.color}` : "",
    filters.material ? `材质 · ${filters.material}` : "",
    filters.fit ? `版型 · ${filters.fit}` : "",
    filters.status ? `状态 · ${filters.status}` : "",
    filters.search ? `搜索 · ${filters.search}` : ""
  ].filter(Boolean);

  function toggleFlip(id: string) {
    setFlippedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }

  function toggleSeason(item: WardrobeItem, season: WardrobeItem["seasons"][number]) {
    const nextSeasons = item.seasons.includes(season)
      ? item.seasons.filter((value) => value !== season)
      : [...item.seasons, season];
    onUpdateItem(item.id, { seasons: nextSeasons }, "季节已更新");
  }

  return (
    <section className="tab-panel active">
      <div className="closet-layout">
        <aside className="closet-sidebar card">
          <div className="sidebar-heading">分类导航</div>
          <div className="sidebar-groups">
            {GROUPS.map((group: (typeof GROUPS)[number]) => {
              const count =
                group.key === "all"
                  ? sidebarItems.length
                  : sidebarItems.filter((item) => resolveGroupForCategory(item.category, categoryGroups) === group.key).length;

              return (
                <button
                  key={group.key}
                  type="button"
                  className={clsx("sidebar-group", filters.group === group.key && "selected")}
                  onClick={() => onFilterChange({ group: group.key, category: "" })}
                >
                  <span className="sidebar-icon">{group.icon}</span>
                  <span>{group.label}</span>
                  <span className="sidebar-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-note">
            <div className="sidebar-note-title">整理提醒</div>
            <div className="sidebar-note-copy">
              {`还有 ${missingImages} 件没有图片，${idleItems} 件处于闲置状态。`}
            </div>
          </div>
        </aside>

        <div className="closet-main">
          <article className="closet-toolbar card">
            <div className="toolbar-top">
              <label className="search-field">
                <span className="search-icon">搜</span>
                <input
                  type="search"
                  placeholder="搜索衣物 / 品牌 / 标签"
                  value={filters.search}
                  onChange={(event) => onFilterChange({ search: event.target.value })}
                />
              </label>
              <div className="toolbar-actions">
                <button className="ghost-btn" type="button" onClick={onOpenNewItem}>
                  + 快速添加
                </button>
                <button className="ghost-btn" type="button" onClick={onClearFilters}>
                  清空筛选
                </button>
              </div>
            </div>

            <div className="closet-stats">
              {summary.map(([label, value]) => (
                <div key={String(label)} className="stat-tile">
                  <div className="stat-tile-label">{label}</div>
                  <div className="stat-tile-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="category-chip-bar">
              <button
                className={clsx("chip-btn", !filters.category && "selected")}
                type="button"
                onClick={() => onFilterChange({ category: "" })}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={clsx("chip-btn", filters.category === category && "selected")}
                  type="button"
                  onClick={() => onFilterChange({ category })}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="filter-bar">
              <label className="field">
                <span>颜色</span>
                <select value={filters.color} onChange={(event) => onFilterChange({ color: event.target.value })}>
                  <option value="">全部颜色</option>
                  {colorOptions.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>材质</span>
                <select value={filters.material} onChange={(event) => onFilterChange({ material: event.target.value })}>
                  <option value="">全部材质</option>
                  {materialOptions.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>版型</span>
                <select value={filters.fit} onChange={(event) => onFilterChange({ fit: event.target.value })}>
                  <option value="">全部版型</option>
                  {fitOptions.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>状态</span>
                <select
                  value={filters.status}
                  onChange={(event) => onFilterChange({ status: event.target.value as ItemStatus | "" })}
                >
                  <option value="">全部状态</option>
                  {STATUS_OPTIONS.map((option: ItemStatus) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>排序</span>
                <select
                  value={filters.sort}
                  onChange={(event) => onFilterChange({ sort: event.target.value as ClosetFilters["sort"] })}
                >
                  {SORT_OPTIONS.map((option: (typeof SORT_OPTIONS)[number]) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="active-filter-row">
              <div className="result-count">{`当前展示 ${filteredItems.length} 件`}</div>
              <div className="filter-chips">
                {activeChips.map((chip) => (
                  <span key={chip} className="filter-tag">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <div className="closet-item-grid">
            {filteredItems.length ? (
              filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  flipped={flippedIds.includes(item.id)}
                  onFlip={() => toggleFlip(item.id)}
                  onEdit={() => onOpenEditItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                  onToggleSeason={(season) => toggleSeason(item, season)}
                  onUpdateField={(field, value, message) =>
                    onUpdateItem(item.id, { [field]: value } as Partial<WardrobeItem>, message)
                  }
                />
              ))
            ) : (
              <div className="empty-state">当前筛选下没有衣物，可以先清空筛选，或从右侧快捷操作里继续添加。</div>
            )}
          </div>
        </div>

        <aside className="closet-rail">
          <article className="card rail-card">
            <div className="rail-title-row">
              <strong>整理提醒</strong>
            </div>
            <div className="legend-list">
              {reminders.map((row) => (
                <div key={row.label} className="legend-row">
                  <span className="legend-dot" style={{ background: row.color }} />
                  <div>
                    <div>{row.label}</div>
                    <div className="legend-meta">{row.meta}</div>
                  </div>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="card rail-card">
            <div className="rail-title-row">
              <strong>快捷操作</strong>
            </div>
            <div className="rail-action-list">
              <button className="ghost-btn rail-action-btn" type="button" onClick={onOpenNewItem}>
                添加衣物
              </button>
              <button className="ghost-btn rail-action-btn" type="button" onClick={onClearFilters}>
                清空筛选
              </button>
              <button className="ghost-btn rail-action-btn" type="button" onClick={onExport}>
                导出清单
              </button>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function ItemCard({
  item,
  flipped,
  onFlip,
  onEdit,
  onDelete,
  onToggleSeason,
  onUpdateField
}: {
  item: WardrobeItem;
  flipped: boolean;
  onFlip: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSeason: (season: typeof SEASON_OPTIONS[number]) => void;
  onUpdateField: (field: keyof WardrobeItem, value: WardrobeItem[keyof WardrobeItem], message?: string) => void;
}) {
  const metaStyle = createItemMetaStyle(item);
  const seasonTags = item.seasons.length ? item.seasons : ["未设季节"];
  const styleTagLine = item.styleTags.length ? item.styleTags.slice(0, 3) : ["待补标签"];
  const [styleTagsDraft, setStyleTagsDraft] = useState(item.styleTags.join("、"));

  useEffect(() => {
    setStyleTagsDraft(item.styleTags.join("、"));
  }, [item.id, item.styleTags]);

  function commitStyleTags() {
    const nextTags = styleTagsDraft
      .split(/[、，,|]+/g)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (nextTags.join("、") === item.styleTags.join("、")) return;
    onUpdateField("styleTags", nextTags, "单品信息已更新");
  }

  function handleStyleTagsKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
  }

  return (
    <article className={clsx("item-card card", flipped && "is-flipped")} data-item-id={item.id}>
      <div className="item-card-inner">
        <div className="item-face item-face-front">
          <div className="item-front-top">
            <div className="item-title-block">
              <span className="item-badge">
                <span className="badge-icon" style={{ background: metaStyle.category.color }}>
                  {metaStyle.category.short}
                </span>
                <span>{item.category || "未分类"}</span>
              </span>
              <div className="item-title">{item.name || "未命名单品"}</div>
            </div>
            <div className="item-actions">
              <button className="flip-btn" type="button" aria-label="翻转卡片" onClick={onFlip}>
                ⋯
              </button>
            </div>
          </div>

          <div className="item-visual">
            {item.imageData ? (
              <img className="item-image" src={item.imageData} alt={item.name} />
            ) : (
              <div className="item-image-placeholder">
                <span className="item-image-placeholder-icon">{metaStyle.category.short}</span>
                <div className="item-image-placeholder-text">可在编辑弹窗里直接粘贴图片</div>
              </div>
            )}
          </div>

          <div className="item-meta-grid">
            <MetaChip label="颜色" value={item.color || "未填"} />
            <MetaChip label="材质" value={item.material || "未填"} />
            <MetaChip label="版型" value={item.fit || "未填"} />
            <MetaChip label="店铺" value={item.store || "未填"} />
          </div>

          <div className="item-tag-row">
            {seasonTags.map((tag) => (
              <span key={tag} className="tiny-tag">
                {tag}
              </span>
            ))}
            {styleTagLine.map((tag) => (
              <span key={tag} className="tiny-tag">
                {tag}
              </span>
            ))}
          </div>

          <div className="item-footer-note">{`状态 · ${item.status || "未设"}　喜爱 · ${item.favorite || 0} / 5`}</div>
        </div>

        <div className="item-face item-face-back">
          <div className="item-back-top">
            <div className="item-title-block">
              <div className="item-title">{item.name || "未命名单品"}</div>
              <div className="item-footer-note">翻到背面快速维护这件衣服的设定信息</div>
            </div>
            <div className="item-actions">
              <button className="flip-btn" type="button" aria-label="删除" onClick={onDelete}>
                ×
              </button>
              <button className="flip-btn" type="button" aria-label="编辑" onClick={onEdit}>
                ✎
              </button>
              <button className="flip-btn" type="button" aria-label="翻回正面" onClick={onFlip}>
                ↺
              </button>
            </div>
          </div>

          <div className="item-back-grid">
            <div className="item-edit-block">
              <div className="item-edit-label">季节</div>
              <div className="season-row">
                {SEASON_OPTIONS.map((season: (typeof SEASON_OPTIONS)[number]) => (
                  <button
                    key={season}
                    className={clsx("season-dot", item.seasons.includes(season) && "active")}
                    type="button"
                    onClick={() => onToggleSeason(season)}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <div className="item-edit-block">
              <div className="item-edit-label">穿着频次</div>
              <select
                className="inline-select"
                value={item.wearFrequency}
                onChange={(event) =>
                  onUpdateField("wearFrequency", event.target.value as WardrobeItem["wearFrequency"], "单品信息已更新")
                }
              >
                <option value="">未设置</option>
                {WEAR_OPTIONS.map((option: (typeof WEAR_OPTIONS)[number]) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="item-edit-block">
              <div className="item-edit-label">喜爱程度</div>
              <select
                className="inline-select"
                value={String(item.favorite || 0)}
                onChange={(event) => onUpdateField("favorite", Number(event.target.value), "单品信息已更新")}
              >
                <option value="0">未设置</option>
                {FAVORITE_OPTIONS.map((option: (typeof FAVORITE_OPTIONS)[number]) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="item-edit-block">
              <div className="item-edit-label">状态</div>
              <div className="status-row">
                {STATUS_OPTIONS.map((status: WardrobeItem["status"]) => (
                  <button
                    key={status}
                    className={clsx("status-chip", item.status === status && "active")}
                    data-status={status}
                    type="button"
                    onClick={() => onUpdateField("status", status, "状态已更新")}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="item-edit-block">
              <div className="item-edit-label">风格标签</div>
              <input
                className="inline-input"
                type="text"
                value={styleTagsDraft}
                placeholder="如：通勤、老钱、文艺"
                onChange={(event) => setStyleTagsDraft(event.target.value)}
                onBlur={commitStyleTags}
                onKeyDown={handleStyleTagsKeyDown}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-chip">
      <div className="meta-chip-label">{label}</div>
      <div className="meta-chip-value">{value}</div>
    </div>
  );
}
