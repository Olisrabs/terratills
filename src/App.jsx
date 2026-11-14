import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TopHeader from './components/TopHeader';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import MobilePageHeader from './components/MobilePageHeader';
import { OfflineView } from './components/StateViews';

// Public & Landing Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import PricingPage from './pages/public/PricingPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview';
import ExploreServices from './pages/ExploreServices';
import SearchResults from './pages/SearchResults';
import ServiceCategory from './pages/ServiceCategory';
import ListingDetails from './pages/ListingDetails';
import BookingRequest from './pages/BookingRequest';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import MyServices from './pages/MyServices';
import AddService from './pages/AddService';
import EditService from './pages/EditService';
import ServiceDetailsManagement from './pages/ServiceDetailsManagement';
import ServiceRequests from './pages/ServiceRequests';
import MessagesView from './pages/MessagesView';
import NotificationsView from './pages/NotificationsView';
import ProfileView from './pages/ProfileView';
import VerificationView from './pages/VerificationView';
import SettingsView from './pages/SettingsView';
import AIAssistantView from './pages/AIAssistantView';

function DashboardShell() {
  const { currentRoute } = useApp();

  const renderActiveRoute = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardOverview />;
      case '/dashboard/explore':
        return <ExploreServices />;
      case '/dashboard/explore/search':
        return <SearchResults />;
      case '/dashboard/explore/category/:slug':
        return <ServiceCategory />;
      case '/dashboard/listings/:listingId':
        return <ListingDetails />;
      case '/dashboard/bookings/new/:listingId':
        return <BookingRequest />;
      case '/dashboard/bookings/:bookingId/confirmation':
        return <BookingConfirmation />;
      case '/dashboard/bookings':
        return <MyBookings />;
      case '/dashboard/bookings/:bookingId':
      case '/dashboard/bookings/:bookingId/messages':
      case '/dashboard/bookings/:bookingId/completion':
        return <BookingDetails />;
      case '/dashboard/services':
        return <MyServices />;
      case '/dashboard/services/new':
        return <AddService />;
      case '/dashboard/services/:listingId/edit':
        return <EditService />;
      case '/dashboard/services/:listingId':
      case '/dashboard/services/:listingId/availability':
      case '/dashboard/services/:listingId/performance':
        return <ServiceDetailsManagement />;
      case '/dashboard/service-requests':
      case '/dashboard/service-requests/:requestId':
        return <ServiceRequests />;
      case '/dashboard/messages':
      case '/dashboard/messages/:conversationId':
        return <MessagesView />;
      case '/dashboard/notifications':
        return <NotificationsView />;
        return <NotificationsView />;
      case '/dashboard/profile':
      case '/dashboard/profile/edit':
        return <ProfileView />;
      case '/dashboard/verification':
      case '/dashboard/verification/:type':
        return <VerificationView />;
      case '/dashboard/settings':
      case '/dashboard/settings/security':
      case '/dashboard/settings/notifications':
      case '/dashboard/settings/privacy':
      case '/dashboard/settings/locations':
      case '/dashboard/settings/preferences':
      case '/dashboard/settings/account':
        return <SettingsView />;
      case '/dashboard/assistant':
        return <AIAssistantView />;
      default:
        return <DashboardOverview />;
    }
  };

  const getPageTitle = (route) => {
    if (route.startsWith('/dashboard/explore/category/')) return 'Category';
    if (route.startsWith('/dashboard/listings/')) return 'Service Details';
    if (route.startsWith('/dashboard/bookings/new/')) return 'Book Service';
    if (route.includes('/confirmation')) return 'Booking Confirmed';
    if (route.startsWith('/dashboard/bookings/')) return 'Booking Details';
    if (route.startsWith('/dashboard/services/') && route.includes('/edit')) return 'Edit Service';
    if (route.startsWith('/dashboard/services/')) return 'Service Management';
    if (route.startsWith('/dashboard/service-requests/')) return 'Service Request';
    if (route.startsWith('/dashboard/messages/')) return 'Messages';
    if (route.startsWith('/dashboard/verification/')) return 'Verification Details';

    const titles = {
      '/dashboard/explore': 'Explore Services',
      '/dashboard/explore/search': 'Search Results',
      '/dashboard/bookings': 'My Bookings',
      '/dashboard/services': 'My Services',
      '/dashboard/services/new': 'List a Service',
      '/dashboard/service-requests': 'Service Requests',
      '/dashboard/messages': 'Messages',
      '/dashboard/notifications': 'Notifications',
      '/dashboard/profile': 'My Profile',
      '/dashboard/profile/edit': 'Edit Profile',
      '/dashboard/verification': 'Verification Centre',
      '/dashboard/settings': 'Account Settings',
      '/dashboard/assistant': 'Agro AI Assistant'
    };
    return titles[route] || 'TerraTills';
  };

  return (
    <div className="flex-1 flex">
      {/* Persistent Desktop Sidebar */}
      <Sidebar isOpen={false} onClose={() => {}} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopHeader: hidden on mobile (md:flex), visible on desktop */}
        <TopHeader />

        {/* Mobile Page Header: flush at top with zero margin or white line */}
        {currentRoute !== '/dashboard' && (
          <MobilePageHeader title={getPageTitle(currentRoute)} />
        )}

        <main className="flex-1 overflow-x-hidden">{renderActiveRoute()}</main>
      </div>

      {/* Persistent Mobile Bottom Navigation dock */}
      <MobileBottomNav />
    </div>
  );
}

function MainAppRouter() {
  const { currentRoute, currentUser, isOffline } = useApp();

  const renderCurrentView = () => {
    // 1. Marketing / Public Landing routes
    if (currentRoute === '/' || currentRoute === '/home') {
      return <LandingPage />;
    }
    if (currentRoute === '/about') {
      return <AboutPage />;
    }
    if (currentRoute === '/services' || currentRoute === '/services-overview') {
      return <ServicesPage />;
    }
    if (currentRoute === '/pricing') {
      return <PricingPage />;
    }
    if (currentRoute === '/contact') {
      return <ContactPage />;
    }

    // 2. Auth routes
    if (currentRoute === '/login' || currentRoute === '/auth/login') {
      return <LoginPage />;
    }
    if (
      currentRoute === '/signup' ||
      currentRoute === '/auth/signup' ||
      currentRoute === '/register' ||
      currentRoute === '/auth/register'
    ) {
      return <RegisterPage />;
    }
    if (currentRoute === '/forgot-password' || currentRoute === '/auth/forgot-password') {
      return <ForgotPasswordPage />;
    }

    // 3. Authenticated Unified Dashboard routes
    // The dashboard only shows upon login or when user session is active
    if (currentRoute.startsWith('/dashboard')) {
      if (!currentUser) {
        return <LoginPage />;
      }
      return <DashboardShell />;
    }

    // Default: show Landing Page
    return <LandingPage />;
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-slate-800 flex flex-col font-sans antialiased">
      {isOffline && <OfflineView />}
      {renderCurrentView()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppRouter />
    </AppProvider>
  );
}
