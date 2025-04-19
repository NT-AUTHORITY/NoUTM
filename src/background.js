let config = {
  globalParameters: [],
  customDomainParameters: {}
};

// Default configuration
const DEFAULT_CONFIG = {
  globalParameters: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
    "utm_cid",
    "utm_reader"
  ],
  customDomainParameters: {
    "*://*.bilibili.com": [
      "buvid",
      "mid",
      "vd_source",
      "spm_id_from",
      "is_story_h5",
      "p",
      "plat_id",
      "share_from",
      "share_medium",
      "share_plat",
      "share_source",
      "share_tag",
      "timestamp",
      "unique_k",
      "up_id",
      "share_session_id",
      "from_spmid",
      "-Arouter",
      "spmid",
      "ts",
      "live_from",
      "vt"
    ]
  }
};

// Migrate old config to new format
function migrateConfig(oldConfig) {
  const newConfig = {
    globalParameters: [],
    customDomainParameters: {}
  };

  // Migrate UTM parameters to global parameters
  if (oldConfig.utmParameters) {
    newConfig.globalParameters = [...oldConfig.utmParameters];
  }

  // Migrate Bilibili parameters to domain-specific parameters
  if (oldConfig.bilibiliParameters) {
    newConfig.customDomainParameters["*://*.bilibili.com"] = [...oldConfig.bilibiliParameters];
  }

  // Migrate custom parameters to global parameters
  if (oldConfig.customParameters) {
    newConfig.globalParameters = [...newConfig.globalParameters, ...oldConfig.customParameters];
  }

  // Remove duplicates
  newConfig.globalParameters = [...new Set(newConfig.globalParameters)];

  return newConfig;
}

// Load configuration
async function loadConfig() {
  try {
    const result = await chrome.storage.local.get('config');
    if (result.config) {
      // Check if config needs migration
      if (!result.config.globalParameters || !result.config.customDomainParameters) {
        config = migrateConfig(result.config);
        // Save migrated config
        await chrome.storage.local.set({ config });
      } else {
        config = result.config;
      }
    } else {
      try {
        // Try to load from config.json first
        const response = await fetch(chrome.runtime.getURL('src/config.json'));
        if (response.ok) {
          config = await response.json();
        } else {
          // If config.json fails, use hardcoded defaults
          config = DEFAULT_CONFIG;
        }
      } catch (e) {
        // If fetch fails, use hardcoded defaults
        config = DEFAULT_CONFIG;
      }
      // Save to storage
      try {
        await chrome.storage.local.set({ config });
      } catch (e) {
        console.error('Failed to save default config to storage:', e);
      }
    }
  } catch (e) {
    console.error('Error loading configuration:', e);
    // If everything fails, use hardcoded defaults
    config = DEFAULT_CONFIG;
  }
}

// Function to remove tracking parameters from URL
function removeTrackingParameters(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    let modified = false;

    // Remove global parameters
    if (config.globalParameters) {
      config.globalParameters.forEach(param => {
        if (params.has(param)) {
          params.delete(param);
          modified = true;
        }
      });
    }

    // Check for domain-specific parameters
    if (config.customDomainParameters) {
      const currentUrl = urlObj.protocol + '//' + urlObj.hostname;
      Object.entries(config.customDomainParameters).forEach(([pattern, parameters]) => {
        // Convert pattern to regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '\\?');
        const regex = new RegExp('^' + regexPattern + '$');
        
        if (regex.test(currentUrl)) {
          parameters.forEach(param => {
            if (params.has(param)) {
              params.delete(param);
              modified = true;
            }
          });
        }
      });
    }

    // If we removed any parameters, update the URL
    if (modified) {
      urlObj.search = params.toString();
      return urlObj.toString();
    }
  } catch (e) {
    console.error('Error processing URL:', e);
  }
  return url;
}

// Initialize extension
async function initializeExtension() {
  // Load configuration
  await loadConfig();

  // Create context menu
  chrome.contextMenus.create({
    id: "about",
    title: "About NoUTM",
    contexts: ["action"]
  });

  // Handle context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {oUTM
    if (info.menuItemId === "about") {
      chrome.tabs.create({
        url: "https://github.com/NT-AUTHORITY/NoUTM/tree/v1.0.0"
      });
    }
  });

  // Listen for navigation events
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) { // Only process main frame
      const cleanUrl = removeTrackingParameters(details.url);
      
      if (cleanUrl !== details.url) {
        chrome.tabs.update(details.tabId, { url: cleanUrl });
      }
    }
  });

  // Listen for config updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'configUpdated') {
      config = message.config;
    }
  });
}

// Start initialization
initializeExtension(); 