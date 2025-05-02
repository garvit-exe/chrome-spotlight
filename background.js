// --- Constants ---
const MAX_RESULTS_PER_SOURCE = 10; // Limit results from each source for performance

// --- Event Listeners ---

// Listen for the command shortcut (if not using default_popup triggering)
// chrome.commands.onCommand.addListener((command) => {
//   if (command === "_execute_action") {
//     // Logic to open a custom overlay UI would go here
//     // For the popup approach, this listener isn't strictly needed as
//     // the manifest handles opening spotlight.html automatically.
//     console.log("Chrome Spotlight command triggered.");
//   }
// });

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "search") {
    performSearch(request.query)
      .then(results => {
        sendResponse({ status: "success", data: results });
      })
      .catch(error => {
        console.error("Search error:", error);
        sendResponse({ status: "error", message: error.message });
      });
    return true; // Indicates asynchronous response
  }

  if (request.action === "execute") {
    executeAction(request.item)
      .then(() => {
        sendResponse({ status: "success" });
      })
      .catch(error => {
        console.error("Action execution error:", error);
        sendResponse({ status: "error", message: error.message });
      });
    return true; // Indicates asynchronous response
  }
});

// --- Search Logic ---

async function performSearch(query) {
  if (!query || query.trim().length < 1) { // Require at least 1 char for basic search
      return [];
  }

  const lowerQuery = query.toLowerCase();
  const promises = [];

  // 1. Search Bookmarks
  promises.push(searchBookmarks(lowerQuery));

  // 2. Search History
  promises.push(searchHistory(lowerQuery));

  // 3. Search Open Tabs
  promises.push(searchOpenTabs(lowerQuery));

  // 4. Search Extensions
  promises.push(searchExtensions(lowerQuery));

  // 5. Check for URL action
  if (isValidUrl(query)) {
     promises.push(Promise.resolve([{
         type: 'action',
         title: `Open URL: ${query}`,
         url: query,
         actionType: 'openUrlNewTab',
         icon: 'icons/action-url.png' // Placeholder icon
     }, {
         type: 'action',
         title: `Open URL in Current Tab: ${query}`,
         url: query,
         actionType: 'openUrlCurrentTab',
         icon: 'icons/action-url-current.png' // Placeholder icon
     }]));
  }

  const resultsArrays = await Promise.all(promises);
  const combinedResults = [].concat(...resultsArrays);

  // Simple ranking: Exact matches first? Or just combine?
  // For now, just combine and let the UI display sections.
  return combinedResults;
}

async function searchBookmarks(query) {
  try {
    const bookmarkResults = await chrome.bookmarks.search(query);
    return bookmarkResults
      .filter(bm => !bm.url.startsWith('javascript:')) // Exclude bookmarklets if desired
      .slice(0, MAX_RESULTS_PER_SOURCE)
      .map(bm => ({
        type: 'bookmark',
        title: bm.title || 'Untitled Bookmark',
        url: bm.url,
        id: bm.id,
        icon: 'icons/bookmark.png' // Placeholder icon
      }));
  } catch (e) {
    console.error("Bookmark search failed:", e);
    return []; // Return empty array on error
  }
}

async function searchHistory(query) {
  try {
    // Basic history search. Date filtering is a "Nice-to-have".
    const historyResults = await chrome.history.search({
      text: query,
      maxResults: MAX_RESULTS_PER_SOURCE * 2 // Fetch more initially, then filter/rank
    });
    return historyResults
      .filter(item => item.url && !item.url.startsWith('chrome://')) // Filter out internal pages if desired
      .slice(0, MAX_RESULTS_PER_SOURCE)
      .map(item => ({
        type: 'history',
        title: item.title || item.url.split('/').pop() || 'Untitled Page',
        url: item.url,
        lastVisitTime: item.lastVisitTime,
        id: item.id,
        icon: 'icons/history.png' // Placeholder icon
      }));
  } catch (e) {
    console.error("History search failed:", e);
    return [];
  }
}

async function searchOpenTabs(query) {
    try {
        const tabs = await chrome.tabs.query({}); // Get all tabs across all windows
        const lowerQuery = query.toLowerCase();
        return tabs
            .filter(tab =>
                (tab.title && tab.title.toLowerCase().includes(lowerQuery)) ||
                (tab.url && tab.url.toLowerCase().includes(lowerQuery))
            )
            .slice(0, MAX_RESULTS_PER_SOURCE)
            .map(tab => ({
                type: 'tab',
                title: tab.title || tab.url.split('/').pop() || 'Untitled Tab',
                url: tab.url,
                id: tab.id,
                windowId: tab.windowId,
                favIconUrl: tab.favIconUrl || 'icons/tab.png' // Use favicon or placeholder
            }));
    } catch (e) {
        console.error("Tab search failed:", e);
        return [];
    }
}


async function searchExtensions(query) {
  try {
    const extensions = await chrome.management.getAll();
    const lowerQuery = query.toLowerCase();
    return extensions
      .filter(ext =>
          (ext.enabled && (ext.isApp || ext.type === 'extension')) && // Only enabled extensions/apps
          (ext.name.toLowerCase().includes(lowerQuery) ||
           (ext.description && ext.description.toLowerCase().includes(lowerQuery)))
      )
      .slice(0, MAX_RESULTS_PER_SOURCE)
      .map(ext => ({
          type: 'extension',
          title: `Launch Extension: ${ext.name}`,
          id: ext.id,
          name: ext.name,
          actionType: 'launchExtension',
          icon: ext.icons ? (ext.icons.find(i => i.size >= 16)?.url || 'icons/extension.png') : 'icons/extension.png' // Use extension icon or placeholder
      }));
  } catch (e) {
      console.error("Extension search failed:", e);
      return [];
  }
}


// --- Action Execution ---

async function executeAction(item) {
  console.log("Executing action for:", item);
  switch (item.type) {
    case 'bookmark':
    case 'history':
      await chrome.tabs.create({ url: item.url });
      break;
    case 'tab':
      await chrome.windows.update(item.windowId, { focused: true });
      await chrome.tabs.update(item.id, { active: true });
      break;
    case 'action': // Our custom actions like 'Open URL'
      if (item.actionType === 'openUrlNewTab') {
        await chrome.tabs.create({ url: item.url });
      } else if (item.actionType === 'openUrlCurrentTab') {
         const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true});
         if (currentTab) {
             await chrome.tabs.update(currentTab.id, { url: item.url });
         } else { // Fallback if no active tab found
             await chrome.tabs.create({ url: item.url });
         }
      }
      break;
    case 'extension':
      if (item.actionType === 'launchExtension') {
         // Check if it's an app first
         const extInfo = await chrome.management.get(item.id);
         if (extInfo.launchType === 'OPEN_AS_REGULAR_TAB' || extInfo.launchType === 'OPEN_AS_WINDOW') {
            await chrome.management.launchApp(item.id);
         } else {
             // If not an app or no specific launch type, try opening options or just focus extension management
             const optionsUrl = extInfo.optionsUrl;
             if (optionsUrl) {
                 // Check if options page is already open
                 const tabs = await chrome.tabs.query({ url: optionsUrl });
                 if (tabs.length > 0) {
                     await chrome.windows.update(tabs[0].windowId, { focused: true });
                     await chrome.tabs.update(tabs[0].id, { active: true });
                 } else {
                     await chrome.tabs.create({ url: optionsUrl });
                 }
             } else {
                 // Fallback: open the extensions page focused on this extension
                 await chrome.tabs.create({ url: `chrome://extensions/?id=${item.id}` });
             }
         }
      }
      break;
    default:
      console.warn("Unknown action type:", item.type);
  }
  // Close the popup after execution (the popup script should listen for success)
}

// --- Utility Functions ---
function isValidUrl(string) {
    // Basic check, can be improved with a more robust regex
    try {
        new URL(string);
        // Additional check for common protocols
        return string.startsWith('http:') || string.startsWith('https:') || string.startsWith('file:') || string.startsWith('ftp:');
    } catch (_) {
        return false;
    }
}

// Simple debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Example Usage (if needed for direct call within background)
// const debouncedSearch = debounce(performSearch, 250); // Debounce search by 250ms