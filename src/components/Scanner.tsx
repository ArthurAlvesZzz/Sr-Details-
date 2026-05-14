import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageCircle, RefreshCcw, ScanLine, ArrowRight, ChevronLeft } from 'lucide-react';
import { View, Service } from '../types.ts';
import { getPriceDisplay } from '../utils/pricing.ts';
import { safeText } from '../utils/safeData.ts';

interface ScannerProps {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
  services: Service[];
  brand: any;
}

export default function Scanner({ onNavigate, services, brand }: ScannerProps) {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState('');
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('');

  const mapRecommendation = () => {
    let rec = 'lavagem-tecnica';
    const safeObj = safeText(objective);
    const safeLevel = safeText(level);
    const safeVeh = safeText(vehicle);

    if (safeObj.includes('Manutenção')) rec = 'lavagem-manutencao';
    else if (safeObj.includes('Lavagem completa')) rec = 'lavagem-detalhada';
    else if (safeObj.includes('Interior sujo')) rec = 'interna-detalhada';
    else if (safeObj.includes('Mau cheiro') || safeObj.includes('Bancos manchados')) rec = 'higienizacao-tecidos';
    else if (safeObj.includes('Pintura sem brilho')) rec = 'polimento-tecnico';
    else if (safeObj.includes('proteger a pintura')) rec = 'vitrificacao';
    else if (safeObj.includes('venda')) rec = 'sr-start';
    else if (safeObj.includes('Pacote completo')) rec = 'sr-pro';
    else if (safeObj.includes('Máxima proteção') || safeLevel.includes('Máxima proteção')) rec = 'sr-diamond';
    else if (safeObj.includes('Motor')) rec = 'tratamento-motor';
    
    // level overrides
    if (rec === 'sr-start' || rec === 'lavagem-detalhada' || rec === 'lavagem-tecnica') {
        if (safeLevel === 'Premium') rec = 'sr-premium';
        if (safeLevel === 'Máxima proteção') rec = 'sr-diamond';
        if (safeLevel === 'Intermediário' && safeObj.includes('venda')) rec = 'sr-plus';
    }
    
    // vehicle override
    if (safeVeh === 'Moto') {
        rec = (safeObj.includes('Pacote') || safeLevel === 'Premium' || safeLevel === 'Máxima proteção') ? 'pacote-sr-motos' : 'lavagem-moto';
    }
    
    return rec;
  };

  const handleNextStep = (value: string) => {
    if (step === 1) setVehicle(value);
    if (step === 2) setObjective(value);
    if (step === 3) {
       setLevel(value);
    }
    setStep(prev => prev + 1);
  };

  const selectedServiceObj = useMemo(() => {
     if (step === 4) {
        const id = mapRecommendation();
        const found = services.find(s => s.id === id);
        
        // If the recommended service is inactive or not found, fallback to the first available active service
        if (!found || !found.active) {
            return services.find(s => s.active) || null;
        }
        
        return found;
     }
     return null;
  }, [step, vehicle, objective, level, services]);

  const handleBookRecommendation = () => {
     if(selectedServiceObj) {
        onNavigate('booking', { serviceId: selectedServiceObj.id });
     }
  };

  return (
    <div id="diagnostic-view" className="pb-[140px] pt-8 px-6 min-h-screen flex flex-col">
      <header className="mb-8">
        {step > 1 && step < 4 && (
          <button onClick={() => setStep(p => p - 1)} className="flex items-center gap-1 text-[#FFD000] text-xs font-black uppercase tracking-[2px] mb-4 hover:text-[#FFE066] transition-colors">
             <ChevronLeft size={14} /> Voltar
          </button>
        )}
        <h1 className="text-3xl font-black text-[#F4F4F2] mb-3 tracking-tight">Scanner SR Details</h1>
        <p className="text-[#A7A7A3] text-sm leading-relaxed">Descubra o serviço ideal para o seu veículo.</p>
        
        {step < 4 && (
           <div className="mt-6 flex h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-[#FFD000]" 
               initial={{ width: 0 }} 
               animate={{ width: `${(step / 3) * 100}%` }}
               transition={{ ease: "easeInOut" }}
             />
           </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-4">
             <h2 className="text-[11px] font-black text-[#A7A7A3] uppercase tracking-[3px] mb-4">Qual é o seu veículo?</h2>
             {['Popular', 'SUV', 'Caminhonete', 'Moto'].map(v => (
                <button
                  key={v}
                  onClick={() => handleNextStep(v)}
                  className="w-full text-left p-5 rounded-[1.5rem] bg-[#0B0B0D] border border-white/5 hover:border-[#FFD000]/40 transition-all active:scale-95 group flex items-center justify-between shadow-inner"
                >
                   <span className="text-[#F4F4F2] font-semibold text-[13px] tracking-tight">{v}</span>
                   <ArrowRight size={14} className="text-[#6F7175] group-hover:text-[#FFD000]" />
                </button>
             ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-3">
             <h2 className="text-[11px] font-black text-[#A7A7A3] uppercase tracking-[3px] mb-4">O que te incomoda mais?</h2>
             {[
                'Lavagem completa', 'Interior sujo', 'Mau cheiro', 'Bancos manchados',
                'Pintura sem brilho', 'Quero proteger a pintura', 'Preparar para venda',
                'Pacote completo', 'Motor sujo', 'Manutenção rápida'
             ].map(v => (
                <button
                  key={v}
                  onClick={() => handleNextStep(v)}
                  className="w-full text-left p-4 rounded-2xl bg-[#0B0B0D] border border-white/5 hover:border-[#FFD000]/40 transition-all active:scale-95 group shadow-inner flex justify-between items-center"
                >
                   <span className="text-[#F4F4F2] text-xs font-semibold">{v}</span>
                   <ArrowRight size={14} className="text-[#6F7175] group-hover:text-[#FFD000] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
             ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-4">
             <h2 className="text-[11px] font-black text-[#A7A7A3] uppercase tracking-[3px] mb-4">Nível de cuidado desejado</h2>
             {['Básico', 'Intermediário', 'Premium', 'Máxima proteção'].map(v => (
                <button
                  key={v}
                  onClick={() => handleNextStep(v)}
                  className="w-full text-left p-5 rounded-[1.5rem] bg-[#0B0B0D] border border-white/5 hover:border-[#FFD000]/40 transition-all active:scale-95 group flex items-center justify-between shadow-inner"
                >
                   <span className="text-[#F4F4F2] font-semibold text-[13px] tracking-tight">{v}</span>
                   <ArrowRight size={14} className="text-[#6F7175] group-hover:text-[#FFD000]" />
                </button>
             ))}
          </motion.div>
        )}

        {step === 4 && selectedServiceObj && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="flex-1">
             <div className="bg-[#0B0B0D]/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-[#FFD000]/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFD000]/10 blur-[40px] pointer-events-none"></div>
               
               <div className="text-center mb-6 relative z-10 pt-4">
                  <div className="inline-flex items-center gap-2 mb-4 bg-[#FFD000]/10 border border-[#FFD000]/20 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD000] shadow-[0_0_8px_rgba(255,208,0,0.8)] animate-pulse"></span>
                    <span className="text-[#FFD000] text-[8px] font-black uppercase tracking-[3px]">Recomendação SR Details</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-[#F4F4F2] mb-2 leading-tight">
                    {selectedServiceObj.name}
                  </h3>
                  
                  <p className="text-[#A7A7A3] text-xs">
                    {selectedServiceObj.shortDescription}
                  </p>
               </div>

               <div className="flex flex-col gap-2 mb-6">
                  <div className="flex justify-between items-center bg-[#111114] p-4 rounded-xl border border-white/5">
                     <span className="font-black text-[#FFE066] text-lg">{getPriceDisplay(selectedServiceObj.priceOptions || [])}</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#111114] p-4 rounded-xl border border-white/5">
                     <span className="text-[10px] text-[#A7A7A3] uppercase tracking-widest font-black">Duração</span>
                     <span className="font-bold text-[#F4F4F2] text-sm">{selectedServiceObj.deliveryLabel}</span>
                  </div>
               </div>

               <div className="space-y-3 relative z-10">
                 <button
                   onClick={handleBookRecommendation}
                   className="w-full bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black py-4 rounded-2xl shadow-[0_5px_20px_rgba(255,208,0,0.2)] flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-[2px]"
                 >
                   Prosseguir com este serviço
                 </button>
                 
                 <button
                   onClick={() => setStep(1)}
                   className="w-full py-4 text-[#6F7175] text-[10px] font-black uppercase tracking-[3px] flex items-center justify-center gap-2 hover:text-[#FFE066] transition-colors"
                 >
                   <RefreshCcw size={14} /> Nova Avaliação
                 </button>
                 
                 <a
                   href={`https://wa.me/55${brand?.whatsapp?.replace(/\D/g, '') || '34999999999'}`}
                   target="_blank"
                   rel="noreferrer"
                   className="w-full pt-4 flex items-center justify-center gap-2 text-[10px] text-[#A7A7A3] font-bold hover:text-[#F4F4F2] transition-colors"
                 >
                   <MessageCircle size={14} /> Tirar Dúvida no WhatsApp
                 </a>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
