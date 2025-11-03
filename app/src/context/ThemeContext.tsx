
// Fornece o tema actual e função para trocar entre os 6 flows.
// Troca de cores com leve animação (reanimated pode ser adicionada conforme preferires).

import React, { createContext, useContext, useMemo, useState } from 'react';
import { FlowKey, FlowPalettes } from '../theme/colors';

type ThemeCtx = {
  tema: FlowKey;
  palette: typeof FlowPalettes[FlowKey];
  setTema: (k: FlowKey) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tema, setTema] = useState<FlowKey>('blue'); // padrão inicial

  const palette = useMemo(() => FlowPalettes[tema], [tema]);

  return (
    <Ctx.Provider value={{ tema, palette, setTema }}>
      {children}
    </Ctx.Provider>
  );
};

export const useThemeFlow = () => {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Retorna um valor padrão para evitar erros durante a renderização inicial
    console.warn('useThemeFlow: ThemeProvider ainda não está montado, usando valores padrão');
    return {
      tema: 'blue' as FlowKey,
      palette: FlowPalettes['blue'],
      setTema: () => {},
    };
  }
  return ctx;
};
