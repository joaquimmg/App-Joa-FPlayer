
// Paletas dos 6 "Flows" + fundos claro/escuro.

export type FlowKey = 'red' | 'orange' | 'blue' | 'purple' | 'black' | 'pink';

export const FlowPalettes: Record<FlowKey, {
  primary: string;
  primaryAlt: string;
  bg: string;
  text: string;
  isDark: boolean;
}> = {
  red:    { primary: '#E53935', primaryAlt: '#FF5252', bg: '#F5F5F5', text: '#111', isDark: false },
  orange: { primary: '#FB8C00', primaryAlt: '#FFB74D', bg: '#F5F5F5', text: '#111', isDark: false },
  blue:   { primary: '#1E88E5', primaryAlt: '#64B5F6', bg: '#F5F5F5', text: '#111', isDark: false },
  purple: { primary: '#8E24AA', primaryAlt: '#BA68C8', bg: '#F5F5F5', text: '#111', isDark: false },
  black:  { primary: '#1F1F1F', primaryAlt: '#00E5FF', bg: '#121212', text: '#FFF', isDark: true  },
  pink:   { primary: '#D81B60', primaryAlt: '#F48FB1', bg: '#F5F5F5', text: '#111', isDark: false },
};
