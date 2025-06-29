export let db;

const DEFAULT_DB = {
  title: 'Meu Códice',
  sections: []
};

/**
 * Salva o banco de dados atual no localStorage.
 */
export function saveDb() {
  try {
    localStorage.setItem('codexDb', JSON.stringify(db));
  } catch (e) {
    console.error("Erro ao salvar o Códice no localStorage:", e);
    alert("Não foi possível salvar seu Códice. O armazenamento pode estar cheio.");
  }
}

/**
 * Carrega o banco de dados do localStorage ou inicializa com o padrão.
 */
export function loadDb() {
  const savedDb = localStorage.getItem('codexDb');
  try {
    db = savedDb ? JSON.parse(savedDb) : JSON.parse(JSON.stringify(DEFAULT_DB));
  } catch (e) {
    console.error("Erro ao carregar Códice do localStorage. Usando Códice padrão.", e);
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

/**
 * Adiciona ou atualiza uma seção.
 * @param {object} sectionData - Dados da seção.
 */
export function saveSection(sectionData) {
  if (sectionData.id) {
    const section = db.sections.find(s => s.id === sectionData.id);
    if (section) {
      Object.assign(section, sectionData);
    }
  } else {
    db.sections.push({
      id: 'section_' + Date.now(),
      name: sectionData.name,
      icon: sectionData.icon,
      defaultTemplate: sectionData.defaultTemplate,
      items: []
    });
  }
  saveDb();
}

/**
 * Deleta uma seção.
 * @param {string} sectionId 
 */
export function deleteSection(sectionId) {
    const section = db.sections.find(s => s.id === sectionId);
    if (section && confirm(`Tem certeza que deseja deletar a seção "${section.name}" e todos os seus tópicos?`)) {
        db.sections = db.sections.filter(s => s.id !== sectionId);
        saveDb();
        return true;
    }
    return false;
}


/**
 * Adiciona ou atualiza um item dentro de uma seção.
 * @param {object} itemData - Dados do item.
 */
export function saveItem(itemData) {
  const section = db.sections.find(c => c.id === itemData.categoryId);
  if (!section) return null;

  if (itemData.id) {
    const itemIndex = section.items.findIndex(i => i.id === itemData.id);
    if (itemIndex > -1) {
      // Mantém o ID original, mas atualiza o resto
      section.items[itemIndex] = { ...section.items[itemIndex], ...itemData };
    }
  } else {
    itemData.id = 'item_' + Date.now();
    section.items.push(itemData);
  }
  saveDb();
  return itemData;
}


/**
 * Deleta um item.
 * @param {string} categoryId 
 * @param {string} itemId 
 */
export function deleteItem(categoryId, itemId) {
    if (confirm('Tem certeza que deseja deletar este tópico?')) {
        const section = db.sections.find(c => c.id === categoryId);
        if (section) {
            section.items = section.items.filter(i => i.id !== itemId);
            saveDb();
            return true;
        }
    }
    return false;
}