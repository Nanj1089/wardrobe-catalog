import legacyWardrobe from "./legacyWardrobe.json";
import type {
  ActivityRecord,
  AppData,
  CategoryStyle,
  ClosetGroupKey,
  ClosetSortMode,
  GroupDefinition,
  ItemStatus,
  LegacyWardrobeItem,
  LegacyWardrobeStore,
  MeasurementData,
  PreviousReactAppData,
  PreviousReactInventoryItem,
  SeasonTag,
  SharedState,
  WardrobeItem
} from "@/types";

export const APP_VERSION = "4.0.0";
export const STORAGE_KEY = "nanjiang-wardrobe-react-v4";
export const LEGACY_STORAGE_KEY = "nanjiang-wardrobe-library-v3";
export const PREVIOUS_REACT_STORAGE_KEY = "my-wardrobe-react-v1";

export const DEFAULT_CATEGORIES = [
  "内衣",
  "内搭",
  "衬衫",
  "卫衣",
  "马甲",
  "毛衣",
  "大衣",
  "羽绒",
  "外套",
  "风衣",
  "冲锋衣",
  "裤子",
  "半裙",
  "连衣裙",
  "上衣",
  "吊带/抹胸",
  "背心",
  "短袖",
  "披肩"
];

export const STATUS_OPTIONS: ItemStatus[] = ["在穿", "闲置", "收藏", "愿望"];
export const WEAR_OPTIONS = ["高频", "中频", "低频"] as const;
export const SEASON_OPTIONS: SeasonTag[] = ["春", "夏", "秋", "冬"];
export const SORT_OPTIONS: Array<{ value: ClosetSortMode; label: string }> = [
  { value: "updated-desc", label: "最近更新" },
  { value: "name-asc", label: "名称 A-Z" },
  { value: "feature-priority", label: "版型 / 材质 / 颜色优先" },
  { value: "favorite-desc", label: "喜爱程度从高到低" }
];

export const FAVORITE_OPTIONS = [
  { value: 5, label: "5 分 很喜欢" },
  { value: 4, label: "4 分 喜欢" },
  { value: 3, label: "3 分 一般" },
  { value: 2, label: "2 分 偶尔穿" },
  { value: 1, label: "1 分 可替代" }
];

export const GROUPS: GroupDefinition[] = [
  { key: "inner", label: "贴身层", icon: "内" },
  { key: "tops", label: "上身", icon: "上" },
  { key: "bottoms", label: "下身", icon: "下" },
  { key: "dresses", label: "全身", icon: "裙" },
  { key: "outer", label: "外层", icon: "外" },
  { key: "bags", label: "包饰", icon: "包" },
  { key: "accessories", label: "配饰", icon: "配" },
  { key: "shoes", label: "鞋袜", icon: "鞋" },
  { key: "all", label: "全部", icon: "衣" }
];

export const MEASUREMENT_MAIN_FIELDS: Array<{ key: keyof MeasurementData; label: string; unit: string; icon: string }> = [
  { key: "height", label: "身高", unit: "cm", icon: "⟂" },
  { key: "weight", label: "体重", unit: "kg", icon: "◌" },
  { key: "shoulder", label: "肩宽", unit: "cm", icon: "⌒" },
  { key: "bust", label: "胸围", unit: "cm", icon: "◔" },
  { key: "waist", label: "腰围", unit: "cm", icon: "◡" },
  { key: "hip", label: "臀围", unit: "cm", icon: "◠" },
  { key: "legLength", label: "裤长", unit: "cm", icon: "∥" },
  { key: "shoeSize", label: "鞋码", unit: "", icon: "⌣" }
];

export const MEASUREMENT_SECONDARY_FIELDS: Array<{ key: keyof MeasurementData; label: string; unit: string }> = [
  { key: "armLength", label: "臂长", unit: "cm" },
  { key: "underbust", label: "底围", unit: "cm" },
  { key: "thigh", label: "大腿围", unit: "cm" },
  { key: "footLength", label: "脚长", unit: "cm" },
  { key: "footWidth", label: "脚宽", unit: "cm" },
  { key: "braSize", label: "内衣码", unit: "" }
];

export const MARKER_CONFIG = [
  { key: "bust" as const, label: "上胸围", top: "35%", left: "54%", secondary: false },
  { key: "waist" as const, label: "腰围", top: "58%", left: "49%", secondary: false },
  { key: "shoeSize" as const, label: "鞋码", top: "85%", left: "50%", secondary: true }
];

export const COLOR_SUGGESTIONS = [
  "白色",
  "米白",
  "奶白",
  "浅灰",
  "深灰",
  "黑色",
  "卡其",
  "杏色",
  "驼色",
  "沙色",
  "棕色",
  "咖色",
  "浅蓝",
  "牛仔蓝",
  "深蓝",
  "墨绿",
  "酒红",
  "砖红",
  "粉色",
  "浅紫",
  "黄色"
];

const DEFAULT_MEASUREMENTS: MeasurementData = {
  height: "178",
  weight: "61",
  shoeSize: "41.5",
  braSize: "",
  shoulder: "39",
  armLength: "57",
  bust: "88",
  underbust: "75",
  waist: "71",
  hip: "97",
  legLength: "98",
  thigh: "54",
  footLength: "25.2",
  footWidth: ""
};

export const EMPTY_SHARED_STATE: SharedState = {
  enabled: false,
  authRequired: false,
  dataFile: "",
  originLabel: ""
};

export function buildDefaultData(): AppData {
  return migrateLegacyStore(legacyWardrobe as LegacyWardrobeStore);
}

export function migrateAnyData(source: unknown): AppData {
  if (isAppData(source)) {
    return normalizeAppData(source);
  }

  if (isLegacyStore(source)) {
    return migrateLegacyStore(source);
  }

  return buildDefaultData();
}

export function migratePreviousReactData(source: PreviousReactAppData): AppData {
  const measurements = normalizeMeasurements(source.measurements ?? {});
  const styleTitle = source.styleProfile?.title?.trim() || "港风、老钱、文艺与一点故事感的复古衣橱";
  const styleDescription =
    source.styleProfile?.description?.trim() ||
    "白色打底、温柔轻暖、偏简约但不简单。核心气质是港风和老钱的克制，夹一点文艺与浅淡西亚。";
  const categories = uniqueStrings([
    ...DEFAULT_CATEGORIES,
    ...source.inventory
      ?.map((item) => item.subcategory?.trim() || item.primaryCategory?.trim() || "")
      .filter(Boolean) ?? []
  ]);

  const items = (source.inventory ?? []).map((item, index) => mapPreviousReactItem(item, index));

  return normalizeAppData({
    version: APP_VERSION,
    updatedAt: new Date().toISOString(),
    profile: {
      displayName: "我",
      styleTitle,
      styleDescription,
      categories,
      storeNotes: {},
      measurements
    },
    items,
    activities: source.activities ?? buildDefaultActivities(),
    capacityLimit: source.capacityLimit ?? 400
  });
}

export function migrateLegacyStore(input?: LegacyWardrobeStore): AppData {
  const source = input ?? {};
  const items = (source.items ?? []).map((item, index) => mapLegacyItem(item, index));
  const categories = uniqueStrings([...(source.profile?.categories ?? []), ...DEFAULT_CATEGORIES, ...items.map((item) => item.category)]);

  return normalizeAppData({
    version: source.version || APP_VERSION,
    updatedAt: source.updatedAt || new Date().toISOString(),
    profile: {
      displayName: source.profile?.displayName?.trim() || "我",
      styleTitle: source.profile?.styleTitle?.trim() || "港风、老钱、文艺与一点故事感的复古衣橱",
      styleDescription:
        source.profile?.styleDescription?.trim() ||
        "白色打底、温柔轻暖、偏简约但不简单。核心气质是港风和老钱的克制，夹一点文艺与浅淡西亚。",
      categories,
      storeNotes: {},
      measurements: normalizeMeasurements(source.profile?.measurements ?? {})
    },
    items,
    activities: source.activities?.length ? source.activities : buildDefaultActivities(source.updatedAt),
    capacityLimit: source.capacityLimit ?? 400
  });
}

export function normalizeAppData(input: Partial<AppData>): AppData {
  const profile = input.profile ?? {
    displayName: "我",
    styleTitle: "",
    styleDescription: "",
    categories: [...DEFAULT_CATEGORIES],
    storeNotes: {},
    measurements: DEFAULT_MEASUREMENTS
  };

  const items = (input.items ?? []).map((item, index) => normalizeItem(item, index));
  const nextCategories = uniqueStrings([
    ...((profile.categories?.length ? profile.categories.filter((category) => category !== "未分类") : items.length ? [] : DEFAULT_CATEGORIES) ?? []),
    ...items.map((item) => item.category).filter(Boolean)
  ]);

  return {
    version: input.version || APP_VERSION,
    updatedAt: input.updatedAt || new Date().toISOString(),
    profile: {
      displayName: profile.displayName?.trim() || "我",
      styleTitle: profile.styleTitle?.trim() || "",
      styleDescription: profile.styleDescription?.trim() || "",
      categories: nextCategories.length ? nextCategories : [...DEFAULT_CATEGORIES],
      storeNotes: normalizeStoreNotes(profile.storeNotes),
      measurements: normalizeMeasurements(profile.measurements ?? {})
    },
    items,
    activities: (input.activities ?? buildDefaultActivities()).slice(0, 30),
    capacityLimit: input.capacityLimit ?? 400
  };
}

export function normalizeItem(item: Partial<WardrobeItem>, index = 0): WardrobeItem {
  const now = new Date().toISOString();
  const name = item.name?.trim() || `衣物 ${index + 1}`;
  const category = item.category?.trim() === "未分类" ? "" : item.category?.trim() || "";
  const color = normalizeColor(item.color || "");

  return {
    id: item.id || `wardrobe-${Date.now()}-${index}`,
    name,
    category,
    color,
    material: item.material?.trim() || "",
    fit: item.fit?.trim() || "",
    store: item.store?.trim() || "",
    imageData: item.imageData || "",
    wearFrequency: normalizeWearFrequency(item.wearFrequency),
    favorite: clampFavorite(item.favorite),
    styleTags: uniqueStrings(item.styleTags ?? []),
    status: normalizeStatus(item.status),
    seasons: normalizeSeasons(item.seasons ?? []),
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now
  };
}

export function createEmptyItem(categories: string[], current?: Partial<WardrobeItem>): WardrobeItem {
  const now = new Date().toISOString();
  return normalizeItem({
    id: current?.id || `wardrobe-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: current?.name || "",
    category: current?.category === "未分类" ? "" : current?.category || categories[0] || "",
    color: current?.color || "",
    material: current?.material || "",
    fit: current?.fit || "",
    store: current?.store || "",
    imageData: current?.imageData || "",
    wearFrequency: current?.wearFrequency || "",
    favorite: current?.favorite || 0,
    styleTags: current?.styleTags || [],
    status: current?.status || "在穿",
    seasons: current?.seasons || [],
    createdAt: current?.createdAt || now,
    updatedAt: current?.updatedAt || now
  });
}

export function createActivity(type: ActivityRecord["type"], description: string): ActivityRecord {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    type,
    description
  };
}

export function appendActivity(data: AppData, type: ActivityRecord["type"], description: string): AppData {
  return normalizeAppData({
    ...data,
    updatedAt: new Date().toISOString(),
    activities: [createActivity(type, description), ...data.activities].slice(0, 30)
  });
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

export function normalizeTagArray(value: string) {
  return uniqueStrings(
    value
      .split(/[、，,/|]+/g)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export function groupForCategory(category: string): ClosetGroupKey {
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

export function colorFromText(color: string) {
  const text = safeText(color);
  if (!text) return "#c8a27f";
  if (text.includes("黑")) return "#2c2c2c";
  if (text.includes("白")) return "#f1ede7";
  if (text.includes("灰")) return text.includes("深") ? "#72757d" : "#a8abae";
  if (text.includes("卡其")) return "#cab18a";
  if (text.includes("驼")) return "#c2905d";
  if (text.includes("棕") || text.includes("咖")) return "#9c6c45";
  if (text.includes("蓝")) return text.includes("深") ? "#627da1" : "#8ea9cf";
  if (text.includes("绿")) return "#849a7d";
  if (text.includes("粉")) return "#d7adb0";
  if (text.includes("红")) return "#c86d5f";
  if (text.includes("黄")) return "#dfc36a";
  if (text.includes("紫")) return "#b39bc7";
  return stableHashColor(text);
}

export function getCategoryStyle(category: string, index = 0): CategoryStyle {
  const palette = [
    "#bf9066",
    "#c8a27f",
    "#d7b08c",
    "#b59f87",
    "#9aa78d",
    "#a88c7a",
    "#c69586",
    "#c4a7b2",
    "#95a8b0",
    "#8b9cb1",
    "#c8a175",
    "#b58d77",
    "#d8b6b0",
    "#cb998a",
    "#d5bf9d",
    "#d6b98e",
    "#b6a48a",
    "#bd9d8f",
    "#c7b3a6"
  ];

  return {
    color: palette[index % palette.length],
    short: safeText(category).slice(0, 1) || "衣"
  };
}

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AppData;
  return Boolean(candidate.profile && Array.isArray(candidate.items));
}

function isLegacyStore(value: unknown): value is LegacyWardrobeStore {
  if (!value || typeof value !== "object") return false;
  const candidate = value as LegacyWardrobeStore;
  return Boolean(candidate.profile || Array.isArray(candidate.items));
}

function mapLegacyItem(item: LegacyWardrobeItem, index: number): WardrobeItem {
  return normalizeItem({
    id: item.id || `legacy-${index}`,
    name: item.name || `衣物 ${index + 1}`,
    category: item.category || "",
    color: item.color || "",
    material: item.material || "",
    fit: item.fit || "",
    store: item.store || "",
    imageData: item.imageData || "",
    wearFrequency: normalizeWearFrequency(item.wearFrequency),
    favorite: clampFavorite(item.favorite),
    styleTags: item.styleTags || [],
    status: normalizeStatus(item.status),
    seasons: normalizeSeasons(item.seasons || []),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }, index);
}

function mapPreviousReactItem(item: PreviousReactInventoryItem, index: number): WardrobeItem {
  return normalizeItem({
    id: item.id || `react-${index}`,
    name: item.name || `衣物 ${index + 1}`,
    category: item.subcategory || item.primaryCategory || "",
    color: item.color || "",
    material: item.note || "",
    fit: item.layer || "",
    store: item.brand || "",
    imageData: "",
    wearFrequency: item.wearCount && item.wearCount >= 12 ? "高频" : item.wearCount && item.wearCount >= 6 ? "中频" : "",
    favorite: clampFavorite(item.tags?.includes("常穿") ? 4 : 0),
    styleTags: item.tags || [],
    status: mapPreviousStatus(item.status),
    seasons: seasonLabelToTags(item.season),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }, index);
}

function normalizeMeasurements(input: Partial<Record<string, string>> | Partial<MeasurementData>): MeasurementData {
  const source = input as Partial<Record<string, string>>;
  return {
    height: source.height || source["身高"] || DEFAULT_MEASUREMENTS.height,
    weight: source.weight || source["体重"] || DEFAULT_MEASUREMENTS.weight,
    shoeSize: source.shoeSize || source["鞋码"] || DEFAULT_MEASUREMENTS.shoeSize,
    braSize: source.braSize || source["内衣码"] || DEFAULT_MEASUREMENTS.braSize,
    shoulder: source.shoulder || source["肩宽"] || DEFAULT_MEASUREMENTS.shoulder,
    armLength: source.armLength || source["臂长"] || DEFAULT_MEASUREMENTS.armLength,
    bust: source.bust || source["胸围"] || source["上胸围"] || DEFAULT_MEASUREMENTS.bust,
    underbust: source.underbust || source["底围"] || DEFAULT_MEASUREMENTS.underbust,
    waist: source.waist || source["腰围"] || DEFAULT_MEASUREMENTS.waist,
    hip: source.hip || source["臀围"] || DEFAULT_MEASUREMENTS.hip,
    legLength: source.legLength || source["裤长"] || DEFAULT_MEASUREMENTS.legLength,
    thigh: source.thigh || source["大腿围"] || DEFAULT_MEASUREMENTS.thigh,
    footLength: source.footLength || source["脚长"] || DEFAULT_MEASUREMENTS.footLength,
    footWidth: source.footWidth || source["脚宽"] || DEFAULT_MEASUREMENTS.footWidth
  };
}

function normalizeStoreNotes(input?: Record<string, string>) {
  return Object.entries(input ?? {}).reduce<Record<string, string>>((result, [store, note]) => {
    const nextStore = safeText(store);
    if (!nextStore) return result;
    result[nextStore] = typeof note === "string" ? note.trim() : "";
    return result;
  }, {});
}

function buildDefaultActivities(updatedAt?: string): ActivityRecord[] {
  const base: ActivityRecord[] = [
    {
      id: "activity-measurement-default",
      timestamp: "2026-04-24T14:32:00.000Z",
      type: "profile" as const,
      description: "更新人体尺寸"
    },
    {
      id: "activity-item-default-1",
      timestamp: "2026-04-24T14:20:00.000Z",
      type: "item" as const,
      description: "编辑衣橱单品"
    },
    {
      id: "activity-item-default-2",
      timestamp: "2026-04-24T13:58:00.000Z",
      type: "item" as const,
      description: "新增衣物记录"
    }
  ];

  if (updatedAt) {
    base.unshift({
      id: "activity-system-migrate",
      timestamp: updatedAt,
      type: "system",
      description: "迁移原有电子衣橱数据"
    });
  }

  return base;
}

function normalizeColor(value: string) {
  const text = safeText(value);
  if (!text) return "";
  const normalized = text.replace(/\s+/g, "").replace(/色$/, "");
  if (normalized === "米白") return "米白";
  if (normalized === "奶白") return "奶白";
  if (normalized === "白") return "白色";
  if (normalized === "深灰") return "深灰";
  if (normalized === "灰" || normalized === "浅灰") return "浅灰";
  if (normalized === "黑") return "黑色";
  if (normalized === "卡其") return "卡其";
  if (normalized === "驼") return "驼色";
  if (normalized === "沙") return "沙色";
  if (normalized === "棕") return "棕色";
  if (normalized === "咖") return "咖色";
  if (normalized === "深蓝") return "深蓝";
  if (normalized === "蓝") return "蓝色";
  return text;
}

function normalizeWearFrequency(value?: string): WardrobeItem["wearFrequency"] {
  const text = safeText(value);
  if (text.includes("高")) return "高频";
  if (text.includes("中")) return "中频";
  if (text.includes("低")) return "低频";
  return "";
}

function normalizeStatus(value?: string): ItemStatus {
  const text = safeText(value);
  if (text.includes("闲") || text.includes("换季")) return "闲置";
  if (text.includes("藏")) return "收藏";
  if (text.includes("愿")) return "愿望";
  return "在穿";
}

function normalizeSeasons(values: string[]): SeasonTag[] {
  return values
    .map((value) => safeText(value))
    .map((value) => {
      if (value.includes("春")) return "春";
      if (value.includes("夏")) return "夏";
      if (value.includes("秋")) return "秋";
      if (value.includes("冬")) return "冬";
      return null;
    })
    .filter((item): item is SeasonTag => Boolean(item))
    .filter((item, index, array) => array.indexOf(item) === index);
}

function mapPreviousStatus(value?: string): ItemStatus {
  const text = safeText(value);
  if (text.includes("换季")) return "闲置";
  if (text.includes("洗")) return "在穿";
  return normalizeStatus(text);
}

function seasonLabelToTags(label?: string) {
  const text = safeText(label);
  if (!text) return [];
  if (text.includes("春夏")) return ["春", "夏"] as SeasonTag[];
  if (text.includes("春秋")) return ["春", "秋"] as SeasonTag[];
  if (text.includes("秋冬")) return ["秋", "冬"] as SeasonTag[];
  if (text.includes("冬")) return ["冬"] as SeasonTag[];
  if (text.includes("夏")) return ["夏"] as SeasonTag[];
  if (text.includes("春")) return ["春"] as SeasonTag[];
  if (text.includes("秋")) return ["秋"] as SeasonTag[];
  return [];
}

function clampFavorite(value?: number) {
  if (!value) return 0;
  return Math.max(0, Math.min(5, Number(value)));
}

function safeText(value?: string) {
  return (value || "").trim();
}

function stableHashColor(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) % 360;
  }

  return `hsl(${hash} 38% 66%)`;
}
