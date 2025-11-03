
// Lista/CRUD de Mixes: cria, renomeia, muda cor base, elimina e adiciona/remover itens com base em títulos locais.

import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useThemeFlow } from '../../context/ThemeContext';
import { listarPorTipo, MediaLocal } from '../../db/sqlite';
import { adicionarItem, atualizarMix, criarMix, listarMixes, Mix, removerItem, removerMix } from '../../services/mixes';

export default function EcraMixes() {
  const { palette } = useThemeFlow();
  const { autenticado, token } = useAuth();
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('red');
  const [modalVisible, setModalVisible] = useState(false);
  const [mixSelecionado, setMixSelecionado] = useState<number | null>(null);
  const [audiosDisponiveis, setAudiosDisponiveis] = useState<MediaLocal[]>([]);
  const [audiosSelecionados, setAudiosSelecionados] = useState<Set<number>>(new Set());

  const carregar = async () => {
    try {
      console.log('[Mixes] Carregando lista de mixes...');
      const data = await listarMixes();
      console.log('[Mixes] Mixes carregados:', data.length);
      setMixes(data);
    } catch (error: any) {
      console.error('[Mixes] Erro ao carregar:', error);
      
      if (error.response?.status === 401) {
        Alert.alert(
          'Não autenticado',
          'Você precisa fazer login para acessar os Mixes.\n\nPor favor, faça logout e entre novamente.',
          [
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          'Falha ao obter mixes. Verifique se o backend está rodando.'
        );
      }
    }
  };

  useEffect(() => {
    console.log('[Mixes] useEffect - autenticado:', autenticado, 'token:', !!token);
    if (autenticado && token) {
      carregar();
    } else {
      console.warn('[Mixes] Usuário não autenticado, não carregando mixes');
    }
  }, [autenticado, token]);

  const onCriar = async () => {
    if (!nome) return;
    await criarMix(nome, cor);
    setNome('');
    await carregar();
  };

  const onAddItem = (mixId: number) => {
    console.log('[Mixes] Abrindo modal para adicionar áudios ao mix', mixId);
    
    // Carregar áudios disponíveis
    const audios = listarPorTipo('audio') as MediaLocal[];
    
    if (audios.length === 0) {
      Alert.alert(
        'Sem áudio',
        'Não há áudio local para adicionar. Importe na Biblioteca.'
      );
      return;
    }
    
    setAudiosDisponiveis(audios);
    setMixSelecionado(mixId);
    setAudiosSelecionados(new Set());
    setModalVisible(true);
  };

  const toggleAudioSelecao = (audioId: number) => {
    const novosSelec = new Set(audiosSelecionados);
    if (novosSelec.has(audioId)) {
      novosSelec.delete(audioId);
    } else {
      novosSelec.add(audioId);
    }
    setAudiosSelecionados(novosSelec);
  };

  const confirmarAdicao = async () => {
    if (!mixSelecionado || audiosSelecionados.size === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um áudio.');
      return;
    }

    console.log('[Mixes] Adicionando', audiosSelecionados.size, 'áudios ao mix', mixSelecionado);

    try {
      for (const audioId of audiosSelecionados) {
        const audio = audiosDisponiveis.find(a => a.id === audioId);
        if (audio) {
          console.log('[Mixes] Adicionando:', audio.titulo);
          await adicionarItem(mixSelecionado, audio.titulo, 'audio');
        }
      }

      setModalVisible(false);
      await carregar();
      
      Alert.alert(
        'Sucesso!',
        `${audiosSelecionados.size} áudio(s) adicionado(s) ao mix.`
      );
    } catch (error) {
      console.error('[Mixes] Erro ao adicionar áudios:', error);
      Alert.alert('Erro', 'Falha ao adicionar áudios ao mix.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {!autenticado ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: palette.text, fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
            🔒 Autenticação Necessária
          </Text>
          <Text style={{ color: palette.text, opacity: 0.7, textAlign: 'center' }}>
            Você precisa fazer login para acessar os Mixes.
          </Text>
          <Text style={{ color: palette.text, opacity: 0.7, textAlign: 'center', marginTop: 10 }}>
            Por favor, faça logout e entre novamente.
          </Text>
        </View>
      ) : (
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: palette.text, fontSize: 18, marginBottom: 8, fontWeight: '600' }}>Criar novo Mix</Text>
        <TextInput 
          placeholder="Nome do Mix" 
          value={nome} 
          onChangeText={setNome} 
          style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }} 
        />
        <TextInput 
          placeholder="Cor base (red, orange, blue, purple, black, pink)" 
          value={cor} 
          onChangeText={setCor} 
          style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }} 
        />
        <Pressable 
          onPress={onCriar} 
          style={{ backgroundColor: palette.primary, padding: 12, borderRadius: 8, marginBottom: 16 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Criar Mix</Text>
        </Pressable>

      <FlatList
        data={mixes}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: palette.isDark ? '#1f1f1f' : '#fff', marginBottom: 12 }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>{item.nome}</Text>
            <Text style={{ color: palette.text, opacity: 0.8 }}>Flow base: {item.flow_cor_base}</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Pressable onPress={() => onAddItem(item.id)} style={{ backgroundColor: palette.primaryAlt, padding: 8, borderRadius: 8, flex: 1 }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Adicionar Áudios</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.prompt(
                    'Editar Mix',
                    'Novo nome do Mix:',
                    async (novoNome) => {
                      if (novoNome) {
                        Alert.prompt(
                          'Editar cor',
                          'Nova cor (red, orange, blue, purple, black, pink):',
                          async (novaCor) => {
                            await atualizarMix(item.id, novoNome, novaCor || item.flow_cor_base);
                            await carregar();
                          },
                          'plain-text',
                          item.flow_cor_base
                        );
                      }
                    },
                    'plain-text',
                    item.nome
                  );
                }}
                style={{ backgroundColor: palette.primary, padding: 8, borderRadius: 8 }}
              >
                <Text style={{ color: '#fff' }}>Editar</Text>
              </Pressable>
              <Pressable onPress={async () => { await removerMix(item.id); await carregar(); }} style={{ backgroundColor: '#c0392b', padding: 8, borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>Apagar</Text>
              </Pressable>
            </View>

            {item.items.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: palette.text, marginBottom: 6 }}>Itens:</Text>
                {item.items.map(it => (
                  <View key={it.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ color: palette.text }}>{it.media_titulo} ({it.media_tipo})</Text>
                    <Pressable onPress={async () => { await removerItem(item.id, it.id); await carregar(); }}>
                      <Text style={{ color: '#c0392b' }}>Remover</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}  
          </View>
        )}
      />
      </View>
      )}

      {/* Modal de Seleção de Áudios */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ 
            backgroundColor: palette.bg, 
            borderRadius: 16, 
            padding: 20,
            maxHeight: '80%'
          }}>
            <Text style={{ 
              color: palette.text, 
              fontSize: 20, 
              fontWeight: '700', 
              marginBottom: 16 
            }}>
              Selecione os Áudios
            </Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {audiosDisponiveis.map((audio) => (
                <Pressable
                  key={audio.id}
                  onPress={() => toggleAudioSelecao(audio.id!)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: audiosSelecionados.has(audio.id!) 
                      ? palette.primary 
                      : (palette.isDark ? '#2a2a2a' : '#f0f0f0'),
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      color: audiosSelecionados.has(audio.id!) ? '#fff' : palette.text,
                      fontWeight: '600'
                    }}>
                      {audio.titulo}
                    </Text>
                    <Text style={{ 
                      color: audiosSelecionados.has(audio.id!) ? '#fff' : palette.text,
                      opacity: 0.7,
                      fontSize: 12
                    }}>
                      Flow: {audio.flow_cor}
                    </Text>
                  </View>
                  {audiosSelecionados.has(audio.id!) && (
                    <Text style={{ color: '#fff', fontSize: 18 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  borderRadius: 8, 
                  backgroundColor: palette.isDark ? '#2a2a2a' : '#e0e0e0'
                }}
              >
                <Text style={{ color: palette.text, textAlign: 'center', fontWeight: '600' }}>
                  Cancelar
                </Text>
              </Pressable>
              
              <Pressable
                onPress={confirmarAdicao}
                style={{ 
                  flex: 1, 
                  padding: 12, 
                  borderRadius: 8, 
                  backgroundColor: palette.primary
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
                  Adicionar ({audiosSelecionados.size})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
