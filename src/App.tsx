import { Provider } from 'react-redux';
import { store } from './store';
import { GameLayout } from './layouts/GameLayout';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ModuleMapScreen } from './screens/ModuleMap';
import { LevelList } from './screens/LevelList';
import { LevelScene } from './screens/LevelScene';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom';

// Route Error Component
function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        error={new Error(`${error.status} ${error.statusText}`)}
        resetErrorBoundary={() => window.location.href = '/'}
        title={`${error.status} - ${error.statusText}`}
        message={error.data?.message || "The page you're looking for doesn't exist or encountered an error."}
      />
    );
  }

  return (
    <ErrorFallback
      error={error instanceof Error ? error : new Error('Unknown route error')}
      resetErrorBoundary={() => window.location.href = '/'}
      title="Navigation Error"
      message="Something went wrong while navigating. Let's get you back on track."
    />
  );
}

const router = createBrowserRouter(
  [
    {
      element: <GameLayout><Outlet /></GameLayout>,
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: '/',
          element: <LoginScreen />,
          errorElement: <RouteErrorBoundary />
        },
        {
          path: '/home',
          element: <HomeScreen />,
          errorElement: <RouteErrorBoundary />
        },
        {
          path: '/modules',
          element: <ModuleMapScreen />,
          errorElement: <RouteErrorBoundary />
        },
        {
          path: '/modules/:moduleId',
          element: <LevelList />,
          errorElement: <RouteErrorBoundary />
        },
        {
          path: '/modules/:moduleId/levels/:levelId',
          element: <LevelScene />,
          errorElement: <RouteErrorBoundary />
        },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]
);

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log error to console or external service
          console.error('Application Error:', error, errorInfo);

          // You can add error reporting service here
          // Example: Sentry.captureException(error, { extra: errorInfo });
        }}
      >
        <RouterProvider router={router} />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;