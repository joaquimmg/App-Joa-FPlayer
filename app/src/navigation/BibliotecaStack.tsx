
// ------------------------------------------------------
// Stack da Tab "Biblioteca"
// Contém as listas de áudio, vídeo e todos
// ------------------------------------------------------

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useThemeFlow } from '../context/ThemeContext';
import EcraDetalhesMedia from '../screens/biblioteca/EcraDetalhesMedia';
import EcraTabsBiblioteca from '../screens/biblioteca/EcraTabsBiblioteca';

export type BibliotecaStackParamList = {
  EcraTabsBiblioteca: undefined;
  EcraDetalhesMedia: { id: number };
};

const Stack = createNativeStackNavigator<BibliotecaStackParamList>();

export default function BibliotecaStack() {
  const { palette } = useThemeFlow();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EcraTabsBiblioteca"
        component={EcraTabsBiblioteca}
      />
      <Stack.Screen
        name="EcraDetalhesMedia"
        component={EcraDetalhesMedia}
        options={{
          headerShown: true,
          title: 'Detalhes da Mídia',
          headerStyle: { backgroundColor: palette.primary },
          headerTintColor: '#FFF',
        }}
      />
    </Stack.Navigator>
  );
}
