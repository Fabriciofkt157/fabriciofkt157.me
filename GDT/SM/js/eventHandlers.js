import { db, saveDb, saveSection, deleteSection, saveItem, deleteItem } from './state.js';
import { 
    updateCodexTitle, 
    buildNavMenu, 
    renderContent, 
    openEditor,
    showSectionModal, 
    closeSectionModal,
    selectIcon
} from './ui.js';

function getFunctionSource(func) {
    let source = func.toString();
    source = source.substring(source.indexOf("{") + 1, source.lastIndexOf("}"));
    return source;
}

function handleExportToStaticHTML() {
    const docClone = document.documentElement.cloneNode(true);

    const elementsToRemove = [
        '#editor-panel', '#section-modal', '#codex-title-input', '#export-db', 
        '#import-db', '#import-db-file', '#export-html', '#new-section-btn', 
        'script[src*="sortablejs"]', 'script[src*="main.js"]'
    ];
    docClone.querySelectorAll(elementsToRemove.join(', ')).forEach(el => el.remove());
    
    docClone.querySelectorAll('[data-action="add-item"], [data-action="edit-section"], [data-action="open-editor"], .drag-handle').forEach(el => el.remove());
    
    docClone.querySelector('#codex-title').classList.remove('cursor-pointer');

    const viewerScript = `
        const db = ${JSON.stringify(db, null, 2)};

        const navMenuEl = document.getElementById('nav-menu');
        const mainContentEl = document.getElementById('main-content');

        function buildNavMenu() {
            ${getFunctionSource(buildNavMenu)}
        }

        function renderContent(itemId) {
            ${getFunctionSource(renderContent)}
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('codex-title').textContent = db.title;
            document.title = db.title;
            
            buildNavMenu();
            renderContent('home');

            document.getElementById('nav-menu').addEventListener('click', (e) => {
                const target = e.target.closest('a[data-action="nav"]');
                if (target) {
                    e.preventDefault();
                    renderContent(target.dataset.target);
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                    }
                }
            });
            
            const sidebarEl = document.getElementById('sidebar');
            document.addEventListener('click', (e) => {
                if (sidebarEl.classList.contains('open') && !sidebarEl.contains(e.target) && !document.getElementById('sidebar-toggle-btn').contains(e.target)) {
                    sidebarEl.classList.remove('open');
                }
            });
            
            const toggleBtn = document.getElementById('sidebar-toggle-btn');
            toggleBtn.addEventListener('click', (e) => {
                 e.stopPropagation();
                 sidebarEl.classList.toggle('open');
            });
        });
    `;

    const scriptEl = docClone.createElement('script');
    scriptEl.textContent = viewerScript;
    docClone.querySelector('body').appendChild(scriptEl);

    const finalHtml = '<!DOCTYPE html>\\n' + docClone.outerHTML;
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${db.title.replace(/\s+/g, '_')}_static.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Exportação para HTML concluída!');
}

export function initializeEventHandlers() {
    const codexTitleEl = document.getElementById('codex-title');
    const codexTitleInputEl = document.getElementById('codex-title-input');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const editorPanelEl = document.getElementById('editor-panel');
    const sectionModalEl = document.getElementById('section-modal');
    const mainContentEl = document.getElementById('main-content'); 

    codexTitleEl.addEventListener('click', () => {
        codexTitleInputEl.classList.remove('hidden');
        codexTitleEl.classList.add('hidden');
        codexTitleInputEl.focus();
    });

    codexTitleInputEl.addEventListener('blur', () => {
        const newTitle = codexTitleInputEl.value.trim();
        if (newTitle) {
            db.title = newTitle;
            saveDb();
            updateCodexTitle();
        }
        codexTitleInputEl.classList.add('hidden');
        codexTitleEl.classList.remove('hidden');
    });

    codexTitleInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') codexTitleInputEl.blur();
        if (e.key === 'Escape') {
            codexTitleInputEl.value = db.title;
            codexTitleInputEl.blur();
        }
    });

    document.getElementById('nav-menu').addEventListener('click', (e) => {
        const target = e.target.closest('button, a');
        if (!target) return;

        const { action, target: navTarget, categoryId, sectionId } = target.dataset;
        
        if (action === 'nav') {
            e.preventDefault();
            renderContent(navTarget);
            if (window.innerWidth <= 768) {
                sidebarEl.classList.remove('open');
            }
        }
        if (action === 'add-item') openEditor(categoryId);
        if (action === 'edit-section') showSectionModal(sectionId);
    });
    
    mainContentEl.addEventListener('click', (e) => {
        const buttonTarget = e.target.closest('button');
        if (buttonTarget && buttonTarget.dataset.action === 'open-editor') {
            const { categoryId, itemId } = buttonTarget.dataset;
            openEditor(categoryId, itemId);
        }
    });

    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        sidebarEl.classList.toggle('open');
    });
    document.getElementById('new-section-btn').addEventListener('click', () => showSectionModal());
    document.getElementById('close-editor-btn').addEventListener('click', () => editorPanelEl.classList.add('hidden'));

    document.addEventListener('click', (e) => {
        if (sidebarEl.classList.contains('open') && !sidebarEl.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebarEl.classList.remove('open');
        }
    });

    editorPanelEl.addEventListener('submit', (e) => {
        if (e.target.id !== 'edit-form') return;
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const savedItem = saveItem(data);
        if (savedItem) {
            buildNavMenu();
            renderContent(savedItem.id);
            editorPanelEl.classList.add('hidden');
        }
    });
    
    editorPanelEl.addEventListener('click', (e) => {
        if(e.target.id !== 'delete-btn') return;
        
        const form = e.target.closest('form');
        const categoryId = form.querySelector('input[name="categoryId"]').value;
        const itemId = form.querySelector('input[name="id"]').value;

        if (deleteItem(categoryId, itemId)) {
            buildNavMenu();
            renderContent('home');
            editorPanelEl.classList.add('hidden');
        }
    });

    document.getElementById('section-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-section-id').value;
        const name = document.getElementById('section-name').value;
        const icon = document.getElementById('section-icon').value;
        const defaultTemplate = document.getElementById('section-template').value;
        saveSection({ id, name, icon, defaultTemplate });
        buildNavMenu();
        closeSectionModal();
    });

    document.getElementById('cancel-section-btn').addEventListener('click', closeSectionModal);
    
    sectionModalEl.addEventListener('click', (e) => {
        if (e.target.dataset.action === 'delete-section') {
            if(deleteSection(e.target.dataset.sectionId)) {
                buildNavMenu();
                renderContent('home');
                closeSectionModal();
            }
        }
    });

    document.getElementById('icon-picker-button').addEventListener('click', () => {
        document.getElementById('icon-picker-container').classList.toggle('hidden');
    });

    document.getElementById('icon-grid').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.icon) {
            selectIcon(button.dataset.icon);
        }
    });
    
    document.getElementById('export-db').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(db.title || 'codice').replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('import-db').addEventListener('click', () => {
        document.getElementById('import-db-file').click();
    });

    document.getElementById('import-db-file').addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const importedDb = JSON.parse(e.target.result);
                if (importedDb && typeof importedDb.title === 'string' && Array.isArray(importedDb.sections)) {
                    Object.assign(db, importedDb);
                    saveDb();
                    updateCodexTitle();
                    buildNavMenu();
                    renderContent('home');
                    alert('Códice importado com sucesso!');
                } else {
                    throw new Error("Formato do JSON é inválido.");
                }
            } catch (err) {
                alert(`Erro ao importar: ${err.message}`);
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    });

    document.getElementById('export-html').addEventListener('click', handleExportToStaticHTML);
}
