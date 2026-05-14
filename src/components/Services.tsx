import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Check, Search, Plus, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { ADDONS } from '../constants.ts';
import { View, Service } from '../types.ts';
import { formatCurrency, getPriceDisplay, getActivePriceOptions } from '../utils/pricing.ts';

const safeText = (value: unknown) => String(value ?? '');

const normalizeText = (value: unknown) =>
  safeText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const safeArray = <T,>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

interface ServicesProps {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
  services: Service[];
}

export default function Services({ onNavigate, services }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceParams, setSelectedServiceParams] = useState<Service | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(
      services
        .filter(s => s?.active)
        .map(s => safeText(s.categoryName).trim())
        .filter(Boolean)
    );
    return ['Todos', ...Array.from(cats), 'Individuais'];
  }, [services]);

  const filteredServices = useMemo(() => {
    let result = services.filter(s => s?.active);

    if (activeCategory !== 'Todos' && activeCategory !== 'Individuais') {
      result = result.filter(s => safeText(s.categoryName) === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const q = normalizeText(searchQuery);

      result = result.filter((service) => {
        const searchableText = [
          service.name,
          service.shortDescription,
          service.fullDescription,
          service.categoryName,
          service.slug,
          ...safeArray(service.benefits),
          ...safeArray(service.includes),
          ...safeArray(service.recommendedFor),
          ...safeArray(service.priceOptions).map(p => p.label)
        ].map(normalizeText).join(' ');

        return searchableText.includes(q);
      });
    }

    return [...result].sort((a, b) => {
      const orderA = Number(a.displayOrder ?? 9999);
      const orderB = Number(b.displayOrder ?? 9999);
      return orderA - orderB;
    });
  }, [activeCategory, searchQuery, services]);

  const handleSelectService = (serviceId: string) => {
    onNavigate('booking', { serviceId });
  };

  return (
    <div id="services-view" className="pb-[140px] pt-8 px-6 min-h-screen">
      <header className="mb-6 relative z-10">
        <h1 className="text-3xl font-black text-[#F4F4F2] mb-3 tracking-tight">Catálogo SR Details</h1>
        <p className="text-[#A7A7A3] text-sm leading-relaxed">
          Escolha o serviço ideal para o seu veículo e agende direto pelo app.
        </p>
      </header>

      {/* Busca */}
      <div className="relative mb-6 z-10">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className="text-[#6F7175]" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar serviço, pacote ou cuidado..." 
          className="w-full bg-[#0B0B0D] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[13px] text-[#F4F4F2] font-medium focus:outline-none focus:border-[#FFD000]/50 focus:ring-1 focus:ring-[#FFD000]/50 transition-all placeholder:text-[#6F7175] shadow-inner"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2 z-10 relative">
         {categories.map((cat, i) => {
            const isActive = activeCategory === cat;
            return (
              <button 
                key={i} 
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${isActive ? 'bg-[#FFD000] text-[#050505] shadow-[0_0_15px_rgba(255,208,0,0.3)]' : 'bg-[#111114] text-[#A7A7A3] border border-white/5 hover:border-[#FFD000]/30'}`}
              >
                 {cat}
              </button>
            )
         })}
      </div>

      <div className="space-y-6 relative z-10">
        {activeCategory === 'Individuais' ? (
          (() => {
            const filteredAddons = ADDONS.filter(addon => {
               if (!searchQuery.trim()) return true;
               return normalizeText(addon.name).includes(normalizeText(searchQuery));
            });
            if (filteredAddons.length === 0) {
              return (
                <div className="bg-[#0B0B0D] border border-white/5 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-[#111114] rounded-full flex items-center justify-center mb-4 border border-white/5 text-[#6F7175]">
                     <Search size={24} />
                   </div>
                   <p className="text-[#F4F4F2] font-black text-lg mb-2">Nenhum serviço encontrado</p>
                   <p className="text-[#A7A7A3] text-sm">Tente ajustar sua busca ou categoria.</p>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4">
                 {filteredAddons.map((addon) => (
                   <div key={addon.id} className="bg-[#0B0B0D] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                     <div>
                        <span className="text-[10px] text-[#FFD000] uppercase font-black tracking-widest block mb-1">Individual</span>
                        <h4 className="text-[#F4F4F2] font-bold text-sm">{safeText(addon.name)}</h4>
                     </div>
                     <div className="text-right">
                        <span className="text-xs text-[#6F7175] block mb-1">Valor</span>
                        <span className="text-[#FFE066] font-black text-sm">{formatCurrency(addon.price)}</span>
                     </div>
                   </div>
                 ))}
              </div>
            );
          })()
        ) : services.length === 0 ? (
          <div className="bg-[#0B0B0D] border border-white/5 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-[#111114] rounded-full flex items-center justify-center mb-4 border border-white/5 text-[#6F7175]">
               <Search size={24} />
             </div>
             <p className="text-[#F4F4F2] font-black text-lg mb-2">Catálogo indisponível no momento.</p>
             <p className="text-[#A7A7A3] text-sm">Entre em contato com a SR Details ou acesse o painel para configurar o catálogo.</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-[#0B0B0D] border border-white/5 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-[#111114] rounded-full flex items-center justify-center mb-4 border border-white/5 text-[#6F7175]">
               <Search size={24} />
             </div>
             <p className="text-[#F4F4F2] font-black text-lg mb-2">Nenhum serviço encontrado</p>
             <p className="text-[#A7A7A3] text-sm">Tente ajustar sua busca ou categoria.</p>
          </div>
        ) : (
          filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0B0B0D]/90 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative transition-transform duration-300 hover:border-[#FFD000]/30"
            >
              <div className="p-7 relative z-10">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div>
                     <span className="text-[9px] text-[#FFD000] font-black uppercase tracking-[3px] block mb-2">{safeText(service.categoryName) || 'Serviço'}</span>
                     <h3 className="text-[1.35rem] font-black text-[#F4F4F2] tracking-tighter leading-tight">
                       {safeText(service.name) || 'Serviço sem nome'}
                     </h3>
                  </div>
                  {(service as any).badge && (
                    <span className="relative text-[8px] bg-[#FFD000]/10 text-[#FFD000] font-black px-3 py-1.5 rounded-full uppercase tracking-[2px] border border-[#FFD000]/30 shrink-0 text-center">
                      {(service as any).badge}
                    </span>
                  )}
                </div>
                
                <p className="text-[#A7A7A3] text-[13px] mb-5 leading-relaxed">
                  {safeText(service.shortDescription) || 'Descrição não informada.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                   {safeArray(service.benefits).map((ben, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-[#111114] border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest text-[#6F7175]">
                         <Check size={10} className="text-[#FFD000]" />
                         {safeText(ben)}
                      </span>
                   ))}
                </div>

                <div className="flex items-center justify-between bg-[#050505] p-4 rounded-[1.25rem] border border-white/5 mb-6">
                    <div className="flex flex-col">
                       <span className="text-xl font-black text-[#FFE066] tracking-tighter">
                          {getPriceDisplay(safeArray(service.priceOptions))}
                       </span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] text-[#A7A7A3] uppercase tracking-[2px] font-black mb-1 flex items-center justify-center gap-1"><Clock size={10}/> Duração</span>
                       <span className="text-[13px] font-bold text-[#F4F4F2]">
                          {safeText(service.deliveryLabel) || 'Consultar duração'}
                       </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                   <button
                    onClick={() => handleSelectService(service.id)}
                    className="flex-1 bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black py-4 rounded-[1.25rem] text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_5px_20px_rgba(255,208,0,0.2)]"
                   >
                     Selecionar <ArrowRight size={14}/>
                   </button>
                   
                   <button
                    onClick={() => setSelectedServiceParams(service)}
                    className="flex-1 bg-[#111114] text-[#F4F4F2] font-black py-4 rounded-[1.25rem] text-[10px] uppercase tracking-[2px] flex items-center justify-center border border-white/10 hover:border-[#FFD000]/40 active:scale-95 transition-all"
                   >
                     Ver detalhes
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
         {selectedServiceParams && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-6"
            >
               <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full sm:max-w-md bg-[#0B0B0D] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
               >
                  <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-[#050505] relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/10 blur-2xl rounded-full pointer-events-none"></div>
                     <div>
                        <span className="text-[10px] text-[#FFD000] font-black uppercase tracking-[3px] block mb-1">{safeText(selectedServiceParams.categoryName) || 'Serviço'}</span>
                        <h2 className="text-xl font-black text-[#F4F4F2] tracking-tighter">{safeText(selectedServiceParams.name) || 'Serviço sem nome'}</h2>
                     </div>
                     <button 
                        onClick={() => setSelectedServiceParams(null)}
                        className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center border border-white/10 text-[#6F7175] hover:text-[#F4F4F2] active:scale-95 transition-all relative z-10"
                     >
                        <X size={18} />
                     </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto hide-scrollbar flex-1 relative">
                     <p className="text-[#A7A7A3] text-sm leading-relaxed mb-6">
                        {safeText(selectedServiceParams.shortDescription) || 'Descrição não informada.'}
                     </p>
                     
                     <div className="mb-6">
                        <h4 className="text-[11px] uppercase font-black tracking-widest text-[#6F7175] mb-3 flex items-center gap-2">
                           <ShieldCheck size={14} className="text-[#FFD000]" /> 
                           O que está incluso
                        </h4>
                        <ul className="space-y-3">
                           {safeArray(selectedServiceParams.includes).length > 0 ? safeArray(selectedServiceParams.includes).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                 <div className="min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#FFD000]/10 mt-0.5">
                                    <Check size={10} className="text-[#FFD000]" />
                                 </div>
                                 <span className="text-sm font-medium text-[#F4F4F2] leading-snug">{safeText(item)}</span>
                              </li>
                           )) : (
                              <li className="text-sm font-medium text-[#A7A7A3]">Nenhum item informado.</li>
                           )}
                        </ul>
                     </div>

                     <div className="mb-8">
                        <h4 className="text-[11px] uppercase font-black tracking-widest text-[#6F7175] mb-3 flex items-center gap-2">
                           <Tag size={14} className="text-[#FFD000]" /> 
                           Tabela de Preços
                        </h4>
                        <div className="space-y-2">
                           {getActivePriceOptions(safeArray(selectedServiceParams.priceOptions)).map((p, idx) => (
                              <div key={p.id || idx} className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                                 <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-[#F4F4F2]">{safeText(p.label)}</span>
                                    {p.sublabel && <span className="text-[10px] text-[#A7A7A3] mt-0.5 uppercase tracking-widest">{safeText(p.sublabel)}</span>}
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[15px] font-black text-[#FFE066]">{formatCurrency(p.price || 0)}</span>
                                    {p.installmentLabel && (
                                       <span className="block text-[9px] text-[#A7A7A3] mt-0.5">{safeText(p.installmentLabel)}</span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-6 border-t border-white/5 bg-[#050505]">
                     <button
                        onClick={() => {
                           handleSelectService(selectedServiceParams.id);
                           setSelectedServiceParams(null);
                        }}
                        className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black uppercase tracking-[2px] text-sm shadow-[0_10px_30px_rgba(255,208,0,0.25)] active:scale-[0.98] transition-transform"
                     >
                        Agendar este serviço
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
