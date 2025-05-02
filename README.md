# Chrome Spotlight ✨

**Bring the power and speed of macOS Spotlight to your Chrome browsing experience.**

Chrome Spotlight is a lightweight, privacy-focused Chrome extension designed for quick searching and accessing your bookmarks, browsing history, open tabs, installed extensions, and performing quick actions directly from a clean, keyboard-driven interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Optional: Add build status, version badges later -->

## The Problem

Navigating Chrome often involves switching between the address bar (Omnibox), the Bookmarks Manager, the History page, and the Extensions page. Finding a specific open tab among many can also be cumbersome. Chrome Spotlight aims to unify these common browsing tasks into a single, instant-access interface, inspired by the efficiency of macOS Spotlight.

## Features

### Core Functionality (Implemented)

*   **🚀 Instant Activation:** Launch the spotlight instantly with a customizable keyboard shortcut (defaults suggested: `Ctrl+Space` or `Cmd+Space` - **requires user customization**).
*   **🔍 Unified Search:**
    *   **Bookmarks:** Search by title, URL, or folder name.
    *   **History:** Search by page title or URL.
    *   **Open Tabs:** Search across all open tabs (in all windows) by title or URL.
    *   **Extensions:** Find installed Chrome extensions and apps by name.
*   **⚡ Quick Actions:**
    *   Open any bookmark or history item in a new tab.
    *   Switch directly to an open tab found in the search results.
    *   Launch installed Chrome extensions or apps.
    *   Type or paste a URL and quickly open it in a new tab or the current tab.
*   **⌨️ Keyboard Navigation:** Fully navigable using `Arrow Up` / `Arrow Down` keys, `Enter` (to select/execute), and `Escape` (to close).
*   **✨ Clean Interface:** I do not really like the current interface, so I will be changing it soon. I will be very glad if someone else does it for me.
*   **⚙️ Customizable Shortcut:** Change the activation shortcut via Chrome's built-in extension shortcut manager (`chrome://extensions/shortcuts`).

### Desired Enhancements (Future Roadmap)

*   **📅 Advanced History Filtering:** Filter history results by date ranges (e.g., "last 7 days", "last month").
*   **📁 Bookmark Folder Search:** Option to explicitly search within specific bookmark folders.
*   **☁️ Web Service Integration (Optional & Opt-in):**
    *   Search Google Drive files.
    *   Search Gmail emails (subject/sender).
    *   Display upcoming Google Calendar events.
*   **🧠 Smart Suggestions:**
    *   Autocomplete queries based on frequent searches or top sites/bookmarks.
    *   Contextual suggestions based on the current active page.
*   **🎨 Customization:**
    *   Select which sources to include in search results (e.g., disable history, only search bookmarks).
    *   Visual themes (Light mode, Dark mode, System default).
*   **🔒 Enhanced Privacy:**
    *   Full support for Incognito mode (searches don't leak across modes, actions stay within the current mode).
    *   Options to clear any internal caches (if features requiring them are added) or disable specific integrations.
*   **🧩 Extensibility:**
    *   Plugin system for developers to add new search sources (e.g., other web services, local files) or custom actions.
    *   API for other Chrome extensions to interact with Chrome Spotlight.

## Demo

![Demo](./Screenshot%202025-05-03%20at%2000.13.24.jpg)


## Installation

### From Source (Developer Mode)

As this extension is not yet on the Chrome Web Store, you'll need to load it manually:

1.  **Download or Clone:** Download the source code ZIP file or clone this repository:
    ```bash
    git clone https://github.com/garvit-exe/chrome-spotlight.git
    ```
2.  **Unpack:** If you downloaded a ZIP file, unzip it into a dedicated folder on your computer.
3.  **Open Chrome Extensions:** Type `chrome://extensions/` in your Chrome address bar and press Enter.
4.  **Enable Developer Mode:** Look for the "Developer mode" toggle switch (usually in the top-right corner) and ensure it is turned **ON**.
5.  **Load Unpacked:** Click the "Load unpacked" button that appears.
6.  **Select Folder:** In the file browser window that opens, navigate to and select the directory where you unzipped or cloned the extension files (the folder containing the `manifest.json` file). Click "Select Folder".
7.  **Done!** The Chrome Spotlight extension icon should appear in your list of extensions.

### Configure Shortcut (‼️ CRITICAL STEP ‼️)

The default suggested shortcut (`Ctrl+Space` or `Cmd+Space`) **very likely conflicts** with system-level functions (like macOS Spotlight itself or Windows language switching inputs). You **must** configure a working shortcut yourself:

1.  Navigate to `chrome://extensions/shortcuts` in your Chrome address bar.
2.  Find "Chrome Spotlight" in the list of extensions.
3.  Locate the action described (e.g., "Open Chrome Spotlight" or "Activate the extension").
4.  Click the **edit icon** (looks like a pencil) next to the current shortcut assignment (it might say "Not set").
5.  **Press the key combination** you want to use on your keyboard (e.g., `Alt+Space`, `Ctrl+Shift+F`, `Cmd+Shift+Space`). Choose something unique that doesn't clash with other apps or system functions!
6.  Your chosen shortcut should now be displayed.

## Usage

1.  **Activate:** Press the keyboard shortcut you configured in the previous step. The Chrome Spotlight popup will appear instantly.
2.  **Search:** Start typing your query. This could be:
    *   Part of a bookmark's title or URL.
    *   Part of a page title or URL from your browsing history.
    *   Part of an open tab's title or URL.
    *   The name of an installed extension.
    *   A full URL you want to open (e.g., `example.com` or `https://example.com`).
    *   Results will appear and update dynamically as you type.
3.  **Navigate Results:**
    *   Use the `Arrow Down` and `Arrow Up` keys to move through the results list.
    *   The currently selected item will be visually highlighted.
4.  **Execute Action:**
    *   Press `Enter` on a selected item to perform its default action:
        *   *Bookmark/History:* Opens the URL in a new tab.
        *   *Open Tab:* Switches focus to that existing tab and its window.
        *   *Extension:* Launches the extension or its primary action/page.
        *   *URL Action (`Open URL...`):* Opens the typed URL as indicated (new tab or current tab).
5.  **Dismiss:**
    *   Press the `Escape` key.
    *   Click anywhere outside the Spotlight popup.

## Customization

*   **Keyboard Shortcut:** As mentioned, this is configured via `chrome://extensions/shortcuts`.
*   **Options Page:** You can access the extension's options page:
    *   By right-clicking the Chrome Spotlight icon in your extensions toolbar (if visible) and selecting "Options".
    *   By going to `chrome://extensions/`, finding Chrome Spotlight, clicking "Details", and then "Extension options".
    *   Current options include:
        *   UI Theme selection (Light/Dark).
    *   Future options will include:
        *   Selecting which data sources (bookmarks, history, tabs, etc.) to include in searches.

## Privacy

Privacy is a core design principle for Chrome Spotlight.

*   **Local Data:** The core functionality operates entirely on data already stored locally by your Chrome browser (bookmarks, history, tab list, extension list).
*   **No Search Query Logging:** Your search queries typed into Spotlight are **not** stored or transmitted anywhere by the extension itself. They are only used ephemerally to filter your local Chrome data.
*   **No External Communication (Core):** The basic search functionality does not send your queries or browsing data to any external servers. *(Note: Future optional integrations like Google Drive/Gmail search would require explicit user opt-in, permissions, and would communicate with those specific Google services).*
*   **Permissions:** The extension requests only the permissions necessary for its core function:
    *   `tabs`: To list, query, and switch to open tabs.
    *   `bookmarks`: To search your bookmarks.
    *   `history`: To search your browsing history.
    *   `management`: To list and launch installed extensions/apps.
    *   `storage`: To save your preferences (like theme choice).
    *   `identity` (Optional - *Future*): Would only be requested if features like Google Drive/Gmail integration are added and enabled by the user.
*   **Incognito Mode:** Support for proper incognito separation is planned. Currently, searches run from a normal window may show results from normal browsing data.

## Contributing

Contributions are welcome! If you have ideas for improvements, new features, or find bugs, please feel free to:

1.  Open an issue on the [GitHub Issues page](https://github.com/garvit-exe/chrome-spotlight/issues)* to discuss the change or report the bug.
2.  Fork the repository, make your changes, and submit a Pull Request.

Please adhere to standard coding practices and ensure your changes align with the extension's focus on speed, usability, and privacy.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.