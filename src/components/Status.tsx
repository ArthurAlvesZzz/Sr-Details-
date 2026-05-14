import { motion } from 'motion/react';
import { Car, Clock, Calendar, CheckCircle2, Navigation, MessageCircle, Info, MapPin } from 'lucide-react';
import { View, BookingRequest, RequestStatus } from '../types.ts';
import { formatCurrency } from '../utils/pricing.ts';

interface MyRequestProps {
  request: BookingRequest | null;
  onNavigate?: (view: View, params?: { serviceId?: string }) => void;
  brand?: any;
}

export default function MyRequest({ request, onNavigate, brand }: MyRequestProps) {
  if (!request) {
    return (
      <div id="my-request-view" className="pb-[140px] pt-12 px-6 min-h-[80vh] flex flex-col justify-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#0B0B0D]/90 backdrop-blur-2xl p-8 rounded-[3rem] border border-[#FFD000]/5 shadow-2xl text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 w-full h-40 bg-gradient-to-b from-[#FFD000]/10 to-transparent pointer-events-none blur-2xl"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-[#111114] to-[#050505] rounded-[2rem] flex items-center justify-center border border-[#FFD000]/30 mx-auto mb-8 relative z-10 shadow-[0_0_30px_rgba(255,208,0,0.15)] group-hover:shadow-[0_0_40px_rgba(255,208,0,0.25)] transition-shadow">
             <div className="absolute inset-0 bg-[#FFD000] opacity-10 blur-xl rounded-full"></div>
             <Car size={36} className="text-[#FFD000] drop-shadow-[0_0_10px_rgba(255,208,0,0.5)]" />
          </div>
          
          <h2 className="text-2xl font-black text-[#F4F4F2] mb-4 tracking-tighter leading-tight relative z-10">
            Nenhum agendamento ativo.
          </h2>
          <p className="text-[#6F7175] mb-8 text-sm leading-relaxed max-w-[280px] mx-auto relative z-10">
            Escolha um serviço ou use o Scanner para encontrar o cuidado ideal para o seu veículo.
          </p>
          
          <div className="flex flex-col gap-3 relative z-10">
            <button
              onClick={() => onNavigate && onNavigate('services')}
              className="w-full bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black uppercase tracking-[2px] py-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-[0_5px_20px_rgba(255,208,0,0.2)] active:scale-95 transition-all overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out skew-x-[-25deg]"></div>
              Ver Serviços
            </button>
            <button
              onClick={() => onNavigate && onNavigate('scanner')}
              className="w-full bg-[#050505] text-[#A7A7A3] border border-white/5 font-bold uppercase tracking-[1.5px] py-4 rounded-2xl flex items-center justify-center gap-2 text-xs active:scale-95 transition-all hover:text-[#FFE066] hover:border-[#FFD000]/30 shadow-inner"
            >
              Usar Scanner
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getStatusSteps = () => {
    const steps = [
      RequestStatus.REQUESTED,
      RequestStatus.ANALYSIS,
      RequestStatus.CONFIRMED,
      RequestStatus.RECEIVED,
      RequestStatus.EXECUTING,
      RequestStatus.READY_FOR_PICKUP,
      RequestStatus.FINISHED
    ];
    
    let currentIndex = steps.indexOf(request.status);
    if(currentIndex === -1) currentIndex = 0; // fallback if somehow not found

    return steps.map((s, idx) => ({
      label: s,
      isCompleted: idx < currentIndex,
      isCurrent: idx === currentIndex,
      isFuture: idx > currentIndex
    }));
  };

  return (
    <div id="my-request-view" className="pb-[140px] pt-10 px-6 min-h-screen flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-black text-[#F4F4F2] mb-2 tracking-tighter leading-none">Minha Solicitação.</h1>
        <p className="text-[#A7A7A3] text-sm">Acompanhe seu agendamento em tempo real.</p>
      </header>

      {/* Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0B0B0D] border border-[#FFD000]/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 right-0 w-32 h-32 bg-[#FFD000]/10 blur-[40px] pointer-events-none rounded-full"></div>

        {/* Top: Protocol and Status */}
        <div className="flex justify-between items-start mb-6">
           <div>
              <span className="text-[10px] text-[#A7A7A3] font-black uppercase tracking-widest block mb-1">Protocolo</span>
              <span className="text-[#F4F4F2] font-black text-sm tracking-widest uppercase">{request.protocol}</span>
           </div>
           
           <div className="flex items-center gap-2 text-[9px] bg-[#FFD000]/10 text-[#FFD000] font-black px-3 py-1.5 rounded-full uppercase tracking-[2px] border border-[#FFD000]/30 shadow-inner">
             <span className="w-1.5 h-1.5 rounded-full bg-[#FFE066] animate-pulse shadow-[0_0_8px_rgba(255,208,0,0.8)]"></span>
             {request.status.toUpperCase()}
           </div>
        </div>

        {/* Client & Vehicle */}
        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 mb-4 shadow-inner">
           <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#A7A7A3]">Cliente</span>
              <span className="text-sm font-bold text-[#F4F4F2]">{request.customerName}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-xs text-[#A7A7A3]">Veículo</span>
              <span className="text-sm font-bold text-[#F4F4F2]">{request.vehicleModel} ({request.vehicleType})</span>
           </div>
        </div>

        {/* Service Details */}
        <div className="bg-[#111114] p-4 rounded-2xl border border-white/5 mb-4 shadow-inner">
           <span className="text-[10px] text-[#A7A7A3] uppercase tracking-[2px] font-black block mb-2">Serviço Agendado</span>
           <span className="text-[15px] font-black text-[#FFE066] block mb-1">{request.serviceName}</span>
           <span className="text-[13px] text-[#F4F4F2] font-bold block">{request.selectedPriceLabel}</span>
           
           <div className="mt-4 flex justify-between items-end border-t border-white/5 pt-3">
              <span className="text-[11px] font-bold uppercase text-[#A7A7A3] tracking-[1px]">Valor Total</span>
              <span className="text-xl font-black text-[#FFE066]">{formatCurrency(request.totalPrice)}</span>
           </div>
        </div>

        {/* Time and Place */}
        <div className="grid grid-cols-2 gap-3 mb-6">
           <div className="bg-[#111114] p-4 rounded-xl border border-white/5 shadow-inner">
              <Calendar size={14} className="text-[#FFD000] mb-2" />
              <span className="block text-[10px] text-[#A7A7A3] uppercase tracking-widest font-black mb-1">Data</span>
              <span className="block text-sm font-bold text-[#F4F4F2]">{request.date.split('-').reverse().join('/')}</span>
           </div>
           <div className="bg-[#111114] p-4 rounded-xl border border-white/5 shadow-inner">
              <Clock size={14} className="text-[#FFD000] mb-2" />
              <span className="block text-[10px] text-[#A7A7A3] uppercase tracking-widest font-black mb-1">Horário</span>
              <span className="block text-sm font-bold text-[#F4F4F2]">{request.startTime || request.time} as {request.endTime || '??:??'}</span>
           </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
           <a 
              href="https://maps.google.com/?q=SR+Details+Uberlandia" 
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#111114] border border-white/10 hover:border-[#FFD000]/40 text-[#F4F4F2] p-4 rounded-xl flex items-center justify-between font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
           >
              <div className="flex items-center gap-2">
                 <MapPin size={16} className="text-[#FFD000]" />
                 Como Chegar
              </div>
              <Navigation size={14} className="text-[#6F7175]" />
           </a>
           
           <a 
              href={`https://wa.me/55${brand?.whatsapp?.replace(/\D/g, '') || '34999999999'}?text=Olá SR Details. Meu protocolo é ${request.protocol}. Gostaria de falar sobre o meu veículo.`}
              target="_blank" 
              rel="noreferrer"
              className="w-full bg-[#111114] border border-white/10 hover:border-[#FFD000]/40 text-[#F4F4F2] p-4 rounded-xl flex items-center justify-between font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
           >
              <div className="flex items-center gap-2">
                 <MessageCircle size={16} className="text-[#FFD000]" />
                 Falar com a Equipe
              </div>
           </a>
        </div>
      </motion.div>

      {/* Timeline Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0B0B0D] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative"
      >
        <h3 className="text-xs font-black text-[#A7A7A3] uppercase tracking-[3px] mb-6 flex items-center gap-2">
           <CheckCircle2 size={16} className="text-[#FFD000]" /> Linha do Tempo
        </h3>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-[31px] top-4 bottom-4 w-px flex flex-col items-center">
            <div className="h-full w-full bg-gradient-to-b from-[#FFD000]/40 to-white/5"></div>
          </div>
          
          {getStatusSteps().map((step, i) => (
            <div key={i} className="flex items-center gap-5 relative">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center relative z-10 transition-all ${
                step.isCompleted ? 'bg-[#FFD000] shadow-[0_0_10px_rgba(255,208,0,0.4)]' : 
                step.isCurrent ? 'bg-[#FFD000] shadow-[0_0_15px_rgba(255,208,0,0.8)] border-[3px] border-[#111114] scale-125' : 
                'bg-[#111114] border border-white/10'
              }`}>
                {step.isCompleted && <CheckCircle2 size={10} className="text-[#050505]" strokeWidth={4} />}
              </div>
              
              <div className="flex flex-col">
                <span className={`text-sm transition-colors tracking-tight ${
                  step.isCompleted ? 'text-[#F4F4F2] font-semibold' : 
                  step.isCurrent ? 'text-[#FFE066] font-black' : 
                  'text-[#6F7175] font-medium'
                }`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
