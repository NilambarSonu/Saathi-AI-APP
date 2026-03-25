import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  TouchableOpacity, Image, Dimensions, SafeAreaView, Keyboard,
  Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, FadeInUp, Layout, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { api } from '../../services/api';
import { getChatSessions, createChatSession, ChatMessage, ChatSession } from '../../services/chat';

const { width } = Dimensions.get('window');

const AI_LOADING_STEPS = [
  'Analyzing soil...',
  'Checking nutrients...',
  'Generating recommendations...',
];

export default function AIChatScreen() {
  const router = useRouter();
  
  // States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // History Modal States
  const [showHistory, setShowHistory] = useState(false);
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);
  const [isLoadingPastSessions, setIsLoadingPastSessions] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [fileAttachment, setFileAttachment] = useState<{
    name: string;
    content: any;
    uri?: string;
    mimeType?: string;
    type: 'image' | 'file';
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [language, setLanguage] = useState('en');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [typingStageText, setTypingStageText] = useState(AI_LOADING_STEPS[0]);

  const startTypingStages = () => {
    setTypingStageText(AI_LOADING_STEPS[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % AI_LOADING_STEPS.length;
      setTypingStageText(AI_LOADING_STEPS[idx]);
    }, 1400);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    loadLatestSession();
    
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const loadLatestSession = async () => {
    try {
      setIsLoadingHistory(true);
      const sessions = await getChatSessions();
      if (sessions && sessions.length > 0) {
        const latest = sessions[0];
        setSessionId(latest.id);
        if (latest.messages) {
          setMessages(latest.messages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openHistoryPanel = async () => {
    setShowHistory(true);
    setIsLoadingPastSessions(true);
    try {
      const sessions = await getChatSessions();
      setPastSessions(sessions);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not fetch history from database.');
    } finally {
      setIsLoadingPastSessions(false);
    }
  };

  const loadSpecificSession = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages ? session.messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ) : []);
    setShowHistory(false);
  };

  const createNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();

    // Call saathiai.org backend endpoint for file analysis
    if (fileAttachment && !messageText) {
      const icon = fileAttachment.type === 'image' ? '🖼️' : '📎';
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sessionId: sessionId || 'temp',
        content: `${icon} Analyzing: ${fileAttachment.name}`,
        role: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);
      setFileAttachment(null);
      setIsTyping(true);
      const stopTypingStages = startTypingStages();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        const data = await api.uploadSoil({
          data: fileAttachment.content,
          language,
          fileName: fileAttachment.name,
          type: fileAttachment.type,
        });

        const aiMsg: ChatMessage = {
          id: Date.now().toString() + '-ai',
          sessionId: sessionId || 'temp',
          content: data.response || 'Analysis complete.',
          role: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMsg]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (data.sessionId) setSessionId(data.sessionId);
      } catch (err: any) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-err',
          sessionId: sessionId || 'temp',
          content: '❌ Could not analyze attachment. Please try again.',
          role: 'ai',
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        stopTypingStages();
        setIsTyping(false);
      }
      return;
    }

    if (!messageText || isTyping) return;
    setInputText('');
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempUserId = Date.now().toString();
    const newMsg: ChatMessage = {
      id: tempUserId,
      sessionId: sessionId || 'temp',
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    const stopTypingStages = startTypingStages();

    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const newSession = await createChatSession(
          messageText.substring(0, 30) + '...',
          'en'
        );
        activeSessionId = newSession.id;
        setSessionId(newSession.id);
      }

      const response = await api.chat(messageText, undefined, {
        language,
        sessionId: activeSessionId,
      });

      const aiMsg: ChatMessage = {
        id: Date.now().toString() + '-ai',
        sessionId: response?.sessionId || activeSessionId,
        role: 'ai',
        content: response?.response || 'I could not generate a response right now.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (response?.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to send message:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      stopTypingStages();
      setIsTyping(false);
    }
  };

  const handleVoiceInput = async () => {
    Speech.stop();

    if (isRecording) {
      try {
        setIsRecording(false);
        await recordingRef.current?.stopAndUnloadAsync();
        setInputText(prev => prev + (prev ? ' ' : '') + '[Voice recorded — tap send to ask your question]');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (err) {
        console.error('[Voice] Stop error:', err);
      }
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Please enable microphone access in Settings to use voice input.', [{ text: 'OK' }]);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      setTimeout(async () => {
        if (isRecording) {
          await handleVoiceInput();
        }
      }, 10000);

    } catch (err: any) {
      console.error('[Voice] Start error:', err);
      Alert.alert('Voice Error', 'Could not start recording.');
    }
  };

  // Uses DocumentPicker, but restricts to images visually for clarity
  const handleImageAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      
      const file = result.assets[0];
      setFileAttachment({
        name: file.name,
        content: file.uri,
        uri: file.uri,
        mimeType: file.mimeType || 'image/jpeg',
        type: 'image'
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Could not open image.');
      }
    }
  };

  const handleFileAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/plain', 'application/pdf', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];

      let content: any = null;
      try {
        const rawText = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
        try {
          content = JSON.parse(rawText);
        } catch {
          content = rawText;
        }
      } catch (readErr) {
        content = { fileName: file.name, note: 'File content could not be read' };
      }

      setFileAttachment({
        name: file.name,
        content: content,
        uri: file.uri,
        mimeType: file.mimeType || 'unknown',
        type: 'file'
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Could not open file.');
      }
    }
  };

  const QuickAction = ({ icon, title, index }: { icon: string, title: string, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={s.quickActionWrapper}>
      <Pressable 
        style={({ pressed }) => [
          s.quickActionTile,
          pressed && s.quickActionTilePressed
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          handleSend(`Tell me about ${title.toLowerCase()}`);
        }}
      >
        <Text style={s.quickActionIcon}>{icon}</Text>
        <Text style={s.quickActionTitle}>{title}</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView 
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── HEADER ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity 
              style={s.backBtn} 
              onPress={() => {
                Haptics.selectionAsync();
                router.back();
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#0D1F12" />
            </TouchableOpacity>
            
            <View style={s.headerTitleContainer}>
              <View style={s.botAvatarOuter}>
                <Image source={require('../../assets/images/favicon.png')} style={s.botAvatarInner} />
                <View style={s.onlineDot} />
              </View>
              <View>
                <Text style={s.headerTitle}>Saathi Intelligence</Text>
                <Text style={s.headerSubtitle}>Typing fast, thinking deep</Text>
              </View>
            </View>
          </View>
          
          <View style={s.headerActions}>
            <TouchableOpacity style={s.actionBtn} onPress={openHistoryPanel}>
              <Feather name="clock" size={20} color="#6B8A72" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── CHAT SCROLL ── */}
        <ScrollView 
          ref={scrollViewRef}
          style={s.chatContainer} 
          contentContainerStyle={[s.chatScroll, { paddingBottom: 120 }]}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoadingHistory ? (
            <View style={s.welcomeState}>
              <ActivityIndicator size="large" color="#7B2CBF" />
              <Text style={s.loadingText}>Syncing memory...</Text>
            </View>
          ) : messages.length === 0 ? (
            <Animated.View entering={FadeIn.duration(800)} style={s.welcomeState}>
              <View style={s.lottieWrapper}>
                <LottieView
                  source={require('../../animations/chatbot.json')}
                  autoPlay loop
                  style={s.lottieRobot}
                />
              </View>
              <Text style={s.welcomeTitle}>Namaste, Farmer! 🙏</Text>
              <Text style={s.welcomeSubtitle}>What can Saathi AI help you with today? Share soil data, ask about crops, or scan pests.</Text>

              <View style={s.quickActionsGrid}>
                <View style={s.quickActionsRow}>
                  <QuickAction icon="💧" title="Fertilizer Plan" index={1} />
                  <QuickAction icon="🐛" title="Pest Diagnosis" index={2} />
                </View>
                <View style={s.quickActionsRow}>
                  <QuickAction icon="🌾" title="Crop Suitability" index={3} />
                  <QuickAction icon="🌤️" title="Weather Advisory" index={4} />
                </View>
              </View>
            </Animated.View>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <Animated.View 
                  key={msg.id ? `${msg.id}-${index}` : index.toString()} 
                  entering={FadeInUp.springify().damping(18).stiffness(150)}
                  layout={Layout.springify()}
                  style={[s.messageRow, isUser ? s.messageRowUser : s.messageRowAI]}
                >
                  {!isUser && (
                    <View style={s.msgAvatarAI}>
                      <Image source={require('../../assets/images/favicon.png')} style={{width: 18, height: 18}} />
                    </View>
                  )}
                  
                  <View style={[s.msgBubble, isUser ? s.msgBubbleUser : s.msgBubbleAI]}>
                    <Text style={[s.msgText, isUser ? s.msgTextUser : s.msgTextAI]}>
                      {msg.content}
                    </Text>
                    <Text style={[s.msgTime, isUser ? s.msgTimeUser : s.msgTimeAI]}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                </Animated.View>
              );
            })
          )}

          {isTyping && (
            <Animated.View entering={FadeInUp} style={[s.messageRow, s.messageRowAI]}>
              <View style={s.msgAvatarAI}>
                <Image source={require('../../assets/images/favicon.png')} style={{width: 18, height: 18}} />
              </View>
              <View style={[s.msgBubble, s.messageBubbleTyping]}>
                  <Text style={{ fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#6B8A72' }}>{typingStageText}</Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* ── ATTACHMENT PILL ── */}
        {fileAttachment && (
          <Animated.View entering={FadeInDown} style={s.attachmentBanner}>
            <View style={s.attachmentPill}>
              <MaterialCommunityIcons 
                name={fileAttachment.type === 'image' ? 'image-outline' : 'file-document-outline'} 
                size={20} color="#7B2CBF" 
              />
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Text style={s.attachmentName} numberOfLines={1}>{fileAttachment.name}</Text>
                <Text style={s.attachmentSub}>Ready to analyze</Text>
              </View>
              <TouchableOpacity onPress={() => setFileAttachment(null)} style={s.attachmentRemove}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* ── FLOATING INPUT BAR ── */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <BlurView intensity={60} tint="light" style={[s.inputGlass, keyboardVisible && s.inputGlassKeyboard]}>
            <View style={s.inputWrapper}>
              
              <TouchableOpacity style={s.iconBtn} onPress={handleImageAttach}>
                <Ionicons name="image-outline" size={22} color="#6B8A72" />
              </TouchableOpacity>
              
              <TouchableOpacity style={s.iconBtn} onPress={handleFileAttach}>
                <Feather name="paperclip" size={20} color="#6B8A72" />
              </TouchableOpacity>
              
              <TextInput
                style={s.textInput}
                placeholder="Ask Saathi AI..."
                placeholderTextColor="#A8BFB0"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />

              {inputText.trim() || fileAttachment ? (
                <TouchableOpacity
                  style={[s.sendBtn, isTyping && s.sendBtnDisabled]}
                  onPress={() => handleSend()}
                  disabled={isTyping}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#C77DEF', '#7B2CBF']}
                    style={s.sendBtnGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    {isTyping ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="arrow-up" size={18} color="#FFF" style={{ marginLeft: 1 }} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[s.micBtn, isRecording && s.micBtnRecording]} 
                  onPress={handleVoiceInput}
                  activeOpacity={0.7}
                >
                  {isRecording ? (
                    <Animated.View entering={ZoomIn.duration(400)}>
                      <MaterialCommunityIcons name="stop" size={22} color="#EF4444" />
                    </Animated.View>
                  ) : (
                    <Feather name="mic" size={20} color="#6B8A72" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </KeyboardAvoidingView>

      {/* ── CHAT HISTORY MODAL ── */}
      <Modal visible={showHistory} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)} style={s.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#0D1F12" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={s.newChatBtn} onPress={createNewChat}>
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={s.newChatText}>Start New Chat</Text>
            </TouchableOpacity>

            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
              {isLoadingPastSessions ? (
                <ActivityIndicator size="large" color="#7B2CBF" style={{ marginTop: 40 }} />
              ) : pastSessions.length === 0 ? (
                <Text style={s.emptyHistory}>No chat history found.</Text>
              ) : (
                pastSessions.map((sesh) => (
                  <TouchableOpacity 
                    key={sesh.id} 
                    style={[s.historyItem, sessionId === sesh.id && s.historyItemActive]}
                    onPress={() => loadSpecificSession(sesh)}
                  >
                    <Feather name="message-square" size={20} color={sessionId === sesh.id ? '#7B2CBF' : '#6B8A72'} />
                    <View style={s.historyItemBody}>
                      <Text style={[s.historyItemTitle, sessionId === sesh.id && { color: '#7B2CBF' }]} numberOfLines={1}>
                        {sesh.title || 'Conversation'}
                      </Text>
                      <Text style={s.historyItemDate}>
                        {new Date(sesh.updatedAt || sesh.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0FBF4' },
  container: { flex: 1, position: 'relative' },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8F7ED',
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  botAvatarOuter: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center',
    marginRight: 12, position: 'relative',
  },
  botAvatarInner: { width: 24, height: 24 },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF',
  },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 16, color: '#0D1F12' },
  headerSubtitle: { fontFamily: 'Sora_500Medium', fontSize: 11, color: '#22C55E', marginTop: 2 },
  headerActions: { flexDirection: 'row' },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },

  // Chat Area
  chatContainer: { flex: 1 },
  chatScroll: { padding: 20 },
  
  welcomeState: { alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  loadingText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#6B8A72', marginTop: 12 },
  
  // BIGGER ANIMATION FIX: Increased to 220
  lottieWrapper: { width: 220, height: 220, marginBottom: 10 },
  lottieRobot: { width: '100%', height: '100%' },
  
  welcomeTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 26, color: '#0D1F12', marginBottom: 8 },
  welcomeSubtitle: { fontFamily: 'Sora_400Regular', fontSize: 14, color: '#6B8A72', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20, lineHeight: 22 },
  
  quickActionsGrid: { width: '100%', gap: 12 },
  quickActionsRow: { flexDirection: 'row', gap: 12 },
  
  // CENTERED CARDS FIX: Uniform wrapper layout and heights
  quickActionWrapper: { flex: 1 },
  quickActionTile: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    alignItems: 'center', justifyContent: 'center',
    height: 120, // fixed height for uniformity
    borderWidth: 1, borderColor: '#E8F7ED',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
  },
  quickActionTilePressed: { backgroundColor: '#F0FBF4', transform: [{ scale: 0.98 }] },
  quickActionIcon: { fontSize: 32, marginBottom: 10 },
  quickActionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#0D1F12', textAlign: 'center' },

  // Message Bubbles
  messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end', maxWidth: '85%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageRowAI: { alignSelf: 'flex-start' },
  
  msgAvatarAI: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: '#E8F5EE',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  
  msgBubble: { paddingHorizontal: 16, paddingVertical: 12, minWidth: 80 },
  msgBubbleAI: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderBottomRightRadius: 20, borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  msgBubbleUser: {
    backgroundColor: '#1E3A8A',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderBottomRightRadius: 4, borderBottomLeftRadius: 20,
  },
  messageBubbleTyping: {
    backgroundColor: '#FFFFFF', borderRadius: 20, borderBottomLeftRadius: 4,
    paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center', alignItems: 'center',
  },
  
  msgText: { fontFamily: 'Sora_400Regular', fontSize: 15, lineHeight: 22 },
  msgTextAI: { color: '#0D1F12' },
  msgTextUser: { color: '#FFFFFF' },
  
  msgTime: { fontFamily: 'Sora_500Medium', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeAI: { color: '#9CA3AF' },
  msgTimeUser: { color: 'rgba(255,255,255,0.7)' },

  // Attachment Banner
  attachmentBanner: { position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 20 },
  attachmentPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: '#E8F7ED',
    shadowColor: '#C77DEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
  },
  attachmentName: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: '#0D1F12' },
  attachmentSub: { fontFamily: 'Sora_400Regular', fontSize: 11, color: '#6B8A72', marginTop: 2 },
  attachmentRemove: { padding: 4 },

  // Floating Input Bar
  inputGlass: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    borderRadius: 32, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  inputGlassKeyboard: {
    bottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 6,
  },
  iconBtn: {
    width: 40, height: 44, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1, minHeight: 44, maxHeight: 120,
    paddingHorizontal: 10, paddingTop: 14, paddingBottom: 14,
    fontFamily: 'Sora_400Regular', fontSize: 14, color: '#0D1F12',
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    shadowColor: '#C77DEF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendBtnGradient: {
    width: '100%', height: '100%', borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  micBtnRecording: {
    backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5',
  },

  // Modal (History)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    height: '75%', padding: 24, paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Sora_700Bold', fontSize: 24, color: '#0D1F12' },
  modalCloseBtn: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7B2CBF', borderRadius: 16, padding: 16, marginBottom: 24, gap: 8,
  },
  newChatText: { fontFamily: 'Sora_600SemiBold', fontSize: 15, color: '#FFFFFF' },
  modalScroll: { flex: 1 },
  emptyHistory: { fontFamily: 'Sora_400Regular', fontSize: 14, color: '#6B8A72', textAlign: 'center', marginTop: 40 },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 12,
  },
  historyItemActive: { backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#E9D5FF' },
  historyItemBody: { flex: 1, marginHorizontal: 12 },
  historyItemTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: '#1F2937', marginBottom: 4 },
  historyItemDate: { fontFamily: 'Sora_400Regular', fontSize: 12, color: '#9CA3AF' },
});
