
// ----------------------------------------------------
// Contexto global do reprodutor de mídia Joalin FlowPlayer
// Permite controlar reprodução, pausa, próximo, anterior e shuffle
// Funciona tanto para áudio quanto vídeo
// ----------------------------------------------------

import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Tipo para representar um ficheiro de mídia (mesmo formato do SQLite)
export type MediaItem = {
  id?: number;
  uri: string;
  titulo: string;
  tipo: 'audio' | 'video';
  flow_cor: string;
  duracao?: number;
};

// Tipo do contexto (interface)
type PlayerContextType = {
  playlist: MediaItem[];
  indiceAtual: number;
  itemAtual?: MediaItem;
  isPlaying: boolean;
  tipo: 'audio' | 'video' | null;
  iniciarReproducao: (lista: MediaItem[], index?: number) => Promise<void>;
  pausar: () => Promise<void>;
  retomar: () => Promise<void>;
  parar: () => Promise<void>;
  proximo: () => Promise<void>;
  anterior: () => Promise<void>;
  embaralhar: () => Promise<void>;
};

// Criação do contexto
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Hook de uso rápido
export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer deve ser usado dentro de PlayerProvider');
  return ctx;
};

// Provider que engloba toda a app
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // Estado principal
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tipo, setTipo] = useState<'audio' | 'video' | null>(null);

  // Referência para o som ou vídeo
  const soundRef = useRef<Audio.Sound | null>(null);

  // ----------------------------------------------------
  // Inicializa o modo de áudio para continuar em background
  // ----------------------------------------------------
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  // ----------------------------------------------------
  // Função principal: iniciar reprodução
  // ----------------------------------------------------
  const iniciarReproducao = async (lista: MediaItem[], index: number = 0) => {
    try {
      // Limpa qualquer reprodução anterior
      await parar();

      setPlaylist(lista);
      setIndiceAtual(index);
      const item = lista[index];
      setTipo(item.tipo);

      // Cria objeto de som (áudio) com expo-av
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // Listener: quando o som termina, avança para o próximo
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish && !status.isLooping) {
          // Usar setTimeout para evitar chamada recursiva imediata
          setTimeout(() => {
            const novoIndex = (index + 1) % lista.length;
            if (novoIndex !== index) {
              iniciarReproducao(lista, novoIndex);
            }
          }, 100);
        }
      });
    } catch (e) {
      console.error('Erro ao iniciar reprodução:', e);
    }
  };

  // ----------------------------------------------------
  // Controlos básicos
  // ----------------------------------------------------
  const pausar = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const retomar = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const parar = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
    }
  };

  // ----------------------------------------------------
  // Navegação entre faixas
  // ----------------------------------------------------
  const proximo = async () => {
    if (playlist.length === 0) return;
    const novoIndex = (indiceAtual + 1) % playlist.length;
    await iniciarReproducao(playlist, novoIndex);
  };

  const anterior = async () => {
    if (playlist.length === 0) return;
    const novoIndex =
      indiceAtual === 0 ? playlist.length - 1 : indiceAtual - 1;
    await iniciarReproducao(playlist, novoIndex);
  };

  // ----------------------------------------------------
  // Shuffle: embaralhar lista
  // ----------------------------------------------------
  const embaralhar = async () => {
    if (playlist.length <= 1) return;
    const novaLista = [...playlist].sort(() => Math.random() - 0.5);
    setPlaylist(novaLista);
    await iniciarReproducao(novaLista, 0);
  };

  // ----------------------------------------------------
  // Renderização do provider
  // ----------------------------------------------------
  return (
    <PlayerContext.Provider
      value={{
        playlist,
        indiceAtual,
        itemAtual: playlist[indiceAtual],
        isPlaying,
        tipo,
        iniciarReproducao,
        pausar,
        retomar,
        parar,
        proximo,
        anterior,
        embaralhar,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
