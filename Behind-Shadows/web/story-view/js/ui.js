/**
 * Inicializa os elementos estáticos da UI que dependem dos dados do db.json.
 * @param {object} db - O objeto do banco de dados carregado.
 */
export function initializeUI(db) {
    document.title = db.siteTitle;
    document.getElementById('codex-title').textContent = db.siteTitle;
    
    // Formata e exibe a data da última atualização
    const lastUpdatedEl = document.getElementById('last-updated');
    const updateDate = new Date(db.lastUpdated);
    lastUpdatedEl.textContent = `Atualizado em: ${updateDate.toLocaleDateString()} às ${updateDate.toLocaleTimeString()}`;

    buildNavMenu(db);
}

/**
 * Constrói o menu de navegação, suportando seções aninhadas.
 * @param {object} db - O objeto do banco de dados.
 */
function buildNavMenu(db) {
    const navMenuEl = document.getElementById('nav-menu');
    navMenuEl.innerHTML = ''; // Limpa o menu

    const homeLink = createNavLink('Início', 'home', 'fa-dungeon');
    navMenuEl.appendChild(homeLink);

    // Cria um mapa de seções para fácil acesso e aninhamento
    const sectionMap = new Map(db.sections.map(s => [s.id, { ...s, children: [] }]));
    const rootSections = [];

    // Associa filhos aos pais
    sectionMap.forEach(section => {
        if (section.parent && sectionMap.has(section.parent)) {
            sectionMap.get(section.parent).children.push(section);
        } else {
            rootSections.push(section);
        }
    });

    // Função recursiva para renderizar cada seção e seus filhos
    const renderSection = (section, container, level = 0) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = level === 0 ? 'mt-4' : 'mt-2 ml-4';

        sectionDiv.innerHTML = `
            <div class="flex justify-between items-center ${level > 0 ? '' : 'px-3'}">
                <h3 class="text-xs font-title text-stone-500 uppercase tracking-wider flex items-center">
                    <i class="fas ${section.icon} fa-fw mr-3"></i>
                    <span>${section.title}</span>
                </h3>
            </div>
        `;

        const itemListUl = document.createElement('ul');
        itemListUl.className = 'space-y-1 mt-1 ml-5 border-l border-stone-700';
        
        section.items.forEach(itemInfo => {
            const topic = db.topics[itemInfo.id];
            if (topic) {
                const li = document.createElement('li');
                li.appendChild(createNavLink(topic.title, topic.id));
                itemListUl.appendChild(li);
            }
        });
        sectionDiv.appendChild(itemListUl);

        // Renderiza as sub-seções
        if (section.children.length > 0) {
            section.children.forEach(child => renderSection(child, sectionDiv, level + 1));
        }

        container.appendChild(sectionDiv);
    };

    // Inicia a renderização a partir das seções raiz
    rootSections.forEach(section => renderSection(section, navMenuEl));
}

/**
 * Função utilitária para criar um link de navegação.
 * @param {string} text - O texto do link.
 * @param {string} targetId - O ID do tópico para o qual o link aponta.
 * @param {string|null} icon - A classe do ícone Font Awesome.
 * @returns {HTMLAnchorElement}
 */
function createNavLink(text, targetId, icon = null) {
    const a = document.createElement('a');
    a.href = `#${targetId}`; // Usa hash para navegação SPA-like
    a.className = icon 
        ? 'block text-stone-300 hover:bg-stone-700 hover:text-sky-300 rounded-md px-3 py-2 text-sm font-medium'
        : 'block text-stone-400 hover:text-sky-300 text-sm py-1 pl-4';
    
    a.innerHTML = icon ? `<i class="fas ${icon} w-6 mr-2"></i>${text}` : text;
    a.dataset.action = 'nav';
    a.dataset.target = targetId;
    return a;
}

/**
 * Renderiza o conteúdo principal (página inicial ou um tópico).
 * @param {object} db - O objeto do banco de dados.
 * @param {string} topicId - O ID do tópico a ser renderizado, ou 'home'.
 */
export function renderContent(db, topicId) {
    const mainContentEl = document.getElementById('main-content');
    
    if (topicId === 'home' || !topicId) {
        const homeTemplate = document.getElementById('home-template').innerHTML;
        mainContentEl.innerHTML = homeTemplate;
        document.getElementById('home-title').textContent = db.siteTitle;
        window.location.hash = '';
        return;
    }

    const topic = db.topics[topicId];
    if (!topic) {
        console.warn(`Tópico com ID "${topicId}" não encontrado.`);
        renderContent(db, 'home');
        return;
    }
    
    window.location.hash = topicId;

    const templateName = topic.template || 'simple';
    const templateContainer = document.getElementById(`${templateName}-template-display`);
    if (!templateContainer) {
        console.error(`Template de visualização para '${templateName}' não encontrado.`);
        renderContent(db, 'home');
        return;
    }

    let templateHtml = templateContainer.innerHTML;
    
    // Substituições genéricas
    templateHtml = templateHtml.replace(/{titulo}/g, topic.title || 'Sem Título');
    templateHtml = templateHtml.replace(/{subtitulo}/g, topic.subtitle || '');
    templateHtml = templateHtml.replace(/{contentHtml}/g, topic.contentHtml || '');
    
    // Substituições específicas de cada template
    switch (templateName) {
        case 'character':
            templateHtml = templateHtml.replace(/{image_url}/g, topic.image_url || `https://placehold.co/200x200/292524/7dd3fc?text=${topic.title ? topic.title[0] : '?'}`);
            const details = [
                { label: 'Idade', value: topic.age },
                { label: 'Origem', value: topic.origin },
                { label: 'Aniversário', value: topic.birthday }
            ];
            const detailsGridHtml = details
                .filter(d => d.value)
                .map(d => `<p><strong>${d.label}:</strong> ${d.value}</p>`)
                .join('');
            templateHtml = templateHtml.replace('{details_grid}', detailsGridHtml);
            break;
            
        case 'mapa':
             templateHtml = templateHtml.replace(/{image_url}/g, topic.image_url || `https://placehold.co/800x600/1c1917/78716c?text=Mapa+Indisponível`);
             break;

        case 'evento':
        case 'grupo':
        case 'cutscene':
            const characterLinks = (topic.personagens || [])
                .map(charId => {
                    const charTopic = db.topics[charId];
                    return charTopic 
                        ? `<a href="#${charId}" data-action="nav" data-target="${charId}" class="bg-sky-800/50 hover:bg-sky-700/50 text-sky-200 text-sm font-semibold px-2 py-1 rounded-md">${charTopic.title}</a>`
                        : `<span class="bg-red-800/50 text-red-200 text-sm px-2 py-1 rounded-md">${charId} (não encontrado)</span>`;
                })
                .join('');
            templateHtml = templateHtml.replace('{personagens}', characterLinks || 'Nenhum personagem listado.');
            break;
    }

    mainContentEl.innerHTML = templateHtml;
}

