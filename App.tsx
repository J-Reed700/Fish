import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Game } from './src/components/Game';
import { ErrorReporting } from './src/services/ErrorReporting';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { PurchaseProvider } from './src/monetization/contexts/PurchaseContext';

function AppContent() {
  useEffect(() => {
    ErrorReporting.initialize();
    ErrorReporting.addBreadcrumb('App started');
  }, []);

  return (
    <PurchaseProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Game fishCount={30} mode="free-swim" />
          <StatusBar style="light" />
        </GestureHandlerRootView>
      </ErrorBoundary>
    </PurchaseProvider>
  );
}

export default ErrorReporting.wrap(AppContent);
