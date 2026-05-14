import { useState, useEffect, useMemo, useCallback } from 'react';
import BottomNav from './components/BottomNav.tsx';
import Home from './components/Home.tsx';
import Services from './components/Services.tsx';
import Diagnostic from './components/Scanner.tsx';
import Booking from './components/Booking.tsx';
import MyRequest from './components/Status.tsx';
import AdminDashboard from './components/admin/AdminDashboard.tsx';
import { View, BookingRequest, RequestStatus, Service, ScheduleSettings, BusinessSettings as IBusinessSettings } from './types.ts';
import { motion, AnimatePresence } from 'motion/react';
import AdminLogin from './components/AdminLogin.tsx';
import { useAuth, AuthProvider } from './auth/AuthProvider.tsx';
import { useData, DataProvider } from './providers/DataProvider.tsx';

export function AppContent() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { services, bookings, businessSettings, scheduleSettings, loading, error } = useData();
  const [currentView, setCurrentView] = useState<View>('home' as View);
  const [draftServiceId, setDraftServiceId] = useState<string | null>(null);
  const [myLastRequest, setMyLastRequest] = useState<BookingRequest | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentView]);

  const handleNavigate = useCallback((view: View, params?: { serviceId?: string }) => {
    if (params?.serviceId) {
      setDraftServiceId(prev => prev === params.serviceId ? prev : params.serviceId);
    }
    setCurrentView(prev => prev === view ? prev : view);
  }, []);

  // Fallbacks for brand/schedule if not yet seeded
  const brand = useMemo(() => businessSettings || {
    businessName: 'SR Details', slogan: 'A Estética que Valoriza a Sua Vida',
    headline: 'Eleve o padrão do seu veículo.', subheadline: 'Estética automotiva premium',
    primaryColor: '#FFD000', secondaryColor: '#B8860B', logoUrl: '',
    whatsapp: '34999999999', address: 'R. Paulo L. Rotelli, 100', city: 'Uberlândia',
    state: 'MG', instagram: '@srdetails', googleMapsUrl: '', workingHoursText: 'Seg a Sáb - 08:00 às 18:00'
  }, [businessSettings]);

  const scheduleBrand = useMemo(() => scheduleSettings || {
    businessHours: { start: "08:00", end: "18:00" }, workingDays: [1, 2, 3, 4, 5, 6],
    slotIntervalMinutes: 30, bufferBetweenBookingsMinutes: 30, teamsCapacity: 1,
    allowSameDayBooking: true, minimumNoticeMinutes: 120, maxBookingsPerDay: null,
    blockedDates: [], blockedTimeSlots: []
  }, [scheduleSettings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#FFD000]/20 border-t-[#FFD000] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center text-red-500">
         {error}
       </div>
    );
  }

  if (services.length === 0 && !loading && currentView !== 'admin' && currentView !== 'admin-login') {
    return (
       <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center space-y-4">
         <p className="text-[#F4F4F2] font-black text-xl">Catálogo indisponível no momento.</p>
         <p className="text-[#A7A7A3] text-sm max-w-sm mb-4">Entre em contato com a SR Details ou acesse o painel para configurar o catálogo.</p>
         <button onClick={() => setCurrentView('admin-login')} className="bg-[#FFD000] text-[#050505] px-6 py-3 font-bold rounded-[1.25rem] shadow-[0_5px_20px_rgba(255,208,0,0.2)]">
           Acessar painel para popular catálogo
         </button>
       </div>
    );
  }

  const handleBookingSubmit = async (newRequest: BookingRequest) => {
    // Note: We'll create it directly in Firestore from the Booking component
    setMyLastRequest(newRequest);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home onNavigate={handleNavigate} brand={brand} services={services} />;
      case 'services': return <Services onNavigate={handleNavigate} services={services} />;
      case 'scanner': return <Diagnostic onNavigate={handleNavigate} services={services} brand={brand} />;
      case 'booking': return <Booking 
        onNavigate={handleNavigate} 
        onSubmit={handleBookingSubmit} 
        services={services} 
        scheduleSettings={scheduleBrand}
        bookings={bookings}
        draftServiceId={draftServiceId}
      />;
      case 'status': {
        const liveRequest = myLastRequest ? bookings.find(b => b.id === myLastRequest.id) || myLastRequest : null;
        return <MyRequest request={liveRequest} onNavigate={handleNavigate} brand={brand} />;
      }
      case 'admin-login': return <AdminLogin onNavigate={handleNavigate} />;
      case 'admin': return isAdmin ? (
        <AdminDashboard 
          bookings={bookings} setBookings={() => {}}
          services={services} setServices={() => {}}
          scheduleSettings={scheduleBrand} setScheduleSettings={() => {}}
          brandSettings={brand} setBrandSettings={() => {}}
          userRole={currentUser?.role}
          onLogout={() => { logout(); handleNavigate('home'); }}
          onExit={() => handleNavigate('home')} 
        />
      ) : <AdminLogin onNavigate={handleNavigate} />;
      default: return <Home onNavigate={handleNavigate} brand={brand} services={services} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F4F4F2] font-sans selection:bg-[#FFD000] selection:text-black">
      <div className="max-w-md mx-auto relative min-h-screen overflow-x-hidden bg-[#050505] shadow-2xl shadow-black">
        {/* Background Layers */}
        <div className="fixed inset-0 pointer-events-none flex justify-center overflow-hidden max-w-md mx-auto">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.06] mix-blend-overlay"></div>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,208,0,0.15)_0%,_transparent_70%)] blur-[80px]"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(184,134,11,0.1)_0%,_transparent_70%)] blur-[80px]"></div>
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(111,113,117,0.1)_0%,_transparent_70%)] blur-[80px]"></div>
        </div>

        <main className="relative z-10 overflow-y-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {currentView !== 'admin' && currentView !== 'brand-settings' && currentView !== 'admin-login' && (
          <BottomNav currentView={currentView} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

