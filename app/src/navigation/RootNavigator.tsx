
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppDrawer from './AppDrawer';
import AuthStack from './AuthStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { autenticado, loading, token } = useAuth();

  useEffect(() => {
    console.log('[RootNavigator] Estado:', { autenticado, loading, hasToken: !!token });
  }, [autenticado, loading, token]);

  if (loading) {
    console.log('[RootNavigator] Carregando...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00A859" />
      </View>
    );
  }

  console.log('[RootNavigator] Navegando para:', autenticado ? 'App' : 'Auth');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {autenticado ? (
          <Stack.Screen name="App" component={AppDrawer} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
