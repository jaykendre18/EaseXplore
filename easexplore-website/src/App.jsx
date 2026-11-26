import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import { ROUTES } from '@/config/routes';
import { AuthProvider } from '@/context/AuthContext';
import { BudgetProvider } from '@/context/BudgetContext';
import { FavouritesProvider } from '@/context/FavouritesContext';

// Each page loads only when it is visited, which keeps the first load small.
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Itinerary = lazy(() => import('@/pages/Itinerary'));
const Transport = lazy(() => import('@/pages/Transport'));
const Budget = lazy(() => import('@/pages/Budget'));
const Recommendations = lazy(() => import('@/pages/Recommendations'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <FavouritesProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                {/* Open to everyone */}
                <Route path={ROUTES.home.path} element={<Home />} />
                <Route path={ROUTES.login.path} element={<Login />} />
                <Route path={ROUTES.resetPassword.path} element={<ResetPassword />} />
                <Route path={ROUTES.itinerary.path} element={<Itinerary />} />
                <Route path={ROUTES.transport.path} element={<Transport />} />
                <Route path={ROUTES.budget.path} element={<Budget />} />
                <Route path={ROUTES.recommendations.path} element={<Recommendations />} />

                {/* Needs a login */}
                <Route element={<ProtectedRoute />}>
                  <Route path={ROUTES.dashboard.path} element={<Dashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FavouritesProvider>
      </BudgetProvider>
    </AuthProvider>
  );
}
