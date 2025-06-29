// js/main.js

import { loadDb } from './state.js';
import { updateCodexTitle, buildNavMenu, renderContent, initializeDragAndDrop } from './ui.js';
import { initializeEventHandlers } from './eventHandlers.js';

function main() {
    loadDb();
    updateCodexTitle();
    buildNavMenu();
    renderContent('home');
    initializeEventHandlers();
    initializeDragAndDrop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
    }
