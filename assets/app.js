const fontOptions = [
  {
    id: "kaishu",
    label: "楷书",
    shortMeta: "文楷 + 楷体",
    detail:
      "优先使用热门开源网页字体 LXGW WenKai / 霞鹜文楷，再回退到接近 Word 的系统楷体。",
    previewClass: "font--kaishu",
    source: "LXGW WenKai + 系统楷体",
  },
  {
    id: "xingkai",
    label: "行楷",
    shortMeta: "默认已开启",
    detail:
      "优先使用系统行楷，网页兜底使用热门字体 Ma Shan Zheng，保证更多设备可见。",
    previewClass: "font--xingkai",
    source: "系统行楷 + Google Fonts Ma Shan Zheng",
  },
  {
    id: "xingshu",
    label: "行书",
    shortMeta: "更潇洒流动",
    detail: "以 Google Fonts 的 Zhi Mang Xing 为主，补充 Long Cang 作为回退。",
    previewClass: "font--xingshu",
    source: "Google Fonts Zhi Mang Xing / Long Cang",
  },
  {
    id: "caoshu",
    label: "草书",
    shortMeta: "笔势更放逸",
    detail: "使用热门网页草书 Liu Jian Mao Cao，风格最接近快速挥写效果。",
    previewClass: "font--caoshu",
    source: "Google Fonts Liu Jian Mao Cao",
  },
];

const defaultText = "春风十里，不如你落笔成章。";

const state = {
  text: defaultText,
  activeFonts: new Set(["kaishu", "xingkai"]),
  fontSize: 56,
  lineHeight: 1.6,
};

const textInput = document.querySelector("#text-input");
const fontToggles = document.querySelector("#font-toggles");
const previewGrid = document.querySelector("#preview-grid");
const emptyState = document.querySelector("#empty-state");
const selectionSummary = document.querySelector("#selection-summary");
const charCount = document.querySelector("#char-count");
const fontSizeRange = document.querySelector("#font-size-range");
const lineHeightRange = document.querySelector("#line-height-range");
const fontSizeValue = document.querySelector("#font-size-value");
const lineHeightValue = document.querySelector("#line-height-value");
const sampleButton = document.querySelector("#sample-btn");
const clearButton = document.querySelector("#clear-btn");
const resetButton = document.querySelector("#reset-btn");
const emptyResetButton = document.querySelector("#empty-reset-btn");

function getDisplayText() {
  return state.text.trim() || "请在上方输入想预览的中文文字。";
}

function formatCount(text) {
  return Array.from(text).length;
}

function resetFonts() {
  state.activeFonts = new Set(["kaishu", "xingkai"]);
}

function renderFontToggles() {
  fontToggles.innerHTML = "";

  fontOptions.forEach((font) => {
    const isActive = state.activeFonts.has(font.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `font-toggle${isActive ? " is-active" : ""}`;
    button.dataset.fontId = font.id;
    button.setAttribute("aria-pressed", String(isActive));
    button.innerHTML = `
      <span class="font-toggle__title">${font.label}</span>
      <span class="font-toggle__meta">${font.shortMeta}</span>
    `;
    fontToggles.appendChild(button);
  });
}

function createPreviewCard(font, index) {
  const card = document.createElement("article");
  card.className = "preview-card";
  card.style.setProperty("--index", String(index));

  const previewText = document.createElement("p");
  previewText.className = `preview-card__text ${font.previewClass}`;
  previewText.textContent = getDisplayText();
  previewText.style.fontSize = `${state.fontSize}px`;
  previewText.style.lineHeight = String(state.lineHeight);

  const body = document.createElement("div");
  body.className = "preview-card__body";
  body.appendChild(previewText);

  card.innerHTML = `
    <div class="preview-card__header">
      <div>
        <span class="preview-card__title">${font.label}</span>
        <span class="preview-card__meta">${font.detail}</span>
      </div>
      <div class="preview-card__pills">
        <span class="preview-card__pill">${font.shortMeta}</span>
        <span class="preview-card__source">${font.source}</span>
      </div>
    </div>
  `;

  card.appendChild(body);
  return card;
}

function renderPreviews() {
  const activeFonts = fontOptions.filter((font) => state.activeFonts.has(font.id));

  previewGrid.innerHTML = "";

  if (activeFonts.length === 0) {
    emptyState.hidden = false;
    previewGrid.hidden = true;
    selectionSummary.textContent = "当前展示 0 种字体";
    return;
  }

  emptyState.hidden = true;
  previewGrid.hidden = false;

  activeFonts.forEach((font, index) => {
    previewGrid.appendChild(createPreviewCard(font, index));
  });

  selectionSummary.textContent = `当前展示 ${activeFonts.length} 种字体`;
}

function syncPanelValues() {
  fontSizeValue.textContent = `${state.fontSize}px`;
  lineHeightValue.textContent = state.lineHeight.toFixed(2);
  charCount.textContent = `共 ${formatCount(state.text)} 个字符`;
}

function renderAll() {
  renderFontToggles();
  renderPreviews();
  syncPanelValues();
}

textInput.addEventListener("input", (event) => {
  state.text = event.target.value;
  renderPreviews();
  syncPanelValues();
});

fontToggles.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font-id]");

  if (!button) {
    return;
  }

  const { fontId } = button.dataset;

  if (state.activeFonts.has(fontId)) {
    state.activeFonts.delete(fontId);
  } else {
    state.activeFonts.add(fontId);
  }

  renderAll();
});

fontSizeRange.addEventListener("input", (event) => {
  state.fontSize = Number(event.target.value);
  renderPreviews();
  syncPanelValues();
});

lineHeightRange.addEventListener("input", (event) => {
  state.lineHeight = Number(event.target.value);
  renderPreviews();
  syncPanelValues();
});

sampleButton.addEventListener("click", () => {
  state.text = "青山不墨千秋画，流水无弦万古琴。";
  textInput.value = state.text;
  renderPreviews();
  syncPanelValues();
});

clearButton.addEventListener("click", () => {
  state.text = "";
  textInput.value = "";
  renderPreviews();
  syncPanelValues();
});

resetButton.addEventListener("click", () => {
  resetFonts();
  renderAll();
});

emptyResetButton.addEventListener("click", () => {
  resetFonts();
  renderAll();
});

renderAll();
