import { createBrowserRouter, redirect } from 'react-router';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Client pages
import LandingPage from './pages/client/LandingPage';
import ClientLogin from './pages/client/ClientLogin';
import ServiceSelection from './pages/client/ServiceSelection';
import DateSelection from './pages/client/DateSelection';
import TimeSlotPage from './pages/client/TimeSlotPage';
import BookingSummary from './pages/client/BookingSummary';
import PaymentPage from './pages/client/PaymentPage';
import BookingConfirmation from './pages/client/BookingConfirmation';
import MyAppointments from './pages/client/MyAppointments';
import MediaVault from './pages/client/MediaVault';
import Gallery from './pages/client/Gallery';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import ClinicOwnerLogin from './pages/admin/ClinicOwnerLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingsList from './pages/admin/BookingsList';
import BookingDetails from './pages/admin/BookingDetails';
import CalendarView from './pages/admin/CalendarView';
import WorkingHours from './pages/admin/WorkingHours';
import ServicesManagement from './pages/admin/ServicesManagement';
import StaffManagement from './pages/admin/StaffManagement';
import RoomsManagement from './pages/admin/RoomsManagement';
import Payments from './pages/admin/Payments';
import Refunds from './pages/admin/Refunds';
import TenantSettings from './pages/admin/TenantSettings';
import Observability from './pages/admin/Observability';
import MediaManagement from './pages/admin/MediaManagement';

// Home page
import HomePage from './pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/client-login',
    Component: ClientLogin,
  },
  {
    path: '/clinic-login',
    Component: ClinicOwnerLogin,
  },
  {
    path: '/login',
    Component: AdminLogin,
  },
  {
    path: '/gallery',
    Component: Gallery,
  },
  {
    path: '/client',
    Component: ClientLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'services', Component: ServiceSelection },
      { path: 'date', Component: DateSelection },
      { path: 'time', Component: TimeSlotPage },
      { path: 'summary', Component: BookingSummary },
      { path: 'payment', Component: PaymentPage },
      { path: 'confirmation', Component: BookingConfirmation },
      { path: 'appointments', Component: MyAppointments },
      { path: 'profile', Component: MyAppointments },
      { path: 'vault', Component: MediaVault },
    ],
  },
  {
    path: '/admin/login',
    Component: AdminLogin,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, loader: () => redirect('/admin/dashboard') },
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'bookings', Component: BookingsList },
      { path: 'bookings/:id', Component: BookingDetails },
      { path: 'calendar', Component: CalendarView },
      { path: 'working-hours', Component: WorkingHours },
      { path: 'services', Component: ServicesManagement },
      { path: 'staff', Component: StaffManagement },
      { path: 'rooms', Component: RoomsManagement },
      { path: 'payments', Component: Payments },
      { path: 'refunds', Component: Refunds },
      { path: 'settings', Component: TenantSettings },
      { path: 'observability', Component: Observability },
      { path: 'media', Component: MediaManagement },
      { path: 'gallery', Component: Gallery },
    ],
  },
]);
