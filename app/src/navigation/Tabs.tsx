
// ------------------------------------------------------
// Navegação por abas inferior (Flows, Biblioteca, Mixes)
// ------------------------------------------------------

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable } from 'react-native';
import { useThemeFlow } from '../context/ThemeContext';

import BibliotecaStack from './BibliotecaStack';
import FlowsStack from './FlowsStack';
import MixesStack from './MixesStack';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { palette } = useThemeFlow();
  const navigation = useNavigation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: palette.primary },
        headerTintColor: '#FFF',
        headerLeft: () => (
          <Pressable 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={28} color="#FFF" />
          </Pressable>
        ),
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.isDark ? '#999' : '#777',
        tabBarStyle: { 
          backgroundColor: palette.isDark ? '#0d0d0d' : '#FFF', 
          borderTopWidth: 0.5,
          borderTopColor: palette.isDark ? '#333' : '#ddd'
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'FlowsStack') iconName = 'color-palette-outline';
          if (route.name === 'BibliotecaStack') iconName = 'library-outline';
          if (route.name === 'MixesStack') iconName = 'musical-notes-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="FlowsStack"
        component={FlowsStack}
        options={{ title: 'Flows' }}
      />
      <Tab.Screen
        name="BibliotecaStack"
        component={BibliotecaStack}
        options={{ title: 'Biblioteca' }}
      />
      <Tab.Screen
        name="MixesStack"
        component={MixesStack}
        options={{ title: 'Mixes' }}
      />
    </Tab.Navigator>
  );
}
