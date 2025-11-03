import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { APP_NAME, COLORS, SPACING } from './utils';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.title}>Welcome to {APP_NAME}</Text>
      <Text style={styles.subtitle}>Powered by Expo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.MD,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
    color: COLORS.TEXT,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
});