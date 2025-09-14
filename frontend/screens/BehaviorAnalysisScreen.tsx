import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import { apiClient } from '../lib/apiClient';

interface BehaviorAnalysis {
  analysis: string;
  developmental_stage: string;
  possible_causes: string[];
  strategies: string[];
  when_to_seek_help?: string;
}

export default function BehaviorAnalysisScreen() {
  const [childAge, setChildAge] = useState('');
  const [behaviorDescription, setBehaviorDescription] = useState('');
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<BehaviorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeBehavior = async () => {
    if (!childAge.trim() || !behaviorDescription.trim()) {
      Alert.alert('Missing Information', 'Please provide your child\'s age and describe the behavior.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/analyze-behavior', {
        child_age: childAge,
        behavior_description: behaviorDescription,
        context: context
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Behavior analysis error:', error);
      Alert.alert('Error', 'Failed to analyze behavior. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setChildAge('');
    setBehaviorDescription('');
    setContext('');
    setAnalysis(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Behavior Analysis" subtitle="Understand your child's behavior" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Child's Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3, 5, 8..."
              value={childAge}
              onChangeText={setChildAge}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Describe the Behavior</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what your child is doing, when it happens, and how often..."
              value={behaviorDescription}
              onChangeText={setBehaviorDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Context (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any recent changes, stressors, or relevant background information..."
              value={context}
              onChangeText={setContext}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.analyzeButton, isLoading && styles.buttonDisabled]}
              onPress={analyzeBehavior}
              disabled={isLoading}
            >
              <Text style={styles.analyzeButtonText}>
                {isLoading ? 'Analyzing...' : '🧠 Analyze Behavior'}
              </Text>
            </TouchableOpacity>

            {analysis && (
              <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
                <Text style={styles.clearButtonText}>Start New Analysis</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {analysis && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Analysis</Text>
              <Text style={styles.sectionText}>{analysis.analysis}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Developmental Stage</Text>
              <Text style={styles.sectionText}>{analysis.developmental_stage}</Text>
            </View>

            {analysis.possible_causes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔍 Possible Causes</Text>
                {analysis.possible_causes.map((cause, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{cause}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysis.strategies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Strategies</Text>
                {analysis.strategies.map((strategy, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{strategy}</Text>
                  </View>
                ))}
              </View>
            )}

            {analysis.when_to_seek_help && (
              <View style={[styles.section, styles.warningSection]}>
                <Text style={styles.sectionTitle}>⚠️ When to Seek Professional Help</Text>
                <Text style={styles.sectionText}>{analysis.when_to_seek_help}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 12,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  warningSection: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});
