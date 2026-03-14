import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import LottieView from 'lottie-react-native';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I am processing your request. How else can I assist with your farming needs today?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const QuickAction = ({ icon, title }: { icon: string, title: string }) => (
    <Pressable 
      style={styles.quickActionTile}
      onPress={() => setInputText(`Tell me about ${title.toLowerCase()}`)}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.aiAvatarSmall}>
            <Text style={{ fontSize: 20 }}>🌱</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Saathi AI</Text>
            <Text style={styles.headerSubtitle}>● Online · Agricultural Expert</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <Pressable style={styles.headerActionBtn}>
            <Text style={{ fontSize: 20 }}>🌐</Text>
          </Pressable>
          <Pressable style={styles.headerActionBtn}>
            <Image 
              source={require('../../public/chat-sidebar-open.png')}
              style={{ width: 20, height: 20, tintColor: Colors.textPrimary }} 
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer} 
        contentContainerStyle={styles.chatScroll}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeState}>
            <LottieView
              source={require('../../animations/chatbot.json')}
              autoPlay
              loop
              style={{ width: 220, height: 220, marginBottom: Spacing.xl }}
            />
            <Text style={styles.welcomeTitle}>Namaste! 🙏</Text>
            <Text style={styles.welcomeSubtitle}>How can Saathi AI help your farm today?</Text>

            <View style={styles.quickActionsGrid}>
              <View style={styles.quickActionsRow}>
                <QuickAction icon="💧" title="Fertilizer Plan" />
                <QuickAction icon="🐛" title="Pest Diagnosis" />
              </View>
              <View style={styles.quickActionsRow}>
                <QuickAction icon="🌾" title="Crop Suitability" />
                <QuickAction icon="🌤️" title="Weather Advisory" />
              </View>
            </View>
          </View>
        ) : (
          messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAI
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.messageAvatarAI}>
                  <Text style={{ fontSize: 16 }}>🌱</Text>
                </View>
              )}
              
              <View 
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleAI
                ]}
              >
                <Text 
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.messageTextUser : styles.messageTextAI
                  ]}
                >
                  {msg.text}
                </Text>
              </View>

              {msg.sender === 'user' && (
                <View style={styles.messageAvatarUser}>
                  <Text style={{ fontSize: 16 }}>👨‍🌾</Text>
                </View>
              )}
            </View>
          ))
        )}

        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowAI]}>
            <View style={styles.messageAvatarAI}>
              <Text style={{ fontSize: 16 }}>🌱</Text>
            </View>
            <View style={[styles.messageBubble, styles.messageBubbleAI]}>
              <Text style={styles.messageTextAI}>...</Text>
            </View>
          </View>
        )}
        
        {/* Spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <Pressable style={styles.attachBtn}>
          <Text style={{ fontSize: 20 }}>📎</Text>
        </Pressable>
        
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        {inputText.trim() ? (
          <Pressable style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendIcon}>▶</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.micBtn}>
            <Text style={{ fontSize: 20 }}>🎤</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  aiAvatarSmall: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: { fontFamily: 'Sora_700Bold', fontSize: 15, color: Colors.textPrimary },
  headerSubtitle: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: Colors.primary },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  headerActionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  
  chatContainer: { flex: 1 },
  chatScroll: { padding: Spacing.xl },
  
  welcomeState: { alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  welcomeTitle: {
    fontFamily: 'Sora_800ExtraBold', // Using Sora instead of DM Serif for consistency if not loaded
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontFamily: 'Sora_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  
  quickActionsGrid: { width: '100%', gap: Spacing.sm },
  quickActionsRow: { flexDirection: 'row', gap: Spacing.sm },
  quickActionTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  quickActionIcon: { fontSize: 24, marginBottom: Spacing.xs },
  quickActionTitle: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },

  messageRow: { flexDirection: 'row', marginBottom: Spacing.lg, maxWidth: '85%' },
  messageRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  messageRowAI: { alignSelf: 'flex-start' },
  
  messageAvatarAI: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm, alignSelf: 'flex-end',
  },
  messageAvatarUser: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FFF3E0',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.sm, alignSelf: 'flex-end',
  },
  
  messageBubble: { padding: Spacing.md, ...Spacing.shadows.sm },
  messageBubbleAI: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    borderTopLeftRadius: 4, borderTopRightRadius: 16,
    borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 16, borderTopRightRadius: 4,
    borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
  },
  
  messageText: { fontFamily: 'Sora_400Regular', fontSize: 13, lineHeight: 20 },
  messageTextAI: { color: Colors.textPrimary },
  messageTextUser: { color: '#FFF' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 90 : Spacing.xl, // Give room for tab bar
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  attachBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minHeight: 44, maxHeight: 100,
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Spacing.radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: 12, paddingBottom: 12,
    fontFamily: 'Sora_400Regular', fontSize: 14,
    marginHorizontal: Spacing.sm,
  },
  micBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { color: '#FFF', fontSize: 18, marginLeft: 4 }
});
