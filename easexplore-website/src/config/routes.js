// Every page path, label and icon lives here so the header, footer,
// dashboard links and router can never drift apart.
export const ROUTES = {
  home: { path: '/', label: 'Home', icon: 'home' },
  itinerary: { path: '/itinerary', label: 'Smart Itinerary', icon: 'route' },
  transport: { path: '/transport', label: 'Transit Finder & RTO Meter', icon: 'directions_subway' },
  budget: { path: '/budget', label: 'Budget & Expense', icon: 'account_balance_wallet' },
  recommendations: { path: '/recommendations', label: 'Food & Stays', icon: 'restaurant' },
  dashboard: { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  login: { path: '/login', label: 'Log in', icon: 'login' },
  resetPassword: { path: '/reset-password', label: 'Reset password', icon: 'lock_reset' },
};

// Links shown in the main navigation bar, in order.
export const MAIN_NAV = [
  ROUTES.home,
  ROUTES.itinerary,
  ROUTES.transport,
  ROUTES.budget,
  ROUTES.recommendations,
];
