
// ------------------------------------------------------
// Stack da Tab "Mixes"
// Mostra as playlists sincronizadas com o backend
// ------------------------------------------------------

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useThemeFlow } from '../context/ThemeContext';
import EcraMixes from '../screens/mixes/EcraMixes';

const Stack = createNativeStackNavigator();

export default function MixesStack() {
  const { palette } = useThemeFlow();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EcraMixes"
        component={EcraMixes}
      />
    </Stack.Navigator>
  );
}
