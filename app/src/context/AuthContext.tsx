
// --------------------------------------------------------------
// Contexto global de autenticação (login, logout, registo)
// Usado no RootNavigator para alternar entre stacks
// --------------------------------------------------------------

import React, { createContext, useContext, useEffect, useState } from 'react';
import { entrar, obterEmailUtilizador, obterToken, registar, terminarSessao } from '../services/auth';

// Tipo do utilizador (dados básicos)
interface Utilizador {
  nome?: string;
  email?: string;
}

// Tipo do contexto exposto
interface AuthContextData {
  utilizador: Utilizador | null;
  token: string | null;
  loading: boolean;
  entrarContexto: (email: string, password: string) => Promise<void>;
  registarContexto: (nome: string, email: string, password: string) => Promise<void>;
  terminarSessaoContexto: () => Promise<void>;
  autenticado: boolean;
}

// Cria o contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --------------------------------------------------------------
// Provedor do contexto
// --------------------------------------------------------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [utilizador, setUtilizador] = useState<Utilizador | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Quando o app inicia, verifica se existe token guardado
  useEffect(() => {
    const carregarToken = async () => {
      try {
        console.log('[AuthContext] Carregando token salvo...');
        const tokenGuardado = await obterToken();
        
        if (tokenGuardado) {
          console.log('[AuthContext] Token encontrado, restaurando sessão');
          
          // Recuperar email salvo
          const emailSalvo = await obterEmailUtilizador();
          console.log('[AuthContext] Email recuperado:', emailSalvo || 'nenhum');
          
          setToken(tokenGuardado);
          setUtilizador({ 
            email: emailSalvo || undefined,
            nome: emailSalvo ? emailSalvo.split('@')[0] : 'Utilizador'
          });
        } else {
          console.log('[AuthContext] Nenhum token salvo encontrado');
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao carregar token:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarToken();
  }, []);

  // Função de login
  async function entrarContexto(email: string, password: string) {
    setLoading(true);
    try {
      console.log('[AuthContext] Fazendo login para:', email);
      const novoToken = await entrar({ email, password });
      console.log('[AuthContext] Login bem-sucedido, token recebido');
      setToken(novoToken);
      setUtilizador({ 
        email,
        nome: email.split('@')[0]
      });
    } catch (error) {
      console.error('[AuthContext] Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Função de registo
  async function registarContexto(nome: string, email: string, password: string) {
    setLoading(true);
    try {
      await registar({ nome, email, password });
      await entrarContexto(email, password);
    } finally {
      setLoading(false);
    }
  }

  // Função de logout
  async function terminarSessaoContexto() {
    console.log('[AuthContext] Terminando sessão...');
    await terminarSessao();
    setUtilizador(null);
    setToken(null);
    console.log('[AuthContext] Sessão terminada');
  }

  return (
    <AuthContext.Provider
      value={{
        utilizador,
        token,
        loading,
        entrarContexto,
        registarContexto,
        terminarSessaoContexto,
        autenticado: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx || Object.keys(ctx).length === 0) {
    console.warn('useAuth: AuthProvider ainda não está montado');
    return {
      utilizador: null,
      token: null,
      loading: true,
      entrarContexto: async () => {},
      registarContexto: async () => {},
      terminarSessaoContexto: async () => {},
      autenticado: false,
    } as AuthContextData;
  }
  return ctx;
}
