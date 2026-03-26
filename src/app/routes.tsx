import { createBrowserRouter } from 'react-router';
import { IntroScreen } from './pages/IntroScreen';
import { CustomerDetails } from './pages/CustomerDetails';
import { BillingInterface } from './pages/BillingInterface';
import { AgentLogin } from './pages/AgentLogin';
import { SellerLogin } from './pages/SellerLogin';
import { SellerDashboard } from './pages/SellerDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IntroScreen />,
  },
  {
    path: '/customer-details',
    element: <CustomerDetails />,
  },
  {
    path: '/billing',
    element: <BillingInterface />,
  },
  {
    path: '/agent-login',
    element: <AgentLogin />,
  },
  {
    path: '/seller-login',
    element: <SellerLogin />,
  },
  {
    path: '/seller-dashboard',
    element: <SellerDashboard />,
  },
  {
    path: '*',
    element: <IntroScreen />,
  },
]);
