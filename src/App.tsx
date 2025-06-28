import { Provider } from 'react-redux';
import { store } from './store';
import { GameLayout } from './layouts/GameLayout';
import LoaderScreen from './screens/LoaderScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ModuleMapScreen } from './screens/ModuleMap';
import { LevelList } from './screens/LevelList';
import { LevelScene } from './screens/LevelScene';
import AuthPage from './screens/AuthPage';
import { AuthProvider } from './contexts/AuthContext';
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
import InstructionsPage from './screens/InstructionsPage';
import BingoGame from './screens/BingoGame';

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

        { path: '/', element: <LoaderScreen /> },
        { path: '/home', element: <HomeScreen /> },
        { path: '/modules', element: <ModuleMapScreen /> },
        { path: '/modules/:moduleId', element: <LevelList /> },
        { path: '/modules/:moduleId/levels/:levelId', element: <LevelScene /> },
        { path: '/modules/:moduleId/levels/1',element: <BingoGame />, errorElement: <RouteErrorBoundary /> },
        { path: '/auth', element: <AuthPage /> },
        { path: '/instructions', element: <InstructionsPage /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]
);

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  );
}

export default App;