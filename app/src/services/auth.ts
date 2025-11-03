
// --------------------------------------------------------------
// Serviço de autenticação do Joalin FlowPlayer
// Faz login, registo, logout e gestão do token JWT
// --------------------------------------------------------------

import * as SecureStore from 'expo-secure-store';
import { api } from './api';

// Interface dos dados esperados no login
interface LoginCredenciais {
  email: string;
  password: string;
}

// Interface dos dados para registo
interface RegistoDados {
  nome: string;
  email: string;
  password: string;
}

// Interface do token de resposta
interface TokenResponse {
  access_token: string;
  token_type: string;
}

// --------------------------------------------------------------
// Função: Entrar (Login)
// --------------------------------------------------------------
export async function entrar({ email, password }: LoginCredenciais) {
  try {
    console.log('Tentando fazer login com URL:', api.defaults.baseURL);
    console.log('Email:', email);
    
    // OAuth2 requer form-urlencoded, não JSON
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post<TokenResponse>('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 60000, // 60 segundos
    });

    const token = response.data.access_token;

    // Guarda o token localmente no dispositivo
    console.log('[Auth] Salvando token no SecureStore...');
    await SecureStore.setItemAsync('token', token);
    console.log('[Auth] Token salvo com sucesso');
    
    // Guarda o email do usuário
    console.log('[Auth] Salvando email do usuário:', email);
    await SecureStore.setItemAsync('userEmail', email);
    
    // Verifica se foi salvo
    const tokenSalvo = await SecureStore.getItemAsync('token');
    const emailSalvo = await SecureStore.getItemAsync('userEmail');
    console.log('[Auth] Verificação - Token salvo:', !!tokenSalvo, 'Email salvo:', emailSalvo);

    console.log('Login bem-sucedido!');
    return token;
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    
    // Verifica se é timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'Tempo esgotado: O servidor não respondeu. Verifique:\n' +
        `1. Se o backend está rodando em ${api.defaults.baseURL}\n` +
        '2. Se ambos estão na mesma rede Wi-Fi\n' +
        '3. Se o firewall está configurado corretamente'
      );
    }
    
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
      console.error('Status:', error.response.status);
      throw new Error(
        error.response.data?.detail || 
        'Falha ao entrar. Verifique o e-mail e a palavra-passe.'
      );
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
      throw new Error(
        `Erro de conexão: Não foi possível conectar ao servidor.\n\n` +
        `URL: ${api.defaults.baseURL}\n\n` +
        'Verifique:\n' +
        '1. Se o backend está rodando (execute: cd backend && start.bat)\n' +
        '2. Se ambos os dispositivos estão na mesma rede Wi-Fi\n' +
        '3. Se o IP do backend está correto em api.ts\n' +
        '4. Se o firewall permite conexões na porta 8000'
      );
    } else {
      console.error('Erro na configuração:', error.message);
      throw new Error('Erro ao preparar a requisição: ' + error.message);
    }
  }
}

// --------------------------------------------------------------
// Função: Registar
// --------------------------------------------------------------
export async function registar({ nome, email, password }: RegistoDados) {
  try {
    console.log('Tentando registar com URL:', api.defaults.baseURL);
    console.log('Dados de registo:', { nome, email, password: '***' });
    
    const response = await api.post('/auth/registar', {
      nome,
      email,
      password,
    }, {
      timeout: 60000, // 60 segundos para este endpoint
    });

    console.log('Registo bem-sucedido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao registar:', error);
    
    // Verifica se é timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error(
        'Tempo esgotado: O servidor não respondeu. Verifique:\n' +
        `1. Se o backend está rodando em ${api.defaults.baseURL}\n` +
        '2. Se ambos estão na mesma rede Wi-Fi\n' +
        '3. Se o firewall está configurado corretamente'
      );
    }
    
    if (error.response) {
      // O servidor respondeu com erro
      console.error('Resposta do servidor:', error.response.data);
      console.error('Status:', error.response.status);
      throw new Error(
        error.response.data?.detail || 
        'Falha ao registar. Verifique os dados.'
      );
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
      throw new Error(
        `Erro de conexão: Não foi possível conectar ao servidor.\n\n` +
        `URL: ${api.defaults.baseURL}\n\n` +
        'Verifique:\n' +
        '1. Se o backend está rodando (execute: cd backend && start.bat)\n' +
        '2. Se ambos os dispositivos estão na mesma rede Wi-Fi\n' +
        '3. Se o IP do backend está correto em api.ts\n' +
        '4. Se o firewall permite conexões na porta 8000'
      );
    } else {
      // Erro ao configurar a requisição
      console.error('Erro na configuração:', error.message);
      throw new Error('Erro ao preparar a requisição: ' + error.message);
    }
  }
}

// --------------------------------------------------------------
// Função: Terminar Sessão (Logout)
// --------------------------------------------------------------
export async function terminarSessao() {
  console.log('[Auth] Removendo token e email do SecureStore...');
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('userEmail');
  console.log('[Auth] Token e email removidos');
}

// --------------------------------------------------------------
// Função: Obter Email do Utilizador
// --------------------------------------------------------------
export async function obterEmailUtilizador(): Promise<string | null> {
  try {
    const email = await SecureStore.getItemAsync('userEmail');
    console.log('[Auth] obterEmailUtilizador - Email encontrado:', email || 'nenhum');
    return email;
  } catch (error) {
    console.error('[Auth] Erro ao obter email:', error);
    return null;
  }
}

// --------------------------------------------------------------
// Função: Obter Token Atual
// --------------------------------------------------------------
export async function obterToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('token');
    console.log('[Auth] obterToken - Token encontrado:', !!token);
    return token;
  } catch (error) {
    console.error('[Auth] Erro ao obter token:', error);
    return null;
  }
}

// --------------------------------------------------------------
// Função: Verificar se utilizador está autenticado
// --------------------------------------------------------------
export async function estaAutenticado(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('token');
  return !!token;
}
