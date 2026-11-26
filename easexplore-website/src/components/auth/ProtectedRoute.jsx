import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

/**
 * Wrap pages that need a login:
 *   <Route element={<ProtectedRoute />}> ...pages... </Route>
 * Logged-out visitors go to the login page and return here afterwards.
 *
 * Note: this only controls what the screen shows. The real protection of saved
 * data is done by Row Level Security rules in Supabase (set up in Step 7).
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-on-surface-variant" role="status">
        <Icon name="progress_activity" className="animate-spin" />
        Checking your login…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login.path} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
