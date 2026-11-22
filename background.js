const DEFAULT_RULES = [
  {
    id: "default-cloud",
    name: "Cloud",
    color: "blue",
    patterns: ["aws.amazon.com", "*.amazon.com", "*.azure.com"]
  },
  {
    id: "default-devops",
    name: "DevOps",
    color: "purple",
    patterns: ["*.github.com", "*.bitbucket.org", "*.terraform.io", "*.harness.io"]
  }
];

const EDGE_TO_API_COLOR = {
  blue: "blue",
  pink: "pink",
  violet: "purple",
  purple: "purple",
  "royal-blue": "blue",
  teal: "cyan",
  "orange-yellow": "orange",
  gray: "grey",
  // Legacy / standard Chromium fallbacks
  grey: "grey",
  cyan: "cyan",
  orange: "orange",
  red: "red",
  yellow: "yellow",
  green: "green"
};

function toApiTabGroupColor(color) {
  if (!color) return "blue";
  const key = String(color).toLowerCase().trim();
  return EDGE_TO_API_COLOR[key] || "blue";
}

// Initialize default rules on first install
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get("rules");
  if (!data.rules) {
    await chrome.storage.sync.set({ rules: DEFAULT_RULES });
  }
});

// Open options page on extension icon click
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Robust pattern-to-regex converter supporting wildcards and bare domains
function patternToRegex(pattern) {
  let clean = pattern.trim().toLowerCase().replace(/^https?:\/\//, "");
  const escaped = clean.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");

  if (!clean.includes("*")) {
    return new RegExp(`^https?:\\/\\/([^\\/]+\\.)?${escaped}(\\/|$|\\?)`, "i");
  }
  return new RegExp(`^https?:\\/\\/${escaped}(\\/|$|\\?)`, "i");
}

function findMatchingRule(url, rules) {
  if (!url || !url.startsWith("http")) return null;
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (!pattern.trim()) continue;
      if (patternToRegex(pattern).test(url)) return rule;
    }
  }
  return null;
}

// Check if URL is safe to group
function isRestrictedUrl(url) {
  if (!url) return true;
  const restrictedPrefixes = [
    "edge://",
    "chrome://",
    "about:",
    "chrome-extension://",
    "edge-extension://",
    "file://"
  ];
  return restrictedPrefixes.some((prefix) => url.startsWith(prefix));
}

async function handleTabGrouping(tabId, overrideUrl = null) {
  if (tabId === undefined) return;

  let tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch {
    return; // Tab may have been closed
  }

  const targetUrl = overrideUrl || tab.url || tab.pendingUrl;
  if (isRestrictedUrl(targetUrl)) return;

  const { rules = [] } = await chrome.storage.sync.get("rules");
  const matchedRule = findMatchingRule(targetUrl, rules);

  try {
    // If URL doesn't match any rule, ungroup it if it inherited a parent group
    if (!matchedRule) {
      if (tab.groupId !== undefined && tab.groupId !== -1) {
        await chrome.tabs.ungroup(tab.id);
      }
      return;
    }

    const existingGroups = await chrome.tabGroups.query({
      windowId: tab.windowId,
      title: matchedRule.name
    });

    let groupId;
    if (existingGroups.length > 0) {
      groupId = existingGroups[0].id;
      if (tab.groupId === groupId) return;

      await chrome.tabs.group({
        tabIds: [tab.id],
        groupId: groupId
      });
    } else {
      groupId = await chrome.tabs.group({
        tabIds: [tab.id],
        createProperties: { windowId: tab.windowId }
      });
    }

    // Force update the group title and color explicitly for Edge compatibility
    await chrome.tabGroups.update(groupId, {
      title: matchedRule.name,
      color: toApiTabGroupColor(matchedRule.color)
    });
  } catch (err) {
    console.debug("Edge tab grouping handled with fallback:", err);
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    handleTabGrouping(tabId, changeInfo.url || tab.url || tab.pendingUrl);
  }
});

// Listen for brand-new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  handleTabGrouping(tab.id, tab.url || tab.pendingUrl);
});