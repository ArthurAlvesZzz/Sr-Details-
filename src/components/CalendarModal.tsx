import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ScheduleSettings, BookingRequest, Service } from '../types.ts';
import { isWorkingDay, isDateBlocked, getAvailableSlots } from '../lib/scheduleEngine.ts';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  service: Service | undefined;
  bookings: BookingRequest[];
  scheduleSettings: ScheduleSettings;
}

type CalendarDayStatus = "available" | "unavailable" | "closed" | "selected";

interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: CalendarDayStatus;
}

export default function CalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  service,
  bookings,
  scheduleSettings
}: CalendarModalProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Reset to current month when opened
  useEffect(() => {
    if (isOpen) {
       const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00Z') : new Date();
       setCurrentMonthDate(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    }
  }, [isOpen, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    if (!service) return [];
    
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth(); // 0-11
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start on Sunday
    
    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    }

    const days: CalendarDay[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const isCurrentMonth = tempDate.getMonth() === month;
      const isToday = dateStr === todayStr;
      
      let status: CalendarDayStatus = "closed";

      if (dateStr === selectedDate) {
         status = "selected";
      } else if (dateStr < todayStr) {
         status = "closed"; // Past dates
      } else if (!isWorkingDay(dateStr, scheduleSettings) || isDateBlocked(dateStr, scheduleSettings)) {
         status = "closed"; // Closed or manually blocked
      } else {
         // It's a valid future/present working day
         const slots = getAvailableSlots(dateStr, service, bookings, scheduleSettings);
         if (slots.length > 0) {
            status = "available";
         } else {
            status = "unavailable";
         }
      }

      days.push({
        date: dateStr,
        dayNumber: tempDate.getDate(),
        isCurrentMonth,
        isToday,
        status
      });

      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonthDate, service, bookings, scheduleSettings, selectedDate]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const handleSelect = (day: CalendarDay) => {
     if (day.status === 'closed' || day.status === 'unavailable') return;
     onSelectDate(day.date);
     onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0B0B0D] border border-white/10 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-[400px] overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[#F4F4F2] font-black text-xl flex items-center gap-2">
                 {monthNames[currentMonthDate.getMonth()]} <span className="text-[#A7A7A3]">{currentMonthDate.getFullYear()}</span>
               </h3>
               <div className="flex items-center gap-2">
                  <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111114] text-[#A7A7A3] hover:text-[#F4F4F2] border border-white/5 transition-colors">
                     <ChevronLeft size={16} />
                  </button>
                  <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111114] text-[#A7A7A3] hover:text-[#F4F4F2] border border-white/5 transition-colors">
                     <ChevronRight size={16} />
                  </button>
                  <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 ml-2">
                     <X size={16} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
               {weekDays.map(wd => (
                  <div key={wd} className="text-center text-[10px] font-black tracking-widest uppercase text-[#6F7175] py-2">
                     {wd}
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
               {calendarDays.map((day, idx) => {
                  let bgClass = "bg-[#111114] border-transparent text-[#6F7175]";
                  let clickAction = () => handleSelect(day);

                  if (day.status === "selected") {
                     bgClass = "bg-[#FFD000] border-[#FFD000] text-[#050505] shadow-[0_0_15px_rgba(255,208,0,0.4)] font-black";
                  } else if (day.status === "available") {
                     bgClass = "bg-[#050505] border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 cursor-pointer font-bold";
                  } else if (day.status === "unavailable") {
                     bgClass = "bg-[#050505] border-red-500/20 text-red-500 hover:bg-red-500/10 cursor-not-allowed opacity-50";
                  } else {
                     bgClass = "bg-[#050505] border-transparent text-[#6F7175] opacity-30 cursor-not-allowed";
                     clickAction = () => {};
                  }

                  if (!day.isCurrentMonth) {
                     bgClass += " opacity-20";
                  }

                  let borderClass = day.isCurrentMonth ? "border" : "border-0";
                  if (day.isToday && day.status !== "selected") {
                     borderClass += " border-white/30";
                  }

                  return (
                     <button
                        key={idx}
                        onClick={clickAction}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm transition-all ${bgClass} ${borderClass}`}
                     >
                        {day.dayNumber}
                     </button>
                  );
               })}
            </div>
          </div>
          
          <div className="bg-[#050505] px-6 py-4 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-2 justify-center">
             <div className="flex items-center gap-1.5 text-[10px] text-[#A7A7A3] font-bold uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> Disponível
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-[#A7A7A3] font-bold uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60"></div> Indisponível
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-[#A7A7A3] font-bold uppercase tracking-wider">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6F7175] opacity-50"></div> Fechado
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
