
// ------------------------------------------------------
// Lista completa de todas as mídias (áudio + vídeo)
// ------------------------------------------------------

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listarTodas, removerMedia } from '../../db/sqlite';

export default function ListaTodos() {
  const [dados, setDados] = useState<any[]>([]);

  function carregar() {
    const res = listarTodas();
    setDados(res);
  }

  function apagar(id: number) {
    removerMedia(id);
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.sub}>
          {item.tipo.toUpperCase()} | {item.flow_cor.toUpperCase()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => apagar(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {dados.length === 0 ? (
        <Text style={styles.vazio}>Nenhum ficheiro encontrado.</Text>
      ) : (
        <FlatList data={dados} renderItem={renderItem} keyExtractor={(i) => i.id.toString()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#FFF' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#DDD',
  },
  titulo: { fontSize: 16, fontWeight: '600', color: '#222' },
  sub: { fontSize: 13, color: '#777' },
  vazio: { textAlign: 'center', marginTop: 50, color: '#777' },
});
