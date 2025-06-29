export const templates = {
  simple: {
    name: "Página Simples",
    fields: [
      { key: 'title', label: 'Título', type: 'text', placeholder: 'Título do tópico' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Uma breve descrição' },
      { key: 'content', label: 'Conteúdo', type: 'textarea', rows: 12, placeholder: 'Escreva aqui... HTML é permitido.' }
    ]
  },
  character: {
    name: "Ficha de Personagem",
    fields: [
      { key: 'title', label: 'Nome', type: 'text', placeholder: 'Nome completo do personagem' },
      { key: 'subtitle', label: 'Apelido ou Título', type: 'text', placeholder: 'Ex: O Bravo, Lon, etc.' },
      { key: 'image_url', label: 'URL da Imagem', type: 'text', placeholder: 'https://...' },
      { key: 'age', label: 'Idade', type: 'text', placeholder: 'Ex: 27 anos, Imortal' },
      { key: 'birthday', label: 'Aniversário', type: 'text', placeholder: 'Ex: 14/02' },
      { key: 'origin', label: 'Origem', type: 'text', placeholder: 'Ex: Reino de Eldoria' },
      { key: 'personality', label: 'Personalidade', type: 'textarea', rows: 4, placeholder: 'Descreva a personalidade...' },
      { key: 'about', label: 'Sobre', type: 'textarea', rows: 8, placeholder: 'História, aparência, etc...' },
      { key: 'curiosity', label: 'Curiosidade', type: 'textarea', rows: 4, placeholder: 'Fatos e curiosidades...' },
      { key: 'notes', label: 'Notas', type: 'textarea', rows: 4, placeholder: 'Notas do autor, ideias...' },
    ]
  },
  inventory: {
    name: "Lista / Inventário",
    fields: [
      { key: 'title', label: 'Nome da Lista', type: 'text', placeholder: 'Ex: Inventário de Kael' },
      { key: 'subtitle', label: 'Descrição', type: 'text', placeholder: 'Itens encontrados na masmorra...' },
      { key: 'items', label: 'Itens (JSON)', type: 'textarea', rows: 12, placeholder: '[{"name": "Poção de Cura", "qty": 5, "icon": "fa-flask"}, ...]' }
    ]
  }
};

export const iconList = ['fa-book', 'fa-scroll', 'fa-hat-wizard', 'fa-dungeon', 'fa-dragon', 'fa-shield-halved', 'fa-users', 'fa-map-location-dot', 'fa-mountain-sun', 'fa-tree', 'fa-ring', 'fa-gem', 'fa-khanda', 'fa-gavel', 'fa-crown', 'fa-chess-king', 'fa-landmark-flag', 'fa-fire', 'fa-water', 'fa-wind', 'fa-earth-americas', 'fa-flask-vial', 'fa-wand-magic-sparkles', 'fa-hand-fist', 'fa-paw', 'fa-feather-pointed', 'fa-skull-crossbones', 'fa-ghost', 'fa-bug', 'fa-ankh', 'fa-torii-gate', 'fa-star', 'fa-moon', 'fa-sun', 'fa-key', 'fa-lock'];