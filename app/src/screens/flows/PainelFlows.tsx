
// Ecrã com os 6 botões/cards de cor. Ao tocar, muda o tema e abre o Player com as médias daquele flow.

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useThemeFlow } from '../../context/ThemeContext';
import { listarPorFlow } from '../../db/sqlite';
import { FlowsStackParamList } from '../../navigation/FlowsStack';

type Props = NativeStackScreenProps<FlowsStackParamList, 'PainelFlows'>;

const FLOWS: { key: any; label: string }[] = [
  { key: 'red', label: 'Vermelho (Energia, Foco)' },
  { key: 'orange', label: 'Laranja (Criatividade, Ânimo)' },
  { key: 'blue', label: 'Azul (Calma, Relaxamento)' },
  { key: 'purple', label: 'Roxo (Reflexão, Noite)' },
  { key: 'black', label: 'Preto (Intensidade, Clássico)' },
  { key: 'pink', label: 'Rosa (Leveza, Diversão)' },
];

export default function PainelFlows({ navigation }: Props) {
  const { setTema, palette } = useThemeFlow();
  const { width } = useWindowDimensions();
  
  // Responsivo: 2 colunas em mobile, 3 em tablet
  const numColumns = width > 600 ? 3 : 2;
  const cardHeight = width > 600 ? 140 : 120;

  const onPressFlow = (flowKey: any) => {
    console.log('[PainelFlows] Flow selecionado:', flowKey);
    
    // 1) Muda tema
    setTema(flowKey);
    
    // 2) Lê do SQLite os itens desse flow
    const lista = listarPorFlow(flowKey);
    console.log('[PainelFlows] Itens encontrados:', lista.length);
    
    if (lista.length === 0) {
      // Sem itens: podes mostrar um aviso (simples)
      Alert.alert(
        'Sem médias',
        'Não há médias associadas a este Flow. Importe alguns ficheiros na Biblioteca.'
      );
      return;
    }
    
    // 3) Embaralha (shuffle) e abre o player
    const shuffled = [...lista].sort(() => Math.random() - 0.5);
    const uris = shuffled.map(x => ({ uri: x.uri, tipo: x.tipo, titulo: x.titulo }));
    
    console.log('[PainelFlows] Navegando para player com', uris.length, 'itens');
    navigation.navigate('EcraPlayer', { uris, index: 0 });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: palette.text, fontSize: 18, marginBottom: 16, lineHeight: 24 }}>
          Escolha um Flow para ouvir/ver as suas médias marcadas com essa cor:
        </Text>
        
        <FlatList
          data={FLOWS}
          keyExtractor={item => item.key}
          numColumns={numColumns}
          key={numColumns} // Força re-render ao mudar colunas
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPressFlow(item.key)}
              style={{
                flex: 1,
                height: cardHeight,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: item.key === 'black' ? '#2D2D2D' : item.key,
                opacity: 0.9,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Text style={{ 
                color: '#fff', 
                fontWeight: '700', 
                fontSize: 16,
                textAlign: 'center', 
                paddingHorizontal: 12 
              }}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}
