import React, { useState, useMemo } from 'react';
import { BookingRequest, ScheduleSettings, Service, RequestStatus } from '../../types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Lock, X, Plus } from 'lucide-react';
import { useToast } from './ToastProvider';
import { getFirebaseFriendlyError } from '../../utils/firebaseErrors';
import { safeArray } from '../../utils/safeData.ts';

interface AdminScheduleTabProps {
  bookings: BookingRequest[];
  settings: ScheduleSettings;
  setSettings: any;
  onNavigateToTab?: (tab: string) => void;
  services?: Service[];
}

export default function AdminScheduleTab({ bookings, settings, setSettings, onNavigateToTab, services = [] }: AdminScheduleTabProps) {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showManualModal, setShowManualModal] = useState(false);

  // Mock timeline generation
  const timeline = useMemo(() => {
    const start = parseInt(settings.businessHours?.start?.split(':')[0] || '8');
    const end = parseInt(settings.businessHours?.end?.split(':')[0] || '18');
    const gen = [];
    
    for (let i = start; i < end; i++) {
       gen.push(`${i.toString().padStart(2, '0')}:00`);
       gen.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return gen;
  }, [settings.businessHours]);

  const bookingsForDate = bookings.filter(b => b.date === selectedDate);

  const toggleBlock = async (time: string) => {
    const isDayBlocked = safeArray(settings.blockedDates).includes(selectedDate);
    if (isDayBlocked) {
      showToast('Este dia inteiro já está bloqueado.', 'info');
      return;
    }

    const isBlocked = safeArray(settings.blockedTimeSlots).some(b => b.date === selectedDate && b.startTime === time);
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      
      let newBlocks = [...safeArray(settings.blockedTimeSlots)];
      if (isBlocked) {
         newBlocks = newBlocks.filter(b => !(b.date === selectedDate && b.startTime === time));
      } else {
         const [h, m] = time.split(':').map(Number);
         const d = new Date();
         d.setHours(h, m + (settings.slotIntervalMinutes || 30), 0, 0);
         const endTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
         newBlocks.push({ date: selectedDate, startTime: time, endTime, reason: 'Bloqueio manual' });
      }

      await setDoc(doc(db, 'scheduleSettings', 'main'), {
        blockedTimeSlots: newBlocks
      }, { merge: true });
      
      showToast(isBlocked ? `Horário ${time} liberado.` : `Horário ${time} bloqueado.`, isBlocked ? 'success' : 'warning');
    } catch (err) {
      console.error('Error toggling block', err);
      showToast(getFirebaseFriendlyError(err, 'Erro ao atualizar bloqueio.'), 'error');
    }
  };

  const handleBlockDay = async () => {
    const isBlocked = safeArray(settings.blockedDates).includes(selectedDate);
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      
      let newDates = [...safeArray(settings.blockedDates)];
      if (isBlocked) {
        newDates = newDates.filter(d => d !== selectedDate);
      } else {
        if (!newDates.includes(selectedDate)) newDates.push(selectedDate);
      }

      await setDoc(doc(db, 'scheduleSettings', 'main'), {
        blockedDates: newDates
      }, { merge: true });
      showToast(isBlocked ? 'Dia liberado.' : 'Dia inteiro bloqueado.', isBlocked ? 'success' : 'warning');
    } catch (err) {
      console.error('Error blocking day', err);
      showToast(getFirebaseFriendlyError(err, 'Erro ao alterar bloqueio do dia.'), 'error');
    }
  };

  const isDayBlocked = safeArray(settings.blockedDates).includes(selectedDate);

  // Manual Booking Form State
  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', vehicleModel: '', vehicleYear: '',
    vehicleColor: '', plate: '', serviceId: '', priceOptionLabel: '',
    date: selectedDate, time: '', notes: ''
  });

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const selectedSvc = services.find(s => s.id === formData.serviceId);
       if (!selectedSvc) throw new Error('Serviço inválido');
       
       const priceOpt = selectedSvc.priceOptions?.find(p => p.label === formData.priceOptionLabel);
       const price = priceOpt ? priceOpt.price : 0;

       const { db } = await import('../../lib/firebase');
       const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

       // Build reference
       const { v4: uuidv4 } = await import('uuid');
       const newId = uuidv4();
       
       const randomDigits = Math.floor(1000 + Math.random() * 9000);
       const protocol = `SR-${randomDigits}`;

       const [h, m] = formData.time.split(':').map(Number);
       const startDate = new Date();
       startDate.setHours(h, m, 0, 0);
       const durationMin = selectedSvc.durationMinutes || 60;
       startDate.setMinutes(startDate.getMinutes() + durationMin);
       const endTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

       const ref = doc(db, 'bookings', newId);
       const payload = {
         id: newId,
         protocol,
         customerName: formData.customerName,
         customerPhone: formData.customerPhone,
         vehicleType: priceOpt?.label || 'Padrão',
         vehicleModel: formData.vehicleModel,
         vehicleYear: formData.vehicleYear,
         vehicleColor: formData.vehicleColor,
         plate: formData.plate,
         serviceId: formData.serviceId,
         serviceName: selectedSvc.name,
         selectedPriceLabel: formData.priceOptionLabel,
         servicePrice: price,
         totalPrice: price,
         date: formData.date,
         time: formData.time,
         startTime: formData.time,
         endTime,
         notes: formData.notes,
         status: RequestStatus.CONFIRMED,
         createdAt: serverTimestamp(),
         serviceSnapshot: selectedSvc
       };

       await setDoc(ref, payload);
       showToast('Agendamento criado com sucesso.', 'success');
       setShowManualModal(false);
       setFormData(curr => ({...curr, customerName: '', customerPhone: '', vehicleModel: '', vehicleYear: '', vehicleColor: '', plate: '', notes: ''}));
     } catch (err) {
       console.error(err);
       showToast(getFirebaseFriendlyError(err, 'Erro ao criar agendamento manual.'), 'error');
     }
  };

  const selectedServiceForModal = useMemo(() => services.find(s => s.id === formData.serviceId), [services, formData.serviceId]);

  const handleManualBooking = () => {
     setShowManualModal(true);
  };

  return (
    <div className="px-6 space-y-6">
      <AnimatePresence>
        {showManualModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-0 sm:pb-4"
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-[#111114] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0B0B0D]">
                <h3 className="font-black text-white text-sm flex items-center gap-2"><Plus size={16} className="text-[#FFD000]"/> Agendamento Manual</h3>
                <button onClick={() => setShowManualModal(false)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                  <X size={16} className="text-[#A7A7A3]" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 no-scrollbar space-y-4">
                <form id="manualBookingForm" onSubmit={handleManualBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Cliente *</label>
                      <input required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">WhatsApp *</label>
                      <input required value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Serviço *</label>
                    <select required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value, priceOptionLabel: ''})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white">
                      <option value="">Selecione...</option>
                      {services.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes} min)</option>)}
                    </select>
                  </div>

                  {selectedServiceForModal && (
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Veículo (Categoria/Preço) *</label>
                      <select required value={formData.priceOptionLabel} onChange={e => setFormData({...formData, priceOptionLabel: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white">
                        <option value="">Selecione...</option>
                        {selectedServiceForModal.priceOptions?.map(po => <option key={po.label} value={po.label}>{po.label} - R$ {po.price}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Modelo</label>
                      <input required value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Ano</label>
                      <input required value={formData.vehicleYear} onChange={e => setFormData({...formData, vehicleYear: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Cor</label>
                      <input required value={formData.vehicleColor} onChange={e => setFormData({...formData, vehicleColor: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Placa</label>
                      <input value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Data *</label>
                      <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Hora *</label>
                      <select required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white">
                        <option value="">Selecione...</option>
                        {timeline.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-[#A7A7A3] uppercase mb-1">Observações Internas</label>
                     <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl p-2 text-xs text-white min-h-[60px]" />
                  </div>
                </form>
              </div>
              <div className="p-4 border-t border-white/5 bg-[#0B0B0D]">
                 <button form="manualBookingForm" type="submit" className="w-full bg-[#FFD000] text-black font-black uppercase text-xs tracking-wider py-3 rounded-xl active:scale-95 transition-all">
                    Criar Agendamento
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
           const isBlocked = safeArray(settings.blockedTimeSlots).some(b => b.date === selectedDate && b.startTime === time);
           const isDayBlocked = safeArray(settings.blockedDates).includes(selectedDate);
           
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
