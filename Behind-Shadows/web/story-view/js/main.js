import { initializeUI, renderContent } from './ui.js';
import { initializeEventHandlers } from './eventHandlers.js';

/**
 * Ponto de entrada principal da aplicação.
 */
async function main() {
    try {
        // Busca o banco de dados gerado pelo script build.js
        const response = await fetch('./dist/db.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar db.json: ${response.statusText}`);
        }
        const db = await response.json();

        // Inicializa a interface com os dados carregados
        initializeUI(db);
        initializeEventHandlers(db);
        
        // Verifica se há um hash na URL para carregar um tópico específico
        const initialTopicId = window.location.hash.substring(1);
        renderContent(db, initialTopicId || 'home');

    } catch (error) {
        console.error("Falha ao inicializar o Códice:", error);
        document.getElementById('main-content').innerHTML = `
            <div class="text-center p-8 bg-red-800/20 rounded-lg border border-red-500/50">
                <h2 class="text-3xl text-red-300 font-title">Erro ao Carregar</h2>
                <p class="text-red-400 mt-2">Não foi possível carregar os dados do Códice.</p>
                <p class="text-red-500 mt-4 text-sm">Certifique-se de que o arquivo <code>dist/db.json</code> existe e está acessível.</p>
            </div>
        `;
    }
}

// Garante que o script só rode após o carregamento completo da página.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
