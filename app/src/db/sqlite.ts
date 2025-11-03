
// ------------------------------------------------------
// Base de dados local do Joalin FlowPlayer (expo-sqlite)
// Armazena os ficheiros de mídia locais
// ------------------------------------------------------

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('flowplayer.db');

// ------------------------------------------------------
// Tipo TypeScript para MediaLocal
// ------------------------------------------------------
export type MediaLocal = {
  id: number;
  uri: string;
  titulo: string;
  tipo: 'audio' | 'video';
  flow_cor: 'red' | 'orange' | 'blue' | 'purple' | 'black' | 'pink';
  duracao: number | null;
};

// ------------------------------------------------------
// Criação da tabela (executa apenas uma vez)
// ------------------------------------------------------
export function initDB() {
  try {
    console.log('[SQLite] Inicializando banco de dados...');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS MediaLocal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT NOT NULL UNIQUE,
        titulo TEXT NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('audio', 'video')),
        flow_cor TEXT NOT NULL CHECK(flow_cor IN ('red', 'orange', 'blue', 'purple', 'black', 'pink')),
        duracao INTEGER
      );
    `);
    console.log('[SQLite] Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('[SQLite] Erro ao inicializar BD:', error);
    throw error;
  }
}

// ------------------------------------------------------
// Inserir novo registo
// ------------------------------------------------------
export function adicionarMedia({
  uri,
  titulo,
  tipo,
  flow_cor,
  duracao,
}: {
  uri: string;
  titulo: string;
  tipo: 'audio' | 'video';
  flow_cor: 'red' | 'orange' | 'blue' | 'purple' | 'black' | 'pink';
  duracao?: number;
}) {
  try {
    console.log('[SQLite] Adicionando mídia:', { uri, titulo, tipo, flow_cor });
    
    const result = db.runSync(
      'INSERT OR IGNORE INTO MediaLocal (uri, titulo, tipo, flow_cor, duracao) VALUES (?, ?, ?, ?, ?)',
      [uri, titulo, tipo, flow_cor, duracao ?? null]
    );
    
    console.log('[SQLite] Mídia adicionada, changes:', result.changes, 'lastInsertRowId:', result.lastInsertRowId);
    
    if (result.changes === 0) {
      console.warn('[SQLite] Mídia já existe ou não foi inserida:', uri);
    }
    
    return result;
  } catch (error) {
    console.error('[SQLite] Erro ao adicionar mídia:', error);
    throw error;
  }
}

// ------------------------------------------------------
// Ler todas as mídias
// ------------------------------------------------------
export function listarTodas(): MediaLocal[] {
  const res = db.getAllSync('SELECT * FROM MediaLocal ORDER BY id DESC');
  return res as MediaLocal[];
}

// ------------------------------------------------------
// Filtrar por tipo (audio / video / todos)
// ------------------------------------------------------
export function listarPorTipo(tipo?: string): MediaLocal[] {
  try {
    console.log('[SQLite] Listando por tipo:', tipo);
    
    let resultado: MediaLocal[];
    
    if (!tipo || tipo === 'todos') {
      resultado = listarTodas();
    } else {
      resultado = db.getAllSync('SELECT * FROM MediaLocal WHERE tipo = ? ORDER BY id DESC', [tipo]) as MediaLocal[];
    }
    
    console.log('[SQLite] Encontrados', resultado.length, 'registos');
    return resultado;
  } catch (error) {
    console.error('[SQLite] Erro ao listar por tipo:', error);
    return [];
  }
}

// ------------------------------------------------------
// Filtrar por Flow (cor)
// ------------------------------------------------------
export function listarPorFlow(flow_cor: string): MediaLocal[] {
  return db.getAllSync(
    'SELECT * FROM MediaLocal WHERE flow_cor = ? ORDER BY id DESC',
    [flow_cor]
  ) as MediaLocal[];
}

// ------------------------------------------------------
// Buscar por ID
// ------------------------------------------------------
export function buscarPorId(id: number): MediaLocal | null {
  return db.getFirstSync<MediaLocal>(
    'SELECT * FROM MediaLocal WHERE id = ?',
    [id]
  );
}

// ------------------------------------------------------
// Atualizar cor ou título
// ------------------------------------------------------
export function atualizarMedia(id: number, titulo: string, flow_cor: string) {
  db.runSync('UPDATE MediaLocal SET titulo = ?, flow_cor = ? WHERE id = ?', [
    titulo,
    flow_cor,
    id,
  ]);
}

// ------------------------------------------------------
// Remover registo
// ------------------------------------------------------
export function removerMedia(id: number) {
  db.runSync('DELETE FROM MediaLocal WHERE id = ?', [id]);
}

// ------------------------------------------------------
// Apagar tudo (uso interno ou debug)
// ------------------------------------------------------
export function limparTudo() {
  db.runSync('DELETE FROM MediaLocal');
}

// ------------------------------------------------------
// Limpar vídeos com URIs content:// inválidos
// (URIs content:// não funcionam com expo-video)
// ------------------------------------------------------
export function limparVideosContentUri(): number {
  try {
    console.log('[SQLite] Limpando vídeos com URIs content://');
    
    const result = db.runSync(
      "DELETE FROM MediaLocal WHERE tipo = 'video' AND uri LIKE 'content://%'"
    );
    
    console.log('[SQLite] Vídeos removidos:', result.changes);
    return result.changes;
  } catch (error) {
    console.error('[SQLite] Erro ao limpar vídeos content://:', error);
    return 0;
  }
}

// ------------------------------------------------------
// Verificar se há vídeos com URIs content://
// ------------------------------------------------------
export function verificarVideosContentUri(): number {
  try {
    const resultado = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM MediaLocal WHERE tipo = 'video' AND uri LIKE 'content://%'"
    );
    
    return resultado?.count || 0;
  } catch (error) {
    console.error('[SQLite] Erro ao verificar vídeos content://:', error);
    return 0;
  }
}

// Exportar instância do BD
export { db };

