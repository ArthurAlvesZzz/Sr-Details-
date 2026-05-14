import { useState } from 'react';
import { BookingRequest, RequestStatus } from '../../types.ts';
import { Search, ChevronDown, CheckCircle2, Clock, XCircle, PlayCircle, Settings, X, Edit, Box, Navigation, MessageCircle, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../../lib/utils.ts';
import { useToast } from './ToastProvider';
import { getFirebaseFriendlyError } from '../../utils/firebaseErrors';

interface AdminOrdersTabProps {
  bookings: BookingRequest[];
  setBookings: any;
}

export default function AdminOrdersTab({ bookings, setBookings }: AdminOrdersTabProps) {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<string>('Todos');
  const [search, setSearch] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<BookingRequest | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  const filters = ['Todos', 'Pendentes', 'Confirmados', 'Em execução', 'Finalizados', 'Cancelados'];

  const getFilteredBookings = () => {
     let filtered = bookings;
     if (filter !== 'Todos') {
        const statuses: Record<string, string[]> = {
           'Pendentes': [RequestStatus.REQUESTED, RequestStatus.ANALYSIS],
           'Confirmados': [RequestStatus.CONFIRMED],
           'Em execução': [RequestStatus.RECEIVED, RequestStatus.EXECUTING, RequestStatus.READY_FOR_PICKUP],
           'Finalizados': [RequestStatus.FINISHED],
           'Cancelados': [RequestStatus.CANCELED]
        };
        const allowedTargets = statuses[filter] || [];
        filtered = filtered.filter(b => allowedTargets.includes(b.status));
     }

     if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(b => 
           b.customerName?.toLowerCase().includes(query) || 
           b.protocol?.toLowerCase().includes(query) ||
           b.vehicleModel?.toLowerCase().includes(query)
        );
     }
     
     return filtered.sort((a,b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  };

  const statusOptions = [
    { value: RequestStatus.REQUESTED, icon: Clock, label: 'Solicitado', desc: 'Cliente acabou de solicitar.' },
    { value: RequestStatus.ANALYSIS, icon: Search, label: 'Em Análise', desc: 'Avaliando dados e agenda.' },
    { value: RequestStatus.CONFIRMED, icon: CheckCircle2, label: 'Confirmado', desc: 'Agendamento aceito.' },
    { value: RequestStatus.RECEIVED, icon: Box, label: 'Recebido', desc: 'O veículo chegou.' },
    { value: RequestStatus.EXECUTING, icon: PlayCircle, label: 'Em Execução', desc: 'Serviço rolendo.' },
    { value: RequestStatus.READY_FOR_PICKUP, icon: CheckCircle2, label: 'Pronto Retirada', desc: 'Aguardando o cliente.' },
    { value: RequestStatus.FINISHED, icon: CheckCircle2, label: 'Finalizado', desc: 'Tudo certo. Encerrado.' },
    { value: RequestStatus.CANCELED, icon: XCircle, label: 'Cancelado', desc: 'Não vai mais acontecer.' },
  ];

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!selectedOrder) return;
    
    if (status === RequestStatus.FINISHED || status === RequestStatus.CANCELED) {
       if (!window.confirm(`Tem certeza que deseja mudar para ${status}?`)) return;
    }

    try {
      const { db } = await import('../../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'bookings', selectedOrder.id), {
        status
      });
      setShowStatusModal(false);
      showToast(`Status atualizado para ${status}.`, 'success');
    } catch (err) {
      console.error(err);
      showToast(getFirebaseFriendlyError(err, 'Erro ao atualizar status.'), 'error');
    }
  };

  const handleCancel = async (booking: BookingRequest) => {
     if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
        try {
          const { db } = await import('../../lib/firebase');
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, 'bookings', booking.id), {
            status: RequestStatus.CANCELED
          });
          showToast('Agendamento cancelado.', 'success');
        } catch (err) {
          console.error(err);
          showToast(getFirebaseFriendlyError(err, 'Erro ao cancelar agendamento.'), 'error');
        }
     }
  };

  const handleDelete = async (booking: BookingRequest) => {
     if (window.confirm('Excluir este agendamento permanentemente? Esta ação não pode ser desfeita.')) {
        try {
          const { db } = await import('../../lib/firebase');
          const { doc, deleteDoc } = await import('firebase/firestore');
          await deleteDoc(doc(db, 'bookings', booking.id));
          showToast('Agendamento excluído.', 'success');
        } catch (err) {
          console.error(err);
          showToast(getFirebaseFriendlyError(err, 'Erro ao excluir agendamento.'), 'error');
        }
     }
  };

  const openWhatsApp = (booking: BookingRequest) => {
     const rawPhone = booking.customerPhone?.replace(/\D/g, '');
     if (!rawPhone || rawPhone.length < 10) {
        showToast('WhatsApp inválido para este cliente.', 'error');
        return;
     }
     const message = `Olá ${booking.customerName}, aqui é da SR Details. Sobre seu agendamento ${booking.protocol} do veículo ${booking.vehicleModel} para ${booking.date.split('-').reverse().join('/')} às ${booking.time}...`;
     window.open(`https://wa.me/55${rawPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="px-6 space-y-6">
      <header>
         <h2 className="text-xl font-black tracking-tight mb-2">Pedidos Recentes</h2>
         <p className="text-[#A7A7A3] text-sm">Gerencie todos os agendamentos.</p>
      </header>

      {/* Search and Filters */}
      <div className="space-y-4">
         <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7175]" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, veículo ou protocolo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111114] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none transition-colors shadow-inner"
            />
         </div>
         
         <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
            {filters.map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${filter === f ? 'bg-[#FFD000] text-[#050505] shadow-[0_4px_10px_rgba(255,208,0,0.2)]' : 'bg-[#111114] text-[#A7A7A3] border border-white/5'}`}
               >
                  {f}
               </button>
            ))}
         </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 mt-4">
         {getFilteredBookings().length === 0 ? (
            <p className="text-center text-[#6F7175] text-sm py-10">Nenhum pedido encontrado.</p>
         ) : getFilteredBookings().map((booking, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={booking.id} 
              className="bg-[#0B0B0D] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col"
            >
               <div className="flex justify-between items-start mb-3">
                  <div>
                     <span className="text-[10px] text-[#A7A7A3] uppercase tracking-widest font-black block mb-1">PROTOCOLO</span>
                     <span className="text-[#F4F4F2] font-black text-sm">{booking.protocol}</span>
                  </div>
                  <button 
                     onClick={() => { setSelectedOrder(booking); setShowStatusModal(true); }}
                     className="bg-[#111114] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-[#FFE066] flex items-center gap-2 hover:border-[#FFD000]/30 transition-all shadow-inner"
                  >
                     {booking.status} <ChevronDown size={14} />
                  </button>
               </div>
               
               <div className="py-3 border-t border-b border-white/5 my-3 grid gap-2">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-[#6F7175]">Cliente</span>
                     <span className="text-[#F4F4F2] font-medium">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-[#6F7175]">Veículo</span>
                     <span className="text-[#F4F4F2] font-medium">{booking.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-[#6F7175]">Serviço</span>
                     <span className="text-[#FFE066] font-black">{booking.serviceName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-[#6F7175]">Agendado para</span>
                     <span className="text-[#F4F4F2] font-bold">{booking.date.split('-').reverse().join('/')} às {booking.time}</span>
                  </div>
               </div>

               <div className="flex justify-between items-center mt-auto mb-4">
                  <span className="text-[#A7A7A3] text-xs font-medium">Valor Total</span>
                  <span className="text-[#FFE066] font-black">{formatCurrency(booking.totalPrice)}</span>
               </div>

               {expandedDetailsId === booking.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 bg-[#111114] p-3 rounded-xl border border-white/5 text-xs text-[#A7A7A3] space-y-2">
                    <p><strong className="text-[#F4F4F2]">Telefone:</strong> {booking.customerPhone}</p>
                    <p><strong className="text-[#F4F4F2]">Cor/Placa:</strong> {booking.vehicleColor} / {booking.plate || 'N/A'}</p>
                    <p><strong className="text-[#F4F4F2]">Adicionais:</strong> {booking.addOns?.map(a => a.name).join(', ') || 'Nenhum'}</p>
                    <p><strong className="text-[#F4F4F2]">Notas:</strong> {booking.notes || 'Sem observações'}</p>
                  </motion.div>
               )}

               {/* Action Buttons */}
               <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                  <button onClick={() => setExpandedDetailsId(p => p === booking.id ? null : booking.id)} className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors ${expandedDetailsId === booking.id ? 'bg-[#FFD000]/10 border-[#FFD000]/30 text-[#FFD000]' : 'bg-[#111114] border-white/5 text-[#A7A7A3] hover:text-[#F4F4F2]'}`}>
                     <Info size={16} />
                     <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Detalhes</span>
                  </button>
                  <button onClick={() => openWhatsApp(booking)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#111114] border border-white/5 text-[#A7A7A3] hover:text-[#25D366] hover:border-[#25D366]/30 transition-colors">
                     <MessageCircle size={16} />
                     <span className="text-[9px] uppercase tracking-wider font-bold mt-1">WhatsApp</span>
                  </button>
                  <button onClick={() => handleCancel(booking)} disabled={booking.status === RequestStatus.CANCELED || booking.status === RequestStatus.FINISHED} className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#111114] border border-white/5 text-[#A7A7A3] hover:text-red-500 hover:border-red-500/30 transition-colors disabled:opacity-30 disabled:pointer-events-none">
                     <XCircle size={16} />
                     <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Cancelar</span>
                  </button>
                  <button onClick={() => handleDelete(booking)} className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#111114] border border-white/5 text-[#A7A7A3] hover:text-red-600 hover:border-red-600/30 transition-colors">
                     <Trash2 size={16} />
                     <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Excluir</span>
                  </button>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Premium Status Modal */}
      <AnimatePresence>
        {showStatusModal && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusModal(false)}
              className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="fixed bottom-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[100] pointer-events-auto flex flex-col justify-end sm:justify-center p-4 max-h-[100dvh]"
            >
               <div className="bg-[#0B0B0D] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 flex flex-col max-h-[85vh] no-scrollbar">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                     <h3 className="text-lg font-black text-[#F4F4F2] tracking-tight">Alterar Status</h3>
                     <button onClick={() => setShowStatusModal(false)} className="w-8 h-8 rounded-full bg-[#111114] border border-white/5 text-[#6F7175] flex items-center justify-center hover:text-white transition-colors">
                        <X size={16} />
                     </button>
                  </div>

                  <div className="space-y-3">
                     {statusOptions.map(opt => {
                        const Icon = opt.icon;
                        const isCurrent = opt.value === selectedOrder.status;

                        return (
                           <button 
                             key={opt.value}
                             onClick={() => handleUpdateStatus(opt.value as RequestStatus)}
                             className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${isCurrent ? 'bg-[#FFD000]/10 border-[#FFD000]/30' : 'bg-[#111114] border-white/5 hover:border-white/10'}`}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${isCurrent ? 'bg-[#FFD000] border-[#FFE066] text-[#050505]' : 'bg-[#1A1810] border-white/5 text-[#A7A7A3] group-hover:text-[#F4F4F2]'}`}>
                                    <Icon size={18} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className={`text-sm font-black ${isCurrent ? 'text-[#FFE066]' : 'text-[#F4F4F2]'}`}>{opt.label}</span>
                                    <span className="text-[10px] text-[#6F7175]">{opt.desc}</span>
                                 </div>
                              </div>
                              {isCurrent && <CheckCircle2 size={18} className="text-[#FFD000]" />}
                           </button>
                        )
                     })}
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
