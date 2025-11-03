
// Componente pequeno para alternar secureTextEntry nos campos de palavra-passe.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

export const IconeOlhoSenha: React.FC<{ visivel: boolean; onPress: () => void }> = ({ visivel, onPress }) => {
  return (
    <Pressable onPress={onPress} accessibilityLabel={visivel ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}>
      <Ionicons name={visivel ? 'eye-off' : 'eye'} size={22} />
    </Pressable>
  );
};
