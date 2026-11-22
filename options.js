const form = document.getElementById("rule-form");
const ruleIdInput = document.getElementById("rule-id");
const groupNameInput = document.getElementById("group-name");
const groupColorInput = document.getElementById("group-color");
const urlPatternsInput = document.getElementById("url-patterns");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const rulesContainer = document.getElementById("rules-container");

const COLOR_ALIAS_TO_SELECT = {
  grey: "gray",
  cyan: "teal",
  orange: "orange-yellow"
};

async function loadRules() {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  renderRules(rules);
}

function renderRules(rules) {
  rulesContainer.innerHTML = "";

  if (rules.length === 0) {
    rulesContainer.innerHTML = `<p style="color: #6b7280; text-align: center;">No group rules configured yet. Add one above.</p>`;
    return;
  }

  rules.forEach((rule) => {
    const item = document.createElement("div");
    item.className = "rule-item";

    const pillsHtml = rule.patterns
      .map((p) => `<span class="pattern-pill">${escapeHtml(p)}</span>`)
      .join("");

    item.innerHTML = `
      <div>
        <div class="rule-header">
          <span class="badge color-${escapeHtml(rule.color)}">${escapeHtml(rule.name)}</span>
        </div>
        <div class="patterns-list">${pillsHtml}</div>
      </div>
      <div class="rule-actions">
        <button class="btn-secondary edit-btn" data-id="${rule.id}">Edit</button>
        <button class="btn-danger delete-btn" data-id="${rule.id}">Delete</button>
      </div>
    `;

    rulesContainer.appendChild(item);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteRule(btn.dataset.id));
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = ruleIdInput.value || crypto.randomUUID();
  const name = groupNameInput.value.trim();
  const color = groupColorInput.value;
  const patterns = urlPatternsInput.value
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!name || patterns.length === 0) return;

  const { rules = [] } = await chrome.storage.sync.get("rules");
  const existingIndex = rules.findIndex((r) => r.id === id);

  const newRule = { id, name, color, patterns };

  if (existingIndex > -1) {
    rules[existingIndex] = newRule;
  } else {
    rules.push(newRule);
  }

  await chrome.storage.sync.set({ rules });
  resetForm();
  loadRules();
});

async function startEdit(id) {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  const rule = rules.find((r) => r.id === id);
  if (!rule) return;

  const normalizedSelectColor = COLOR_ALIAS_TO_SELECT[rule.color] || rule.color;
  const hasOption = Array.from(groupColorInput.options).some(
    (opt) => opt.value === normalizedSelectColor
  );

  ruleIdInput.value = rule.id;
  groupNameInput.value = rule.name;
  groupColorInput.value = hasOption ? normalizedSelectColor : "blue";
  urlPatternsInput.value = rule.patterns.join(", ");

  saveBtn.textContent = "Update Group Rule";
  cancelBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteRule(id) {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  const updated = rules.filter((r) => r.id !== id);
  await chrome.storage.sync.set({ rules: updated });
  if (ruleIdInput.value === id) resetForm();
  loadRules();
}

function resetForm() {
  form.reset();
  ruleIdInput.value = "";
  saveBtn.textContent = "Add Group Rule";
  cancelBtn.style.display = "none";
}

cancelBtn.addEventListener("click", resetForm);

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

loadRules();

// --- Export Rules to JSON ---
document.getElementById("export-btn")?.addEventListener("click", async () => {
  const { rules = [] } = await chrome.storage.sync.get("rules");
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));

  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `EdgeTabsPlus-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// --- Import Rules from JSON ---
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file");

if (importBtn && importFileInput) {
  importBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedRules = JSON.parse(e.target.result);
        if (!Array.isArray(importedRules)) {
          throw new Error("Invalid format");
        }

        // Basic structural validation
        const isValid = importedRules.every((r) => r.id && r.name && Array.isArray(r.patterns));
        if (!isValid) {
          alert("Import failed: The selected file does not match the required EdgeTabsPlus format.");
          return;
        }

        await chrome.storage.sync.set({ rules: importedRules });
        loadRules();
        alert("Rules imported successfully!");
      } catch (err) {
        alert("Failed to parse JSON file. Please ensure it is a valid backup file.");
        console.error(err);
      } finally {
        importFileInput.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  });
}