import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { NotificationSystem } from './components/NotificationSystem';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <NotificationSystem />
    </AppProvider>
  );
}
