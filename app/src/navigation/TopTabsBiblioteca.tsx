
// ------------------------------------------------------
// Top Tabs para a Biblioteca (Áudio | Vídeo | Todos)
// ------------------------------------------------------

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import ListaAudio from '../screens/biblioteca/ListaAudio';
import ListaTodos from '../screens/biblioteca/ListaTodos';
import ListaVideo from '../screens/biblioteca/ListaVideo';

const Tab = createMaterialTopTabNavigator();

export default function TopTabsBiblioteca() {
  return (
    <Tab.Navigator
      initialRouteName="ListaAudio"
      screenOptions={{
        tabBarActiveTintColor: '#00A859',
        tabBarIndicatorStyle: { backgroundColor: '#00A859', height: 3 },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen name="ListaAudio" component={ListaAudio} options={{ title: 'Áudio' }} />
      <Tab.Screen name="ListaVideo" component={ListaVideo} options={{ title: 'Vídeo' }} />
      <Tab.Screen name="ListaTodos" component={ListaTodos} options={{ title: 'Todos' }} />
    </Tab.Navigator>
  );
}
