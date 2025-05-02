const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
let currentResults = [];
let selectedIndex = -1; // -1 means input is selected, 0+ for results
let searchDebounceTimeout;

// --- Event Listeners ---

searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            // Send search query to background script
            chrome.runtime.sendMessage({ action: "search", query: query }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                    renderResults([]); // Clear results on error
                    return;
                }
                if (response && response.status === "success") {
                    renderResults(response.data);
                } else {
                    console.error("Search failed:", response?.message);
                    renderResults([]);
                }
            });
        } else {
            renderResults([]); // Clear results if query is empty
        }
    }, 150); // Debounce search requests (adjust time as needed)
});

searchInput.addEventListener('keydown', handleNavigation);
// Add keydown to list as well, in case focus moves (though we try to keep it on input)
resultsList.addEventListener('keydown', handleNavigation);


// --- Rendering ---

function renderResults(results) {
    resultsList.innerHTML = ''; // Clear previous results
    currentResults = results || [];
    selectedIndex = -1; // Reset selection

    if (currentResults.length === 0 && searchInput.value.trim().length > 0) {
        resultsList.innerHTML = '<li class="no-results">No results found.</li>'; // Optional: No results message
        return;
    }


    currentResults.forEach((item, index) => {
        const li = document.createElement('li');
        li.dataset.index = index; // Store index for selection

        const img = document.createElement('img');
        // Use favIconUrl for tabs if available, otherwise use type-specific icon
        img.src = item.favIconUrl || item.icon || `icons/${item.type}.png`; // Ensure fallback icons exist
        img.onerror = () => { img.src = 'icons/default.png'; }; // Fallback for broken icons

        const titleSpan = document.createElement('span');
        titleSpan.className = 'title';
        titleSpan.textContent = item.title || 'Untitled';

        const typeLabel = document.createElement('span');
        typeLabel.className = 'type-label';
        typeLabel.textContent = formatTypeLabel(item); // Display type (Tab, Bookmark, etc.)

        li.appendChild(img);
        li.appendChild(titleSpan);
        // Maybe add URL/path conditionally or for certain types
        // const urlSpan = document.createElement('span');
        // urlSpan.className = 'url';
        // urlSpan.textContent = item.url || '';
        // li.appendChild(urlSpan);
        li.appendChild(typeLabel);


        li.addEventListener('click', () => {
            executeSelectedItem(index);
        });

        li.addEventListener('mouseenter', () => {
            selectedIndex = index;
            updateSelectionUI();
        });

        resultsList.appendChild(li);
    });
    updateSelectionUI(); // Select the first item by default if results exist
}

function formatTypeLabel(item) {
    switch (item.type) {
        case 'tab': return 'Tab';
        case 'bookmark': return 'Bookmark';
        case 'history': return 'History';
        case 'action': return 'Action';
        case 'extension': return 'Extension';
        default: return 'Item';
    }
}

// --- Navigation and Execution ---

function handleNavigation(event) {
    const resultItems = resultsList.querySelectorAll('li');
    if (!resultItems.length && event.key !== 'Escape') return; // No results to navigate

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault(); // Prevent cursor move in input
            if (selectedIndex < currentResults.length - 1) {
                selectedIndex++;
                updateSelectionUI();
            }
            break;
        case 'ArrowUp':
            event.preventDefault(); // Prevent cursor move in input
            if (selectedIndex > 0) {
                selectedIndex--;
                updateSelectionUI();
            } else {
                // Optional: Move focus back to input when ArrowUp from first item
                selectedIndex = -1;
                updateSelectionUI();
                // searchInput.focus(); // Might be slightly jarring
            }
            break;
        case 'Enter':
             event.preventDefault(); // Prevent form submission/newline
             if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
                executeSelectedItem(selectedIndex);
             } else if (currentResults.length > 0) {
                 // If input is focused but results exist, execute the first one
                 executeSelectedItem(0);
             }
             // Handle case where input has a valid URL typed but no item is selected?
             // The current background logic adds URL actions, so this should be covered.
            break;
        case 'Escape':
            window.close(); // Close the popup
            break;
    }
}

function updateSelectionUI() {
    const resultItems = resultsList.querySelectorAll('li');
    resultItems.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // Keep selected item visible
        } else {
            item.classList.remove('selected');
        }
    });

    // Optional: Add/remove a class on the input if it's 'selected' (index -1)
    if (selectedIndex === -1) {
         searchInput.classList.add('focused'); // Example class
    } else {
         searchInput.classList.remove('focused');
    }
}


function executeSelectedItem(index) {
    if (index >= 0 && index < currentResults.length) {
        const item = currentResults[index];
        console.log("Requesting execution:", item);
        chrome.runtime.sendMessage({ action: "execute", item: item }, (response) => {
             if (chrome.runtime.lastError) {
                console.error("Error sending execute message:", chrome.runtime.lastError.message);
                // Optionally display an error to the user in the popup
                return;
            }
            if (response && response.status === "success") {
                // Action successful, close the popup
                setTimeout(() => window.close(), 50); // Small delay ensures action starts
            } else {
                console.error("Action execution failed:", response?.message);
                 // Optionally display an error to the user
            }
        });
    }
}


// --- Initial Setup ---
// Optional: Apply theme based on stored preference or system setting
// chrome.storage.sync.get(['theme'], (result) => {
//   if (result.theme === 'dark') {
//     document.body.classList.add('dark-mode');
//   }
// });

// Ensure input is focused when popup opens
searchInput.focus();