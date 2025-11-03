
// ------------------------------------------------------
// Stack principal da Tab "Flows"
// Mostra o Painel de cores e o EcraPlayer
// ------------------------------------------------------

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EcraPlayer from '../screens/flows/EcraPlayer';
import PainelFlows from '../screens/flows/PainelFlows';

export type FlowsStackParamList = {
  PainelFlows: undefined;
  EcraPlayer: {
    uris: Array<{ uri: string; tipo: 'audio' | 'video'; titulo: string }>;
    index: number;
  };
};

const Stack = createNativeStackNavigator<FlowsStackParamList>();

export default function FlowsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PainelFlows" component={PainelFlows} />
      <Stack.Screen
        name="EcraPlayer"
        component={EcraPlayer}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
