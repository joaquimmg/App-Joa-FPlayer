
import { StyleSheet } from 'react-native';
import { typography } from './typography';

export const gStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: typography.regular,
  },
  button: {
    backgroundColor: '#1E88E5',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: typography.semibold,
  },
  textoTitulo: {
    fontFamily: typography.bold,
    fontSize: 18,
  },
});
