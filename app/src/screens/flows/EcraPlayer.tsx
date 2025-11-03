
// Leitor unificado: usa expo-av para audio e expo-video para vídeo
// Interface moderna para áudio com design minimalista e responsivo
// Áudio continua em background (configurado no mount)

import { Feather, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useThemeFlow } from '../../context/ThemeContext';
import { FlowsStackParamList } from '../../navigation/FlowsStack';

type Props = NativeStackScreenProps<FlowsStackParamList, 'EcraPlayer'>;

// Função auxiliar para formatar tempo (ms para MM:SS)
const formatTime = (millis: number): string => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE: VideoPlayerModerno
// Player de vídeo com interface moderna e fluida
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type VideoPlayerProps = {
  videoPlayer: any;
  item: any;
  palette: any;
  playing: boolean;
  togglePlay: () => void;
  prev: () => void;
  next: () => void;
  uris: any[];
  navigation: any;
  loading: boolean;
};

function VideoPlayerModerno({
  videoPlayer,
  item,
  palette,
  playing,
  togglePlay,
  prev,
  next,
  uris,
  navigation,
  loading,
}: VideoPlayerProps) {
  const { width, height } = useWindowDimensions();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempPosition, setTempPosition] = useState(0); // Posição temporária durante arrasto
  const lastSliderUpdateRef = useRef(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoViewRef = useRef<any>(null); // Ref para o VideoView

  // Auto-hide dos controlos após 2.5s - MAS NUNCA quando pausado
  const resetControlsTimeout = React.useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Sempre mostrar controles
    setShowControls(true);
    
    // Só esconder automaticamente se estiver REPRODUZINDO
    if (playing && !isSeeking && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (playing && !isSeeking && !showSettings) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [playing, isSeeking, showSettings]);

  // Listener para posição do vídeo - OTIMIZADO (1000ms para reduzir ainda mais lags)
  useEffect(() => {
    if (!videoPlayer) return;
    
    const interval = setInterval(() => {
      try {
        if (!isSeeking && videoPlayer.currentTime !== undefined && videoPlayer.duration !== undefined) {
          setPosition(videoPlayer.currentTime * 1000);
          setDuration(videoPlayer.duration * 1000);
        }
      } catch (error) {
        // Ignorar erros silenciosamente para não travar
      }
    }, 1000); // Aumentado de 500ms para 1000ms

    return () => clearInterval(interval);
  }, [videoPlayer, isSeeking]);

  // Mostrar controlos quando pausado
  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      // Quando começar a reproduzir, iniciar o timeout
      resetControlsTimeout();
    }
  }, [playing, resetControlsTimeout]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleTap = React.useCallback(() => {
    console.log('[VideoPlayer] Tap - showControls:', showControls, 'playing:', playing);
    // Alternar visibilidade dos controles
    const novoEstado = !showControls;
    setShowControls(novoEstado);
    
    // Se mostrou os controles e está reproduzindo, iniciar auto-hide
    if (novoEstado && playing) {
      resetControlsTimeout();
    } else if (!novoEstado && controlsTimeoutRef.current) {
      // Se ocultou, limpar timeout
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [showControls, playing, resetControlsTimeout]);

  const handleSeek = React.useCallback(async (value: number) => {
    if (videoPlayer && !isProcessing) {
      try {
        const targetTime = value / 1000;
        videoPlayer.currentTime = targetTime;
        setPosition(value); // Atualizar imediatamente para feedback visual
      } catch (error) {
        console.warn('Erro ao fazer seek:', error);
      }
    }
  }, [videoPlayer, isProcessing]);

  const skip = React.useCallback(async (seconds: number) => {
    if (videoPlayer && !isProcessing) {
      try {
        const currentTime = videoPlayer.currentTime || 0;
        const durationSec = videoPlayer.duration || 0;
        const newTime = Math.max(0, Math.min(durationSec, currentTime + seconds));
        videoPlayer.currentTime = newTime;
        setPosition(newTime * 1000); // Atualizar imediatamente
        resetControlsTimeout();
      } catch (error) {
        console.warn('Erro ao pular:', error);
      }
    }
  }, [videoPlayer, resetControlsTimeout, isProcessing]);

  const toggleFullscreen = React.useCallback(async () => {
    // No Android, fullscreen não é suportado via API programática
    // O vídeo entra automaticamente em fullscreen ao rotacionar para paisagem
    if (Platform.OS === 'android') {
      Alert.alert(
        'Modo Ecrã Inteiro',
        'No Android, rode o dispositivo para modo paisagem para visualizar em ecrã inteiro.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!videoViewRef.current) {
      console.warn('[VideoPlayer] videoViewRef não está disponível');
      return;
    }
    
    try {
      console.log('[VideoPlayer] Estado atual - isFullscreen:', isFullscreen);
      
      if (isFullscreen) {
        // Sair de fullscreen (iOS apenas)
        console.log('[VideoPlayer] Saindo de fullscreen...');
        await videoViewRef.current.exitFullscreen();
        setIsFullscreen(false);
        console.log('[VideoPlayer] Saíu de fullscreen com sucesso');
      } else {
        // Entrar em fullscreen (iOS apenas)
        console.log('[VideoPlayer] Entrando em fullscreen...');
        await videoViewRef.current.enterFullscreen();
        setIsFullscreen(true);
        console.log('[VideoPlayer] Entrei em fullscreen com sucesso');
      }
      
      // Resetar timeout dos controles
      resetControlsTimeout();
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('[VideoPlayer] Erro ao alternar fullscreen:', error);
      Alert.alert(
        'Erro no Fullscreen',
        'Não foi possível alternar o modo de ecrã inteiro.'
      );
    }
  }, [isFullscreen, resetControlsTimeout]);

  const changeSpeed = React.useCallback(() => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoPlayer) {
      videoPlayer.playbackRate = nextSpeed;
    }
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [playbackSpeed, videoPlayer]);

  // Wrapper para prev/next com proteção contra cliques múltiplos - OTIMIZADO
  const handlePrev = React.useCallback(() => {
    if (!isProcessing && uris.length > 1) {
      setIsProcessing(true);
      requestAnimationFrame(() => {
        prev();
        setTimeout(() => setIsProcessing(false), 1500);
      });
    }
  }, [prev, isProcessing, uris.length]);

  const handleNext = React.useCallback(() => {
    if (!isProcessing && uris.length > 1) {
      setIsProcessing(true);
      requestAnimationFrame(() => {
        next();
        setTimeout(() => setIsProcessing(false), 1500);
      });
    }
  }, [next, isProcessing, uris.length]);

  const handleSliderChange = React.useCallback((value: number) => {
    const now = Date.now();
    // Throttle: atualizar no máximo a cada 100ms para evitar lags
    if (now - lastSliderUpdateRef.current > 100) {
      setIsSeeking(true);
      setTempPosition(value);
      resetControlsTimeout();
      lastSliderUpdateRef.current = now;
    }
  }, [resetControlsTimeout]);

  const handleSliderComplete = React.useCallback((value: number) => {
    setIsSeeking(false);
    setPosition(value);
    handleSeek(value);
  }, [handleSeek]);

  // Calcular dimensões responsíveis - AUMENTADO para ocupar mais espaço
  const isLandscape = width > height;
  const videoCardWidth = isLandscape ? width * 0.9 : width - 24;
  const videoCardHeight = isLandscape ? height * 0.85 : Math.min(height * 0.65, (videoCardWidth * 16) / 9);

  // Mapeamento de cores da especificação para o tema Flows
  const videoColors = React.useMemo(() => ({
    primary600: palette.primary,
    primary400: palette.primaryAlt,
    primary200: palette.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    textMain: palette.isDark ? '#FFFFFF' : '#111111',
    textSecondary: palette.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    overlayBg: 'rgba(0, 0, 0, 0.4)',
  }), [palette]);

  return (
    <View style={[videoStyles.container, { backgroundColor: palette.bg }]}>
      {/* Header */}
      <View style={[videoStyles.header, { 
        backgroundColor: palette.primary,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={videoStyles.headerButton}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={videoStyles.headerTitle} numberOfLines={1}>
          {item.titulo}
        </Text>
        
        <TouchableOpacity 
          onPress={() => setShowSettings(!showSettings)} 
          style={videoStyles.headerButton}
          accessibilityLabel="Definições"
        >
          <Feather name="settings" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Container do vídeo */}
      <View style={videoStyles.videoContainer}>
        <View 
          style={[videoStyles.videoCard, {
            width: videoCardWidth,
            height: videoCardHeight,
            shadowColor: palette.primary,
          }]}
        >
          {/* VideoView */}
          <VideoView
            ref={videoViewRef}
            player={videoPlayer}
            style={videoStyles.videoView}
            allowsPictureInPicture
            contentFit="contain"
            nativeControls={false}
          />

          {/* Loading indicator */}
          {loading && (
            <View style={[StyleSheet.absoluteFill, {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }]}>
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={{ color: '#fff', marginTop: 12, fontSize: 14 }}>Carregando vídeo...</Text>
            </View>
          )}

          {/* Pressable para detectar toques - sobreposto ao vídeo */}
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={handleTap}
            accessibilityLabel="Toque para mostrar/ocultar controlos"
          >
            {/* Overlay escuro quando controlos visíveis */}
            {showControls && (
              <View style={[videoStyles.overlay, { backgroundColor: videoColors.overlayBg }]} />
            )}
          </Pressable>

          {/* Botão Play/Pause central - Aparece quando pausado OU quando controlos visíveis */}
          {(!playing || (showControls && !isSeeking)) && (
            <TouchableOpacity
              style={[videoStyles.centerPlayButton, {
                borderColor: videoColors.primary600,
              }]}
              onPress={togglePlay}
              activeOpacity={0.8}
              accessibilityLabel={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
              accessibilityRole="button"
            >
              <View style={[videoStyles.playButtonInner, {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }]}>
                <MaterialIcons 
                  name={playing ? 'pause' : 'play-arrow'} 
                  size={56} 
                  color="#fff" 
                />
              </View>
            </TouchableOpacity>
          )}

          {/* HUD removido - botões agora estão na barra inferior */}

          {/* Barra inferior de controlos */}
          {showControls && (
            <View style={[videoStyles.bottomControls, {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }]}>
              {/* Linha 1: Tempos */}
              <View style={videoStyles.timeRow}>
                <Text style={[videoStyles.timeText, { color: '#FFFFFF' }]}>
                  {formatTime(position)} / {formatTime(duration)}
                </Text>
              </View>

              {/* Slider */}
              <Slider
                style={videoStyles.videoSlider}
                value={isSeeking ? tempPosition : position}
                minimumValue={0}
                maximumValue={duration || 1}
                minimumTrackTintColor={videoColors.primary600}
                maximumTrackTintColor={videoColors.primary200}
                thumbTintColor={videoColors.primary600}
                onValueChange={handleSliderChange}
                onSlidingComplete={handleSliderComplete}
                accessibilityLabel="Barra de progresso do vídeo"
              />

              {/* Linha 2: Ícones de controlo */}
              <View style={videoStyles.iconsRow}>
                {/* Botão Anterior */}
                <TouchableOpacity
                  style={videoStyles.iconButton}
                  onPress={handlePrev}
                  disabled={uris.length <= 1 || isProcessing}
                  activeOpacity={0.7}
                  accessibilityLabel="Vídeo anterior"
                >
                  <MaterialIcons 
                    name="skip-previous" 
                    size={24} 
                    color={uris.length <= 1 ? '#666' : '#fff'} 
                  />
                </TouchableOpacity>

                {/* Botão -10s */}
                <TouchableOpacity
                  style={videoStyles.iconButton}
                  onPress={() => skip(-10)}
                  activeOpacity={0.7}
                  accessibilityLabel="Retroceder 10 segundos"
                >
                  <Feather name="rotate-ccw" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Botão Play/Pause */}
                <TouchableOpacity
                  style={videoStyles.iconButton}
                  onPress={togglePlay}
                  activeOpacity={0.7}
                  accessibilityLabel={playing ? 'Pausar' : 'Reproduzir'}
                >
                  <MaterialIcons 
                    name={playing ? 'pause' : 'play-arrow'} 
                    size={28} 
                    color="#fff" 
                  />
                </TouchableOpacity>

                {/* Botão +10s */}
                <TouchableOpacity
                  style={videoStyles.iconButton}
                  onPress={() => skip(10)}
                  activeOpacity={0.7}
                  accessibilityLabel="Avançar 10 segundos"
                >
                  <Feather name="rotate-cw" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Botão Próximo */}
                <TouchableOpacity
                  style={videoStyles.iconButton}
                  onPress={handleNext}
                  disabled={uris.length <= 1 || isProcessing}
                  activeOpacity={0.7}
                  accessibilityLabel="Próximo vídeo"
                >
                  <MaterialIcons 
                    name="skip-next" 
                    size={24} 
                    color={uris.length <= 1 ? '#666' : '#fff'} 
                  />
                </TouchableOpacity>

                {/* Botão Fullscreen - Apenas iOS */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={videoStyles.iconButton}
                    onPress={() => {
                      console.log('[VideoPlayer] Botão fullscreen clicado');
                      toggleFullscreen();
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
                    accessibilityRole="button"
                  >
                    <Feather 
                      name={isFullscreen ? 'minimize' : 'maximize'} 
                      size={20} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Sheet de definições */}
      {showSettings && (
        <View style={[videoStyles.settingsSheet, {
          backgroundColor: palette.isDark ? '#2A2A2A' : '#fff',
        }]}>
          <View style={videoStyles.settingsHeader}>
            <Text style={[videoStyles.settingsTitle, { color: palette.text }]}>
              Definições
            </Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <MaterialIcons name="close" size={24} color={palette.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={videoStyles.settingsItem}
            onPress={changeSpeed}
          >
            <Text style={[videoStyles.settingsLabel, { color: palette.text }]}>
              Velocidade de reprodução
            </Text>
            <Text style={[videoStyles.settingsValue, { color: palette.primary }]}>
              {playbackSpeed}x
            </Text>
          </TouchableOpacity>

          <View style={[videoStyles.settingsDivider, { 
            backgroundColor: palette.isDark ? '#444' : '#ddd' 
          }]} />

          <TouchableOpacity
            style={videoStyles.settingsItem}
            onPress={() => Alert.alert('Qualidade', 'Funcionalidade em desenvolvimento')}
          >
            <Text style={[videoStyles.settingsLabel, { color: palette.text }]}>
              Qualidade
            </Text>
            <Text style={[videoStyles.settingsValue, { color: palette.text }]}>
              Auto
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTE PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function EcraPlayer({ route, navigation }: Props) {
  const { uris, index } = route.params;
  const { palette } = useThemeFlow();
  const { width, height } = useWindowDimensions();
  
  const [current, setCurrent] = useState(index);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showMenu, setShowMenu] = useState(false);
  
  // Histórico de reprodução para shuffle inteligente
  const playHistoryRef = useRef<number[]>([index]);
  const originalPlaylistRef = useRef([...uris]);
  
  // Refs para sempre ter valores atualizados (evita closure)
  const currentRef = useRef(index);
  const repeatRef = useRef(false);
  const shuffleRef = useRef(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Atualizar refs quando estados mudarem
  useEffect(() => {
    currentRef.current = current;
  }, [current]);
  
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);
  
  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);
  
  // Obter item atual e tipo
  const item = uris[current];
  const tipo = item.tipo;
  
  // Responsividade
  const isSmallScreen = height < 700;
  const isTablet = width > 600;
  const artSize = isSmallScreen ? 140 : isTablet ? 240 : 180;
  const fontSize = isSmallScreen ? -2 : 0;
  const spacing = isSmallScreen ? -4 : isTablet ? 4 : 0;
  
  // Criar player de vídeo apenas quando for vídeo
  const videoPlayer = useVideoPlayer(
    tipo === 'video' ? item.uri : '',
    (player) => {
      if (tipo === 'video') {
        player.loop = false;
        player.play();
      }
    }
  );

  // Atualizar vídeo quando mudar o item atual
  useEffect(() => {
    const updateVideo = async () => {
      if (tipo === 'video' && videoPlayer && item.uri) {
        console.log('[Player] Atualizando vídeo para:', item.uri);
        
        try {
          setLoading(true);
          
          // Carregar vídeo diretamente
          // URIs content:// funcionam nativamente no Android com expo-video
          await videoPlayer.replaceAsync(item.uri);
          videoPlayer.play();
          setPlaying(true);
          setLoading(false);
          console.log('[Player] Vídeo carregado com sucesso');
        } catch (error) {
          console.error('[Player] Erro ao trocar vídeo:', error);
          setLoading(false);
          
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isPermissionError = errorMessage.toLowerCase().includes('permission');
          
          Alert.alert(
            isPermissionError ? 'Erro de Permissão' : 'Erro ao Carregar Vídeo',
            isPermissionError 
              ? 'Não há permissão para acessar este arquivo. Tente selecionar o vídeo novamente.'
              : 'Não foi possível carregar este vídeo. Verifique se o arquivo existe.',
            [
              { text: 'OK' },
              { text: 'Próximo', onPress: () => next() }
            ]
          );
        }
      }
    };
    
    updateVideo();
  }, [current, tipo]);

  // Listener para quando o vídeo termina
  useEffect(() => {
    if (tipo === 'video' && videoPlayer) {
      const subscription = videoPlayer.addListener('playingChange', ({ isPlaying }) => {
        try {
          setPlaying(isPlaying);
          
          // Se parou e chegou ao fim, passa para o próximo
          if (!isPlaying && videoPlayer.status === 'idle') {
            console.log('[Player] Vídeo terminou, passando para próximo');
            next();
          }
        } catch (error) {
          console.error('[Player] Erro no listener de playingChange:', error);
        }
      });
      
      // Listener para erros - COM TRATAMENTO ESPECÍFICO
      const errorSubscription = videoPlayer.addListener('statusChange', (status: any) => {
        if (status.status === 'error') {
          const errorObj: any = status.error || {};
          const errorMessage = errorObj.message || String(errorObj);
          
          console.error('[Player] Erro no vídeo:', errorMessage);
          
          // Detectar tipo de erro
          const isPermissionError = errorMessage.toLowerCase().includes('permission denial');
          const isDocumentProviderError = errorMessage.includes('MediaDocumentsProvider');
          const isSourceError = errorMessage.toLowerCase().includes('source error');
          const isSecurityError = errorMessage.toLowerCase().includes('security');
          
          let title = 'Erro no Vídeo';
          let message = 'Não foi possível reproduzir este vídeo.';
          
          if (isDocumentProviderError || (isPermissionError && isSecurityError)) {
            title = 'Vídeo Inacessível';
            message = 'Este vídeo não pode ser acessado diretamente. Por favor, selecione o vídeo novamente ou tente outro arquivo.';
          } else if (isSourceError) {
            title = 'Arquivo Não Encontrado';
            message = 'O arquivo de vídeo não foi encontrado. Ele pode ter sido movido ou excluído.';
          }
          
          Alert.alert(
            title,
            message,
            [
              { text: 'OK' },
              { text: 'Próximo', onPress: () => next() }
            ]
          );
        }
      });
      
      return () => {
        subscription.remove();
        errorSubscription.remove();
      };
    }
  }, [tipo, videoPlayer, current]);

  useEffect(() => {
    console.log('[Player] Inicializando com', uris.length, 'itens, index:', index);
    
    // Config global: permite áudio em background e em modo silencioso iOS
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true
    });
    
    // Inicia reprodução
    loadAndPlay(index);

    return () => {
      // Limpa recursos ao sair
      console.log('[Player] Limpando recursos');
      soundRef.current?.unloadAsync();
      // Não tentar limpar videoPlayer aqui - ele é gerenciado pelo hook
    };
  }, []);

  const loadAndPlay = async (i: number) => {
    try {
      const newItem = uris[i];
      console.log('[Player] ┌── Carregando item', i, ':', newItem.titulo, '- Tipo:', newItem.tipo);
      console.log('[Player] │  URI:', newItem.uri);
      
      setCurrent(i);
      currentRef.current = i; // Atualiza ref imediatamente
      
      // Limpar áudio anterior se houver
      if (soundRef.current) {
        console.log('[Player] │  Descarregando áudio anterior');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (newItem.tipo === 'audio') {
        console.log('[Player] │  Criando áudio...');
        const { sound } = await Audio.Sound.createAsync(
          { uri: newItem.uri }, 
          { shouldPlay: true }
          // NÃO registrar callback aqui - será feito abaixo
        );
        
        // Registrar callback DEPOIS de criar o som
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded) {
            setPlaying(status.isPlaying);
            setLoading(false);
            
            // Atualizar posição e duração para o slider
            if (!isSeeking) {
              setPosition(status.positionMillis || 0);
              setDuration(status.durationMillis || 0);
            }
            
            // Quando terminar, verifica o modo de repetição
            if (status.didJustFinish && !status.isLooping) {
              console.log('[Player] ━━━ Mídia Terminou ━━━');
              console.log('[Player] Estado atual (via refs):');
              console.log('  - current:', currentRef.current);
              console.log('  - repeat:', repeatRef.current);
              console.log('  - shuffle:', shuffleRef.current);
              console.log('  - total faixas:', uris.length);
              console.log('  - próximo seria:', currentRef.current + 1);
              
              // Usar setTimeout para evitar problemas e garantir UI atualizada
              setTimeout(() => {
                const currentIdx = currentRef.current;
                const isRepeat = repeatRef.current;
                const isShuffle = shuffleRef.current;
                
                if (isRepeat) {
                  // CENÁRIO 1: Repetir ativado - Repete a faixa atual
                  console.log('[Player] 🔁 Repeat ON → Reiniciando faixa', currentIdx);
                  loadAndPlay(currentIdx);
                } else if (uris.length === 1) {
                  // CENÁRIO 2: Apenas 1 faixa e sem repetir - PARA
                  console.log('[Player] ⏹️ 1 faixa, Repeat OFF → Parando reprodução');
                  setPlaying(false);
                } else {
                  // Múltiplas faixas - verifica shuffle
                  const proximoIndex = currentIdx + 1;
                  console.log('[Player] Múltiplas faixas - Próximo seria:', proximoIndex, 'de', uris.length);
                  
                  if (isShuffle) {
                    // CENÁRIO 3: Shuffle ativado
                    console.log('[Player] 🔀 Shuffle ON → Escolhendo próxima aleatória');
                    
                    // Verifica se já tocou todas
                    if (playHistoryRef.current.length >= uris.length) {
                      console.log('[Player] 📝 Tocou todas as', uris.length, 'faixas → Resetando histórico');
                      playHistoryRef.current = [];
                    }
                    
                    // Shuffle inteligente
                    const naoTocadas = uris
                      .map((_, idx) => idx)
                      .filter(idx => !playHistoryRef.current.includes(idx));
                    
                    let novoIdx: number;
                    if (naoTocadas.length > 0) {
                      novoIdx = naoTocadas[Math.floor(Math.random() * naoTocadas.length)];
                      console.log('[Player] Escolhido:', novoIdx, '- Restam', naoTocadas.length, 'não tocadas');
                    } else {
                      do {
                        novoIdx = Math.floor(Math.random() * uris.length);
                      } while (novoIdx === currentIdx && uris.length > 1);
                      console.log('[Player] Todas tocadas, escolhido aleatório:', novoIdx);
                      playHistoryRef.current = [];
                    }
                    
                    playHistoryRef.current.push(novoIdx);
                    loadAndPlay(novoIdx);
                  } else {
                    // CENÁRIO 4: Modo sequencial
                    if (proximoIndex < uris.length) {
                      // Ainda há faixas na playlist
                      console.log('[Player] ▶️ Sequencial → Avançando de', currentIdx, 'para', proximoIndex);
                      loadAndPlay(proximoIndex);
                    } else {
                      // Chegou ao fim da playlist
                      console.log('[Player] 🎯 FIM DA PLAYLIST (faixa', currentIdx + 1, 'de', uris.length, ') → PARANDO');
                      setPlaying(false);
                    }
                  }
                }
                
                console.log('[Player] ━━━━━━━━━━━━━━━━━━━');
              }, 100);
            }
          }
        });
        
        soundRef.current = sound;
        setPlaying(true);
        console.log('[Player] └── Áudio carregado e reproduzindo');
      } else {
        console.log('[Player] └── Item de vídeo - será carregado pelo useEffect');
        setPlaying(true);
      }
    } catch (error) {
      console.error('[Player] ✘ Erro ao carregar mídia:', error);
      alert('Erro ao carregar mídia: ' + error);
    }
  };



  const togglePlay = async () => {
    try {
      // Haptic feedback leve
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      if (tipo === 'audio' && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && 'isPlaying' in status) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setPlaying(false);
            console.log('[Player] Áudio pausado');
          } else {
            await soundRef.current.playAsync();
            setPlaying(true);
            console.log('[Player] Áudio reproduzindo');
          }
        }
      } else if (tipo === 'video' && videoPlayer) {
        if (videoPlayer.playing) {
          videoPlayer.pause();
          setPlaying(false);
          console.log('[Player] Vídeo pausado');
        } else {
          videoPlayer.play();
          setPlaying(true);
          console.log('[Player] Vídeo reproduzindo');
        }
      }
    } catch (error) {
      console.error('[Player] Erro ao alternar play/pause:', error);
      Alert.alert('Erro', 'Não foi possível alternar a reprodução.');
    }
  };
  
  const handleSeek = async (value: number) => {
    try {
      if (tipo === 'audio' && soundRef.current) {
        await soundRef.current.setPositionAsync(value);
        console.log('[Player] Seek para:', formatTime(value));
        // Haptic feedback ao soltar
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (error) {
      console.error('[Player] Erro ao fazer seek:', error);
    }
  };
  
  const toggleShuffle = () => {
    const novoEstado = !shuffle;
    setShuffle(novoEstado);
    shuffleRef.current = novoEstado; // Atualiza ref imediatamente
    
    if (novoEstado) {
      console.log('[Player] Shuffle ATIVADO');
      // Reseta histórico ao ativar shuffle
      playHistoryRef.current = [current];
      Alert.alert('🔀 Shuffle Ativado', 'As faixas serão reproduzidas aleatoriamente.');
    } else {
      console.log('[Player] Shuffle DESATIVADO');
      playHistoryRef.current = [];
      Alert.alert('▶️ Modo Sequencial', 'As faixas serão reproduzidas em ordem.');
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const toggleRepeat = () => {
    const novoEstado = !repeat;
    setRepeat(novoEstado);
    repeatRef.current = novoEstado; // Atualiza ref imediatamente
    
    if (novoEstado) {
      console.log('[Player] Repeat ATIVADO');
      Alert.alert('🔁 Repetir Ativado', 'A faixa atual será repetida infinitamente.');
    } else {
      console.log('[Player] Repeat DESATIVADO');
      Alert.alert('⏸️ Repetir Desativado', 'A reprodução continuará normalmente.');
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const cyclePlaybackRate = async () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    
    if (tipo === 'audio' && soundRef.current) {
      await soundRef.current.setRateAsync(nextRate, true);
    }
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const next = async () => {
    if (uris.length <= 1) {
      console.log('[Player] Lista tem apenas 1 item');
      if (repeat) {
        console.log('[Player] Repetindo faixa única');
        await loadAndPlay(0);
      } else {
        console.log('[Player] Sem repetição, parando reprodução');
        setPlaying(false);
      }
      return;
    }
    
    let novo: number;
    
    if (shuffle) {
      // Shuffle inteligente: evita repetir faixas até tocar todas
      const naoTocadas = uris
        .map((_, idx) => idx)
        .filter(idx => !playHistoryRef.current.includes(idx));
      
      if (naoTocadas.length > 0) {
        // Escolhe aleatório entre as não tocadas
        novo = naoTocadas[Math.floor(Math.random() * naoTocadas.length)];
        console.log('[Player] Shuffle - Escolhendo entre não tocadas:', novo, 'Restam:', naoTocadas.length);
      } else {
        // Já tocou todas, escolhe aleatório qualquer (exceto atual)
        do {
          novo = Math.floor(Math.random() * uris.length);
        } while (novo === current && uris.length > 1);
        console.log('[Player] Shuffle - Todas tocadas, escolhendo aleatório:', novo);
        // Reseta histórico
        playHistoryRef.current = [];
      }
      
      // Adiciona ao histórico
      playHistoryRef.current.push(novo);
    } else {
      // Sequencial: próximo na ordem (com loop ao final)
      novo = (current + 1) % uris.length;
      console.log('[Player] Próximo sequencial: de', current, 'para', novo);
    }
    
    await loadAndPlay(novo);
  };

  const prev = async () => {
    if (uris.length <= 1) {
      console.log('[Player] Lista tem apenas 1 item');
      // Reinicia do início
      if (position > 3000) {
        // Se passou de 3s, volta ao início da faixa
        console.log('[Player] Voltando ao início da faixa');
        await handleSeek(0);
      } else if (repeat) {
        await loadAndPlay(0);
      }
      return;
    }
    
    let novo: number;
    
    // Se passou de 3s, volta ao início da faixa atual
    if (position > 3000) {
      console.log('[Player] Mais de 3s - Voltando ao início da faixa atual');
      await handleSeek(0);
      return;
    }
    
    if (shuffle && playHistoryRef.current.length > 1) {
      // Em modo shuffle, volta à faixa anterior do histórico
      playHistoryRef.current.pop(); // Remove atual
      novo = playHistoryRef.current[playHistoryRef.current.length - 1];
      console.log('[Player] Shuffle - Voltando no histórico para:', novo);
    } else {
      // Sequencial: anterior na ordem
      novo = (current - 1 + uris.length) % uris.length;
      console.log('[Player] Anterior sequencial: de', current, 'para', novo);
    }
    
    await loadAndPlay(novo);
  };

  // Renderizar interface diferente para áudio e vídeo
  if (tipo === 'video') {
    return (
      <VideoPlayerModerno
        videoPlayer={videoPlayer}
        item={item}
        palette={palette}
        playing={playing}
        togglePlay={togglePlay}
        prev={prev}
        next={next}
        uris={uris}
        navigation={navigation}
        loading={loading}
      />
    );
  }

  // Nova interface moderna para áudio
  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* AppBar / Header */}
      <View style={[styles.header, { 
        backgroundColor: palette.isDark ? palette.primary : palette.primaryAlt,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
      }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
          accessibilityLabel="Botão voltar"
          accessibilityRole="button"
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { fontSize: 18 + fontSize }]}>Music Player</Text>
        
        <TouchableOpacity 
          onPress={() => setShowMenu(!showMenu)} 
          style={styles.headerButton}
          accessibilityLabel="Menu de opções"
          accessibilityRole="button"
        >
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu dropdown (opcional) */}
      {showMenu && (
        <View style={[styles.menuDropdown, { 
          backgroundColor: palette.isDark ? '#2A2A2A' : '#fff',
          borderColor: palette.isDark ? '#444' : '#ddd',
        }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              Alert.alert('Adicionar à fila', 'Funcionalidade em desenvolvimento');
            }}
          >
            <Text style={{ color: palette.text }}>Adicionar à fila</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              toggleRepeat();
            }}
          >
            <Text style={{ color: palette.text }}>Repetir: {repeat ? 'Ativado' : 'Desativado'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              toggleShuffle();
            }}
          >
            <Text style={{ color: palette.text }}>Shuffle: {shuffle ? 'Ativado' : 'Desativado'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        {/* Área de arte/ícone circular */}
        <View style={[styles.artContainer, { marginTop: 16 + spacing, marginBottom: 24 + spacing }]}>
          <View style={[styles.artCircle, { 
            width: artSize, 
            height: artSize,
            backgroundColor: palette.primary,
            shadowColor: palette.primary,
          }]}>
            <MaterialIcons 
              name="music-note" 
              size={artSize * 0.5} 
              color="#fff" 
            />
          </View>
        </View>

        {/* Informações da faixa */}
        <View style={styles.trackInfo}>
          <Text 
            style={[styles.trackTitle, { 
              color: palette.text,
              fontSize: 20 + fontSize,
            }]} 
            numberOfLines={2}
            accessibilityLabel={`Reproduzindo ${item.titulo}`}
          >
            {item.titulo}
          </Text>
          <Text style={[styles.trackSubtitle, { 
            color: palette.isDark ? '#aaa' : '#666',
            fontSize: 14 + fontSize,
          }]}>
            Joalin FlowPlayer
          </Text>
        </View>

        {/* Barra de progresso */}
        <View style={[styles.progressContainer, { marginTop: 24 + spacing }]}>
          <Slider
            style={styles.slider}
            value={position}
            minimumValue={0}
            maximumValue={duration || 1}
            minimumTrackTintColor={palette.primary}
            maximumTrackTintColor={palette.isDark ? '#444' : '#ddd'}
            thumbTintColor={palette.primary}
            onValueChange={(value) => {
              setIsSeeking(true);
              setPosition(value);
            }}
            onSlidingComplete={(value) => {
              setIsSeeking(false);
              handleSeek(value);
            }}
            accessibilityLabel="Barra de progresso"
            accessibilityRole="adjustable"
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: palette.isDark ? '#aaa' : '#666' }]}>
              {formatTime(position)}
            </Text>
            <Text style={[styles.timeText, { color: palette.isDark ? '#aaa' : '#666' }]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controlo principal de reprodução */}
        <View style={[styles.controlsContainer, { marginTop: 16 + spacing }]}>
          <TouchableOpacity 
            onPress={prev}
            disabled={uris.length <= 1}
            style={[styles.controlButton, { opacity: uris.length <= 1 ? 0.3 : 1 }]}
            accessibilityLabel="Faixa anterior"
            accessibilityRole="button"
          >
            <Feather name="skip-back" size={36} color={palette.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={togglePlay}
            style={[styles.playButton, { 
              backgroundColor: palette.primary,
              shadowColor: palette.primary,
            }]}
            accessibilityLabel={playing ? 'Pausar' : 'Reproduzir'}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator size={32} color="#fff" />
            ) : playing ? (
              <Feather name="pause" size={44} color="#fff" />
            ) : (
              <Feather name="play" size={44} color="#fff" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={next}
            disabled={uris.length <= 1}
            style={[styles.controlButton, { opacity: uris.length <= 1 ? 0.3 : 1 }]}
            accessibilityLabel="Próxima faixa"
            accessibilityRole="button"
          >
            <Feather name="skip-forward" size={36} color={palette.text} />
          </TouchableOpacity>
        </View>

        {/* Controlos secundários */}
        <View style={[styles.secondaryControls, { marginTop: 24 + spacing }]}>
          <TouchableOpacity 
            onPress={toggleShuffle}
            style={styles.secondaryButton}
            accessibilityLabel={`Shuffle ${shuffle ? 'ativado' : 'desativado'}`}
            accessibilityRole="button"
          >
            <Feather 
              name="shuffle" 
              size={20} 
              color={shuffle ? palette.primary : (palette.isDark ? '#666' : '#999')} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={toggleRepeat}
            style={styles.secondaryButton}
            accessibilityLabel={`Repetir ${repeat ? 'ativado' : 'desativado'}`}
            accessibilityRole="button"
          >
            <Feather 
              name="repeat" 
              size={20} 
              color={repeat ? palette.primary : (palette.isDark ? '#666' : '#999')} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={cyclePlaybackRate}
            style={styles.secondaryButton}
            accessibilityLabel={`Velocidade de reprodução ${playbackRate}x`}
            accessibilityRole="button"
          >
            <Text style={[styles.rateText, { 
              color: playbackRate !== 1.0 ? palette.primary : (palette.isDark ? '#666' : '#999')
            }]}>
              {playbackRate}x
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    minHeight: 640,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60,
    right: 16,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  artContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCircle: {
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  trackTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  trackSubtitle: {
    fontWeight: '400',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  secondaryButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESTILOS DO PLAYER DE VÍDEO MODERNO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const videoStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  videoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: 'relative',
  },
  videoTitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerPlayButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  playButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    bottom: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
    zIndex: 15,
  },
  hudButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 28,
  },
  hudButtonLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 25,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  videoSlider: {
    width: '100%',
    height: 24,
    marginVertical: 6,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    zIndex: 100,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingsDivider: {
    height: 1,
    width: '100%',
  },
});
