
// Edita título e Flow; permite remover da BD (não apaga o ficheiro físico).

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useThemeFlow } from '../../context/ThemeContext';
import { atualizarMedia, buscarPorId, removerMedia } from '../../db/sqlite';
import { BibliotecaStackParamList } from '../../navigation/BibliotecaStack';

type Props = NativeStackScreenProps<BibliotecaStackParamList, 'EcraDetalhesMedia'>;

export default function EcraDetalhesMedia({ route, navigation }: Props) {
  const { id } = route.params;
  const { palette } = useThemeFlow();
  const [titulo, setTitulo] = useState('');
  const [flow, setFlow] = useState<'red' | 'orange' | 'blue' | 'purple' | 'black' | 'pink'>('blue');

  useEffect(() => {
    const result = buscarPorId(id);
    if (result) {
      setTitulo(result.titulo);
      setFlow(result.flow_cor);
    }
  }, [id]);

  const guardar = () => {
    atualizarMedia(id, titulo, flow);
    Alert.alert('Sucesso', 'Guardado com sucesso.');
    navigation.goBack();
  };

  const remover = () => {
    removerMedia(id);
    Alert.alert('Sucesso', 'Removido da Biblioteca.');
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, padding: 16 }}>
      <Text style={{ color: palette.text, marginBottom: 8 }}>Título</Text>
      <TextInput value={titulo} onChangeText={setTitulo} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 }} />

      <Text style={{ color: palette.text, marginBottom: 8 }}>Flow (cor)</Text>
      <TextInput value={flow} onChangeText={(t) => setFlow(t as any)} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8 }} />

      <Pressable onPress={guardar} style={{ marginTop: 16, backgroundColor: palette.primary, padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Guardar</Text>
      </Pressable>

      <Pressable onPress={remover} style={{ marginTop: 12, backgroundColor: '#c0392b', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Remover da Biblioteca</Text>
      </Pressable>
    </View>
  );
}
