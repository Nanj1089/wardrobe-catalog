import { useEffect, useMemo, useRef, useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { Header } from "@/components/Header";
import { ItemModal } from "@/components/ItemModal";
import { ClosetPage } from "@/components/pages/ClosetPage";
import { HomePage } from "@/components/pages/HomePage";
import { HubPage } from "@/components/pages/HubPage";
import {
  APP_VERSION,
  COLOR_SUGGESTIONS,
  EMPTY_SHARED_STATE,
  appendActivity,
  createEmptyItem,
  normalizeAppData,
  uniqueStrings
} from "@/data/defaultData";
import {
  exportData,
  importData,
  loadCategoryGroups,
  loadInitialData,
  saveCategoryGroups,
  saveData
} from "@/utils/storage";
import { getAuthRedirectUrl, getSupabaseUser, isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  buildCategoryGroupMap,
  getFilteredItems,
  normalizeItem,
  renameCategories
} from "@/utils/wardrobe";
import type {
  AppData,
  AppTab,
  ClosetFilters,
  ClosetGroupKey,
  MeasurementData,
  SaveState,
  SharedState,
  WardrobeItem,
  WardrobeProfile
} from "@/types";

const EMPTY_FILTERS: ClosetFilters = {
  group: "all",
  category: "",
  color: "",
  material: "",
  fit: "",
  status: "",
  sort: "updated-desc",
  search: ""
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [profileDraft, setProfileDraft] = useState<WardrobeProfile | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<Partial<Record<string, ClosetGroupKey>>>({});
  const [shared, setShared] = useState<SharedState>(EMPTY_SHARED_STATE);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [cloudUserId, setCloudUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(() => getTabFromHash(window.location.hash));
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [filters, setFilters] = useState<ClosetFilters>(EMPTY_FILTERS);
  const [modalDraft, setModalDraft] = useState<WardrobeItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let active = true;

    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      return () => {
        active = false;
      };
    }

    getSupabaseUser().then((user) => {
      if (!active) return;
      setCloudUserId(user?.id ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCloudUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!authReady) return;
    if (isSupabaseConfigured && !cloudUserId) {
      initializedRef.current = false;
      setData(null);
      setProfileDraft(null);
      setShared(EMPTY_SHARED_STATE);
      return;
    }

    loadInitialData(cloudUserId ?? undefined).then(({ data: initialData, shared: initialShared }) => {
      if (cancelled) return;
      setData(initialData);
      setProfileDraft(initialData.profile);
      setCategoryGroups(buildCategoryGroupMap(initialData.profile.categories, loadCategoryGroups()));
      setShared(initialShared);
      initializedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [authReady, cloudUserId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function handleHashChange() {
      const nextTab = getTabFromHash(window.location.hash);
      setActiveTab((current) => (current === nextTab ? current : nextTab));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const nextHash = `#${activeTab}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!initializedRef.current || !data) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    setSaveState("saving");

    saveTimerRef.current = window.setTimeout(() => {
      saveData(data, shared, cloudUserId ?? undefined)
        .then(() => setSaveState("saved"))
        .catch((error) => {
          console.error(error);
          setSaveState("error");
          showToast(error.message || "共享保存失败，本地副本已更新。");
        });
    }, 260);
  }, [cloudUserId, data, shared]);

  useEffect(() => {
    if (!data) return;
    setCategoryGroups((current) => buildCategoryGroupMap(data.profile.categories, current));
  }, [data?.profile.categories]);

  useEffect(() => {
    if (!initializedRef.current) return;
    saveCategoryGroups(categoryGroups);
  }, [categoryGroups]);

  const filteredItems = useMemo(
    () => (data ? getFilteredItems(data, filters, categoryGroups) : []),
    [data, filters, categoryGroups]
  );
  const colorOptions = useMemo(
    () => (data ? uniqueStrings([...COLOR_SUGGESTIONS, ...data.items.map((item) => item.color)]) : COLOR_SUGGESTIONS),
    [data]
  );
  const materialOptions = useMemo(
    () => (data ? uniqueStrings(data.items.map((item) => item.material).filter(Boolean)) : []),
    [data]
  );
  const fitOptions = useMemo(
    () => (data ? uniqueStrings(data.items.map((item) => item.fit).filter(Boolean)) : []),
    [data]
  );

  async function handleSendMagicLink(email: string) {
    if (!supabase) {
      throw new Error("Supabase 尚未配置完成");
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      throw new Error(error.message || "发送登录链接失败");
    }
  }

  if (!authReady) {
    return <div className="loading-shell">正在连接衣橱云端…</div>;
  }

  if (isSupabaseConfigured && !cloudUserId) {
    return <AuthPanel onSendMagicLink={handleSendMagicLink} />;
  }

  if (!data || !profileDraft) {
    return <div className="loading-shell">正在加载电子衣橱…</div>;
  }

  const currentData = data;
  const currentProfileDraft = profileDraft;

  function showToast(message: string) {
    if (!message) return;
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 1800);
  }

  function commitData(nextData: AppData, toastMessage?: string) {
    setData(normalizeAppData({ ...nextData, version: APP_VERSION, updatedAt: new Date().toISOString() }));
    if (toastMessage) showToast(toastMessage);
  }

  function handleProfileMeasurementChange(key: keyof MeasurementData, value: string) {
    setProfileDraft((current) =>
      current
        ? {
            ...current,
            measurements: {
              ...current.measurements,
              [key]: value
            }
          }
        : current
    );
  }

  function handleSaveHome() {
    if (JSON.stringify(currentProfileDraft) === JSON.stringify(currentData.profile)) return;

    const nextData = appendActivity(
      {
        ...currentData,
        profile: currentProfileDraft,
        updatedAt: new Date().toISOString()
      },
      "profile",
      "首页信息已保存"
    );
    setProfileDraft(nextData.profile);
    commitData(nextData, "首页信息已保存");
  }

  function openNewItemModal() {
    setEditingItemId(null);
    setModalDraft(createEmptyItem(currentData.profile.categories));
    setModalOpen(true);
  }

  function openEditItemModal(id: string) {
    const target = currentData.items.find((item) => item.id === id);
    if (!target) return;
    setEditingItemId(id);
    setModalDraft(normalizeItem(target));
    setModalOpen(true);
  }

  function closeItemModal() {
    setModalOpen(false);
    setEditingItemId(null);
    setModalDraft(null);
  }

  function handleModalChange<K extends keyof WardrobeItem>(field: K, value: WardrobeItem[K]) {
    setModalDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
            updatedAt: new Date().toISOString()
          }
        : current
    );
  }

  function handlePasteImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === "string" ? reader.result : "";
      setModalDraft((current) =>
        current
          ? {
              ...current,
              imageData,
              updatedAt: new Date().toISOString()
            }
          : current
      );
      showToast("图片已粘贴到单品卡片");
    };
    reader.readAsDataURL(file);
  }

  function handleSaveModal() {
    if (!modalDraft?.name.trim() || !modalDraft.category.trim()) {
      showToast("请先填写单品名称和分类");
      return;
    }

    const now = new Date().toISOString();
    const normalizedDraft = normalizeItem({
      ...modalDraft,
      updatedAt: now,
      createdAt: modalDraft.createdAt || now
    });

    if (editingItemId) {
      const nextData = appendActivity(
        {
          ...currentData,
          items: currentData.items.map((item) => (item.id === editingItemId ? normalizedDraft : item))
        },
        "item",
        `编辑${normalizedDraft.name}`
      );
      commitData(nextData, "衣物已更新");
    } else {
      const nextData = appendActivity(
        {
          ...currentData,
          items: [normalizedDraft, ...currentData.items]
        },
        "item",
        `新增${normalizedDraft.name}`
      );
      commitData(nextData, "新衣物已加入");
    }

    closeItemModal();
  }

  function handleDeleteItem(id: string) {
    const target = currentData.items.find((item) => item.id === id);
    if (!target) return;
    const confirmed = window.confirm(`确定删除“${target.name || "这件衣物"}”吗？`);
    if (!confirmed) return;

    const nextData = appendActivity(
      {
        ...currentData,
        items: currentData.items.filter((item) => item.id !== id)
      },
      "item",
      `删除${target.name}`
    );
    commitData(nextData, "衣物已删除");
  }

  function handleInlineUpdate(id: string, patch: Partial<WardrobeItem>, message = "单品信息已更新") {
    const currentItem = currentData.items.find((item) => item.id === id);
    if (!currentItem) return;

    const nextItem = normalizeItem({ ...currentItem, ...patch, updatedAt: currentItem.updatedAt });
    if (JSON.stringify(nextItem) === JSON.stringify(currentItem)) return;

    const nextItems = currentData.items.map((item) => (item.id === id ? nextItem : item));
    const nextData = message
      ? appendActivity({ ...currentData, items: nextItems }, "item", message)
      : normalizeAppData({ ...currentData, items: nextItems });

    commitData(nextData);
  }

  function handleSaveCategories(rows: Array<{ original: string; value: string; group: ClosetGroupKey }>) {
    const renamedData = renameCategories(currentData, rows);
    const nextCategoryGroups = rows.reduce<Partial<Record<string, ClosetGroupKey>>>((result, row) => {
      const nextName = row.value.trim();
      if (!nextName) return result;
      result[nextName] = row.group;
      return result;
    }, {});

    setCategoryGroups(nextCategoryGroups);
    const nextData = appendActivity(renamedData, "category", "分类设置已保存");
    setProfileDraft(nextData.profile);
    commitData(nextData, "分类设置已保存");
  }

  function handleSaveStoreNotes(storeNotes: Record<string, string>) {
    const normalizedNotes = Object.entries(storeNotes).reduce<Record<string, string>>((result, [store, note]) => {
      const nextStore = store.trim();
      if (!nextStore) return result;
      result[nextStore] = note.trim();
      return result;
    }, {});

    if (JSON.stringify(normalizedNotes) === JSON.stringify(currentData.profile.storeNotes || {})) return;

    const nextData = appendActivity(
      {
        ...currentData,
        profile: {
          ...currentData.profile,
          storeNotes: normalizedNotes
        },
        updatedAt: new Date().toISOString()
      },
      "profile",
      "店铺备忘录已更新"
    );

    setProfileDraft(nextData.profile);
    commitData(nextData, "店铺备忘录已保存");
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    file.text().then((text) => {
      const imported = importData(text);
      setData(imported);
      setProfileDraft(imported.profile);
      setCategoryGroups((current) => buildCategoryGroupMap(imported.profile.categories, current));
      setFilters(EMPTY_FILTERS);
      setActiveTab("home");
      showToast("已导入新的衣橱数据");
      event.target.value = "";
    });
  }

  function handleCopyShareUrl() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showToast("当前链接已复制"))
      .catch(() => showToast("复制链接失败"));
  }

  function handleCopyCommand() {
    navigator.clipboard
      .writeText("node share-wardrobe-local.js")
      .then(() => showToast("启动命令已复制"))
      .catch(() => showToast("复制命令失败"));
  }

  return (
    <>
      <input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />

      <div className="app-shell">
        <Header
          activeTab={activeTab}
          saveState={saveState}
          sharedEnabled={shared.enabled}
          onTabChange={setActiveTab}
          onImport={() => importInputRef.current?.click()}
          onCopyShareUrl={handleCopyShareUrl}
          onCopyShareCommand={handleCopyCommand}
          onExport={() => exportData(currentData)}
        />

        <main>
          {activeTab === "home" ? (
            <HomePage
              profile={currentProfileDraft}
              items={currentData.items}
              categoryGroups={categoryGroups}
              updatedAtLabel={`最近更新：${formatDateLabel(currentData.updatedAt)}`}
              onMeasurementChange={handleProfileMeasurementChange}
              onStyleTitleChange={(value) =>
                setProfileDraft((current) => (current ? { ...current, styleTitle: value } : current))
              }
              onStyleDescriptionChange={(value) =>
                setProfileDraft((current) => (current ? { ...current, styleDescription: value } : current))
              }
              onSave={handleSaveHome}
            />
          ) : null}

          {activeTab === "closet" ? (
            <ClosetPage
              data={currentData}
              categoryGroups={categoryGroups}
              filters={filters}
              filteredItems={filteredItems}
              allItems={currentData.items}
              colorOptions={colorOptions}
              materialOptions={materialOptions}
              fitOptions={fitOptions}
              onFilterChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
              onClearFilters={() => setFilters(EMPTY_FILTERS)}
              onOpenNewItem={openNewItemModal}
              onOpenEditItem={openEditItemModal}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleInlineUpdate}
              onExport={() => exportData(currentData)}
            />
          ) : null}

          {activeTab === "hub" ? (
            <HubPage
              data={currentData}
              shared={shared}
              categoryGroups={categoryGroups}
              onSaveCategories={handleSaveCategories}
              onSaveStoreNotes={handleSaveStoreNotes}
            />
          ) : null}
        </main>
      </div>

      <ItemModal
        open={modalOpen}
        title={editingItemId ? "编辑衣物" : "新增衣物"}
        categories={currentData.profile.categories}
        colorSuggestions={colorOptions}
        draft={modalDraft}
        onClose={closeItemModal}
        onChange={handleModalChange}
        onPasteImage={handlePasteImage}
        onSave={handleSaveModal}
      />

      <div className={`toast${toast ? " visible" : ""}`}>{toast}</div>
    </>
  );
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function getTabFromHash(hash: string): AppTab {
  const normalized = hash.replace(/^#/, "");
  if (normalized === "closet" || normalized === "hub") return normalized;
  return "home";
}
