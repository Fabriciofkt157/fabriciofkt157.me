import { renderContent } from './ui.js';

/**
 * Inicializa todos os manipuladores de eventos da aplicação.
 * @param {object} db - O objeto do banco de dados carregado.
 */
export function initializeEventHandlers(db) {
    const sidebarEl = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const navMenuEl = document.getElementById('nav-menu');
    const mainContentEl = document.getElementById('main-content');

    // Função para lidar com a navegação
    const handleNavigation = (targetId) => {
        renderContent(db, targetId);
        // Fecha a barra lateral em telas pequenas após o clique
        if (sidebarEl.classList.contains('open')) {
            sidebarEl.classList.remove('open');
        }
    };

    // Delegação de evento para links de navegação no menu e no conteúdo
    document.body.addEventListener('click', (e) => {
        const navLink = e.target.closest('a[data-action="nav"]');
        if (navLink) {
            e.preventDefault();
            const targetId = navLink.dataset.target;
            handleNavigation(targetId);
        }
    });
    
    // Listener para o botão de voltar/avançar do navegador
    window.addEventListener('popstate', () => {
        const topicId = window.location.hash.substring(1);
        renderContent(db, topicId || 'home');
    });

    // Manipulador do botão de abrir/fechar a barra lateral
    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarEl.classList.toggle('open');
    });

    // Fecha a barra lateral ao clicar fora dela em telas pequenas
    document.addEventListener('click', (e) => {
        if (
            sidebarEl.classList.contains('open') &&
            !sidebarEl.contains(e.target) &&
            e.target !== sidebarToggleBtn
        ) {
            sidebarEl.classList.remove('open');
        }
    });
}
