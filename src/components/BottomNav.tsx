import { Home, Grid, Scan, CalendarCheck2, Clock } from 'lucide-react';
import { View } from '../types.ts';

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
}

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'home' as View, icon: Home, label: 'Início' },
    { id: 'services' as View, icon: Grid, label: 'Serviços' },
    { id: 'booking' as View, icon: CalendarCheck2, label: 'Agendar', isPrimary: true },
    { id: 'scanner' as View, icon: Scan, label: 'Scanner' },
    { id: 'status' as View, icon: Clock, label: 'Status' }
  ];

  return (
    <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-12 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
      <div className="w-full max-w-[380px] relative pointer-events-auto">
        {/* Glow behind the nav */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD000]/10 to-transparent blur-xl opacity-50 rounded-full"></div>
        
        {/* Background container without overflow hidden */}
        <div className="absolute inset-0 bg-[#0B0B0D]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,1)]">
           <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
             {/* Subtle inner top highlight */}
             <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
           </div>
        </div>

        {/* Content container */}
        <div className="relative px-2 py-3 flex justify-around items-end h-[72px]">
          {items.map((item) => {
            const isActive = currentView === item.id;
            
            if (item.isPrimary) {
               return (
                 <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="relative px-4 flex flex-col items-center justify-center active:scale-95 transition-transform shrink-0 pb-1"
                 >
                    {/* The primary button floating element */}
                    <div className={`absolute bottom-[28px] left-1/2 -translate-x-1/2 w-[64px] h-[64px] rounded-full flex flex-col items-center justify-center z-20 transition-all duration-300 ${isActive ? 'shadow-[0_10px_30px_rgba(255,208,0,0.4)]' : 'shadow-[0_10px_20px_rgba(0,0,0,0.8)]'}`}>
                      <div className={`absolute inset-0 bg-[#FFD000] blur-xl rounded-full transition-opacity duration-300 ${isActive ? 'opacity-40' : 'opacity-10'}`}></div>
                      <div className={`relative z-10 w-full h-full rounded-full flex items-center justify-center border-[4px] border-[#0B0B0D] overflow-hidden transition-all duration-300 ${isActive ? 'bg-[#FFE066] shadow-[0_0_20px_rgba(255,208,0,0.6)]' : 'bg-[#FFD000] shadow-[0_0_10px_rgba(255,208,0,0.2)]'}`}>
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
                         <item.icon size={26} className="text-[#050505] relative z-10" />
                      </div>
                    </div>
                    {/* Spacer to push label down */}
                    <div className="h-[28px]"></div>
                    <span className={`text-[9px] font-black uppercase tracking-[2px] transition-colors ${isActive ? 'text-[#FFD000]' : 'text-[#A7A7A3]'}`}>
                       {item.label}
                    </span>
                 </button>
               );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center flex-1 active:scale-95 transition-transform group relative pb-1 h-full"
              >
                <div className={`relative z-10 transition-transform duration-300 mb-1.5 ${isActive ? '-translate-y-1' : ''}`}>
                  <item.icon 
                     size={22} 
                     className={`transition-all duration-300 ${isActive ? 'text-[#FFE066] drop-shadow-[0_0_8px_rgba(255,224,102,0.6)]' : 'text-[#6F7175] group-hover:text-[#A7A7A3]'}`} 
                  />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-[#FFE066] opacity-100' : 'text-[#6F7175] opacity-60 group-hover:opacity-100'}`}>
                   {item.label}
                </span>
                
                {isActive && (
                   <div className="absolute bottom-0 w-8 h-[2px] rounded-t-full bg-gradient-to-r from-transparent via-[#FFD000] to-transparent shadow-[0_0_5px_rgba(255,208,0,0.8)]"></div>
                )}
              </button>
            );
          })}
          {/* Hidden Admin Trigger - Double tap area on the right edge */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-8 z-30" 
            onDoubleClick={() => onNavigate('admin')}
          />
        </div>
      </div>
    </nav>
  );
}
