const STORAGE_KEY = "nanjiang-wardrobe-library-v3";
const APP_VERSION = "3.1.0";

const DEFAULT_CATEGORIES = [
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
    "裤子",
    "半裙",
    "连衣裙",
    "上衣",
    "吊带/抹胸",
    "背心",
    "短袖",
    "披肩"
];

const STATUS_OPTIONS = ["在穿", "闲置", "收藏", "愿望"];
const WEAR_OPTIONS = ["高频", "中频", "低频"];
const FAVORITE_OPTIONS = [
    { value: "5", label: "5 分 很喜欢" },
    { value: "4", label: "4 分 喜欢" },
    { value: "3", label: "3 分 一般" },
    { value: "2", label: "2 分 偶尔穿" },
    { value: "1", label: "1 分 可替代" }
];
const SEASON_OPTIONS = ["春", "夏", "秋", "冬"];
const SORT_OPTIONS = [
    { value: "updated-desc", label: "最近更新" },
    { value: "name-asc", label: "名称 A-Z" },
    { value: "feature-priority", label: "版型 / 材质 / 颜色优先" },
    { value: "favorite-desc", label: "喜爱程度高到低" }
];
const BASE_COLORS = [
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

const GROUPS = [
    { key: "all", label: "全部", icon: "衣" },
    { key: "tops", label: "上身", icon: "上" },
    { key: "bottoms", label: "下身", icon: "下" },
    { key: "dresses", label: "全身", icon: "裙" },
    { key: "outer", label: "外层", icon: "外" },
    { key: "inner", label: "贴身", icon: "内" },
    { key: "other", label: "其他", icon: "其" }
];

const MEASURE_GROUPS = {
    summary: [
        { key: "height", label: "身高", unit: "cm" },
        { key: "weight", label: "体重", unit: "kg" },
        { key: "shoeSize", label: "鞋码", unit: "码" },
        { key: "braSize", label: "内衣", unit: "" }
    ],
    upper: [
        { key: "shoulder", label: "肩宽", unit: "cm" },
        { key: "armLength", label: "臂长", unit: "cm" },
        { key: "bust", label: "上胸围", unit: "cm" },
        { key: "underbust", label: "底围", unit: "cm" }
    ],
    lower: [
        { key: "waist", label: "腰围", unit: "cm" },
        { key: "hip", label: "臀围", unit: "cm" },
        { key: "legLength", label: "腿长", unit: "cm" },
        { key: "thigh", label: "大腿围", unit: "cm" }
    ],
    foot: [
        { key: "footLength", label: "脚长", unit: "cm" },
        { key: "footWidth", label: "脚宽", unit: "cm" },
        { key: "shoeSize", label: "鞋码", unit: "码" }
    ]
};

const MARKER_CONFIG = [
    { key: "bust", label: "上胸围", top: "35%", left: "54%", secondary: false },
    { key: "waist", label: "腰围", top: "58%", left: "49%", secondary: false },
    { key: "shoeSize", label: "鞋码", top: "85%", left: "50%", secondary: true }
];

const CATEGORY_KEYWORDS = {
    tops: ["内衣", "内搭", "衬衫", "卫衣", "马甲", "毛衣", "上衣", "吊带", "抹胸", "背心", "短袖", "披肩"],
    bottoms: ["裤", "裙"],
    dresses: ["连衣裙"],
    outer: ["大衣", "羽绒", "外套", "风衣"],
    inner: ["内衣", "内搭", "吊带", "抹胸", "背心"]
};

const state = {
    store: null,
    filters: {
        tab: "home",
        group: "all",
        category: "",
        color: "",
        material: "",
        fit: "",
        status: "",
        sort: "updated-desc",
        search: ""
    },
    ui: {
        editingId: null,
        modalOpen: false,
        toastTimer: null,
        homeBound: false
    },
    shared: {
        enabled: false,
        authRequired: false,
        editKey: "",
        dataFile: "",
        originLabel: ""
    },
    modalImageData: ""
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
    cacheDom();
    bindEvents();

    await loadRemoteMeta();
    state.store = await loadInitialStore();
    renderAll();
    bindHomeStage();
}

function cacheDom() {
    const ids = [
        "exportBtn",
        "saveHomeBtn",
        "saveBodyMeasureBtn",
        "homeSummaryMetrics",
        "homeInteractiveStage",
        "windTraceLayer",
        "measurementMarkers",
        "bodyMeasureList",
        "bodyMeasureSecondary",
        "bodyMeasureUpdatedAt",
        "styleTitleInput",
        "styleDescriptionInput",
        "stylePreviewTitle",
        "stylePreviewDescription",
        "sidebarGroupList",
        "sidebarReminder",
        "searchInput",
        "newItemBtn",
        "clearFiltersBtn",
        "closetSummaryCards",
        "categoryChipBar",
        "colorFilter",
        "materialFilter",
        "fitFilter",
        "statusFilter",
        "sortFilter",
        "resultCount",
        "activeFilterChips",
        "closetItemGrid",
        "closetReminderList",
        "importTile",
        "shareUrlBtn",
        "copyCommandBtn",
        "exportTile",
        "importInput",
        "shareHint",
        "hubMiniStats",
        "categoryLegend",
        "colorLegend",
        "storeLegend",
        "assistantForm",
        "candidateName",
        "candidateCategory",
        "candidateColor",
        "candidateMaterial",
        "candidateFit",
        "candidateStore",
        "candidateColorSuggestions",
        "assistantResult",
        "categoryManager",
        "addCategoryBtn",
        "saveCategoriesBtn",
        "itemModal",
        "itemModalTitle",
        "closeModalBtn",
        "cancelModalBtn",
        "itemForm",
        "itemName",
        "itemCategory",
        "itemColor",
        "itemMaterial",
        "itemFit",
        "itemStore",
        "itemColorSuggestions",
        "imagePasteZone",
        "itemImagePreview",
        "toast"
    ];

    ids.forEach((id) => {
        dom[id] = document.getElementById(id);
    });

    dom.tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
    dom.tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
}

function bindEvents() {
    dom.tabButtons.forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
    });

    dom.exportBtn.addEventListener("click", exportStore);
    dom.saveHomeBtn.addEventListener("click", handleSaveHome);
    dom.saveBodyMeasureBtn.addEventListener("click", handleSaveHome);
    dom.styleTitleInput.addEventListener("input", syncStylePreview);
    dom.styleDescriptionInput.addEventListener("input", syncStylePreview);
    dom.newItemBtn.addEventListener("click", () => openItemModal());
    dom.clearFiltersBtn.addEventListener("click", clearClosetFilters);
    dom.searchInput.addEventListener("input", (event) => {
        state.filters.search = event.target.value.trim();
        renderCloset();
    });

    ["colorFilter", "materialFilter", "fitFilter", "statusFilter", "sortFilter"].forEach((id) => {
        dom[id].addEventListener("change", (event) => {
            const key = id.replace("Filter", "");
            state.filters[key] = event.target.value;
            renderCloset();
        });
    });

    dom.importTile.addEventListener("click", () => dom.importInput.click());
    dom.importInput.addEventListener("change", importStoreFromFile);
    dom.shareUrlBtn.addEventListener("click", copyShareUrl);
    dom.copyCommandBtn.addEventListener("click", copyStartCommand);
    dom.exportTile.addEventListener("click", exportStore);

    dom.assistantForm.addEventListener("submit", handleAssistantSubmit);

    dom.addCategoryBtn.addEventListener("click", addCategoryRow);
    dom.saveCategoriesBtn.addEventListener("click", saveCategoriesFromManager);

    dom.closeModalBtn.addEventListener("click", closeItemModal);
    dom.cancelModalBtn.addEventListener("click", closeItemModal);
    dom.itemForm.addEventListener("submit", saveItemFromModal);
    dom.itemModal.addEventListener("click", (event) => {
        if (event.target === dom.itemModal) closeItemModal();
    });

    dom.imagePasteZone.addEventListener("paste", handleModalImagePaste);
    dom.imagePasteZone.addEventListener("click", () => dom.imagePasteZone.focus());

    document.addEventListener("click", handleDelegatedClick);
    document.addEventListener("change", handleDelegatedChange);
}

async function loadRemoteMeta() {
    try {
        const response = await fetch("./api/meta", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        state.shared.enabled = true;
        state.shared.authRequired = Boolean(payload.authRequired);
        state.shared.dataFile = payload.dataFile || "";
        state.shared.originLabel = payload.originLabel || "";
    } catch (error) {
        state.shared.enabled = false;
    }
}

async function loadInitialStore() {
    if (state.shared.enabled) {
        try {
            const response = await fetch("./api/store", { cache: "no-store" });
            if (response.ok) {
                const payload = await response.json();
                saveLocalCopy(payload);
                return normalizeStore(payload);
            }
        } catch (error) {
            showToast("共享数据暂时无法连接，先使用本地副本。");
        }
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return normalizeStore(JSON.parse(raw));
        }
    } catch (error) {
        console.error(error);
    }

    return createDefaultStore();
}

function createDefaultStore() {
    return normalizeStore({
        version: APP_VERSION,
        updatedAt: new Date().toISOString(),
        profile: {
            displayName: "我",
            styleTitle: "",
            styleDescription: "",
            categories: [...DEFAULT_CATEGORIES],
            measurements: {
                height: "",
                weight: "",
                shoeSize: "",
                braSize: "",
                shoulder: "",
                armLength: "",
                bust: "",
                underbust: "",
                waist: "",
                hip: "",
                legLength: "",
                thigh: "",
                footLength: "",
                footWidth: ""
            }
        },
        items: []
    });
}

function normalizeStore(input) {
    const source = input && typeof input === "object" ? input : {};
    const profile = source.profile && typeof source.profile === "object" ? source.profile : {};
    const measurements = profile.measurements && typeof profile.measurements === "object" ? profile.measurements : {};
    const categories = uniqueStrings([...(Array.isArray(profile.categories) ? profile.categories : []), ...DEFAULT_CATEGORIES]);

    return {
        version: source.version || APP_VERSION,
        updatedAt: source.updatedAt || new Date().toISOString(),
        profile: {
            displayName: safeText(profile.displayName) || "我",
            styleTitle: safeText(profile.styleTitle),
            styleDescription: safeText(profile.styleDescription),
            categories,
            measurements: {
                height: safeText(measurements.height),
                weight: safeText(measurements.weight),
                shoeSize: safeText(measurements.shoeSize),
                braSize: safeText(measurements.braSize),
                shoulder: safeText(measurements.shoulder),
                armLength: safeText(measurements.armLength),
                bust: safeText(measurements.bust),
                underbust: safeText(measurements.underbust),
                waist: safeText(measurements.waist),
                hip: safeText(measurements.hip),
                legLength: safeText(measurements.legLength),
                thigh: safeText(measurements.thigh),
                footLength: safeText(measurements.footLength),
                footWidth: safeText(measurements.footWidth)
            }
        },
        items: Array.isArray(source.items) ? source.items.map(normalizeItem) : []
    };
}

function normalizeItem(item) {
    const source = item && typeof item === "object" ? item : {};
    return {
        id: safeText(source.id) || createId(),
        name: safeText(source.name),
        category: safeText(source.category),
        color: safeText(source.color),
        material: safeText(source.material),
        fit: safeText(source.fit),
        store: safeText(source.store),
        imageData: safeText(source.imageData),
        wearFrequency: safeText(source.wearFrequency),
        favorite: clampNumber(source.favorite, 0, 5),
        styleTags: normalizeTagArray(source.styleTags),
        status: safeText(source.status) || "在穿",
        seasons: normalizeTagArray(source.seasons).filter((value) => SEASON_OPTIONS.includes(value)),
        createdAt: safeText(source.createdAt) || new Date().toISOString(),
        updatedAt: safeText(source.updatedAt) || new Date().toISOString()
    };
}

function normalizeTagArray(input) {
    if (Array.isArray(input)) return uniqueStrings(input);
    if (typeof input === "string") {
        return uniqueStrings(input.split(/[,，、\s]+/g));
    }
    return [];
}

function safeText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, Math.round(num)));
}

function uniqueStrings(list) {
    return Array.from(
        new Set(
            list
                .map((item) => safeText(item))
                .filter(Boolean)
        )
    );
}

function createId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }
    return `wardrobe-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function saveLocalCopy(store) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
        console.error(error);
    }
}

async function saveRemoteCopy(store) {
    if (!state.shared.enabled) return;

    const headers = {
        "Content-Type": "application/json"
    };
    if (state.shared.editKey) {
        headers["X-Wardrobe-Key"] = state.shared.editKey;
    }

    let response = await fetch("./api/store", {
        method: "PUT",
        headers,
        body: JSON.stringify(store)
    });

    if (response.status === 401) {
        const key = window.prompt("请输入共享编辑密码", state.shared.editKey || "");
        if (!key) throw new Error("需要编辑密码才能保存共享数据。");
        state.shared.editKey = key.trim();
        headers["X-Wardrobe-Key"] = state.shared.editKey;
        response = await fetch("./api/store", {
            method: "PUT",
            headers,
            body: JSON.stringify(store)
        });
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "共享保存失败");
    }

    const payload = await response.json();
    return normalizeStore(payload.store || store);
}

async function commitStore(nextStore, successMessage = "已保存") {
    const normalized = normalizeStore({
        ...nextStore,
        version: APP_VERSION,
        updatedAt: new Date().toISOString()
    });

    state.store = normalized;
    saveLocalCopy(normalized);

    if (state.shared.enabled) {
        try {
            state.store = await saveRemoteCopy(normalized);
            saveLocalCopy(state.store);
        } catch (error) {
            console.error(error);
            showToast(error.message || "共享保存失败，本地已保存。");
            renderAll();
            return;
        }
    }

    renderAll();
    showToast(successMessage);
}

function renderAll() {
    renderHome();
    renderCloset();
    renderHub();
    syncTabState();
}

function switchTab(tab) {
    state.filters.tab = tab;
    syncTabState();
}

function syncTabState() {
    dom.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === state.filters.tab);
    });

    dom.tabPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === `tab-${state.filters.tab}`);
    });
}

function renderHome() {
    renderHomeMetrics();
    renderBodyMeasurePanel();
    renderMeasurementMarkers();

    dom.styleTitleInput.value = state.store.profile.styleTitle;
    dom.styleDescriptionInput.value = state.store.profile.styleDescription;
    syncStylePreview();
}

function renderHomeMetrics() {
    const metrics = MEASURE_GROUPS.summary.map(({ key, label, unit }) => {
        const value = state.store.profile.measurements[key] || "未填";
        return `
            <div class="metric-chip">
                <div class="metric-chip-label">${label}</div>
                <div class="metric-chip-value">${escapeHtml(value)}${value !== "未填" && unit ? `<small>${unit}</small>` : ""}</div>
            </div>
        `;
    });
    dom.homeSummaryMetrics.innerHTML = metrics.join("");
}

function renderBodyMeasurePanel() {
    const mainFields = [
        { key: "height", label: "身高", unit: "cm", icon: "⟂" },
        { key: "weight", label: "体重", unit: "kg", icon: "◌" },
        { key: "shoulder", label: "肩宽", unit: "cm", icon: "⌒" },
        { key: "bust", label: "胸围", unit: "cm", icon: "◔" },
        { key: "waist", label: "腰围", unit: "cm", icon: "◡" },
        { key: "hip", label: "臀围", unit: "cm", icon: "◠" },
        { key: "legLength", label: "裤长", unit: "cm", icon: "∥" },
        { key: "shoeSize", label: "鞋码", unit: "", icon: "⌣" }
    ];

    const secondaryFields = [
        { key: "armLength", label: "臂长", unit: "cm" },
        { key: "underbust", label: "底围", unit: "cm" },
        { key: "thigh", label: "大腿围", unit: "cm" },
        { key: "footLength", label: "脚长", unit: "cm" },
        { key: "footWidth", label: "脚宽", unit: "cm" },
        { key: "braSize", label: "内衣码", unit: "" }
    ];

    dom.bodyMeasureList.innerHTML = mainFields.map(({ key, label, unit, icon }) => `
        <label class="body-measure-row">
            <span class="body-measure-icon">${icon}</span>
            <span class="body-measure-label">${label}</span>
            <input
                class="body-measure-input"
                type="text"
                data-measure-key="${key}"
                data-measure-unit="${unit}"
                value="${escapeHtml(state.store.profile.measurements[key] || "")}"
            />
            <span class="body-measure-unit">${unit}</span>
        </label>
    `).join("");

    dom.bodyMeasureSecondary.innerHTML = secondaryFields.map(({ key, label, unit }) => `
        <label class="field compact-field">
            <span>${label}</span>
            <input type="text" data-measure-key="${key}" data-measure-unit="${unit}" value="${escapeHtml(state.store.profile.measurements[key] || "")}" />
        </label>
    `).join("");

    const updatedText = formatUpdatedDate(state.store.updatedAt);
    dom.bodyMeasureUpdatedAt.textContent = `最近更新：${updatedText}`;
}

function renderMeasurementMarkers() {
    dom.measurementMarkers.innerHTML = MARKER_CONFIG.map((marker) => {
        const rawValue = state.store.profile.measurements[marker.key];
        const value = rawValue ? `${rawValue}${marker.key === "shoeSize" ? " 码" : " cm"}` : marker.label;
        return `
            <div class="measurement-marker${marker.secondary ? " secondary" : ""}" style="top:${marker.top};left:${marker.left};">
                <span class="marker-dot"></span>
                <span class="marker-label">${escapeHtml(value)}</span>
            </div>
        `;
    }).join("");
}

function syncStylePreview() {
    dom.stylePreviewTitle.textContent = dom.styleTitleInput.value.trim() || "还没有写风格标题";
    dom.stylePreviewDescription.textContent = dom.styleDescriptionInput.value.trim() || "可以在这里放你的风格气质、偏好色系和购买标准。";
}

function formatUpdatedDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
}

function renderCloset() {
    populateClosetFilters();
    renderSidebarGroups();
    renderClosetSummary();
    renderCategoryChips();
    renderActiveFilterChips();
    renderClosetGrid();
    renderClosetRail();
}

function populateClosetFilters() {
    dom.searchInput.value = state.filters.search;
    fillSelect(dom.colorFilter, "全部颜色", uniqueStrings([...BASE_COLORS, ...state.store.items.map((item) => item.color)]), state.filters.color);
    fillSelect(dom.materialFilter, "全部材质", uniqueStrings(state.store.items.map((item) => item.material)), state.filters.material);
    fillSelect(dom.fitFilter, "全部版型", uniqueStrings(state.store.items.map((item) => item.fit)), state.filters.fit);
    fillSelect(dom.statusFilter, "全部状态", STATUS_OPTIONS, state.filters.status);
    dom.sortFilter.innerHTML = SORT_OPTIONS.map((item) => `
        <option value="${item.value}"${item.value === state.filters.sort ? " selected" : ""}>${item.label}</option>
    `).join("");

    populateCategorySelect(dom.itemCategory, state.store.profile.categories, "");
    populateCategorySelect(dom.candidateCategory, state.store.profile.categories, "");
    populateColorSuggestions();
}

function populateColorSuggestions() {
    const colors = uniqueStrings([...BASE_COLORS, ...state.store.items.map((item) => item.color)]);
    const html = colors.map((color) => `<option value="${escapeHtml(color)}"></option>`).join("");
    dom.itemColorSuggestions.innerHTML = html;
    dom.candidateColorSuggestions.innerHTML = html;
}

function fillSelect(select, defaultLabel, values, currentValue) {
    const options = values.filter(Boolean);
    const normalizedCurrent = currentValue || "";
    select.innerHTML = [
        defaultLabel ? `<option value="">${escapeHtml(defaultLabel)}</option>` : "",
        ...options.map((value) => `<option value="${escapeHtml(value)}"${value === normalizedCurrent ? " selected" : ""}>${escapeHtml(value)}</option>`)
    ].join("");
}

function populateCategorySelect(select, categories, currentValue) {
    select.innerHTML = categories.map((value) => `<option value="${escapeHtml(value)}"${value === currentValue ? " selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function renderSidebarGroups() {
    const items = getFilteredItems({ ignoreGroup: true, ignoreCategory: true });
    const currentGroup = state.filters.group;

    dom.sidebarGroupList.innerHTML = GROUPS.map((group) => {
        const count = group.key === "all"
            ? items.length
            : items.filter((item) => groupForCategory(item.category) === group.key).length;

        return `
            <button class="sidebar-group${currentGroup === group.key ? " selected" : ""}" type="button" data-group-key="${group.key}">
                <span class="sidebar-icon">${group.icon}</span>
                <span>${group.label}</span>
                <span class="sidebar-count">${count}</span>
            </button>
        `;
    }).join("");

    const missingImages = state.store.items.filter((item) => !item.imageData).length;
    const idleItems = state.store.items.filter((item) => item.status === "闲置").length;
    dom.sidebarReminder.textContent = `有 ${missingImages} 件还没有图片，${idleItems} 件处于闲置状态。`;
}

function renderClosetSummary() {
    const items = getFilteredItems({ ignoreCategory: true, ignoreGroup: true });
    const currentItems = getFilteredItems();
    const highFav = currentItems.filter((item) => item.favorite >= 4).length;
    const withImage = currentItems.filter((item) => item.imageData).length;

    dom.closetSummaryCards.innerHTML = [
        ["总数", items.length],
        ["当前筛选", currentItems.length],
        ["高喜爱", highFav],
        ["有图片", withImage]
    ].map(([label, value]) => `
        <div class="stat-tile">
            <div class="stat-tile-label">${label}</div>
            <div class="stat-tile-value">${value}</div>
        </div>
    `).join("");
}

function renderCategoryChips() {
    const categories = categoriesForCurrentGroup();
    const currentCategory = state.filters.category;
    dom.categoryChipBar.innerHTML = [
        `<button class="chip-btn${!currentCategory ? " selected" : ""}" type="button" data-category-chip="">全部</button>`,
        ...categories.map((category) => `<button class="chip-btn${currentCategory === category ? " selected" : ""}" type="button" data-category-chip="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    ].join("");
}

function renderActiveFilterChips() {
    const chips = [];
    if (state.filters.category) chips.push(["分类", state.filters.category]);
    if (state.filters.color) chips.push(["颜色", state.filters.color]);
    if (state.filters.material) chips.push(["材质", state.filters.material]);
    if (state.filters.fit) chips.push(["版型", state.filters.fit]);
    if (state.filters.status) chips.push(["状态", state.filters.status]);
    if (state.filters.search) chips.push(["搜索", state.filters.search]);

    dom.activeFilterChips.innerHTML = chips.map(([label, value]) => `
        <span class="filter-tag">${escapeHtml(label)} · ${escapeHtml(value)}</span>
    `).join("");

    const items = getFilteredItems();
    dom.resultCount.textContent = `当前展示 ${items.length} 件`;
}

function renderClosetGrid() {
    const items = getFilteredItems();
    if (!items.length) {
        dom.closetItemGrid.innerHTML = `<div class="empty-state">当前筛选下没有衣物，可以先清空筛选，或从右侧快捷操作里继续添加。</div>`;
        return;
    }

    dom.closetItemGrid.innerHTML = items.map((item) => renderItemCard(item)).join("");
}

function renderClosetRail() {
    const items = getFilteredItems();
    const reminderRows = [
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

    dom.closetReminderList.innerHTML = reminderRows.map((row) => `
        <div class="legend-row">
            <span class="legend-dot" style="background:${row.color};"></span>
            <div>
                <div>${escapeHtml(row.label)}</div>
                <div class="legend-meta">${escapeHtml(row.meta)}</div>
            </div>
            <strong>${escapeHtml(row.value)}</strong>
        </div>
    `).join("");
}

function renderItemCard(item) {
    const categoryStyle = getCategoryStyle(item.category);
    const seasonTags = item.seasons.length ? item.seasons : ["未设季节"];
    const styleTagLine = item.styleTags.length ? item.styleTags.slice(0, 3) : ["待补标签"];
    const imageBlock = item.imageData
        ? `<img class="item-image" src="${item.imageData}" alt="${escapeHtml(item.name)}" />`
        : `
            <div class="item-image-placeholder">
                <span class="item-image-placeholder-icon">${escapeHtml(categoryStyle.short)}</span>
                <div class="item-image-placeholder-text">可在编辑弹窗里直接粘贴图片</div>
            </div>
        `;

    return `
        <article class="item-card card" data-item-id="${item.id}">
            <div class="item-card-inner">
                <div class="item-face item-face-front">
                    <div class="item-front-top">
                        <div class="item-title-block">
                            <span class="item-badge">
                                <span class="badge-icon" style="background:${categoryStyle.color};">${escapeHtml(categoryStyle.short)}</span>
                                <span>${escapeHtml(item.category || "未分类")}</span>
                            </span>
                            <div class="item-title">${escapeHtml(item.name || "未命名单品")}</div>
                        </div>
                        <div class="item-actions">
                            <button class="flip-btn" type="button" data-action="flip" data-item-id="${item.id}" aria-label="翻转卡片">⋯</button>
                        </div>
                    </div>

                    <div class="item-visual">
                        ${imageBlock}
                    </div>

                    <div class="item-meta-grid">
                        ${renderMetaChip("颜色", item.color || "未填")}
                        ${renderMetaChip("材质", item.material || "未填")}
                        ${renderMetaChip("版型", item.fit || "未填")}
                        ${renderMetaChip("店铺", item.store || "未填")}
                    </div>

                    <div class="item-tag-row">
                        ${seasonTags.map((tag) => `<span class="tiny-tag">${escapeHtml(tag)}</span>`).join("")}
                        ${styleTagLine.map((tag) => `<span class="tiny-tag">${escapeHtml(tag)}</span>`).join("")}
                    </div>

                    <div class="item-footer-note">状态 · ${escapeHtml(item.status || "未设")}　喜爱 · ${item.favorite || 0} / 5</div>
                </div>

                <div class="item-face item-face-back">
                    <div class="item-back-top">
                        <div class="item-title-block">
                            <div class="item-title">${escapeHtml(item.name || "未命名单品")}</div>
                            <div class="item-footer-note">翻到背面快速维护这件衣服的设定信息</div>
                        </div>
                        <div class="item-actions">
                            <button class="flip-btn" type="button" data-action="flip" data-item-id="${item.id}" aria-label="翻回正面">↺</button>
                            <button class="flip-btn" type="button" data-action="edit" data-item-id="${item.id}" aria-label="编辑">✎</button>
                            <button class="flip-btn" type="button" data-action="delete" data-item-id="${item.id}" aria-label="删除">×</button>
                        </div>
                    </div>

                    <div class="item-back-grid">
                        <div class="item-edit-block">
                            <div class="item-edit-label">季节</div>
                            <div class="season-row">
                                ${SEASON_OPTIONS.map((season) => `
                                    <button
                                        class="season-dot${item.seasons.includes(season) ? " active" : ""}"
                                        type="button"
                                        data-action="season"
                                        data-season="${season}"
                                        data-item-id="${item.id}"
                                    >${season}</button>
                                `).join("")}
                            </div>
                        </div>

                        <div class="item-edit-block">
                            <div class="item-edit-label">穿着频次</div>
                            <select class="inline-select" data-inline-field="wearFrequency" data-item-id="${item.id}">
                                <option value="">未设置</option>
                                ${WEAR_OPTIONS.map((value) => `<option value="${value}"${item.wearFrequency === value ? " selected" : ""}>${value}</option>`).join("")}
                            </select>
                        </div>

                        <div class="item-edit-block">
                            <div class="item-edit-label">喜爱程度</div>
                            <select class="inline-select" data-inline-field="favorite" data-item-id="${item.id}">
                                <option value="0"${!item.favorite ? " selected" : ""}>未设置</option>
                                ${FAVORITE_OPTIONS.map((option) => `<option value="${option.value}"${String(item.favorite) === option.value ? " selected" : ""}>${option.label}</option>`).join("")}
                            </select>
                        </div>

                        <div class="item-edit-block">
                            <div class="item-edit-label">状态</div>
                            <div class="status-row">
                                ${STATUS_OPTIONS.map((status) => `
                                    <button
                                        class="status-chip${item.status === status ? " active" : ""}"
                                        type="button"
                                        data-action="status"
                                        data-status="${status}"
                                        data-item-id="${item.id}"
                                    >${status}</button>
                                `).join("")}
                            </div>
                        </div>

                        <div class="item-edit-block">
                            <div class="item-edit-label">风格标签</div>
                            <input
                                class="inline-input"
                                type="text"
                                value="${escapeHtml(item.styleTags.join("、"))}"
                                placeholder="如：通勤、老钱、文艺"
                                data-inline-field="styleTags"
                                data-item-id="${item.id}"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderMetaChip(label, value) {
    return `
        <div class="meta-chip">
            <div class="meta-chip-label">${label}</div>
            <div class="meta-chip-value">${escapeHtml(value)}</div>
        </div>
    `;
}

function renderHub() {
    renderMiniStats();
    renderCategoryLegend();
    renderColorLegend();
    renderStoreLegend();
    renderCategoryManager();
    renderAssistantDefaults();
    renderShareHint();
}

function renderMiniStats() {
    const items = state.store.items;
    const stats = [
        ["单品总数", items.length],
        ["有图单品", items.filter((item) => item.imageData).length],
        ["高喜爱", items.filter((item) => item.favorite >= 4).length],
        ["闲置", items.filter((item) => item.status === "闲置").length]
    ];

    dom.hubMiniStats.innerHTML = stats.map(([label, value]) => `
        <div class="mini-stat">
            <div class="mini-stat-label">${label}</div>
            <div class="mini-stat-value">${value}</div>
        </div>
    `).join("");
}

function renderCategoryLegend() {
    const counts = countBy(state.store.items, (item) => item.category || "未分类");
    dom.categoryLegend.innerHTML = renderLegendRows(counts, (label, index) => getCategoryStyle(label, index).color);
}

function renderColorLegend() {
    const counts = countBy(state.store.items, (item) => item.color || "未设颜色");
    dom.colorLegend.innerHTML = renderLegendRows(counts, (label) => colorFromText(label));
}

function renderStoreLegend() {
    const counts = countBy(state.store.items, (item) => item.store || "未记店铺");
    dom.storeLegend.innerHTML = renderLegendRows(counts, () => "#c8a27f");
}

function renderLegendRows(counts, colorGetter) {
    return counts.map(([label, value], index) => `
        <div class="legend-row">
            <span class="legend-dot" style="background:${colorGetter(label, index)};"></span>
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `).join("");
}

function renderCategoryManager() {
    dom.categoryManager.innerHTML = state.store.profile.categories.map((category, index) => `
        <div class="category-row" data-original="${escapeHtml(category)}">
            <div class="category-index">${index + 1}</div>
            <input type="text" value="${escapeHtml(category)}" />
            <button class="icon-btn" type="button" data-action="remove-category" aria-label="删除分类">×</button>
        </div>
    `).join("");
}

function renderAssistantDefaults() {
    populateCategorySelect(dom.candidateCategory, state.store.profile.categories, dom.candidateCategory.value || "");
}

function renderShareHint() {
    if (state.shared.enabled) {
        dom.shareHint.textContent = `当前为共享模式，数据文件：${state.shared.dataFile || "wardrobe-shared-store.json"}。`;
    } else {
        dom.shareHint.textContent = "当前是本地模式，开启共享服务后手机和电脑可以共用一份数据。";
    }
}

function handleSaveHome() {
    const nextMeasurements = { ...state.store.profile.measurements };
    document.querySelectorAll("[data-measure-key]").forEach((input) => {
        nextMeasurements[input.dataset.measureKey] = input.value.trim();
    });

    const nextStore = {
        ...state.store,
        profile: {
            ...state.store.profile,
            styleTitle: dom.styleTitleInput.value.trim(),
            styleDescription: dom.styleDescriptionInput.value.trim(),
            measurements: nextMeasurements
        }
    };

    commitStore(nextStore, "首页信息已保存");
}

function addCategoryRow() {
    const wrapper = document.createElement("div");
    wrapper.className = "category-row";
    wrapper.innerHTML = `
        <div class="category-index">新</div>
        <input type="text" value="" />
        <button class="icon-btn" type="button" data-action="remove-category" aria-label="删除分类">×</button>
    `;
    dom.categoryManager.appendChild(wrapper);
}

function saveCategoriesFromManager() {
    const rows = Array.from(dom.categoryManager.querySelectorAll(".category-row"));
    const renameMap = new Map();
    const nextCategories = [];
    const keptOriginals = new Set();

    rows.forEach((row) => {
        const input = row.querySelector("input");
        const original = row.dataset.original || "";
        const nextName = input.value.trim();
        if (!nextName) return;
        if (!nextCategories.includes(nextName)) {
            nextCategories.push(nextName);
        }
        if (original) {
            keptOriginals.add(original);
            if (original !== nextName) renameMap.set(original, nextName);
        }
    });

    const removed = state.store.profile.categories.filter((category) => category && !keptOriginals.has(category) && !renameMap.has(category));
    const nextItems = state.store.items.map((item) => {
        if (renameMap.has(item.category)) {
            return { ...item, category: renameMap.get(item.category), updatedAt: new Date().toISOString() };
        }
        if (removed.includes(item.category)) {
            return { ...item, category: "未分类", updatedAt: new Date().toISOString() };
        }
        return item;
    });

    commitStore({
        ...state.store,
        profile: {
            ...state.store.profile,
            categories: uniqueStrings(nextCategories.length ? [...nextCategories, "未分类"] : ["未分类"])
        },
        items: nextItems
    }, "分类设置已保存");
}

function handleAssistantSubmit(event) {
    event.preventDefault();

    const candidate = {
        name: dom.candidateName.value.trim(),
        category: dom.candidateCategory.value.trim(),
        color: dom.candidateColor.value.trim(),
        material: dom.candidateMaterial.value.trim(),
        fit: dom.candidateFit.value.trim(),
        store: dom.candidateStore.value.trim()
    };

    const similar = state.store.items.filter((item) => {
        let score = 0;
        if (candidate.category && item.category === candidate.category) score += 3;
        if (candidate.color && item.color === candidate.color) score += 2;
        if (candidate.fit && item.fit === candidate.fit) score += 2;
        if (candidate.material && item.material === candidate.material) score += 1;
        if (candidate.store && item.store === candidate.store) score += 1;
        return score >= 3;
    });

    const sameCategoryCount = state.store.items.filter((item) => item.category === candidate.category).length;
    let verdict = { level: "good", text: "可以考虑" };
    let note = "现有衣橱里没有明显重复的同类型单品。";

    if (similar.length >= 3) {
        verdict = { level: "stop", text: "重复风险高" };
        note = `已经找到 ${similar.length} 件高度相似的单品，建议先回看现有搭配。`;
    } else if (sameCategoryCount >= 10) {
        verdict = { level: "warn", text: "先谨慎一点" };
        note = `这个分类已经有 ${sameCategoryCount} 件，除非它能填补明显缺口，否则优先级可以靠后。`;
    }

    const similarList = similar.slice(0, 4).map((item) => `
        <div class="assistant-note">相似单品：${escapeHtml(item.name)} · ${escapeHtml(item.color || "未设颜色")} · ${escapeHtml(item.fit || "未设版型")}</div>
    `).join("");

    dom.assistantResult.innerHTML = `
        <div class="assistant-verdict ${verdict.level}">${verdict.text}</div>
        <div class="assistant-note">${escapeHtml(note)}</div>
        ${similarList || '<div class="assistant-note">还没有找到特别接近的单品。</div>'}
    `;
}

function handleQuickAction(action) {
    if (action === "add") openItemModal();
    if (action === "clear") clearClosetFilters();
    if (action === "export") exportStore();
}

function clearClosetFilters() {
    state.filters.group = "all";
    state.filters.category = "";
    state.filters.color = "";
    state.filters.material = "";
    state.filters.fit = "";
    state.filters.status = "";
    state.filters.search = "";
    state.filters.sort = "updated-desc";
    renderCloset();
}

function openItemModal(itemId = null) {
    const item = itemId ? state.store.items.find((entry) => entry.id === itemId) : null;
    state.ui.editingId = item ? item.id : null;
    state.ui.modalOpen = true;
    state.modalImageData = item?.imageData || "";

    dom.itemModalTitle.textContent = item ? "编辑衣物" : "新增衣物";
    dom.itemName.value = item?.name || "";
    populateCategorySelect(dom.itemCategory, state.store.profile.categories, item?.category || state.store.profile.categories[0] || "未分类");
    dom.itemColor.value = item?.color || "";
    dom.itemMaterial.value = item?.material || "";
    dom.itemFit.value = item?.fit || "";
    dom.itemStore.value = item?.store || "";
    setModalImagePreview(state.modalImageData);
    dom.itemModal.classList.remove("hidden");
}

function closeItemModal() {
    state.ui.editingId = null;
    state.ui.modalOpen = false;
    state.modalImageData = "";
    dom.itemForm.reset();
    dom.itemImagePreview.innerHTML = "";
    dom.itemModal.classList.add("hidden");
}

function setModalImagePreview(imageData) {
    if (!imageData) {
        dom.itemImagePreview.innerHTML = "<div class='item-image-placeholder-text'>粘贴后的图片会显示在这里</div>";
        return;
    }
    dom.itemImagePreview.innerHTML = `<img src="${imageData}" alt="衣物预览" />`;
}

function handleModalImagePaste(event) {
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    const imageItem = Array.from(clipboard.items || []).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;

    event.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        state.modalImageData = typeof reader.result === "string" ? reader.result : "";
        setModalImagePreview(state.modalImageData);
        showToast("图片已粘贴到单品卡片");
    };
    reader.readAsDataURL(file);
}

function saveItemFromModal(event) {
    event.preventDefault();

    const payload = {
        name: dom.itemName.value.trim(),
        category: dom.itemCategory.value.trim(),
        color: dom.itemColor.value.trim(),
        material: dom.itemMaterial.value.trim(),
        fit: dom.itemFit.value.trim(),
        store: dom.itemStore.value.trim(),
        imageData: state.modalImageData || ""
    };

    if (!payload.name || !payload.category) {
        showToast("请先填写单品名称和分类");
        return;
    }

    const now = new Date().toISOString();
    let nextItems;

    if (state.ui.editingId) {
        nextItems = state.store.items.map((item) => {
            if (item.id !== state.ui.editingId) return item;
            return normalizeItem({
                ...item,
                ...payload,
                updatedAt: now
            });
        });
    } else {
        nextItems = [
            normalizeItem({
                id: createId(),
                ...payload,
                wearFrequency: "",
                favorite: 0,
                styleTags: [],
                status: "在穿",
                seasons: [],
                createdAt: now,
                updatedAt: now
            }),
            ...state.store.items
        ];
    }

    commitStore({
        ...state.store,
        items: nextItems
    }, state.ui.editingId ? "衣物已更新" : "新衣物已加入");

    closeItemModal();
}

function handleDelegatedClick(event) {
    const groupButton = event.target.closest("[data-group-key]");
    if (groupButton) {
        state.filters.group = groupButton.dataset.groupKey;
        if (state.filters.category && !categoriesForCurrentGroup().includes(state.filters.category)) {
            state.filters.category = "";
        }
        renderCloset();
        return;
    }

    const categoryChip = event.target.closest("[data-category-chip]");
    if (categoryChip) {
        state.filters.category = categoryChip.dataset.categoryChip || "";
        renderCloset();
        return;
    }

    const quickAction = event.target.closest("[data-quick-action]");
    if (quickAction) {
        handleQuickAction(quickAction.dataset.quickAction);
        return;
    }

    const removeCategory = event.target.closest('[data-action="remove-category"]');
    if (removeCategory) {
        removeCategory.closest(".category-row")?.remove();
        return;
    }

    const itemAction = event.target.closest("[data-action]");
    if (!itemAction) return;

    const action = itemAction.dataset.action;
    const itemId = itemAction.dataset.itemId;
    if (!itemId) return;

    if (action === "flip") {
        const card = itemAction.closest(".item-card");
        card?.classList.toggle("is-flipped");
        return;
    }

    if (action === "edit") {
        openItemModal(itemId);
        return;
    }

    if (action === "delete") {
        deleteItem(itemId);
        return;
    }

    if (action === "status") {
        updateItem(itemId, { status: itemAction.dataset.status || "" }, "状态已更新");
        return;
    }

    if (action === "season") {
        const item = state.store.items.find((entry) => entry.id === itemId);
        if (!item) return;
        const season = itemAction.dataset.season || "";
        const seasons = item.seasons.includes(season)
            ? item.seasons.filter((value) => value !== season)
            : [...item.seasons, season];
        updateItem(itemId, { seasons }, "季节已更新");
    }
}

function handleDelegatedChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("[data-inline-field]")) return;

    const itemId = target.dataset.itemId;
    const field = target.dataset.inlineField;
    if (!itemId || !field) return;

    let value = target.value;
    if (field === "favorite") value = Number(value || 0);
    if (field === "styleTags") value = normalizeTagArray(value);
    updateItem(itemId, { [field]: value }, "单品信息已更新", false);
}

function updateItem(itemId, patch, message = "已更新", showMessage = true) {
    const nextItems = state.store.items.map((item) => {
        if (item.id !== itemId) return item;
        return normalizeItem({
            ...item,
            ...patch,
            updatedAt: new Date().toISOString()
        });
    });

    commitStore({
        ...state.store,
        items: nextItems
    }, showMessage ? message : "");
}

function deleteItem(itemId) {
    const item = state.store.items.find((entry) => entry.id === itemId);
    if (!item) return;

    const confirmed = window.confirm(`确定删除“${item.name || "这件衣物"}”吗？`);
    if (!confirmed) return;

    commitStore({
        ...state.store,
        items: state.store.items.filter((entry) => entry.id !== itemId)
    }, "衣物已删除");
}

function getFilteredItems(options = {}) {
    const ignoreGroup = Boolean(options.ignoreGroup);
    const ignoreCategory = Boolean(options.ignoreCategory);
    let items = [...state.store.items];

    if (!ignoreGroup && state.filters.group !== "all") {
        items = items.filter((item) => groupForCategory(item.category) === state.filters.group);
    }

    if (!ignoreCategory && state.filters.category) {
        items = items.filter((item) => item.category === state.filters.category);
    }

    if (state.filters.color) {
        items = items.filter((item) => item.color === state.filters.color);
    }

    if (state.filters.material) {
        items = items.filter((item) => item.material === state.filters.material);
    }

    if (state.filters.fit) {
        items = items.filter((item) => item.fit === state.filters.fit);
    }

    if (state.filters.status) {
        items = items.filter((item) => item.status === state.filters.status);
    }

    if (state.filters.search) {
        const keyword = state.filters.search.toLowerCase();
        items = items.filter((item) => {
            const haystack = [
                item.name,
                item.category,
                item.color,
                item.material,
                item.fit,
                item.store,
                ...(item.styleTags || [])
            ].join(" ").toLowerCase();
            return haystack.includes(keyword);
        });
    }

    return sortItems(items, state.filters.sort);
}

function categoriesForCurrentGroup() {
    const categories = state.store.profile.categories;
    if (state.filters.group === "all") return categories;
    return categories.filter((category) => groupForCategory(category) === state.filters.group);
}

function sortItems(items, sortMode) {
    const list = [...items];
    const collator = new Intl.Collator("zh-CN");

    list.sort((a, b) => {
        if (sortMode === "name-asc") {
            return collator.compare(a.name || "", b.name || "");
        }
        if (sortMode === "favorite-desc") {
            return (b.favorite || 0) - (a.favorite || 0) || collator.compare(a.name || "", b.name || "");
        }
        if (sortMode === "feature-priority") {
            return collator.compare(a.fit || "", b.fit || "")
                || collator.compare(a.material || "", b.material || "")
                || collator.compare(a.color || "", b.color || "")
                || collator.compare(a.name || "", b.name || "");
        }
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return list;
}

function groupForCategory(category) {
    const text = safeText(category);
    if (!text) return "other";
    if (CATEGORY_KEYWORDS.dresses.some((keyword) => text.includes(keyword))) return "dresses";
    if (CATEGORY_KEYWORDS.outer.some((keyword) => text.includes(keyword))) return "outer";
    if (CATEGORY_KEYWORDS.inner.some((keyword) => text.includes(keyword))) return "inner";
    if (CATEGORY_KEYWORDS.bottoms.some((keyword) => text.includes(keyword))) return "bottoms";
    if (CATEGORY_KEYWORDS.tops.some((keyword) => text.includes(keyword))) return "tops";
    return "other";
}

function getCategoryStyle(category, index = null) {
    const categories = state.store?.profile?.categories || DEFAULT_CATEGORIES;
    const idx = index ?? Math.max(0, categories.indexOf(category));
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
    const short = safeText(category).slice(0, 1) || "衣";
    return {
        color: palette[idx % palette.length],
        short
    };
}

function colorFromText(text) {
    const value = safeText(text);
    if (!value || value === "未设颜色") return "#cfc7bf";
    const map = [
        [/白|奶|米/, "#e9dfd3"],
        [/黑|灰/, "#7f7b78"],
        [/蓝|牛仔/, "#8ca6c8"],
        [/绿/, "#95ad8f"],
        [/红|酒|砖/, "#c58a82"],
        [/粉|紫/, "#d8b1c3"],
        [/黄|金/, "#d2b46d"],
        [/棕|咖|驼|卡其|杏|沙/, "#b89573"]
    ];
    const hit = map.find(([pattern]) => pattern.test(value));
    if (hit) return hit[1];

    let hash = 0;
    for (const ch of value) {
        hash = ((hash << 5) - hash) + ch.charCodeAt(0);
        hash |= 0;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 38% 72%)`;
}

function countBy(items, keyGetter) {
    const map = new Map();
    items.forEach((item) => {
        const key = keyGetter(item);
        map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function exportStore() {
    const blob = new Blob([JSON.stringify(state.store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `nanjiang-wardrobe-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

async function importStoreFromFile(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    try {
        const text = await file.text();
        const payload = JSON.parse(text);
        await commitStore(normalizeStore(payload), "衣橱数据已导入");
    } catch (error) {
        console.error(error);
        showToast("导入失败，请确认 JSON 格式正确。");
    } finally {
        dom.importInput.value = "";
    }
}

async function copyShareUrl() {
    const url = window.location.href;
    await copyText(url, "共享链接已复制");
}

async function copyStartCommand() {
    const port = window.location.port || "8787";
    const command = `cd D:\\Codex_Data\\WardrobeCatalog\n$env:PORT='${port}'\nnode share-wardrobe-local.js`;
    await copyText(command, "启动命令已复制");
}

async function copyText(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(message);
    } catch (error) {
        console.error(error);
        showToast("复制失败，请手动复制。");
    }
}

function bindHomeStage() {
    if (state.ui.homeBound) return;
    state.ui.homeBound = true;

    const stage = dom.homeInteractiveStage;
    stage.addEventListener("pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        stage.style.setProperty("--pointer-x", `${(x * 100).toFixed(2)}%`);
        stage.style.setProperty("--pointer-y", `${(y * 100).toFixed(2)}%`);
        stage.style.setProperty("--drift-x", `${((x - 0.5) * 24).toFixed(2)}px`);
        stage.style.setProperty("--drift-y", `${((y - 0.5) * 20).toFixed(2)}px`);
        stage.style.setProperty("--soft-rotate", `${((x - 0.5) * 4).toFixed(2)}deg`);
    });

    stage.addEventListener("pointerleave", () => {
        stage.style.setProperty("--pointer-x", "50%");
        stage.style.setProperty("--pointer-y", "42%");
        stage.style.setProperty("--drift-x", "0px");
        stage.style.setProperty("--drift-y", "0px");
        stage.style.setProperty("--soft-rotate", "0deg");
    });

    stage.addEventListener("click", (event) => {
        const rect = stage.getBoundingClientRect();
        const trace = document.createElement("span");
        trace.className = "wind-trace";
        trace.style.left = `${event.clientX - rect.left}px`;
        trace.style.top = `${event.clientY - rect.top}px`;
        trace.style.setProperty("--trace-rotate", `${(-18 + Math.random() * 36).toFixed(2)}deg`);
        dom.windTraceLayer.appendChild(trace);
        window.setTimeout(() => trace.remove(), 1500);
    });
}

function showToast(message) {
    if (!message) return;
    dom.toast.textContent = message;
    dom.toast.classList.add("visible");
    window.clearTimeout(state.ui.toastTimer);
    state.ui.toastTimer = window.setTimeout(() => {
        dom.toast.classList.remove("visible");
    }, 2200);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
