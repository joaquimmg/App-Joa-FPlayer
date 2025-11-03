
// Axios configurado para anexar o Bearer Token automaticamente

// @ts-ignore
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IP local
export const BASE_URL = 'https://app-joa-fplayer.onrender.com/';

// 172.16.21.69 - IP da faculdade
// 192.168.100.9 - IP de casa 


export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 segundos para conexões lentas
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de resposta para log de erros
api.interceptors.response.use(
  (response) => {
    console.log(`[✓] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[X] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
      console.error(`[X] Resposta:`, error.response.data);
    } else if (error.request) {
      console.error(`[X] Sem resposta do servidor para: ${error.config?.url}`);
      console.error(`[X] Verifique se o backend está rodando em: ${BASE_URL}`);
    } else {
      console.error(`[X] Erro na configuração:`, error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor que adiciona o token de forma assíncrona
// @ts-ignore - Axios nesta versão tem problemas com tipos de Promise
api.interceptors.request.use(
  // @ts-ignore
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log(`[→] ${config.method?.toUpperCase()} ${config.url}`);
      
      if (token) {
        console.log('[Auth] Token encontrado, adicionando ao header');
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        console.warn('[Auth] Nenhum token encontrado no SecureStore');
      }
    } catch (error) {
      console.error('[Auth] Erro ao buscar token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[Auth] Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);
