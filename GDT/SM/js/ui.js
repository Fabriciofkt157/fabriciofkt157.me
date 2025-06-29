import { db, saveDb } from './state.js';
import { templates, iconList } from './templates.js';

const navMenuEl = document.getElementById('nav-menu');
const mainContentEl = document.getElementById('main-content');
const codexTitleEl = document.getElementById('codex-title');
const codexTitleInputEl = document.getElementById('codex-title-input');
const editorPanelEl = document.getElementById('editor-panel');
const sectionModalEl = document.getElementById('section-modal');

export function updateCodexTitle() {
    codexTitleEl.textContent = db.title;
    codexTitleInputEl.value = db.title;
    document.title = `${db.title} - Editor de Mundos`;
}

export function buildNavMenu() {
    navMenuEl.innerHTML = '';

    const homeLink = document.createElement('a');
    homeLink.href = '#';
    homeLink.className = 'block text-stone-300 hover:bg-stone-700 hover:text-sky-300 rounded-md px-3 py-2 text-sm font-medium';
    homeLink.innerHTML = '<i class="fas fa-dungeon w-6 mr-2"></i>Início';
    homeLink.dataset.action = 'nav';
    homeLink.dataset.target = 'home';
    navMenuEl.appendChild(homeLink);

    db.sections.forEach(category => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mt-4 section-container';
        sectionDiv.dataset.sectionId = category.id;
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between items-center px-3';

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'flex items-center';

        const dragHandle = document.createElement('i');
        dragHandle.className = 'fas fa-grip-vertical drag-handle';
        
        const titleH3 = document.createElement('h3');
        titleH3.className = 'text-xs font-title text-stone-500 uppercase tracking-wider flex items-center';
        titleH3.innerHTML = `<i class="fas ${category.icon} fa-fw mr-3"></i><span>${category.name}</span>`;

        titleWrapper.appendChild(dragHandle);
        titleWrapper.appendChild(titleH3);

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex items-center gap-2';
        controlsDiv.innerHTML = `
            <button data-action="add-item" data-category-id="${category.id}" title="Adicionar Tópico" class="text-stone-500 hover:text-sky-300"><i class="fas fa-plus"></i></button>
            <button data-action="edit-section" data-section-id="${category.id}" title="Editar Seção" class="text-stone-500 hover:text-sky-300"><i class="fas fa-pencil-alt fa-xs"></i></button>
        `;

        headerDiv.appendChild(titleWrapper);
        headerDiv.appendChild(controlsDiv);
        
        const itemListUl = document.createElement('ul');
        itemListUl.className = 'space-y-1 mt-1 ml-5 border-l border-stone-700';

        category.items.sort((a, b) => a.title.localeCompare(b.title)).forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'block text-stone-400 hover:text-sky-300 text-sm py-1 pl-4';
            a.textContent = item.title;
            a.dataset.action = 'nav';
            a.dataset.target = item.id;
            li.appendChild(a);
            itemListUl.appendChild(li);
        });

        sectionDiv.appendChild(headerDiv);
        sectionDiv.appendChild(itemListUl);
        navMenuEl.appendChild(sectionDiv);
    });
}

export function renderContent(itemId) {
    if (itemId === 'home' || !itemId) {
        mainContentEl.innerHTML = document.getElementById('home-template').innerHTML;
        return;
    }

    let item, categoryId;
    for (const category of db.sections) {
        const foundItem = category.items.find(i => i.id === itemId);
        if (foundItem) {
            item = foundItem;
            categoryId = category.id;
            break;
        }
    }

    if (!item) {
        renderContent('home');
        return;
    }

    const templateName = item.template || 'simple';
    const templateContainer = document.getElementById(`${templateName}-template-display`);
    if (!templateContainer) {
        console.error(`Template display para '${templateName}' não encontrado.`);
        return;
    }
    
    let templateHtml = templateContainer.innerHTML;
    
    templateHtml = templateHtml.replace(/{id}/g, item.id).replace(/{categoryId}/g, categoryId);

    Object.keys(item).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        let content = item[key] || '';
        if (key === 'image_url' && !content) {
            content = `https://placehold.co/200x200/292524/7dd3fc?text=${item.title ? item.title[0] : '?'}`;
        }
        templateHtml = templateHtml.replace(regex, content);
    });

    if (templateName === 'character') {
        const createDetailItem = (label, value) => value ? `<p><strong>${label}:</strong> ${value}</p>` : '';
        const createSection = (title, value) => value ? `<div class="mb-6">
                    <h3 class="font-title text-2xl text-sky-200 border-b-2 border-sky-500/30 pb-2 mb-3">${title}</h3>
                    <div class="prose prose-invert max-w-none text-stone-300 leading-relaxed">${value.replace(/\n/g, '<br>')}</div>
                </div>` : '';

        const detailsGridHtml = [
            createDetailItem('Idade', item.age),
            createDetailItem('Origem', item.origin),
            createDetailItem('Aniversário', item.birthday)
        ].filter(Boolean).join('');

        templateHtml = templateHtml
            .replace('{details_grid}', detailsGridHtml)
            .replace('{personality_section}', createSection('Personalidade', item.personality))
            .replace('{about_section}', createSection('Sobre', item.about))
            .replace('{curiosity_section}', createSection('Curiosidade', item.curiosity))
            .replace('{notes_section}', createSection('Notas', item.notes));
    }

    mainContentEl.innerHTML = templateHtml;

    if (templateName === 'inventory') {
        const grid = mainContentEl.querySelector('#inventory-grid');
        try {
            const itemsList = JSON.parse(item.items || '[]');
            if (itemsList.length > 0) {
              grid.innerHTML = itemsList.map(invItem => `
                <div class="flex flex-col items-center text-center p-2 bg-stone-700/50 rounded-lg">
                    <i class="fas ${invItem.icon || 'fa-question-circle'} text-3xl text-sky-300 mb-2"></i>
                    <span class="text-sm font-semibold">${invItem.name || 'Desconhecido'}</span>
                    <span class="text-xs text-stone-400">x${invItem.qty || 1}</span>
                </div>`).join('');
            } else {
              grid.innerHTML = '<p class="col-span-full text-stone-500 italic">Nenhum item adicionado.</p>';
            }
        } catch (e) {
            grid.innerHTML = '<p class="col-span-full text-red-500">Erro ao ler a lista de itens. Verifique o formato JSON.</p>';
        }
    }
}

export function openEditor(categoryId, itemId = null) {
    const editorWrapper = document.getElementById('editor-content-wrapper');
    editorPanelEl.classList.remove('hidden');

    const category = db.sections.find(c => c.id === categoryId);
    if (!category) return;

    let item = itemId ? category.items.find(i => i.id === itemId) : null;
    const templateName = item ? item.template : category.defaultTemplate;
    const template = templates[templateName];

    document.getElementById('editor-title').textContent = item ? `Editar ${template.name}` : `Novo ${template.name}`;

    const formFieldsHtml = template.fields.map(field => {
        const value = item ? (item[field.key] || '') : '';
        if (field.type === 'textarea') {
            return `<div>
                <label for="edit-${field.key}" class="block font-medium text-stone-300">${field.label}</label>
                <textarea id="edit-${field.key}" name="${field.key}" rows="${field.rows || 5}" class="mt-1 block w-full bg-stone-700 border border-stone-600 rounded-md py-2 px-3 text-white" placeholder="${field.placeholder || ''}">${value}</textarea>
            </div>`;
        }
        return `<div>
            <label for="edit-${field.key}" class="block font-medium text-stone-300">${field.label}</label>
            <input type="${field.type}" id="edit-${field.key}" name="${field.key}" value="${value}" class="mt-1 block w-full bg-stone-700 border border-stone-600 rounded-md py-2 px-3 text-white" placeholder="${field.placeholder || ''}">
        </div>`;
    }).join('');

    editorWrapper.innerHTML = `
        <form id="edit-form" class="space-y-4">
            <input type="hidden" name="id" value="${itemId || ''}">
            <input type="hidden" name="categoryId" value="${categoryId}">
            <input type="hidden" name="template" value="${templateName}">
            ${formFieldsHtml}
            <div class="pt-4 flex justify-between">
                <button type="button" id="delete-btn" class="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" style="display: ${item ? 'block' : 'none'};">Deletar</button>
                <button type="submit" class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg ml-auto">Salvar</button>
            </div>
        </form>`;
}

export function showSectionModal(sectionId = null) {
    const form = document.getElementById('section-form');
    form.reset();

    const templateSelect = document.getElementById('section-template');
    templateSelect.innerHTML = Object.keys(templates).map(key => `<option value="${key}">${templates[key].name}</option>`).join('');

    const deleteContainer = document.getElementById('delete-section-container');
    deleteContainer.innerHTML = '';
    
    let currentIcon = 'fa-book';

    if (sectionId) {
        const section = db.sections.find(s => s.id === sectionId);
        if (section) {
            document.getElementById('modal-title').textContent = 'Editar Seção';
            document.getElementById('edit-section-id').value = section.id;
            document.getElementById('section-name').value = section.name;
            document.getElementById('section-icon').value = section.icon;
            templateSelect.value = section.defaultTemplate;
            currentIcon = section.icon;

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.textContent = 'Deletar Seção';
            deleteBtn.className = 'bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm';
            deleteBtn.dataset.action = 'delete-section';
            deleteBtn.dataset.sectionId = sectionId;
            deleteContainer.appendChild(deleteBtn);
        }
    } else {
        document.getElementById('modal-title').textContent = 'Nova Seção';
        document.getElementById('edit-section-id').value = '';
        templateSelect.value = 'simple';
    }

    populateIconPicker(currentIcon);
    sectionModalEl.classList.add('is-open');
}

export function closeSectionModal() {
    sectionModalEl.classList.remove('is-open');
    document.getElementById('icon-picker-container').classList.add('hidden');
}

function populateIconPicker(selectedIcon) {
    const iconGrid = document.getElementById('icon-grid');
    const iconSearch = document.getElementById('icon-search');

    const renderIcons = (filter = '') => {
        iconGrid.innerHTML = '';
        iconList.filter(icon => icon.includes(filter)).forEach(icon => {
            const iconEl = document.createElement('button');
            iconEl.type = 'button';
            iconEl.className = `p-2 rounded-md text-xl hover:bg-sky-500 hover:text-white transition-colors ${icon === selectedIcon ? 'bg-sky-600 text-white' : 'bg-stone-800'}`;
            iconEl.innerHTML = `<i class="fas ${icon}"></i>`;
            iconEl.dataset.icon = icon;
            iconGrid.appendChild(iconEl);
        });
    };

    iconSearch.value = '';
    renderIcons();
    iconSearch.oninput = () => renderIcons(iconSearch.value.trim());
    selectIcon(selectedIcon);
}

export function selectIcon(iconClass) {
    document.getElementById('section-icon').value = iconClass;
    document.getElementById('selected-icon-preview').className = `fas ${iconClass}`;
    
    const iconGrid = document.getElementById('icon-grid');
    Array.from(iconGrid.children).forEach(child => {
        child.classList.remove('bg-sky-600', 'text-white');
        if (child.dataset.icon === iconClass) {
            child.classList.add('bg-sky-600', 'text-white');
        }
    });
}

export function initializeDragAndDrop() {
    new Sortable(navMenuEl, {
        animation: 150,
        handle: '.drag-handle',
        filter: 'a',
        preventOnFilter: true,
        onEnd: (evt) => {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            
            const oldArrayIndex = oldIndex - 1;
            const newArrayIndex = newIndex - 1;

            if (oldArrayIndex < 0 || newArrayIndex < 0) return;

            const [movedItem] = db.sections.splice(oldArrayIndex, 1);
            db.sections.splice(newArrayIndex, 0, movedItem);

            saveDb();
        }
    });
}