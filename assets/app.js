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
    shortMeta: "字帖风实验版",
    detail:
      "基于你提供的字帖样式，按规则做了收紧结构、轻微连笔、重心上提的网页渲染优化，更接近硬笔字帖行楷。",
    previewClass: "font--xingkai-optimized",
    source: "LXGW WenKai + 字帖风规则优化",
    renderMode: "styled-glyphs",
  },
  {
    id: "xingshu",
    label: "行书",
    shortMeta: "顺手好看",
    detail:
      "改成云峰静龙行书，线条更顺、更接近日常誊抄时会想模仿的行书感觉。",
    previewClass: "font--xingshu",
    source: "ZeoSeven Fonts · 云峰静龙行书",
  },
  {
    id: "caoshu",
    label: "草书",
    shortMeta: "系统草写风",
    detail:
      "优先使用系统手写风字体，例如 HanziPen SC，并以行楷类系统字体作为补充回退。",
    previewClass: "font--caoshu",
    source: "系统 HanziPen / Xingkai",
  },
];

const defaultText = "";

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
  return state.text.trim() || "请在上方输入任意中文文字，所选字体会实时转换。";
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

  const previewText = document.createElement("div");
  previewText.className = `preview-card__text ${font.previewClass}`;

  if (font.renderMode === "styled-glyphs") {
    renderStyledGlyphText(previewText, getDisplayText());
  } else {
    previewText.textContent = getDisplayText();
  }

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

function glyphSeed(codePoint, index, salt) {
  const value =
    (codePoint * 1103515245 + (index + 1) * 12345 + salt * 2654435761) >>> 0;
  return (value % 1000) / 1000;
}

function mix(min, max, value) {
  return min + (max - min) * value;
}

function isPunctuation(char) {
  return /[，。！？；：、“”‘’（）《》〈〉,.!?;:()[\]{}]/.test(char);
}

function renderStyledGlyphText(container, text) {
  container.innerHTML = "";

  Array.from(text).forEach((char, index) => {
    if (char === "\n") {
      container.appendChild(document.createElement("br"));
      return;
    }

    if (char === " ") {
      const spacer = document.createElement("span");
      spacer.className = "glyph-space";
      spacer.textContent = "\u00a0";
      container.appendChild(spacer);
      return;
    }

    const span = document.createElement("span");
    const codePoint = char.codePointAt(0) || 0;
    const punctuation = isPunctuation(char);
    const rotate = punctuation
      ? mix(-2, 2, glyphSeed(codePoint, index, 1))
      : mix(-4.8, 2.4, glyphSeed(codePoint, index, 1));
    const skew = punctuation
      ? mix(-3, 1, glyphSeed(codePoint, index, 2))
      : mix(-9.5, -3.8, glyphSeed(codePoint, index, 2));
    const scaleX = punctuation
      ? mix(0.95, 1.05, glyphSeed(codePoint, index, 3))
      : mix(0.88, 1.03, glyphSeed(codePoint, index, 3));
    const scaleY = punctuation
      ? mix(0.95, 1.05, glyphSeed(codePoint, index, 4))
      : mix(0.94, 1.08, glyphSeed(codePoint, index, 4));
    const shiftY = punctuation
      ? mix(-0.02, 0.04, glyphSeed(codePoint, index, 5))
      : mix(-0.11, 0.09, glyphSeed(codePoint, index, 5));
    const shiftX = punctuation
      ? mix(-0.01, 0.03, glyphSeed(codePoint, index, 6))
      : mix(-0.03, 0.05, glyphSeed(codePoint, index, 6));

    span.className = `glyph-unit${punctuation ? " glyph-unit--punct" : ""}`;
    span.textContent = char;
    span.style.setProperty("--glyph-rotate", `${rotate.toFixed(2)}deg`);
    span.style.setProperty("--glyph-skew", `${skew.toFixed(2)}deg`);
    span.style.setProperty("--glyph-scale-x", scaleX.toFixed(3));
    span.style.setProperty("--glyph-scale-y", scaleY.toFixed(3));
    span.style.setProperty("--glyph-shift-y", `${shiftY.toFixed(3)}em`);
    span.style.setProperty("--glyph-shift-x", `${shiftX.toFixed(3)}em`);
    container.appendChild(span);
  });
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
