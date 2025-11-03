
import React from 'react';
import { Text, View } from 'react-native';
import { useThemeFlow } from '../context/ThemeContext';

export default function EmptyState({ mensagem }: { mensagem: string }) {
  const { palette } = useThemeFlow();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: palette.text, opacity: 0.6, textAlign: 'center' }}>{mensagem}</Text>
    </View>
  );
}
