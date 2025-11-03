
// Representa um item de mídia (áudio/vídeo) com cor de flow e título.

import React from 'react';
import { Pressable, Text } from 'react-native';
import { useThemeFlow } from '../context/ThemeContext';
import { MediaLocal } from '../db/sqlite';

type Props = {
  item: MediaLocal;
  onPress?: () => void;
};

export default function CartaoMedia({ item, onPress }: Props) {
  const { palette } = useThemeFlow();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: palette.isDark ? '#1a1a1a' : '#fff',
        borderLeftWidth: 6,
        borderLeftColor: item.flow_cor,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: palette.text, fontWeight: '600' }}>{item.titulo}</Text>
      <Text style={{ color: palette.text, opacity: 0.7, fontSize: 12 }}>{item.tipo.toUpperCase()}</Text>
    </Pressable>
  );
}
