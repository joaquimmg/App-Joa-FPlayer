
// ------------------------------------------------------
// Drawer principal da aplicação
// ------------------------------------------------------

import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useThemeFlow } from '../context/ThemeContext';
import Tabs from './Tabs';

const Drawer = createDrawerNavigator();

function DefinicoesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Definições (a implementar)</Text>
    </View>
  );
}

// Drawer personalizado para incluir o logout
function CustomDrawerContent(props: any) {
  const { terminarSessaoContexto, utilizador } = useAuth();
  const { palette } = useThemeFlow();

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: palette.bg }}>
      {/* Informações do usuário */}
      <View style={{ 
        padding: 20, 
        backgroundColor: palette.primary, 
        marginBottom: 10 
      }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
          Joalin FlowPlayer
        </Text>
        {utilizador && (
          <Text style={{ color: '#fff', opacity: 0.9, marginTop: 4 }}>
            {utilizador.email}
          </Text>
        )}
      </View>

      <DrawerItem
        label="Principal"
        icon={({ color, size }) => (
          <Ionicons name="home-outline" color={palette.primary} size={size} />
        )}
        labelStyle={{ color: palette.text }}
        onPress={() => {
          // Navega para Principal (Tabs) e depois para a aba FlowsStack
          props.navigation.navigate('Principal', {
            screen: 'FlowsStack'
          });
        }}
      />
      
      <DrawerItem
        label="Definições"
        icon={({ color, size }) => (
          <Ionicons name="settings-outline" color={palette.primary} size={size} />
        )}
        labelStyle={{ color: palette.text }}
        onPress={() => props.navigation.navigate('Definicoes')}
      />
      
      <View style={{ borderTopWidth: 1, borderTopColor: palette.isDark ? '#333' : '#ddd', marginVertical: 10 }} />
      
      <DrawerItem
        label="Terminar Sessão"
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" color="#c0392b" size={size} />
        )}
        labelStyle={{ color: '#c0392b', fontWeight: '600' }}
        onPress={terminarSessaoContexto}
      />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  const { palette } = useThemeFlow();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.isDark ? '#999' : '#555',
        drawerStyle: {
          backgroundColor: palette.bg,
        },
      }}
    >
      <Drawer.Screen name="Principal" component={Tabs} />
      <Drawer.Screen name="Definicoes" component={DefinicoesScreen} />
    </Drawer.Navigator>
  );
}
