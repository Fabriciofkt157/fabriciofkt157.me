// js/app.js

const DB_PATH = 'dist/db.json';

let db = null;

const navMenuEl = document.getElementById('nav-menu');
const mainContentEl = document.getElementById('main-content');
const codexTitleEl = document.getElementById('codex-title');
const sidebarEl = document.getElementById('sidebar');

/**
 * Constrói o menu de navegação a partir das seções do banco de dados.
 */
function buildNavMenu() {
    navMenuEl.innerHTML = '';

    const homeLink = document.createElement('a');
    homeLink.href = '#home';
    homeLink.className = 'block text-stone-300 hover:bg-stone-700 hover:text-sky-300 rounded-md px-3 py-2 text-sm font-medium';
    homeLink.innerHTML = '<i class="fas fa-dungeon w-6 mr-2"></i>Início';
    homeLink.dataset.target = 'home';
    navMenuEl.appendChild(homeLink);

    db.sections.forEach(category => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mt-4';
        
        const titleH3 = document.createElement('h3');
        titleH3.className = 'text-xs font-title text-stone-500 uppercase tracking-wider flex items-center px-3';
        titleH3.innerHTML = `<i class="fas ${category.icon || 'fa-book'} fa-fw mr-3"></i><span>${category.title}</span>`;
        
        const itemListUl = document.createElement('ul');
        itemListUl.className = 'space-y-1 mt-1 ml-5 border-l border-stone-700';

        const sortedItems = category.items.sort((a, b) => a.title.localeCompare(b.title));

        sortedItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${item.id}`;
            a.className = 'block text-stone-400 hover:text-sky-300 text-sm py-1 pl-4';
            a.textContent = item.title;
            a.dataset.target = item.id;
            li.appendChild(a);
            itemListUl.appendChild(li);
        });

        sectionDiv.appendChild(titleH3);
        sectionDiv.appendChild(itemListUl);
        navMenuEl.appendChild(sectionDiv);
    });
}

/**
 * Renderiza o conteúdo principal com base no ID do item.
 * @param {string} itemId O ID do tópico a ser renderizado, ou 'home'.
 */
function renderContent(itemId) {
    if (itemId === 'home' || !itemId) {
        mainContentEl.innerHTML = document.getElementById('home-template').innerHTML;
        return;
    }

    const item = db.topics[itemId];

    if (!item) {
        console.warn(`Tópico com id "${itemId}" não encontrado.`);
        renderContent('home');
        return;
    }

    const templateName = item.template || 'simple';
    const templateContainer = document.getElementById(`${templateName}-template-display`);
    if (!templateContainer) {
        console.error(`Template de visualização para '${templateName}' não encontrado.`);
        return;
    }
    
    let templateHtml = templateContainer.innerHTML;
    
    Object.keys(item).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        let content = item[key] || '';
        if (key === 'image_url' && !content) {
            content = `https://placehold.co/200x200/292524/7dd3fc?text=${item.title ? item.title[0] : '?'}`;
        }
        templateHtml = templateHtml.replace(regex, content);
    });

    mainContentEl.innerHTML = templateHtml;
    mainContentEl.scrollTop = 0; // Garante que o conteúdo comece do topo
}

/**
 * Inicializa os manipuladores de eventos para navegação.
 */
function initializeEventHandlers() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    navMenuEl.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target && target.dataset.target) {
            e.preventDefault();
            renderContent(target.dataset.target);
            window.location.hash = target.dataset.target;
            if (window.innerWidth <= 768) {
                sidebarEl.classList.remove('open');
            }
        }
    });

    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarEl.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (sidebarEl.classList.contains('open') && !sidebarEl.contains(e.target) && !sidebarToggleBtn.contains(e.target)) {
            sidebarEl.classList.remove('open');
        }
    });

    window.addEventListener('hashchange', () => {
        const itemId = window.location.hash.substring(1);
        renderContent(itemId || 'home');
    });
}

/**
 * Função principal de inicialização.
 */
async function init() {
    try {
        const response = await fetch(DB_PATH);
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo db.json: ${response.statusText}`);
        }
        db = await response.json();

        document.title = db.siteTitle || 'Códice';
        codexTitleEl.textContent = db.siteTitle || 'Códice';
        
        const lastUpdatedEl = document.getElementById('last-updated');
        if (db.lastUpdated) {
            const date = new Date(db.lastUpdated);
            lastUpdatedEl.textContent = `Última atualização: ${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
        }

        buildNavMenu();
        initializeEventHandlers();

        const initialItemId = window.location.hash.substring(1);
        renderContent(initialItemId || 'home');

    } catch (error) {
        console.error("Falha ao inicializar a aplicação:", error);
        mainContentEl.innerHTML = `<div class="text-center p-8 bg-red-900/50 rounded-lg text-red-300">
            <h2 class="text-3xl font-title">Erro ao carregar o Códice</h2>
            <p>Não foi possível encontrar ou ler o arquivo <code>${DB_PATH}</code>.</p>
            <p class="mt-4">Verifique se o arquivo existe e se o servidor local está rodando corretamente.</p>
        </div>`;
    }
}

// Inicia a aplicação quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', init);
