
// ------------------------------------------------------
// Carrega fontes e SplashScreen antes de iniciar o app.
// Mantém ThemeProvider, AuthProvider e RootNavigator.
// ------------------------------------------------------

import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { AuthProvider } from './app/src/context/AuthContext';
import { PlayerProvider } from './app/src/context/PlayerContext';
import { ThemeProvider } from './app/src/context/ThemeContext';
import { initDB } from './app/src/db/sqlite';
import RootNavigator from './app/src/navigation/RootNavigator';
import { carregarFontes } from './app/src/theme/typography';

// Impede que o splash desapareça automaticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Cria a BD local e carrega as fontes
    (async () => {
      try {
        initDB();
        await carregarFontes();
      } catch (e) {
        console.warn('Erro ao carregar fontes ou BD:', e);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync(); // Oculta o splash quando tudo estiver pronto
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <RootNavigator />
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
