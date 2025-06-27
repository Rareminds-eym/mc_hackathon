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
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import InstructionsPage from './screens/InstructionsPage';

const router = createBrowserRouter(
  [
    {
      element: <GameLayout><Outlet /></GameLayout>,
      children: [
        { path: '/', element: <LoaderScreen /> },
        { path: '/home', element: <HomeScreen /> },
        { path: '/modules', element: <ModuleMapScreen /> },
        { path: '/modules/:moduleId', element: <LevelList /> },
        { path: '/modules/:moduleId/levels/:levelId', element: <LevelScene /> },
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