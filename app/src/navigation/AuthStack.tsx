
// ------------------------------------------------------
// Stack de autenticação (Login / Registo)
// ------------------------------------------------------

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EcraLogin from '../screens/auth/EcraLogin';
import EcraRegisto from '../screens/auth/EcraRegisto';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="EcraLogin"
      screenOptions={{
        headerShown: false, // sem cabeçalho superior
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="EcraLogin" component={EcraLogin} />
      <Stack.Screen name="EcraRegisto" component={EcraRegisto} />
    </Stack.Navigator>
  );
}
