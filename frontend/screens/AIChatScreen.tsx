import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { apiClient } from '../lib/apiClient';

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
  { title: 'Behavior Analysis', icon: '🧠', type: 'behavior' },
  { title: 'Activity Ideas', icon: '🎨', type: 'activities' },
  { title: 'Sleep Issues', icon: '😴', prompt: 'My child is having trouble sleeping' },
  { title: 'Tantrums', icon: '😤', prompt: 'How do I handle tantrums?' },
  { title: 'Screen Time', icon: '📱', prompt: 'How much screen time is appropriate?' },
  { title: 'Picky Eating', icon: '🍎', prompt: 'My child is a picky eater' },
];

export default function AIChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [childAge, setChildAge] = useState('');
  const [showSetup, setShowSetup] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

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
      const chatMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await apiClient.post('/api/chat', {
        messages: chatMessages,
        child_age: childAge || undefined
      });

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
      formatted += '\n';
    }

    if (response.resources?.length > 0) {
      formatted += '📚 Resources:\n';
      response.resources.forEach(resource => {
        formatted += `• ${resource}\n`;
      });
    }

    return formatted.trim();
  };

  const handleQuickAction = (action: any) => {
    if (action.type === 'behavior') {
      navigation.navigate('BehaviorAnalysis' as any);
    } else if (action.type === 'activities') {
      navigation.navigate('ActivityGenerator' as any);
    } else if (action.prompt) {
      sendMessage(action.prompt);
    }
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
      <View style={styles.container}>
        <Header title="AI Parenting Assistant" subtitle="Get personalized advice" />
        
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>Let's get started!</Text>
          <Text style={styles.setupSubtitle}>Tell me about your child to get personalized advice</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Child's Age (optional)</Text>
            <TextInput
              style={styles.ageInput}
              placeholder="e.g., 3, 5, 8..."
              value={childAge}
              onChangeText={setChildAge}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startChat}>
            <Text style={styles.startButtonText}>Start Chatting</Text>
          </TouchableOpacity>

          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={() => handleQuickAction(action)}
                >
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="AI Parenting Assistant" subtitle={childAge ? `Child: ${childAge} years old` : 'Chat with AI'} />
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  setupContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  setupSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  ageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
