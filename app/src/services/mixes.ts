
// CRUD de Mixes e Itens.

import { api } from './api';

export type Mix = {
  id: number;
  nome: string;
  flow_cor_base: string;
  items: { id: number; media_titulo: string; media_tipo: 'audio' | 'video' }[];
};

export async function listarMixes() {
  const { data } = await api.get('/mixes');
  return data as Mix[];
}

export async function criarMix(nome: string, flow_cor_base: string) {
  const { data } = await api.post('/mixes', { nome, flow_cor_base });
  return data as Mix;
}

export async function atualizarMix(id: number, nome: string, flow_cor_base: string) {
  const { data } = await api.put(`/mixes/${id}`, { nome, flow_cor_base });
  return data as Mix;
}

export async function removerMix(id: number) {
  await api.delete(`/mixes/${id}`);
}

export async function adicionarItem(mixId: number, media_titulo: string, media_tipo: 'audio' | 'video') {
  const { data } = await api.post(`/mixes/${mixId}/items`, { media_titulo, media_tipo });
  return data as { id: number; media_titulo: string; media_tipo: string };
}

export async function removerItem(mixId: number, itemId: number) {
  await api.delete(`/mixes/${mixId}/items/${itemId}`);
}
