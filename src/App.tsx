import { Provider } from 'react-redux';
import { store } from './store';
import { GameLayout } from './layouts/GameLayout';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ModuleMapScreen } from './screens/ModuleMap';
import { LevelList } from './screens/LevelList';
import { LevelScene } from './screens/LevelScene';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

const router = createBrowserRouter(
  [
    {
      element: <GameLayout><Outlet /></GameLayout>,
      children: [
        { path: '/', element: <LoginScreen /> },
        { path: '/home', element: <HomeScreen /> },
        { path: '/modules', element: <ModuleMapScreen /> },
        { path: '/modules/:moduleId', element: <LevelList /> },
        { path: '/modules/:moduleId/levels/:levelId', element: <LevelScene /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]
);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;