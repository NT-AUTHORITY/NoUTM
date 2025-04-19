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

// Load configuration when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load config from storage
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
      // Try to load from config.json first
      try {
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
  
  // Render all parameter lists
  renderGlobalParameters();
  renderDomainParameters();

  // Add event listeners
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Add global parameter button
  document.getElementById('addGlobalBtn').addEventListener('click', addGlobalParameter);
  
  // Add domain button
  document.getElementById('addDomainBtn').addEventListener('click', addDomain);

  // Save and Reset buttons
  document.getElementById('saveBtn').addEventListener('click', saveConfig);
  document.getElementById('resetBtn').addEventListener('click', resetConfig);
}

// Render global parameters
function renderGlobalParameters() {
  const container = document.getElementById('globalParameters');
  container.innerHTML = '';
  
  config.globalParameters.forEach(param => {
    const item = document.createElement('div');
    item.className = 'parameter-item';
    
    const text = document.createElement('span');
    text.textContent = param;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteGlobalParameter(param));
    
    item.appendChild(text);
    item.appendChild(deleteBtn);
    container.appendChild(item);
  });
}

// Render domain parameters
function renderDomainParameters() {
  const container = document.getElementById('domainList');
  container.innerHTML = '';
  
  Object.entries(config.customDomainParameters).forEach(([domain, parameters]) => {
    const domainItem = document.createElement('div');
    domainItem.className = 'domain-item';
    
    // Domain header
    const header = document.createElement('div');
    header.className = 'domain-item-header';
    
    const domainName = document.createElement('span');
    domainName.className = 'domain-name';
    domainName.textContent = domain;
    
    const deleteDomainBtn = document.createElement('button');
    deleteDomainBtn.className = 'delete-btn';
    deleteDomainBtn.textContent = 'Delete Domain';
    deleteDomainBtn.addEventListener('click', () => deleteDomain(domain));
    
    header.appendChild(domainName);
    header.appendChild(deleteDomainBtn);
    
    // Parameters list
    const paramList = document.createElement('div');
    paramList.className = 'parameter-list';
    
    parameters.forEach(param => {
      const item = document.createElement('div');
      item.className = 'parameter-item';
      
      const text = document.createElement('span');
      text.textContent = param;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteDomainParameter(domain, param));
      
      item.appendChild(text);
      item.appendChild(deleteBtn);
      paramList.appendChild(item);
    });
    
    // Add parameter input
    const addParam = document.createElement('div');
    addParam.className = 'add-parameter';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add new parameter';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (value) {
        addDomainParameter(domain, value);
        input.value = '';
      }
    });
    
    addParam.appendChild(input);
    addParam.appendChild(addBtn);
    
    domainItem.appendChild(header);
    domainItem.appendChild(paramList);
    domainItem.appendChild(addParam);
    container.appendChild(domainItem);
  });
}

// Add global parameter
function addGlobalParameter() {
  const input = document.getElementById('newGlobalParam');
  const value = input.value.trim();
  
  if (value && !config.globalParameters.includes(value)) {
    config.globalParameters.push(value);
    renderGlobalParameters();
    input.value = '';
  }
}

// Delete global parameter
function deleteGlobalParameter(param) {
  config.globalParameters = config.globalParameters.filter(p => p !== param);
  renderGlobalParameters();
}

// Add domain
function addDomain() {
  const input = document.getElementById('newDomain');
  const domain = input.value.trim();
  
  if (domain && !config.customDomainParameters[domain]) {
    config.customDomainParameters[domain] = [];
    renderDomainParameters();
    input.value = '';
  }
}

// Delete domain
function deleteDomain(domain) {
  delete config.customDomainParameters[domain];
  renderDomainParameters();
}

// Add domain parameter
function addDomainParameter(domain, param) {
  if (!config.customDomainParameters[domain].includes(param)) {
    config.customDomainParameters[domain].push(param);
    renderDomainParameters();
  }
}

// Delete domain parameter
function deleteDomainParameter(domain, param) {
  config.customDomainParameters[domain] = config.customDomainParameters[domain].filter(p => p !== param);
  renderDomainParameters();
}

// Save configuration
async function saveConfig() {
  await chrome.storage.local.set({ config });
  
  // Notify background script about config change
  chrome.runtime.sendMessage({ type: 'configUpdated', config });
  
  // Show save confirmation
  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Saved!';
  setTimeout(() => {
    saveBtn.textContent = originalText;
  }, 2000);
}

// Reset configuration to default
async function resetConfig() {
  // Load default config from config.json
  try {
    const response = await fetch(chrome.runtime.getURL('src/config.json'));
    if (response.ok) {
      config = await response.json();
    } else {
      config = DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error(chrome.runtime.getURL('src/config.json'));
    console.error('Error loading default config:', error);
    config = DEFAULT_CONFIG;
  }

  // Save to storage
  await chrome.storage.local.set({ config });
  
  // Notify background script about config change
  chrome.runtime.sendMessage({ type: 'configUpdated', config });
  
  // Update UI
  renderGlobalParameters();
  renderDomainParameters();
  
  // Show reset confirmation
  const resetBtn = document.getElementById('resetBtn');
  const originalText = resetBtn.textContent;
  resetBtn.textContent = 'Reset!';
  setTimeout(() => {
    resetBtn.textContent = originalText;
  }, 2000);
} 