
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const conteudoPath = path.resolve('conteudo');
const distPath = path.resolve('dist');
const configPath = path.join(conteudoPath, 'config.json');

const frontmatterSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string().optional(),
  icone: z.string().optional(),
  template: z.enum(['simple', 'character', 'inventory', 'timeline', 'evento', 'termo', 'mapa', 'grupo', 'cutscene']).optional(),
  image_url: z.string().optional(),
  age: z.string().optional(),
  birthday: z.string().optional(),
  origin: z.string().optional(),
  personagens: z.array(z.string()).optional()
});

async function processarDiretorio(dir, parentId = null) {
  const secoes = [];
  const topicos = {};

  const itens = await fs.readdir(dir);

  for (const item of itens) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      const resultado = await processarDiretorio(fullPath, path.relative(conteudoPath, dir));
      secoes.push(...resultado.secoes);
      Object.assign(topicos, resultado.topicos);
    } else if (item === '_index.md') {
      const raw = await fs.readFile(fullPath, 'utf8');
      const { data } = matter(raw);

      const secaoId = path.relative(conteudoPath, dir).replace(/\\/g, '/');
      const secao = {
        id: secaoId,
        title: data.titulo.replace(/_/g, ' '),
        icon: data.icone || 'fa-book',
        template: data.template || 'simple',
        parent: parentId,
        items: []
      };

      secoes.push(secao);
    }
  }

  const arquivos = await fs.readdir(dir);
  const secaoId = path.relative(conteudoPath, dir).replace(/\\/g, '/');
  const secao = secoes.find(s => s.id === secaoId);

  for (const file of arquivos) {
    if (file === '_index.md' || !file.endsWith('.md')) continue;

    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(raw);
    const valid = frontmatterSchema.safeParse(data);

    if (!valid.success) {
      console.warn(`⚠️  Erro em ${filePath}:`, valid.error.flatten().fieldErrors);
      continue;
    }

    const id = path.basename(file, '.md');
    if (secao) {
      secao.items.push({ id, title: data.titulo });
    }

    topicos[id] = {
      ...data,
      title: data.titulo,
      subtitle: data.subtitulo || '',
      template: data.template || (secao?.template ?? 'simple'),
      icon: data.icone || secao?.icon || 'fa-book',
      contentHtml: marked(content)
    };
  }

  return { secoes, topicos };
}

async function gerarDbJson() {
  const config = await fs.readJson(configPath).catch(() => ({ siteTitle: 'Story-View' }));
  const { secoes, topicos } = await processarDiretorio(conteudoPath);

  const finalDb = {
    siteTitle: config.siteTitle || 'Story-View',
    lastUpdated: new Date().toISOString(),
    sections: secoes,
    topics: topicos
  };

  await fs.ensureDir(distPath);
  await fs.writeJson(path.join(distPath, 'db.json'), finalDb, { spaces: 2 });

  console.log('✅ db.json gerado com sucesso!');
}

gerarDbJson().catch(err => {
  console.error('Erro ao gerar db.json:', err);
});
