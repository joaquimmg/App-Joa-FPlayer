
// Cabeçalho com título centralizado e cor do tema.

import React from 'react';
import { Platform, StatusBar, Text, View } from 'react-native';
import { useThemeFlow } from '../context/ThemeContext';

export default function Cabecalho({ titulo }: { titulo: string }) {
  const { palette } = useThemeFlow();
  
  // Altura segura para Android (status bar)
  const paddingTop = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8;
  
  return (
    <View style={{ 
      paddingTop, 
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: palette.primary 
    }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{titulo}</Text>
    </View>
  );
}
