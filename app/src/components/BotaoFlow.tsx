
// Botão quadrado colorido, usado para escolher flows.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlowKey } from '../theme/colors';

type Props = {
  cor: FlowKey;
  label: string;
  onPress: () => void;
};

export default function BotaoFlow({ cor, label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 120,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: cor === 'black' ? '#2D2D2D' : cor,
        margin: 6,
      }}
    >
      <View>
        <Text
          style={{
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
