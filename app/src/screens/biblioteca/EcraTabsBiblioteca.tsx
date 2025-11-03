
// ------------------------------------------------------
// Top Tabs: "Áudio" | "Vídeo" | "Todos"
// + botão "Importar" para inserir ficheiros na BD local
// ------------------------------------------------------

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeFlow } from '../../context/ThemeContext';
import {
  adicionarMedia,
  initDB,
  limparTudo,
  limparVideosContentUri,
  listarPorTipo as listar,
  MediaLocal,
  verificarVideosContentUri,
} from '../../db/sqlite';
import { BibliotecaStackParamList } from '../../navigation/BibliotecaStack';

const TopTab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<BibliotecaStackParamList, 'EcraTabsBiblioteca'>;

// ------------------------------------------------------
// Lista genérica reutilizável (Áudio, Vídeo ou Todos)
// ------------------------------------------------------
function ListaGenerica({
  tipo,
  onAbrirDetalhes,
  refresh,
}: {
  tipo?: 'audio' | 'video';
  onAbrirDetalhes: (id: number) => void;
  refresh?: number;
}) {
  const { palette } = useThemeFlow();
  const [dados, setDados] = useState<MediaLocal[]>([]);

  useEffect(() => {
    console.log('[ListaGenerica] Carregando dados, tipo:', tipo, 'refresh:', refresh);
    initDB();
    const lista = listar(tipo) as MediaLocal[];
    console.log('[ListaGenerica] Dados carregados:', lista.length, 'itens');
    setDados(lista);
  }, [tipo, refresh]);

  return (
    <FlatList
      style={{ backgroundColor: palette.bg }}
      data={dados}
      keyExtractor={(x) => String(x.id)}
      ListEmptyComponent={
        <Text
          style={{
            color: palette.text,
            opacity: 0.6,
            textAlign: 'center',
            marginTop: 50,
          }}
        >
          Nenhum ficheiro encontrado.
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onAbrirDetalhes(item.id!)}
          style={styles.item}
        >
          <View>
            <Text style={[styles.titulo, { color: palette.text }]}>
              {item.titulo}
            </Text>
            <Text style={{ color: palette.text, opacity: 0.7 }}>
              {item.tipo.toUpperCase()} • Flow: {item.flow_cor}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

// ------------------------------------------------------
// Ecrã principal com botão "Importar" + Tabs
// ------------------------------------------------------
export default function EcraTabsBiblioteca({ navigation }: Props) {
  const { palette } = useThemeFlow();
  const [refreshKey, setRefreshKey] = useState(0);
  const [flowSelecionado, setFlowSelecionado] = useState<string>('blue');
  const [mostrarModalFlow, setMostrarModalFlow] = useState(false);
  const [ficheirosTemp, setFicheirosTemp] = useState<any[]>([]);

  // Cores disponíveis com emojis
  const coresFlow = [
    { key: 'red', label: 'Red', emoji: '🔴', cor: '#FF0000' },
    { key: 'orange', label: 'Orange', emoji: '🟠', cor: '#FFA500' },
    { key: 'blue', label: 'Blue', emoji: '🔵', cor: '#0000FF' },
    { key: 'purple', label: 'Purple', emoji: '🟣', cor: '#800080' },
    { key: 'black', label: 'Black', emoji: '⚫', cor: '#000000' },
    { key: 'pink', label: 'Pink', emoji: '🩷', cor: '#FFC0CB' },
  ];

  // Verificar vídeos com URIs content:// ao iniciar
  useEffect(() => {
    const verificarVideosIncompativeis = async () => {
      try {
        const count = verificarVideosContentUri();
        
        if (count > 0) {
          console.warn('[Biblioteca] Encontrados', count, 'vídeos com URIs content:// incompatíveis');
          
          Alert.alert(
            'Vídeos Incompatíveis Detectados',
            `Foram encontrados ${count} vídeo(s) que não podem ser reproduzidos. Estes vídeos foram importados com um formato antigo.\n\nDeseja removê-los e importá-los novamente?`,
            [
              { text: 'Mais Tarde', style: 'cancel' },
              {
                text: 'Remover Agora',
                style: 'destructive',
                onPress: () => {
                  const removidos = limparVideosContentUri();
                  setRefreshKey(prev => prev + 1);
                  Alert.alert(
                    'Vídeos Removidos',
                    `${removidos} vídeo(s) incompatível(is) foram removidos. Por favor, importe-os novamente usando o botão "Importar Ficheiros".`,
                    [{ text: 'OK' }]
                  );
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('[Biblioteca] Erro ao verificar vídeos:', error);
      }
    };
    
    verificarVideosIncompativeis();
  }, []);

  const importarFicheiros = async () => {
    try {
      console.log('[Importar] Iniciando importação...');
      
      // Para Android 13+ e iOS, pede permissão de leitura da biblioteca de mídia
      if (Platform.OS !== 'web') {
        console.log('[Importar] Solicitando permissões...');
        // Solicita permissões para todos os tipos de mídia (fotos, vídeos e áudio)
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        console.log('[Importar] Status da permissão:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária',
            'Autorize o acesso à biblioteca de mídia para importar ficheiros.'
          );
          return;
        }
      }

      console.log('[Importar] Abrindo seletor de documentos...');
      // Usa DocumentPicker para escolher ficheiros
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        multiple: true,
        copyToCacheDirectory: true, // Necessário para expo-video acessar o arquivo
      });
      
      console.log('[Importar] Resultado do picker:', res);
      
      if (res.canceled) {
        console.log('[Importar] Usuário cancelou');
        return;
      }

      if (!res.assets || res.assets.length === 0) {
        console.log('[Importar] Nenhum ficheiro selecionado');
        Alert.alert('Aviso', 'Nenhum ficheiro foi selecionado.');
        return;
      }

      console.log('[Importar] Ficheiros selecionados:', res.assets.length);

      // Armazena os ficheiros temporariamente
      setFicheirosTemp(res.assets);

      // Mostra modal para escolher o Flow
      setMostrarModalFlow(true);
    } catch (e: any) {
      console.error('[Importar] Erro:', e);
      Alert.alert('Erro', e.message || 'Falha ao importar ficheiros.');
    }
  };

  const processarFicheiros = async (assets: any[], flow: string) => {
    try {
      console.log('[Processar] Iniciando processamento de', assets.length, 'ficheiros');
      console.log('[Processar] Flow selecionado:', flow);

      let sucessos = 0;
      let erros = 0;

      for (const f of assets) {
        const nome = f.name || 'Sem título';
        const uri = f.uri;
        
        console.log('[Processar] Ficheiro:', nome, '- URI original:', uri);
        
        const isAudio = /\.(mp3|m4a|wav|aac|ogg|flac)$/i.test(nome);
        const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(nome);
        const tipo = isAudio ? 'audio' : isVideo ? 'video' : null;

        console.log('[Processar] Tipo detectado:', tipo);

        if (!tipo) {
          console.warn('[Processar] Tipo não suportado:', nome);
          erros++;
          continue;
        }

        try {
          // O URI vem do DocumentPicker copiado para cache (copyToCacheDirectory: true)
          // Isso é necessário porque expo-video não suporta URIs content:// diretamente
          console.log('[Processar] Adicionando à BD:', { uri, titulo: nome, tipo, flow_cor: flow });
          adicionarMedia({
            uri,
            titulo: nome,
            tipo,
            flow_cor: flow as any,
          });
          console.log('[Processar] Adicionado com sucesso:', nome);
          sucessos++;
        } catch (err: any) {
          console.error('[Processar] Erro ao adicionar:', nome, err);
          erros++;
        }
      }

      console.log('[Processar] Finalizado - Sucessos:', sucessos, 'Erros:', erros);

      // Atualiza a lista
      setRefreshKey(prev => prev + 1);

      // Mostra resultado
      if (sucessos > 0) {
        Alert.alert(
          'Importação concluída!',
          `${sucessos} ficheiro(s) importado(s) com sucesso.${erros > 0 ? `\n${erros} ficheiro(s) falharam.` : ''}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Erro na importação',
          'Nenhum ficheiro foi importado. Verifique se selecionou ficheiros de áudio ou vídeo válidos.',
          [{ text: 'OK' }]
        );
      }
    } catch (e: any) {
      console.error('[Processar] Erro geral:', e);
      Alert.alert('Erro', e.message || 'Falha ao processar ficheiros.');
    }
  };

  const abrirDetalhes = (id: number) =>
    navigation.navigate('EcraDetalhesMedia', { id });

  const selecionarFlow = (flowKey: string) => {
    setMostrarModalFlow(false);
    processarFicheiros(ficheirosTemp, flowKey);
  };
  
  const limparBiblioteca = () => {
    Alert.alert(
      'Limpar Biblioteca',
      'Tens a certeza que desejas remover TODOS os ficheiros da biblioteca? Esta ação não pode ser revertida.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: () => {
            try {
              limparTudo();
              setRefreshKey(prev => prev + 1);
              Alert.alert('Sucesso', 'Biblioteca limpa com sucesso! Agora podes reimportar os ficheiros.');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao limpar biblioteca.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>      
      {/* Modal de Seleção de Flow */}
      <Modal
        visible={mostrarModalFlow}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModalFlow(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: palette.bg }]}>
            <Text style={[styles.modalTitulo, { color: palette.text }]}>
              Escolha um Flow
            </Text>
            <Text style={[styles.modalSubtitulo, { color: palette.text, opacity: 0.7 }]}>
              Selecione a cor do Flow para estes ficheiros:
            </Text>
            
            <ScrollView style={styles.modalScroll}>
              {coresFlow.map((flow) => (
                <Pressable
                  key={flow.key}
                  onPress={() => selecionarFlow(flow.key)}
                  style={[styles.flowOpcao, { borderColor: palette.isDark ? '#333' : '#ddd' }]}
                >
                  <View style={styles.flowOpcaoConteudo}>
                    <Text style={styles.flowEmoji}>{flow.emoji}</Text>
                    <Text style={[styles.flowLabel, { color: palette.text }]}>
                      {flow.label}
                    </Text>
                  </View>
                  <View style={[styles.flowCor, { backgroundColor: flow.cor }]} />
                </Pressable>
              ))}
            </ScrollView>
            
            <Pressable
              onPress={() => setMostrarModalFlow(false)}
              style={[styles.botaoCancelar, { borderColor: palette.isDark ? '#333' : '#ddd' }]}
            >
              <Text style={{ color: palette.text, fontWeight: '600' }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Pressable
          onPress={importarFicheiros}
          style={[styles.botao, { backgroundColor: palette.primary }]}
        >
          <Text style={styles.botaoTexto}>Importar Ficheiros</Text>
        </Pressable>
        
        <Pressable
          onPress={limparBiblioteca}
          style={[styles.botaoSecundario, { 
            borderColor: palette.isDark ? '#444' : '#ddd',
            marginTop: 8,
          }]}
        >
          <Text style={[styles.botaoTextoSecundario, { color: palette.text }]}>🗑️ Limpar Biblioteca</Text>
        </Pressable>
      </View>

      <TopTab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: palette.primary },
          tabBarStyle: {
            backgroundColor: palette.isDark ? '#1a1a1a' : '#fff',
          },
          tabBarLabelStyle: { textTransform: 'none', fontWeight: '600' },
        }}
      >
        <TopTab.Screen name="Áudio">
          {() => <ListaGenerica tipo="audio" onAbrirDetalhes={abrirDetalhes} refresh={refreshKey} />}
        </TopTab.Screen>
        <TopTab.Screen name="Vídeo">
          {() => <ListaGenerica tipo="video" onAbrirDetalhes={abrirDetalhes} refresh={refreshKey} />}
        </TopTab.Screen>
        <TopTab.Screen name="Todos">
          {() => <ListaGenerica onAbrirDetalhes={abrirDetalhes} refresh={refreshKey} />}
        </TopTab.Screen>
      </TopTab.Navigator>
    </View>
  );
}

// ------------------------------------------------------
// Estilos
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12 },
  botao: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  botaoSecundario: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  botaoTextoSecundario: { fontWeight: '600', fontSize: 14 },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  titulo: { fontWeight: '600', fontSize: 16 },
  
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitulo: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 300,
  },
  flowOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  flowOpcaoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flowEmoji: {
    fontSize: 24,
  },
  flowLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  flowCor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  botaoCancelar: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
});
