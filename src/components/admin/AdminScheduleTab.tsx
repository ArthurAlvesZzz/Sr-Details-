import { useState, useMemo } from 'react';
import { BookingRequest, ScheduleSettings } from '../../types.ts';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Lock } from 'lucide-react';
import { useToast } from './ToastProvider';

interface AdminScheduleTabProps {
  bookings: BookingRequest[];
  settings: ScheduleSettings;
  setSettings: any;
  onNavigateToTab?: (tab: string) => void;
}

export default function AdminScheduleTab({ bookings, settings, setSettings, onNavigateToTab }: AdminScheduleTabProps) {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Mock timeline generation
  const timeline = useMemo(() => {
    const start = parseInt(settings.businessHours.start.split(':')[0]);
    const end = parseInt(settings.businessHours.end.split(':')[0]);
    const gen = [];
    
    for (let i = start; i < end; i++) {
       gen.push(`${i.toString().padStart(2, '0')}:00`);
       gen.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return gen;
  }, [settings.businessHours.start, settings.businessHours.end]);

  const bookingsForDate = bookings.filter(b => b.date === selectedDate);
  const [localBlocks, setLocalBlocks] = useState<string[]>([]);

  const toggleBlock = async (time: string) => {
    const isBlocked = settings.blockedTimeSlots?.some(b => b.date === selectedDate && b.startTime === time);
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      let newBlocks = [...(settings.blockedTimeSlots || [])];
      if (isBlocked) {
         newBlocks = newBlocks.filter(b => !(b.date === selectedDate && b.startTime === time));
      } else {
         const [h, m] = time.split(':').map(Number);
         const d = new Date();
         d.setHours(h, m + settings.slotIntervalMinutes, 0, 0);
         const endTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
         newBlocks.push({ date: selectedDate, startTime: time, endTime, reason: 'Bloqueio manual' });
      }

      await updateDoc(doc(db, 'scheduleSettings', 'main'), {
        blockedTimeSlots: newBlocks
      });
      showToast(isBlocked ? `Horário ${time} liberado.` : `Horário ${time} bloqueado.`, isBlocked ? 'success' : 'warning');
    } catch {
      showToast('Erro ao atualizar bloqueio', 'error');
    }
  };

  const handleBlockDay = async () => {
    const isBlocked = settings.blockedDates?.includes(selectedDate);
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      let newDates = [...(settings.blockedDates || [])];
      if (isBlocked) {
        newDates = newDates.filter(d => d !== selectedDate);
      } else {
        newDates.push(selectedDate);
      }

      await updateDoc(doc(db, 'scheduleSettings', 'main'), {
        blockedDates: newDates
      });
      showToast(isBlocked ? 'Dia liberado.' : 'Dia inteiro bloqueado.', isBlocked ? 'success' : 'warning');
    } catch {
      showToast('Erro ao alterar bloqueio do dia', 'error');
    }
  };

  const handleManualBooking = () => {
     showToast('Agendamento manual em breve. Utilize a tela inicial.', 'info');
  };

  return (
    <div className="px-6 space-y-6">
      <header>
         <h2 className="text-xl font-black tracking-tight mb-2">Visão Operacional</h2>
         <p className="text-[#A7A7A3] text-sm">Controle os horários livres e bloqueados.</p>
      </header>

      <div className="bg-[#111114] border border-white/5 rounded-2xl p-2 flex items-center shadow-inner overflow-x-auto no-scrollbar scroll-smooth">
         {[0,1,2,3,4,5,6].map(offset => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const dateStr = d.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const dayNum = d.getDate();

            return (
               <button 
                 key={dateStr}
                 onClick={() => setSelectedDate(dateStr)}
                 className={`flex-none w-14 py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${isSelected ? 'bg-[#FFD000] text-[#050505] shadow-[0_5px_15px_rgba(255,208,0,0.2)]' : 'text-[#A7A7A3] hover:bg-white/5'}`}
               >
                 <span className={`text-[9px] uppercase font-bold ${isSelected ? 'text-[#050505]' : 'text-[#6F7175]'}`}>{dayName}</span>
                 <span className={`text-base font-black ${isSelected ? 'text-[#050505]' : 'text-[#F4F4F2]'}`}>{dayNum}</span>
               </button>
            )
         })}
      </div>

      <div className="flex gap-2">
         <button onClick={handleBlockDay} className="flex-1 bg-[#111114] border border-white/5 text-[#F4F4F2] text-xs font-bold uppercase tracking-wider py-3 rounded-xl active:scale-95 transition-all">
            Bloquear Dia
         </button>
         <button onClick={handleManualBooking} className="flex-1 bg-[#FFD000] text-[#050505] text-xs font-black uppercase tracking-wider py-3 rounded-xl active:scale-95 shadow-[0_5px_15px_rgba(255,208,0,0.2)] transition-all">
            Agendamento Manual
         </button>
      </div>

      <div className="space-y-4 relative mt-8">
        <div className="absolute left-[31px] top-4 bottom-4 w-px flex flex-col items-center">
            <div className="h-full w-full bg-gradient-to-b from-[#111114] via-white/5 to-white/5"></div>
        </div>

        {timeline.map((time, idx) => {
           const booking = bookingsForDate.find(b => b.time === time);
           const isBlocked = settings.blockedTimeSlots?.some(b => b.date === selectedDate && b.startTime === time);
           const isDayBlocked = settings.blockedDates?.includes(selectedDate);
           
           let statusColor = 'bg-[#111114] border-white/10';
           let textColor = 'text-[#6F7175]';
           
           if (booking) {
              statusColor = 'bg-[#FFD000] border-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.4)]';
              textColor = 'text-[#FFD000]';
           } else if (isBlocked || isDayBlocked) {
              statusColor = 'bg-red-500/20 border-red-500/30';
              textColor = 'text-red-400';
           }

           return (
             <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.02 }}
               key={time} 
               className="flex items-center gap-5 relative group"
             >
                <div className={`w-[60px] text-right shrink-0 text-xs font-bold ${textColor}`}>{time}</div>
                <div className={`w-3 h-3 rounded-full border-2 relative z-10 transition-colors ${statusColor}`}></div>
                
                <div 
                   onClick={() => booking ? onNavigateToTab?.('orders') : toggleBlock(time)}
                   className={`flex-1 rounded-2xl p-4 border transition-all cursor-pointer ${
                      booking ? 'bg-[#111114] border-[#FFD000]/20 shadow-inner' :
                      (isBlocked || isDayBlocked) ? 'bg-red-500/5 border-red-500/10' :
                      'bg-[#0B0B0D] border-white/5 hover:border-white/10'
                   }`}
                >
                   {booking ? (
                      <div>
                         <p className="text-sm font-black text-[#F4F4F2] mb-1">{booking.serviceName}</p>
                         <div className="flex justify-between items-center text-xs text-[#A7A7A3]">
                            <span>{booking.customerName}</span>
                            <span className="font-bold text-[#FFE066]">{booking.status}</span>
                         </div>
                      </div>
                   ) : (isBlocked || isDayBlocked) ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                         <Lock size={12} /> Horário bloqueado manualmente
                      </div>
                   ) : (
                      <span className="text-xs text-[#6F7175] font-bold">Livre</span>
                   )}
                </div>
             </motion.div>
           )
        })}
      </div>
    </div>
  )
}
