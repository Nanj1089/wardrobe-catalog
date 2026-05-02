export type AppTab = "home" | "closet" | "hub";

export type ClosetGroupKey =
  | "all"
  | "inner"
  | "tops"
  | "bottoms"
  | "dresses"
  | "outer"
  | "bags"
  | "accessories"
  | "shoes";
export type ClosetSortMode = "updated-desc" | "name-asc" | "feature-priority" | "favorite-desc";
export type ItemStatus = "在穿" | "闲置" | "收藏" | "愿望";
export type WearFrequency = "" | "高频" | "中频" | "低频";
export type SeasonTag = "春" | "夏" | "秋" | "冬";
export type SaveState = "saved" | "saving" | "error";

export interface MeasurementData {
  height: string;
  weight: string;
  shoeSize: string;
  braSize: string;
  shoulder: string;
  armLength: string;
  bust: string;
  underbust: string;
  waist: string;
  hip: string;
  legLength: string;
  thigh: string;
  footLength: string;
  footWidth: string;
}

export interface WardrobeProfile {
  displayName: string;
  styleTitle: string;
  styleDescription: string;
  categories: string[];
  storeNotes: Record<string, string>;
  measurements: MeasurementData;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  material: string;
  fit: string;
  store: string;
  imageData: string;
  wearFrequency: WearFrequency;
  favorite: number;
  styleTags: string[];
  status: ItemStatus;
  seasons: SeasonTag[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecord {
  id: string;
  timestamp: string;
  type: "system" | "profile" | "item" | "category" | "share";
  description: string;
}

export interface AppData {
  version: string;
  updatedAt: string;
  profile: WardrobeProfile;
  items: WardrobeItem[];
  activities: ActivityRecord[];
  capacityLimit: number;
}

export interface SharedState {
  enabled: boolean;
  authRequired: boolean;
  dataFile: string;
  originLabel: string;
}

export interface ClosetFilters {
  group: ClosetGroupKey;
  category: string;
  color: string;
  material: string;
  fit: string;
  status: ItemStatus | "";
  sort: ClosetSortMode;
  search: string;
}

export interface PurchaseCandidate {
  name: string;
  category: string;
  color: string;
  material: string;
  fit: string;
  store: string;
}

export interface PurchaseAssistantResult {
  level: "good" | "warn" | "stop";
  title: string;
  note: string;
  similarItems: WardrobeItem[];
}

export interface CategoryStyle {
  color: string;
  short: string;
}

export interface LegendRow {
  label: string;
  value: number;
  color: string;
}

export interface ReminderRow {
  color: string;
  label: string;
  value: string;
  meta: string;
}

export interface GroupDefinition {
  key: ClosetGroupKey;
  label: string;
  icon: string;
}

export interface PreviousReactInventoryItem {
  id?: string;
  name?: string;
  primaryCategory?: string;
  subcategory?: string;
  season?: string;
  color?: string;
  brand?: string;
  location?: string;
  status?: string;
  wearCount?: number;
  note?: string;
  tags?: string[];
  layer?: string;
  imageMode?: string;
  imageTone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreviousReactStyleProfile {
  primaryStyle?: string;
  colorPreferences?: string[];
  frequentBrands?: string[];
  keywords?: string[];
  tags?: string[];
  title?: string;
  description?: string;
}

export interface PreviousReactAppData {
  measurements?: Partial<MeasurementData>;
  styleProfile?: PreviousReactStyleProfile;
  inventory?: PreviousReactInventoryItem[];
  activities?: ActivityRecord[];
  capacityLimit?: number;
}

export interface LegacyWardrobeProfile {
  displayName?: string;
  styleTitle?: string;
  styleDescription?: string;
  categories?: string[];
  measurements?: Record<string, string>;
}

export interface LegacyWardrobeItem {
  id?: string;
  name?: string;
  category?: string;
  color?: string;
  material?: string;
  fit?: string;
  store?: string;
  imageData?: string;
  wearFrequency?: string;
  favorite?: number;
  styleTags?: string[];
  status?: string;
  seasons?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LegacyWardrobeStore {
  version?: string;
  updatedAt?: string;
  profile?: LegacyWardrobeProfile;
  items?: LegacyWardrobeItem[];
  activities?: ActivityRecord[];
  capacityLimit?: number;
}
