(function () {
  const HISTORY_KEY = "saad-qr-history";
  const MAX_HISTORY = 8;

  const textEl = document.getElementById("text");
  const sizeEl = document.getElementById("size");
  const correctionEl = document.getElementById("correction");
  const colorDarkEl = document.getElementById("colorDark");
  const colorLightEl = document.getElementById("colorLight");
  const generateBtn = document.getElementById("generate");
  const errorEl = document.getElementById("error");
  const qrcodeContainer = document.getElementById("qrcode");
  const emptyState = document.getElementById("empty-state");
  const proofActions = document.getElementById("proof-actions");
  const downloadBtn = document.getElementById("download");
  const copyTextBtn = document.getElementById("copy-text");
  const historyBlock = document.getElementById("history-block");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");

  const CORRECT_LEVELS = { L: "L", M: "M", Q: "Q", H: "H" };

  let currentQR = null;
  let currentText = "";

  function showError(message) {
    if (!message) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }

  function addToHistory(text) {
    let list = getHistory().filter((item) => item !== text);
    list.unshift(text);
    list = list.slice(0, MAX_HISTORY);
    saveHistory(list);
    renderHistory();
  }

  function renderHistory() {
    const list = getHistory();
    historyBlock.hidden = list.length === 0;
    historyList.innerHTML = "";

    list.forEach((item) => {
      const li = document.createElement("li");

      const reuseBtn = document.createElement("button");
      reuseBtn.className = "reuse";
      reuseBtn.type = "button";
      reuseBtn.textContent = item;
      reuseBtn.title = item;
      reuseBtn.addEventListener("click", () => {
        textEl.value = item;
        generate();
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove";
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", "Remove from recent");
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", () => {
        const updated = getHistory().filter((x) => x !== item);
        saveHistory(updated);
        renderHistory();
      });

      li.appendChild(reuseBtn);
      li.appendChild(removeBtn);
      historyList.appendChild(li);
    });
  }

  function generate() {
    const text = textEl.value.trim();
    showError("");

    if (!text) {
      showError("Type or paste something to encode first.");
      return;
    }

    const size = parseInt(sizeEl.value, 10);
    const correction = correctionEl.value;

    qrcodeContainer.innerHTML = "";

    try {
      currentQR = new QRCode(qrcodeContainer, {
        text: text,
        width: size,
        height: size,
        colorDark: colorDarkEl.value,
        colorLight: colorLightEl.value,
        correctLevel: QRCode.CorrectLevel[CORRECT_LEVELS[correction]],
      });
    } catch (e) {
      showError("That content is too long to encode at this size or correction level. Try shortening it, lowering the correction level, or increasing the size.");
      return;
    }

    currentText = text;
    emptyState.hidden = true;
    proofActions.hidden = false;
    addToHistory(text);
  }

  function getRenderedImageSource() {
    const canvas = qrcodeContainer.querySelector("canvas");
    if (canvas) return canvas.toDataURL("image/png");
    const img = qrcodeContainer.querySelector("img");
    if (img) return img.src;
    return null;
  }

  function downloadPNG() {
    const src = getRenderedImageSource();
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    const safeName = (currentText || "qrcode").replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "qrcode";
    a.download = `${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function copyText() {
    if (!currentText) return;
    try {
      await navigator.clipboard.writeText(currentText);
      const original = copyTextBtn.textContent;
      copyTextBtn.textContent = "Copied";
      setTimeout(() => (copyTextBtn.textContent = original), 1400);
    } catch (e) {
      showError("Couldn't copy — your browser may be blocking clipboard access.");
    }
  }

  generateBtn.addEventListener("click", generate);
  downloadBtn.addEventListener("click", downloadPNG);
  copyTextBtn.addEventListener("click", copyText);
  clearHistoryBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });

  textEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      generate();
    }
  });

  renderHistory();
})();
