import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname || '/');
  const [routeParams, setRouteParams] = useState({});
  const [routeQuery, setRouteQuery] = useState(new URLSearchParams(window.location.search));
  const [toasts, setToasts] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // History listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      syncRoute(window.location.pathname, new URLSearchParams(window.location.search), false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync route parser
  const syncRoute = (path, searchParams = new URLSearchParams(), pushHistory = true) => {
    if (pushHistory) {
      const searchStr = searchParams.toString();
      const url = searchStr ? `${path}?${searchStr}` : path;
      window.history.pushState({}, '', url);
    }

    setRouteQuery(searchParams);

    // Parameter extraction:
    // e.g. /dashboard/explore/category/:slug
    const catMatch = path.match(/^\/dashboard\/explore\/category\/([^/]+)$/);
    if (catMatch) {
      setCurrentRoute('/dashboard/explore/category/:slug');
      setRouteParams({ slug: catMatch[1] });
      return;
    }

    // e.g. /dashboard/listings/:listingId
    const listMatch = path.match(/^\/dashboard\/listings\/([^/]+)$/);
    if (listMatch) {
      setCurrentRoute('/dashboard/listings/:listingId');
      setRouteParams({ listingId: listMatch[1] });
      return;
    }

    // e.g. /dashboard/bookings/new/:listingId
    const newBookMatch = path.match(/^\/dashboard\/bookings\/new\/([^/]+)$/);
    if (newBookMatch) {
      setCurrentRoute('/dashboard/bookings/new/:listingId');
      setRouteParams({ listingId: newBookMatch[1] });
      return;
    }

    // e.g. /dashboard/bookings/:bookingId/confirmation
    const confMatch = path.match(/^\/dashboard\/bookings\/([^/]+)\/confirmation$/);
    if (confMatch) {
      setCurrentRoute('/dashboard/bookings/:bookingId/confirmation');
      setRouteParams({ bookingId: confMatch[1] });
      return;
    }

    // e.g. /dashboard/bookings/:bookingId/completion
    const compMatch = path.match(/^\/dashboard\/bookings\/([^/]+)\/completion$/);
    if (compMatch) {
      setCurrentRoute('/dashboard/bookings/:bookingId/completion');
      setRouteParams({ bookingId: compMatch[1] });
      return;
    }

    // e.g. /dashboard/bookings/:bookingId/messages
    const bookMsgMatch = path.match(/^\/dashboard\/bookings\/([^/]+)\/messages$/);
    if (bookMsgMatch) {
      setCurrentRoute('/dashboard/bookings/:bookingId/messages');
      setRouteParams({ bookingId: bookMsgMatch[1] });
      return;
    }

    // e.g. /dashboard/bookings/:bookingId
    const bookMatch = path.match(/^\/dashboard\/bookings\/([^/]+)$/);
    if (bookMatch) {
      setCurrentRoute('/dashboard/bookings/:bookingId');
      setRouteParams({ bookingId: bookMatch[1] });
      return;
    }

    // e.g. /dashboard/services/:listingId/edit
    const editServMatch = path.match(/^\/dashboard\/services\/([^/]+)\/edit$/);
    if (editServMatch) {
      setCurrentRoute('/dashboard/services/:listingId/edit');
      setRouteParams({ listingId: editServMatch[1] });
      return;
    }

    // e.g. /dashboard/services/:listingId/availability
    const availMatch = path.match(/^\/dashboard\/services\/([^/]+)\/availability$/);
    if (availMatch) {
      setCurrentRoute('/dashboard/services/:listingId/availability');
      setRouteParams({ listingId: availMatch[1] });
      return;
    }

    // e.g. /dashboard/services/:listingId/performance
    const perfMatch = path.match(/^\/dashboard\/services\/([^/]+)\/performance$/);
    if (perfMatch) {
      setCurrentRoute('/dashboard/services/:listingId/performance');
      setRouteParams({ listingId: perfMatch[1] });
      return;
    }

    // e.g. /dashboard/services/:listingId
    const servMatch = path.match(/^\/dashboard\/services\/([^/]+)$/);
    if (servMatch) {
      setCurrentRoute('/dashboard/services/:listingId');
      setRouteParams({ listingId: servMatch[1] });
      return;
    }

    // e.g. /dashboard/service-requests/:requestId
    const reqMatch = path.match(/^\/dashboard\/service-requests\/([^/]+)$/);
    if (reqMatch) {
      setCurrentRoute('/dashboard/service-requests/:requestId');
      setRouteParams({ requestId: reqMatch[1] });
      return;
    }

    // e.g. /dashboard/messages/:conversationId
    const convMatch = path.match(/^\/dashboard\/messages\/([^/]+)$/);
    if (convMatch) {
      setCurrentRoute('/dashboard/messages/:conversationId');
      setRouteParams({ conversationId: convMatch[1] });
      return;
    }

    // e.g. /dashboard/finance/transactions/:transactionId
    const txMatch = path.match(/^\/dashboard\/finance\/transactions\/([^/]+)$/);
    if (txMatch) {
      setCurrentRoute('/dashboard/finance/transactions/:transactionId');
      setRouteParams({ transactionId: txMatch[1] });
      return;
    }

    // e.g. /dashboard/reviews/new/:bookingId
    const revNewMatch = path.match(/^\/dashboard\/reviews\/new\/([^/]+)$/);
    if (revNewMatch) {
      setCurrentRoute('/dashboard/reviews/new/:bookingId');
      setRouteParams({ bookingId: revNewMatch[1] });
      return;
    }

    // e.g. /dashboard/support/:ticketId
    const tckMatch = path.match(/^\/dashboard\/support\/([^/]+)$/);
    if (tckMatch && tckMatch[1] !== 'new') {
      setCurrentRoute('/dashboard/support/:ticketId');
      setRouteParams({ ticketId: tckMatch[1] });
      return;
    }

    // e.g. /dashboard/verification/:type
    const verMatch = path.match(/^\/dashboard\/verification\/([^/]+)$/);
    if (verMatch) {
      setCurrentRoute('/dashboard/verification/:type');
      setRouteParams({ type: verMatch[1] });
      return;
    }

    // Standard static routes
    setCurrentRoute(path);
    setRouteParams({});
  };

  const navigate = (path, queryParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.set(k, v);
      }
    });
    syncRoute(path, searchParams, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast notifications
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Initial user fetch
  useEffect(() => {
    // Ensure fresh start without hardcoded default
    const storedUserId = localStorage.getItem('terratills_active_user');
    if (storedUserId) {
      fetch('/api/auth/me', {
        headers: { 'x-user-id': storedUserId }
      })
        .then(r => {
          if (!r.ok) throw new Error('Unauthenticated');
          return r.json();
        })
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('terratills_active_user');
            setCurrentUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('terratills_active_user');
          setCurrentUser(null);
        });
    } else {
      setCurrentUser(null);
    }

    const initialRoute = window.location.pathname || '/';
    syncRoute(initialRoute, new URLSearchParams(window.location.search), false);
  }, []);

  // Authenticated fetch wrapper
  const apiFetch = async (url, options = {}) => {
    const userId = currentUser ? currentUser.id : localStorage.getItem('terratills_active_user');
    const headers = {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      showToast('Session expired. Please sign in.', 'error');
      setCurrentUser(null);
      localStorage.removeItem('terratills_active_user');
      navigate('/login');
    }
    return response;
  };

  const login = (user) => {
    localStorage.setItem('terratills_active_user', user.id);
    setCurrentUser(user);
    showToast(`Welcome, ${user.displayName || user.name}!`, 'success');
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('terratills_active_user');
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
    navigate('/login');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRoute,
        routeParams,
        routeQuery,
        navigate,
        login,
        logout,
        apiFetch,
        showToast,
        isOffline,
        unreadNotifCount,
        setUnreadNotifCount
      }}
    >
      {children}
      {/* Toast Render */}
      <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-float text-xs font-semibold flex items-center space-x-2 transition-all duration-300 animate-slide-up ${
              t.type === 'error'
                ? 'bg-rose-600 text-white'
                : t.type === 'info'
                ? 'bg-slate-800 text-white'
                : 'bg-forest text-white'
            }`}
          >
            <span>{t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '🌿'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

