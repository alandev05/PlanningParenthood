import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../lib/apiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  advice: string;
  actionable_steps: string[];
  age_appropriate_tips?: string[];
  warning_signs?: string[];
  resources?: string[];
}

const QUICK_ACTIONS = [
  { title: 'Sleep Issues', icon: '😴', prompt: 'My child is having trouble sleeping', color: '#FF6B35' },
  { title: 'Tantrums', icon: '😤', prompt: 'How do I handle tantrums?', color: '#FF8C42' },
  { title: 'Screen Time', icon: '📱', prompt: 'How much screen time is appropriate?', color: '#FF4F61' },
  { title: 'Picky Eating', icon: '🍎', prompt: 'My child is a picky eater', color: '#E74C3C' },
  { title: 'Potty Training', icon: '🚽', prompt: 'Tips for potty training', color: '#FF7F50' },
  { title: 'Bedtime Routine', icon: '🌙', prompt: 'Help with bedtime routine', color: '#FF5722' },
];

export default function ChatbotTab({ initialAge }: { initialAge?: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [childAge, setChildAge] = useState('');
  const [showSetup, setShowSetup] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Function to fetch child age from database
  const fetchChildAge = async () => {
    try {
      // In a real app, you'd get user_id from authentication
      const response = await apiClient.get('/api/user/default_user');
      if (response.child_age) {
        setChildAge(response.child_age.toString());
      }
    } catch (error) {
      console.log('Could not fetch child age from database, will use manual input');
      // Continue without age - user can still chat
    }
  };

  // Get child age from params/db on component mount
  useEffect(() => {
    if (initialAge !== undefined && initialAge !== null) {
      setChildAge(String(initialAge));
    } else {
      fetchChildAge();
    }
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Refresh user data before sending chat request to get latest quiz results
      await fetchChildAge();
      
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiClient.post('/api/chat', {
        messages: chatMessages,
        user_id: 'default_user', // In real app, get from auth
        child_age: childAge || undefined
      });

      console.log('🤖 Chat response:', response);

      const assistantMessage: Message = {
        role: 'assistant',
        content: formatResponse(response),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (response: ChatResponse): string => {
    let formatted = response.advice + '\n\n';
    
    if (response.actionable_steps?.length > 0) {
      formatted += '📋 Action Steps:\n';
      response.actionable_steps.forEach((step, index) => {
        formatted += `${index + 1}. ${step}\n`;
      });
      formatted += '\n';
    }

    if (response.age_appropriate_tips?.length > 0) {
      formatted += '💡 Age-Appropriate Tips:\n';
      response.age_appropriate_tips.forEach(tip => {
        formatted += `• ${tip}\n`;
      });
      formatted += '\n';
    }

    if (response.warning_signs?.length > 0) {
      formatted += '⚠️ When to Seek Help:\n';
      response.warning_signs.forEach(sign => {
        formatted += `• ${sign}\n`;
      });
    }

    return formatted.trim();
  };

  const startChat = () => {
    setShowSetup(false);
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hi! I'm your AI parenting assistant. ${childAge ? `I see you have a ${childAge}-year-old.` : ''} I'm here to help with any parenting questions or challenges you might have. What would you like to talk about?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (showSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>AI Parenting Assistant</Text>
          <Text style={styles.setupSubtitle}>
            {childAge ? `Ready to help with your ${childAge} year old` : 'Get personalized advice for your parenting journey'}
          </Text>
          
          <TouchableOpacity style={styles.startButton} onPress={startChat}>
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>

          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Help Topics</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickActionButton, { backgroundColor: action.color }]}
                  onPress={() => {
                    setShowSetup(false);
                    sendMessage(action.prompt);
                  }}
                >
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowSetup(true)}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Parenting Assistant</Text>
            {childAge && <Text style={styles.headerSubtitle}>Ready to help with your {childAge} year old</Text>}
          </View>
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.messageInput}
            placeholder="Ask me anything about parenting..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #FF6B35 0%, #FF4F61 100%)',
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2C3E50',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  setupSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#FF4F61',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quickActionsContainer: {
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  quickActionButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '28%',
    minHeight: 90,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FF4F61',
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF4F61',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 14,
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE5E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  assistantMessageText: {
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
    color: '#FF6B35',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#FFE5E0',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFE5E0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#FFF8F5',
  },
  sendButton: {
    backgroundColor: '#FF4F61',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#FF4F61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D5DBDB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
