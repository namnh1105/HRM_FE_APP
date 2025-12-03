import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const Messages: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hộp thư</Text>
        <Text style={styles.description}>Tính năng tin nhắn đang được phát triển...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Messages;