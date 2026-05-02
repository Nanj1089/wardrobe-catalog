import {
  GROUPS,
  colorFromText,
  getCategoryStyle,
  normalizeAppData,
  normalizeItem,
  uniqueStrings
} from "../data/defaultData";
import type {
  AppData,
  CategoryStyle,
  ClosetFilters,
  ClosetGroupKey,
  LegendRow,
  PurchaseAssistantResult,
  ReminderRow,
  WardrobeItem
} from "@/types";

export { GROUPS, colorFromText, getCategoryStyle, normalizeItem, uniqueStrings };

export function normalizeClosetGroupKey(group?: string): ClosetGroupKey {
  if (
    group === "inner" ||
    group === "tops" ||
    group === "bottoms" ||
    group === "dresses" ||
    group === "outer" ||
    group === "bags" ||
    group === "accessories" ||
    group === "shoes"
  ) {
    return group;
  }

  return "tops";
}

export function guessGroupForCategory(category: string): ClosetGroupKey {
  const text = safeText(category);
  if (!text) return "tops";
  if (/(连衣裙|长裙|套装)/.test(text)) return "dresses";
  if (/(大衣|羽绒|外套|风衣|冲锋衣)/.test(text)) return "outer";
  if (/(内衣|内搭|吊带|抹胸|背心)/.test(text)) return "inner";
  if (/(包|手提包|托特包|背包|斜挎包|钱夹|钱包)/.test(text)) return "bags";
  if (/(耳饰|项链|手链|帽子|眼镜|腰带|围巾|丝巾)/.test(text)) return "accessories";
  if (/(鞋|靴|袜|乐福|高跟|运动鞋|短靴|长靴)/.test(text)) return "shoes";
  if (/(裤子|半裙|裙裤|西裤)/.test(text)) return "bottoms";
  if (/(衬衫|卫衣|马甲|毛衣|上衣|短袖|披肩)/.test(text)) return "tops";
  return "tops";
}

export function resolveGroupForCategory(
  category: string,
  categoryGroups: Partial<Record<string, ClosetGroupKey>> = {}
) {
  const currentGroup = categoryGroups[category];
  return currentGroup ? normalizeClosetGroupKey(currentGroup) : guessGroupForCategory(category);
}

export function getFilteredItems(
  data: AppData,
  filters: ClosetFilters,
  categoryGroups: Partial<Record<string, ClosetGroupKey>> = {}
) {
  let items = [...data.items];

  if (filters.group !== "all") {
    items = items.filter((item) => resolveGroupForCategory(item.category, categoryGroups) === filters.group);
  }

  if (filters.category) {
    items = items.filter((item) => item.category === filters.category);
  }

  if (filters.color) {
    items = items.filter((item) => item.color === filters.color);
  }

  if (filters.material) {
    items = items.filter((item) => item.material === filters.material);
  }

  if (filters.fit) {
    items = items.filter((item) => item.fit === filters.fit);
  }

  if (filters.status) {
    items = items.filter((item) => item.status === filters.status);
  }

  if (filters.search.trim()) {
    const keyword = filters.search.trim().toLowerCase();
    items = items.filter((item) =>
      [item.name, item.category, item.color, item.material, item.fit, item.store, item.styleTags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }

  return sortItems(items, filters.sort);
}

export function sortItems(items: WardrobeItem[], mode: ClosetFilters["sort"]) {
  const list = [...items];
  const collator = new Intl.Collator("zh-CN");

  list.sort((a, b) => {
    if (mode === "name-asc") {
      return collator.compare(a.name, b.name);
    }

    if (mode === "favorite-desc") {
      return (b.favorite || 0) - (a.favorite || 0) || collator.compare(a.name, b.name);
    }

    if (mode === "feature-priority") {
      return (
        collator.compare(a.fit || "", b.fit || "") ||
        collator.compare(a.material || "", b.material || "") ||
        collator.compare(a.color || "", b.color || "") ||
        collator.compare(a.name, b.name)
      );
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return list;
}

export function categoriesForGroup(
  data: AppData,
  group: ClosetFilters["group"],
  categoryGroups: Partial<Record<string, ClosetGroupKey>> = {}
) {
  const categories = data.profile.categories;
  if (group === "all") return categories;
  return categories.filter((category) => resolveGroupForCategory(category, categoryGroups) === group);
}

export function buildReminderRows(items: WardrobeItem[]): ReminderRow[] {
  return [
    {
      color: "#d79f66",
      label: "未贴图",
      value: `${items.filter((item) => !item.imageData).length} 件`,
      meta: "粘贴截图后卡片会更像真实衣橱"
    },
    {
      color: "#7eaf7c",
      label: "高喜爱",
      value: `${items.filter((item) => item.favorite >= 4).length} 件`,
      meta: "优先保留可搭配度高的单品"
    },
    {
      color: "#e1c46e",
      label: "闲置",
      value: `${items.filter((item) => item.status === "闲置").length} 件`,
      meta: "适合移入收纳或做出清判断"
    }
  ];
}

export function buildLegendRows(
  items: WardrobeItem[],
  type: "category" | "color" | "store"
): LegendRow[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key =
      type === "category"
        ? item.category || "未分类"
        : type === "color"
          ? item.color || "未设颜色"
          : item.store || "未记店铺";
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      color:
        type === "category"
          ? getCategoryStyle(label, index).color
          : type === "color"
            ? colorFromText(label)
            : storePalette[index % storePalette.length]
    }));
}

export function buildPurchaseAssistantResult(
  data: AppData,
  candidate: {
    name: string;
    category: string;
    color: string;
    material: string;
    fit: string;
    store: string;
  }
): PurchaseAssistantResult {
  const similar = data.items.filter((item) => {
    let score = 0;
    if (candidate.category && item.category === candidate.category) score += 3;
    if (candidate.color && item.color === candidate.color) score += 2;
    if (candidate.fit && item.fit === candidate.fit) score += 2;
    if (candidate.material && item.material === candidate.material) score += 1;
    if (candidate.store && item.store === candidate.store) score += 1;
    return score >= 3;
  });

  const sameCategoryCount = data.items.filter((item) => item.category === candidate.category).length;

  if (similar.length >= 3) {
    return {
      level: "stop",
      title: "重复风险高",
      note: `已经找到 ${similar.length} 件高度相似的单品，建议先回看现有搭配。`,
      similarItems: similar.slice(0, 4)
    };
  }

  if (sameCategoryCount >= 10) {
    return {
      level: "warn",
      title: "先谨慎一点",
      note: `这个分类已经有 ${sameCategoryCount} 件，除非它能补明显缺口，否则优先级可以靠后。`,
      similarItems: similar.slice(0, 4)
    };
  }

  return {
    level: "good",
    title: "可以考虑",
    note: "现有衣橱里没有明显重复的同类型单品。",
    similarItems: similar.slice(0, 4)
  };
}

export function renameCategories(
  data: AppData,
  rows: Array<{ original: string; value: string }>
) {
  const renameMap = new Map<string, string>();
  const keptOriginals = new Set<string>();
  const cleanedCategories = uniqueStrings(rows.map((row) => row.value).filter(Boolean)).filter(
    (category) => category !== "未分类"
  );

  rows.forEach((row) => {
    if (row.original) {
      keptOriginals.add(row.original);
      if (row.value && row.value !== row.original) {
        renameMap.set(row.original, row.value);
      }
    }
  });

  const kept = new Set(cleanedCategories);
  const nextItems = data.items.map((item) => {
    if (renameMap.has(item.category)) {
      return normalizeItem({
        ...item,
        category: renameMap.get(item.category)!,
        updatedAt: new Date().toISOString()
      });
    }

    if (!keptOriginals.has(item.category) && !kept.has(item.category)) {
      return normalizeItem({
        ...item,
        category: "",
        updatedAt: new Date().toISOString()
      });
    }

    return item;
  });

  return normalizeAppData({
    ...data,
    profile: {
      ...data.profile,
      categories: cleanedCategories
    },
    items: nextItems,
    updatedAt: new Date().toISOString()
  });
}

export function createItemMetaStyle(item: WardrobeItem): {
  color: string;
  category: CategoryStyle;
} {
  return {
    color: colorFromText(item.color || ""),
    category: getCategoryStyle(item.category)
  };
}

export function buildCategoryGroupMap(
  categories: string[],
  current: Partial<Record<string, ClosetGroupKey>>
) {
  return categories.reduce<Partial<Record<string, ClosetGroupKey>>>((result, category) => {
    const resolved = current[category] ? normalizeClosetGroupKey(current[category]) : guessGroupForCategory(category);
    result[category] = resolved;
    return result;
  }, {});
}

function safeText(value?: string) {
  return (value || "").trim();
}

const storePalette = [
  "#c8a27f",
  "#8ea9cf",
  "#849a7d",
  "#d7adb0",
  "#b39bc7",
  "#dfc36a",
  "#9c6c45",
  "#95a8b0"
];
