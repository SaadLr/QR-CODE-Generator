(function () {
  const HISTORY_KEY = "saad-qr-history";
  const MAX_HISTORY = 8;

  const textEl = document.getElementById("text");
  const sizeEl = document.getElementById("size");
  const correctionEl = document.getElementById("correction");
  const colorDarkEl = document.getElementById("colorDark");
  const colorLightEl = document.getElementById("colorLight");
  const logoEl = document.getElementById("logo");
  const logoNameEl = document.getElementById("logo-name");
  const removeLogoBtn = document.getElementById("remove-logo");
  const generateBtn = document.getElementById("generate");
  const errorEl = document.getElementById("error");
  const qrcodeContainer = document.getElementById("qrcode");
  const emptyState = document.getElementById("empty-state");
  const proofActions = document.getElementById("proof-actions");
  const downloadBtn = document.getElementById("download");
  const historyBlock = document.getElementById("history-block");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");

  const CORRECT_LEVELS = { L: "L", M: "M", Q: "Q", H: "H" };

  let currentQR = null;
  let currentText = "";
  let previousCorrection = correctionEl.value;

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

  // Draws the chosen logo centered on top of the QR canvas, with a small
  // white backdrop so the surrounding modules stay high-contrast and scannable.
  function drawLogoOnCanvas(canvas, logoImg) {
    const ctx = canvas.getContext("2d");
    const qrSize = canvas.width;
    const boxSize = Math.round(qrSize * 0.26);
    const cx = qrSize / 2;
    const cy = qrSize / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);

    const inner = boxSize - 10;
    const scale = Math.min(inner / logoImg.width, inner / logoImg.height);
    const w = logoImg.width * scale;
    const h = logoImg.height * scale;
    ctx.drawImage(logoImg, cx - w / 2, cy - h / 2, w, h);
  }

  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Couldn't read that image."));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Couldn't read that file."));
      reader.readAsDataURL(file);
    });
  }

  async function generate() {
    const text = textEl.value.trim();
    showError("");

    if (!text) {
      showError("Type or paste something to encode first.");
      return;
    }

    const size = parseInt(sizeEl.value, 10);
    const hasLogo = logoEl.files && logoEl.files[0];
    const correction = hasLogo ? "H" : correctionEl.value;

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
      showError(
        hasLogo
          ? "That content is too long to fit alongside a logo. Try shortening it or removing the logo."
          : "That content is too long to encode at this size or correction level. Try shortening it, lowering the correction level, or increasing the size."
      );
      return;
    }

    if (hasLogo) {
      const canvas = qrcodeContainer.querySelector("canvas");
      if (!canvas) {
        showError("Your browser can't overlay a logo on this code, but the plain code above still works fine.");
      } else {
        try {
          const img = await loadImageFile(logoEl.files[0]);
          drawLogoOnCanvas(canvas, img);
          // qrcodejs snapshots the canvas into a visible <img> right after
          // drawing the QR pattern, before we get a chance to add the logo.
          // Refresh that snapshot so the on-screen preview matches the canvas.
          const previewImg = qrcodeContainer.querySelector("img");
          if (previewImg) {
            previewImg.src = canvas.toDataURL("image/png");
          }
        } catch (e) {
          showError("Couldn't load that logo file — try a different image.");
        }
      }
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

  function handleLogoChange() {
    const file = logoEl.files && logoEl.files[0];
    if (file) {
      logoNameEl.textContent = file.name;
      removeLogoBtn.hidden = false;
      previousCorrection = correctionEl.value;
      correctionEl.value = "H";
      correctionEl.disabled = true;
    } else {
      logoNameEl.textContent = "No logo selected";
      removeLogoBtn.hidden = true;
      correctionEl.disabled = false;
      correctionEl.value = previousCorrection;
    }
  }

  generateBtn.addEventListener("click", generate);
  downloadBtn.addEventListener("click", downloadPNG);
  clearHistoryBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });

  logoEl.addEventListener("change", handleLogoChange);
  removeLogoBtn.addEventListener("click", () => {
    logoEl.value = "";
    handleLogoChange();
  });

  textEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      generate();
    }
  });

  renderHistory();
})();
