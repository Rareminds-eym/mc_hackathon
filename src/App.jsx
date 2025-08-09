import { useState, useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { GameLayout } from './layouts/GameLayout';
import LoaderScreen from './screens/LoaderScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ModuleMapScreen } from './screens/ModuleMap';
import { LevelList } from './screens/LevelList';
import AuthPage from './screens/AuthPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ResetPassword from './components/auth/ResetPassword';
import ErrorFallback from './components/ErrorFallback';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom';
import Level2 from './screens/Level2/Index';
import Level2GameNavigator from './screens/Level2/GameNavigator';
import Level3 from './screens/Level3/Index';
import Level4 from './screens/Level4/Index';
import InstructionsPage from './screens/InstructionsPage';
import { GameBoard2D } from './components/Level4/GameBoard2D';
import BingoGame from './screens/BingoGame';
import SplashScreen from './components/ui/SplashScreen';
import Score from './components/Scores/Score';
import DebugPage from './pages/DebugPage';
import { InstallPrompt, OfflineIndicator } from './components/PWA';

// Import offline sync functions
import { pullFromSupabase, pushToSupabase, smartSync } from './db/sync';

// Route Error Component
function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        error={new Error(`${error.status} ${error.statusText}`)}
        resetErrorBoundary={() => (window.location.href = '/')}
        title={`${error.status} - ${error.statusText}`}
        message={
          error.data?.message ||
          "The page you're looking for doesn't exist or encountered an error."
        }
      />
    );
  }

  return (
    <ErrorFallback
      error={error instanceof Error ? error : new Error('Unknown route error')}
      resetErrorBoundary={() => (window.location.href = '/')}
      title="Navigation Error"
      message="Something went wrong while navigating. Let's get you back on track."
    />
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const handleSplashComplete = () => setShowSplash(false);

  // Auto-sync function that handles both pull and push intelligently
  const autoSync = useCallback(async (force = false) => {
    // Only sync if online
    if (!isOnline && !force) {
      console.log('Offline - skipping sync');
      return;
    }

    try {
      const now = Date.now();

      console.log('Auto-syncing data...');

      // Use smartSync for intelligent syncing
      const result = await smartSync(force, lastSyncTime);
      if (result.success) {
        if (result.skipped) {
          console.log('Auto-sync skipped - no changes needed');
        } else {
          console.log('Auto-sync completed successfully');
          setLastSyncTime(now);
        }
      } else {
        // Don't log authentication errors as errors - they're expected when not logged in
        if (result.skipped && result.error?.includes('not authenticated')) {
          console.log('Auto-sync skipped - user not authenticated');
        } else {
          console.error('Auto-sync failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Error during auto-sync:', error);
    }
  }, [isOnline, lastSyncTime]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App came online');
      setIsOnline(true);
      // Sync when coming back online
      autoSync(true);
    };

    const handleOffline = () => {
      console.log('App went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Initial data pull on app mount
  useEffect(() => {
    const initializeOfflineData = async () => {
      try {
        console.log('Initializing offline data...');

        // Initial pull from Supabase
        const result = await pullFromSupabase();
        if (result.success) {
          console.log('Successfully initialized offline data');
          setLastSyncTime(Date.now());
        } else {
          console.error('Failed to initialize offline data:', result.error);
        }
      } catch (error) {
        console.error('Error initializing offline data:', error);
      }
    };

    initializeOfflineData();
  }, []);

  // Periodic sync when online (every 5 minutes)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      autoSync();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isOnline, autoSync]);

  // Sync before page unload (when user closes/refreshes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Push any pending changes before leaving
      if (isOnline) {
        pushToSupabase().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOnline]);

  const router = createBrowserRouter([
    {
      element: (
        <GameLayout>
          <Outlet />
        </GameLayout>
      ),
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: '/',
          element: showSplash ? (
            <SplashScreen onComplete={handleSplashComplete} />
          ) : (
            <AuthPage />
          ),
        },
        { path: '/home', element: <ProtectedRoute><HomeScreen /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules', element: <ProtectedRoute><ModuleMapScreen /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId', element: <ProtectedRoute><LevelList /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/levels/1', element: <ProtectedRoute><BingoGame /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/levels/2', element: <ProtectedRoute><Level2 /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/games', element: <ProtectedRoute><Level2GameNavigator /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/levels/3', element: <ProtectedRoute><Level3 /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/levels/4', element: <ProtectedRoute><Level4 /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/modules/:moduleId/levels/4/gameboard2d', element: <ProtectedRoute><GameBoard2D /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/auth', element: <AuthPage />, errorElement: <RouteErrorBoundary /> },
        { path: '/reset-password', element: <ResetPassword />, errorElement: <RouteErrorBoundary /> },
        { path: '/instructions', element: <ProtectedRoute><InstructionsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/scores', element: <ProtectedRoute><Score /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '/debug', element: <ProtectedRoute><DebugPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
        { path: '*', element: <Navigate to="/" replace />, errorElement: <RouteErrorBoundary /> },
      ],
    },
  ]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
        <OfflineIndicator />
        <InstallPrompt />
      </AuthProvider>
    </Provider>
  );
}

export default App;