
// Define e carrega fontes personalizadas via expo-font

import * as Font from 'expo-font';

export async function carregarFontes() {
  await Font.loadAsync({
    'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
  });
}

export const typography = {
  regular: 'Poppins-Regular',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};
