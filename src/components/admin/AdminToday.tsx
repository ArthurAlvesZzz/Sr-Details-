import { BookingRequest, RequestStatus } from '../../types.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { motion } from 'motion/react';
import { TrendingUp, CarFront, Clock, User, MessageCircle, Navigation, MapPin } from 'lucide-react';
import { useToast } from './ToastProvider';

interface AdminTodayProps {
  bookings: BookingRequest[];
  setBookings: any;
  onNavigateToTab?: (tab: string) => void;
}

export default function AdminToday({ bookings, setBookings, onNavigateToTab }: AdminTodayProps) {
  const { showToast } = useToast();
  // Mock today string
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.date === todayStr);
  
  const pending = todaysBookings.filter(b => b.status === RequestStatus.REQUESTED || b.status === RequestStatus.ANALYSIS);
  const executing = todaysBookings.filter(b => b.status === RequestStatus.EXECUTING || b.status === RequestStatus.RECEIVED);
  const finished = todaysBookings.filter(b => b.status === RequestStatus.FINISHED || b.status === RequestStatus.READY_FOR_PICKUP);
  
  const expectedRevenue = todaysBookings
     .filter(b => b.status !== RequestStatus.CANCELED)
     .reduce((acc, b) => acc + b.totalPrice, 0);

  const nextBooking = todaysBookings.find(b => b.status === RequestStatus.REQUESTED || b.status === RequestStatus.CONFIRMED);

  const updateStatus = async (protocol: string, newStatus: RequestStatus) => {
    const bookingToUpdate = bookings.find(b => b.protocol === protocol);
    if (!bookingToUpdate) return;
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'bookings', bookingToUpdate.id), {
        status: newStatus
      });
      showToast(`Serviço alterado para ${newStatus}.`, 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  return (
    <div className="px-6 space-y-6">
      <header className="mb-8">
         <h2 className="text-2xl font-black tracking-tight">Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</h2>
         <p className="text-[#A7A7A3] text-sm">Resumo da sua operação diária.</p>
      </header>

      {/* Metrics Dash */}
      <div className="grid grid-cols-2 gap-3">
         <div onClick={() => onNavigateToTab?.('orders')} className="bg-[#111114] cursor-pointer active:scale-95 transition-transform border border-white/5 rounded-[1.5rem] p-4 shadow-inner hover:border-white/10">
            <span className="text-[#A7A7A3] text-[10px] uppercase font-black tracking-[1px] mb-1 block">Agendamentos</span>
            <div className="text-3xl font-black text-[#F4F4F2]">{todaysBookings.length}</div>
         </div>
         <div className="bg-gradient-to-br from-[#1A1810] to-[#111114] border border-[#FFD000]/20 rounded-[1.5rem] p-4 shadow-inner">
            <span className="text-[#FFE066] text-[10px] uppercase font-black tracking-[1px] mb-1 flex items-center gap-1">
              <TrendingUp size={12} /> Previsão
            </span>
            <div className="text-xl font-black text-[#FFE066] mt-2">{formatCurrency(expectedRevenue)}</div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
         <div onClick={() => onNavigateToTab?.('orders')} className="bg-[#111114] border border-white/5 cursor-pointer active:scale-95 transition-transform hover:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-[#F4F4F2]">{pending.length}</div>
            <span className="text-[9px] uppercase tracking-wider text-[#A7A7A3] mt-1 font-bold">Pendentes</span>
         </div>
         <div onClick={() => onNavigateToTab?.('orders')} className="bg-[#111114] border border-[#FFD000]/10 cursor-pointer active:scale-95 transition-transform hover:border-[#FFD000]/30 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-[#FFE066]">{executing.length}</div>
            <span className="text-[9px] uppercase tracking-wider text-[#A7A7A3] mt-1 font-bold">Em Execução</span>
         </div>
         <div onClick={() => onNavigateToTab?.('orders')} className="bg-[#111114] border border-white/5 cursor-pointer active:scale-95 transition-transform hover:border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-white">{finished.length}</div>
            <span className="text-[9px] uppercase tracking-wider text-[#A7A7A3] mt-1 font-bold">Finalizados</span>
         </div>
      </div>

      <div className="bg-[#111114] border border-white/5 rounded-[1rem] p-4 flex justify-between items-center text-sm shadow-inner mt-2">
         <span className="text-[#A7A7A3] font-bold">Próximo horário livre:</span>
         <span className="text-[#FFD000] font-black">{nextBooking ? '14:30' : 'Disponível'}</span>
      </div>

      {/* Up Next List */}
      <h3 className="text-xs font-black text-[#A7A7A3] uppercase tracking-[2px] mt-8 mb-4">Próximos Atendimentos</h3>
      
      {todaysBookings.length === 0 ? (
         <div className="bg-[#0B0B0D] border border-white/5 rounded-[1.5rem] p-8 text-center flex flex-col items-center justify-center shadow-inner">
            <div className="w-16 h-16 bg-[#111114] rounded-full flex items-center justify-center mb-4 border border-white/5">
              <CarFront size={24} className="text-[#6F7175]" />
            </div>
            <h4 className="text-[#F4F4F2] font-black mb-1">Nenhum atendimento hoje</h4>
            <p className="text-[#A7A7A3] text-xs max-w-[200px] mb-6">A agenda está livre. Que tal criar um agendamento manual?</p>
            <button onClick={() => onNavigateToTab?.('schedule')} className="bg-[#FFD000] text-[#050505] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0_5px_15px_rgba(255,208,0,0.2)]">
               Novo Agendamento
            </button>
         </div>
      ) : (
         <div className="space-y-4">
            {todaysBookings.map((booking, idx) => (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={booking.protocol} 
                  className="bg-[#0B0B0D] border top-white/5 rounded-[1.5rem] p-5 shadow-lg border border-white/5 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFD000]/5 blur-3xl rounded-full"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#FFD000]" />
                        <span className="text-[#F4F4F2] font-black">{booking.time} - {booking.endTime || '??:??'}</span>
                     </div>
                     <span className="text-[9px] uppercase tracking-[1px] font-bold text-[#FFD000] bg-[#FFD000]/10 px-2 py-1 rounded-md border border-[#FFD000]/20">
                        {booking.status}
                     </span>
                  </div>

                  <div 
                    onClick={() => onNavigateToTab?.('orders')}
                    className="mb-4 cursor-pointer"
                  >
                     <p className="font-black text-[#FFE066] mb-1 text-sm">{booking.serviceName}</p>
                     <div className="flex items-center gap-3 text-xs text-[#A7A7A3]">
                        <span className="flex items-center gap-1"><User size={12} /> {booking.customerName}</span>
                        <span className="flex items-center gap-1"><CarFront size={12} /> {booking.vehicleModel}</span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 gap-2 border-t border-white/5 pt-4">
                     {booking.status === RequestStatus.EXECUTING || booking.status === RequestStatus.RECEIVED ? (
                        <button 
                          onClick={() => updateStatus(booking.protocol, RequestStatus.READY_FOR_PICKUP)}
                          className="flex-1 bg-[#111114] border border-[#FFD000]/50 hover:bg-[#FFD000] hover:text-[#050505] text-[#FFD000] font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-colors text-center"
                        >
                          Concluir Serviço
                        </button>
                     ) : booking.status === RequestStatus.FINISHED || booking.status === RequestStatus.CANCELED ? (
                        <button 
                          disabled
                          className="flex-1 bg-[#111114] border border-white/5 text-[#6F7175] font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl text-center opacity-50"
                        >
                          Encerrado
                        </button>
                     ) : (
                        <button 
                          onClick={() => updateStatus(booking.protocol, RequestStatus.EXECUTING)}
                          className="flex-1 bg-[#111114] border border-[#FFD000]/30 hover:bg-[#FFD000] hover:text-[#050505] text-[#FFD000] font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-colors text-center"
                        >
                          Iniciar Serviço
                        </button>
                     )}
                     
                     <a href={`https://wa.me/55${booking.customerPhone?.replace(/\D/g, '') || '34999999999'}?text=${encodeURIComponent(`Olá ${booking.customerName}, aqui é da SR Details sobre seu agendamento.`)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 hover:text-[#FFD000] hover:border-[#FFD000]/30 transition-all">
                        <MessageCircle size={16} />
                     </a>
                     <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("R. Paulo Luís Rotelli, 100, Uberlândia, MG")}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 hover:text-[#FFD000] hover:border-[#FFD000]/30 transition-all">
                        <MapPin size={16} />
                     </a>
                  </div>
               </motion.div>
            ))}
         </div>
      )}
    </div>
  )
}
