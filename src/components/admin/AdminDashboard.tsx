import { useState } from 'react';
import { BookingRequest, Service, ScheduleSettings, BusinessSettings } from '../../types.ts';
import { LogOut, ArrowLeft, LayoutDashboard, CalendarDays, ListOrdered, Wrench, Settings, ShieldAlert } from 'lucide-react';
import AdminToday from './AdminToday';
import AdminOrdersTab from './AdminOrdersTab';
import AdminServicesTab from './AdminServicesTab';
import AdminScheduleTab from './AdminScheduleTab';
import AdminSettingsTab from './AdminSettingsTab';
import AdminDiagnosticsTab from './AdminDiagnosticsTab';
import { ToastProvider } from './ToastProvider';

interface AdminDashboardProps {
  bookings: BookingRequest[];
  setBookings: any;
  services: Service[];
  setServices: any;
  scheduleSettings: ScheduleSettings;
  setScheduleSettings: any;
  brandSettings: BusinessSettings;
  setBrandSettings: any;
  onLogout: () => void;
  onExit: () => void;
  userRole?: string;
}

export default function AdminDashboard({
  bookings, setBookings,
  services, setServices,
  scheduleSettings, setScheduleSettings,
  brandSettings, setBrandSettings,
  onLogout,
  onExit,
  userRole
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('today');

  const tabs = [
    { id: 'today', icon: LayoutDashboard, label: 'Hoje', roles: ['owner', 'manager', 'attendant', 'technician'] },
    { id: 'schedule', icon: CalendarDays, label: 'Agenda', roles: ['owner', 'manager', 'attendant', 'technician'] },
    { id: 'orders', icon: ListOrdered, label: 'Pedidos', roles: ['owner', 'manager', 'attendant'] },
    { id: 'services', icon: Wrench, label: 'Serviços', roles: ['owner', 'manager'] },
    { id: 'settings', icon: Settings, label: 'Ajustes', roles: ['owner'] },
    { id: 'diagnostics', icon: ShieldAlert, label: 'Diag', roles: ['owner'] },
  ].filter(t => t.roles.includes(userRole || 'owner'));

  // Ensure active tab is allowed, otherwise fallback
  if (!tabs.find(t => t.id === activeTab)) {
     if (tabs.length > 0) setActiveTab(tabs[0].id);
  }

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-[#050505] text-[#F4F4F2]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0B0B0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <button onClick={onExit} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 shadow-inner active:scale-95 transition-all">
                  <ArrowLeft size={18} />
                </button>
                <div>
                   <h1 className="text-sm font-black text-[#F4F4F2] uppercase tracking-wider">{brandSettings.businessName} Admin</h1>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] text-[#A7A7A3] font-bold">Online (Modo Nuvem)</span>
                   </div>
                </div>
             </div>
             <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 border border-red-500/10 transition-all">
                <LogOut size={16} />
             </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar pb-[120px] pt-4">
          {activeTab === 'today' && <AdminToday bookings={bookings} setBookings={setBookings} onNavigateToTab={setActiveTab} />}
          {activeTab === 'schedule' && <AdminScheduleTab bookings={bookings} settings={scheduleSettings} setSettings={setScheduleSettings} onNavigateToTab={setActiveTab} services={services} />}
          {activeTab === 'orders' && <AdminOrdersTab bookings={bookings} setBookings={setBookings} />}
          {activeTab === 'services' && <AdminServicesTab services={services} setServices={setServices} />}
          {activeTab === 'settings' && <AdminSettingsTab 
              scheduleSettings={scheduleSettings} setScheduleSettings={setScheduleSettings}
              brandSettings={brandSettings} setBrandSettings={setBrandSettings} 
          />}
          {activeTab === 'diagnostics' && <AdminDiagnosticsTab />}
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0D]/95 backdrop-blur-xl border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
           <div className="flex justify-around items-center max-w-md mx-auto">
              {tabs.map(tab => {
                 const isActive = activeTab === tab.id;
                 const Icon = tab.icon;
                 return (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className="flex flex-col items-center justify-center w-16 h-12 relative active:scale-95 transition-transform"
                   >
                     {isActive && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FFD000]/20 blur-md rounded-full"></div>
                     )}
                     <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 transition-colors ${isActive ? 'text-[#FFD000]' : 'text-[#6F7175]'}`} />
                     <span className={`text-[9px] font-black uppercase tracking-wider mt-1 relative z-10 transition-colors ${isActive ? 'text-[#FFD000]' : 'text-[#6F7175]'}`}>{tab.label}</span>
                   </button>
                 )
              })}
           </div>
        </div>
      </div>
    </ToastProvider>
  );
}
