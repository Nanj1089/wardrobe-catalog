import { useMemo } from "react";
import { MeasurementCard } from "@/components/MeasurementCard";
import { StyleProfileCard } from "@/components/StyleProfileCard";
import { colorFromText } from "../../data/defaultData";
import { resolveGroupForCategory } from "@/utils/wardrobe";
import type { ClosetGroupKey, MeasurementData, WardrobeItem, WardrobeProfile } from "@/types";

interface HomePageProps {
  profile: WardrobeProfile;
  items: WardrobeItem[];
  categoryGroups: Partial<Record<string, ClosetGroupKey>>;
  updatedAtLabel: string;
  onMeasurementChange: (key: keyof MeasurementData, value: string) => void;
  onStyleTitleChange: (value: string) => void;
  onStyleDescriptionChange: (value: string) => void;
  onSave: () => void;
}

export function HomePage({
  profile,
  items,
  categoryGroups,
  updatedAtLabel,
  onMeasurementChange,
  onStyleTitleChange,
  onStyleDescriptionChange,
  onSave
}: HomePageProps) {
  const favoriteItems = useMemo(
    () =>
      [...items]
        .filter((item) => item.favorite >= 4)
        .sort((a, b) => (b.favorite || 0) - (a.favorite || 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [items]
  );

  const featuredLook = useMemo(() => {
    const picks: Array<WardrobeItem | null> = [];
    const usedIds = new Set<string>();
    const targets: ClosetGroupKey[] = ["outer", "tops", "tops", "outer", "bottoms", "bags", "shoes"];

    targets.forEach((target) => {
      const found =
        favoriteItems.find(
          (item) => item.imageData && !usedIds.has(item.id) && resolveGroupForCategory(item.category, categoryGroups) === target
        ) ||
        favoriteItems.find((item) => !usedIds.has(item.id) && resolveGroupForCategory(item.category, categoryGroups) === target) ||
        null;

      if (found) usedIds.add(found.id);
      picks.push(found);
    });

    return picks;
  }, [favoriteItems, categoryGroups]);

  const palette = useMemo(() => {
    const seen = new Set<string>();
    const values = favoriteItems
      .map((item) => item.color.trim())
      .filter(Boolean)
      .filter((color) => {
        if (seen.has(color)) return false;
        seen.add(color);
        return true;
      })
      .slice(0, 5);

    return values.length ? values : ["黑色", "白色", "灰色", "卡其", "蓝色"];
  }, [favoriteItems]);

  const stores = useMemo(() => {
    const counts = new Map<string, number>();
    favoriteItems.forEach((item) => {
      const store = item.store.trim();
      if (!store) return;
      counts.set(store, (counts.get(store) || 0) + 1);
    });

    const ranked = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([store]) => store)
      .slice(0, 3);

    return ranked.length ? ranked : ["UR", "优衣库", "Zara"];
  }, [favoriteItems]);

  const keywords = useMemo(() => {
    const parsed = profile.styleDescription
      .split(/[，、,。/｜|]+/g)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 5);

    return parsed.length ? parsed : ["干净", "利落", "基础款", "轻正式"];
  }, [profile.styleDescription]);

  return (
    <section className="tab-panel active">
      <div className="home-layout home-layout-split refined-home-layout">
        <MeasurementCard
          measurements={profile.measurements}
          updatedAtLabel={updatedAtLabel}
          onChange={onMeasurementChange}
          onSave={onSave}
        />

        <StyleProfileCard
          title={profile.styleTitle}
          description={profile.styleDescription}
          palette={palette.map((color) => ({ label: color, swatch: colorFromText(color) }))}
          stores={stores}
          keywords={keywords}
          featuredItems={featuredLook}
          onTitleChange={onStyleTitleChange}
          onDescriptionChange={onStyleDescriptionChange}
          onSave={onSave}
        />
      </div>
    </section>
  );
}
