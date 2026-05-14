import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Sparkles, Droplets, Shield, ChevronRight, Scan, ArrowRight, Star, Target, CheckCircle2 } from 'lucide-react';
import { View, BusinessSettings, Service } from '../types.ts';
import LocationModal from './LocationModal.tsx';
import { getPriceDisplay } from '../utils/pricing.ts';

interface HomeProps {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
  brand: BusinessSettings;
  services: Service[];
}

export default function Home({ onNavigate, brand, services }: HomeProps) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const featuredServices = services.filter(s => s.active && s.featuredOnHome);
  const premiumPackages = services.filter(s => s.active && s.categoryId === 'pacotes');

  const handleLogoClick = () => {
    if (logoClicks >= 4) {
      onNavigate('admin-login');
      setLogoClicks(0);
    } else {
      setLogoClicks(prev => prev + 1);
    }
  };

  return (
    <div id="home-view" className="pb-[140px] overflow-x-hidden">
      {/* 1. HERO PREMIUM */}
      <section id="hero" className="relative pt-12 pb-16 px-6 flex flex-col items-center text-center">
        {/* Background effects */}
        <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-[#0B0B0D] to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-[#FFD000]/5 blur-[80px] rounded-full pointer-events-none -mt-20 -mr-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-full relative z-10"
        >
          {/* Logo & Badge */}
          <div className="mb-8 flex flex-col items-center">
            {brand.logoUrl ? (
              <img onClick={handleLogoClick} src={brand.logoUrl} alt={brand.businessName} className="h-14 mb-4 relative z-10 object-contain drop-shadow-[0_0_20px_rgba(255,208,0,0.4)] cursor-pointer" />
            ) : (
              <h1 onClick={handleLogoClick} className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFE066] to-[#B8860B] tracking-tighter drop-shadow-sm mb-4 cursor-pointer select-none">{brand.businessName}</h1>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FFD000]/20 bg-[#FFD000]/5 backdrop-blur-md shadow-inner mb-6">
              <Star size={10} className="text-[#FFD000]" />
              <span className="text-[9px] font-black uppercase tracking-[3px] text-[#FFE066]">Estética Automotiva Premium</span>
            </div>
          </div>

          <h2 className="text-[2.4rem] leading-[1.05] font-black text-[#F4F4F2] tracking-tighter mb-4 max-w-[340px]">
            {brand.headline}
          </h2>

          <p className="text-[#A7A7A3] text-sm leading-relaxed max-w-[300px] mb-10">
            {brand.subheadline}
          </p>

          <div className="w-full flex flex-col gap-3">
             <button
                onClick={() => onNavigate('booking')}
                className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black uppercase tracking-[2px] text-sm overflow-hidden relative shadow-[0_10px_30px_rgba(255,208,0,0.25)] active:scale-[0.98] transition-transform group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out skew-x-[-25deg]"></div>
                Agendar agora
              </button>
              
              <button
                onClick={() => onNavigate('services')}
                className="w-full py-5 rounded-[1.5rem] bg-[#050505]/80 backdrop-blur-sm border border-white/5 text-[#A7A7A3] font-bold uppercase tracking-[2px] text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-[#111114] hover:border-[#FFD000]/30 hover:text-[#F4F4F2]"
              >
                Ver catálogo
              </button>
              
              <button
                onClick={() => onNavigate('scanner')}
                className="w-full py-4 text-[#6F7175] font-bold uppercase tracking-[2px] text-[10px] flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:text-[#FFD000] mt-2"
              >
                <Scan size={12} className="mr-1" />
                Scanner do veículo
              </button>
          </div>
        </motion.div>
      </section>

      {/* 2. DESTAQUES RÁPIDOS */}
      {featuredServices.length > 0 && (
         <section className="mb-16">
            <div className="flex overflow-x-auto gap-4 px-6 pb-6 snap-x hide-scrollbar">
               {featuredServices.map(highlight => {
                 return (
                 <button 
                   key={highlight.id} 
                   onClick={() => onNavigate('services')}
                   className="min-w-[200px] snap-center bg-[#0B0B0D] border border-white/5 hover:border-[#FFD000]/30 rounded-[1.5rem] p-5 flex flex-col relative overflow-hidden text-left shadow-lg active:scale-95 transition-all group"
                 >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#FFD000] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <h4 className="text-[#F4F4F2] font-black text-sm tracking-tight mb-2 pl-2">{highlight.name}</h4>
                    <p className="text-[#FFD000] text-[10px] font-bold tracking-widest uppercase pl-2">{getPriceDisplay(highlight.priceOptions || [])}</p>
                    <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#111114] flex items-center justify-center border border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                       <ChevronRight size={12} className="text-[#FFD000]" />
                    </div>
                 </button>
                 );
               })}
            </div>
         </section>
      )}

      {/* 3. CARD DE ENDEREÇO CLICÁVEL */}
      <section className="px-6 mb-16">
        <button 
          onClick={() => setIsLocationModalOpen(true)}
          className="w-full relative bg-[#0B0B0D] p-1 rounded-[1.5rem] overflow-hidden group active:scale-[0.98] transition-all text-left shadow-lg border border-white/5 hover:border-[#FFD000]/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD000]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#050505] px-6 py-5 rounded-[1.25rem] flex items-center justify-between gap-4 relative z-10 shadow-inner">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111114] to-[#050505] flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,208,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,208,0,0.3)] transition-shadow">
                  <MapPin size={20} className="text-[#FFD000]" />
               </div>
               <div>
                  <div className="text-[10px] text-[#A7A7A3] font-black uppercase tracking-[3px] mb-1">{brand.businessName}</div>
                  <div className="text-[13px] text-[#F4F4F2] font-bold tracking-tight mb-1">{brand.address}</div>
                  <div className="text-[9px] text-[#FFD000] uppercase tracking-[2px] font-black">Toque para ver rota</div>
               </div>
            </div>
            <ChevronRight size={18} className="text-[#6F7175] group-hover:text-[#FFD000] transition-colors shrink-0" />
          </div>
        </button>
      </section>

      {/* 4. ESCOLHA PELO OBJETIVO */}
      <section className="px-6 mb-16 relative z-10">
         <div className="mb-6">
            <h3 className="text-[2rem] leading-[1.1] font-black text-[#F4F4F2] tracking-tighter mb-3">
               Escolha pelo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE066] to-[#B8860B]">objetivo</span>
            </h3>
         </div>

         <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FFD000]/5 blur-[60px] rounded-full pointer-events-none"></div>

            {[
              { id: 'lavagem', label: 'Quero uma lavagem completa', icon: Droplets },
              { id: 'interior', label: 'Quero renovar o interior', icon: Sparkles },
              { id: 'pintura', label: 'Quero proteger a pintura', icon: Shield },
              { id: 'venda', label: 'Quero preparar para venda', icon: Target },
              { id: 'pacotes', label: 'Quero um pacote premium', icon: CheckCircle2 },
              { id: 'moto', label: 'Tenho uma moto', icon: Scan },
            ].map((need, idx) => (
              <button 
                key={idx}
                onClick={() => onNavigate('scanner')}
                className="bg-[#0B0B0D]/90 backdrop-blur-md border border-white/5 hover:border-[#FFD000]/30 p-5 rounded-[1.5rem] text-left flex flex-col gap-4 active:scale-95 transition-all duration-300 group shadow-lg hover:shadow-[0_10px_30px_rgba(255,208,0,0.15)] relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFD000]/5 blur-xl rounded-full -mr-8 -mt-8 group-hover:bg-[#FFD000]/20 transition-colors pointer-events-none"></div>
                 
                 <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#111114] to-[#050505] flex items-center justify-center border border-white/5 group-hover:border-[#FFD000]/30 transition-colors shadow-inner relative z-10">
                    <need.icon size={16} className="text-[#6F7175] group-hover:text-[#FFE066] transition-colors drop-shadow-sm" />
                 </div>
                 
                 <span className="text-xs font-bold text-[#F4F4F2] leading-snug group-hover:text-[#FFE066] transition-colors relative z-10">{need.label}</span>
              </button>
            ))}
         </div>
      </section>

      {/* 5. PACOTES EM DESTAQUE */}
      {premiumPackages.length > 0 && (
         <section className="mb-16">
            <div className="px-6 mb-6">
               <h3 className="text-2xl font-black text-[#F4F4F2] tracking-tight mb-2">Pacotes Premium</h3>
               <p className="text-[#A7A7A3] text-sm leading-relaxed pr-8">Soluções completas para renovar e valorizar.</p>
            </div>

            <div className="flex overflow-x-auto gap-4 px-6 pb-6 pt-2 snap-x hide-scrollbar">
               {premiumPackages.map(service => (
                 <div key={service.id} className="min-w-[260px] snap-center bg-[#0B0B0D] border border-[#FFD000]/10 rounded-[1.5rem] p-5 flex flex-col relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 bg-[#FFD000]/10 blur-xl rounded-full pointer-events-none"></div>
                    <h4 className="text-[#F4F4F2] font-black text-[15px] tracking-tight mb-2 pl-2 border-l-2 border-[#FFD000]">{service.name}</h4>
                    <p className="text-[#6F7175] text-xs mb-6 pl-2 flex-1">{service.shortDescription}</p>
                    <button 
                      onClick={() => onNavigate('booking')}
                      className="w-full py-3 bg-[#050505] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[2px] text-[#FFD000] hover:border-[#FFD000]/30 hover:bg-[#FFD000]/5 transition-all"
                    >
                      Ver Detalhes
                    </button>
                 </div>
               ))}
            </div>
         </section>
      )}

      {/* 6. CTA FINAL */}
      <section className="px-6 mb-8 text-center bg-gradient-to-t from-[#0B0B0D] to-transparent pt-10 pb-4 relative z-10">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-[#FFD000]/10 blur-[60px] rounded-full pointer-events-none -mb-32"></div>
         <h2 className="text-[2rem] leading-[1.1] font-black text-[#F4F4F2] tracking-tighter mb-4 relative z-10">
            Agende pelo app em poucos passos
         </h2>
         <p className="text-[#A7A7A3] text-sm mb-8 max-w-[280px] mx-auto relative z-10">
            Escolha o serviço, selecione data e horário e acompanhe o status sem depender do WhatsApp.
         </p>

         <button
            onClick={() => onNavigate('booking')}
            className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black uppercase tracking-[2px] text-sm shadow-[0_10px_30px_rgba(255,208,0,0.25)] active:scale-[0.98] transition-transform relative z-10"
         >
            Começar agendamento
         </button>
      </section>

      <div className="flex justify-center mt-6 mb-10 relative z-10">
         <button 
           onClick={() => onNavigate('admin-login')}
           className="text-[10px] text-[#6F7175] uppercase tracking-[2px] font-bold hover:text-[#FFD000] transition-colors"
         >
           Acesso administrativo
         </button>
      </div>

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        brand={brand}
      />
    </div>
  );
}
