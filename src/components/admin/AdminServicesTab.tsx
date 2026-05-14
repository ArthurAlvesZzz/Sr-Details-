import React, { useState } from 'react';
import { Service } from '../../types.ts';
import { Search, Plus, Edit2, Shield, Settings2, ArrowLeft, Save, HelpCircle, X, Trash2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './ToastProvider';
import { formatCurrency, getPriceDisplay } from '../../utils/pricing.ts';
import { useData } from '../../providers/DataProvider.tsx';
import { getFirebaseFriendlyError } from '../../utils/firebaseErrors';

interface AdminServicesTabProps {
  services: Service[];
  setServices: any;
}

const FILTERS = ['Todos', 'Lavagens', 'Motos', 'Interior', 'Motor', 'Pintura', 'Proteção', 'Pacotes', 'Serviços Individuais', 'Ativos', 'Inativos'];

export default function AdminServicesTab({ services, setServices }: AdminServicesTabProps) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [editingService, setEditingService] = useState<Service | null | 'new'>(null);
  
  const filtered = services.filter(s => {
     if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.categoryName.toLowerCase().includes(search.toLowerCase())) return false;
     
     if (activeFilter === 'Ativos') return s.active;
     if (activeFilter === 'Inativos') return !s.active;
     if (activeFilter !== 'Todos') {
        return s.categoryName.toLowerCase() === activeFilter.toLowerCase();
     }
     
     return true;
  });

  const handleSaveService = async (e: React.FormEvent) => {
     e.preventDefault();
     const fd = new FormData(e.target as HTMLFormElement);
     
     const updatedService: Partial<Service> = {
        name: fd.get('name') as string,
        categoryName: fd.get('categoryName') as string,
        categoryId: (fd.get('categoryName') as string).toLowerCase().replace(/[^a-z]/g, ''),
        shortDescription: fd.get('shortDescription') as string,
        fullDescription: fd.get('fullDescription') as string,
        durationMinutes: parseInt(fd.get('durationMinutes') as string) || 0,
        durationDays: parseInt(fd.get('durationDays') as string) || 0,
        deliveryLabel: fd.get('deliveryLabel') as string,
        featuredOnHome: fd.get('featuredOnHome') === 'on',
        availableInScanner: fd.get('availableInScanner') === 'on',
        availableForBooking: fd.get('availableForBooking') === 'on',
        active: fd.get('active') === 'on',
        schedulingMode: parseInt(fd.get('durationDays') as string) > 0 ? 'days' : 'hours',
        requiresManualApproval: parseInt(fd.get('durationDays') as string) > 0,
     };

     const oldOptions = editingService !== 'new' && editingService ? editingService.priceOptions : [];
     const newOptions: import('../../types.ts').PriceOption[] = [];
     for(let i = 0; i < 20; i++) {
        if(fd.has(`priceId_${i}`)) {
           newOptions.push({
              id: fd.get(`priceId_${i}`) as string,
              label: fd.get(`priceLabel_${i}`) as string,
              price: parseFloat(fd.get(`priceValue_${i}`) as string) || 0,
              active: true,
              installmentLabel: oldOptions && oldOptions[i] ? oldOptions[i].installmentLabel : ''
           });
        }
     }
     
     if (newOptions.length > 0) {
        updatedService.priceOptions = newOptions;
     }

     try {
       const { db } = await import('../../lib/firebase');
       const { doc, setDoc, updateDoc } = await import('firebase/firestore');

       if (editingService === 'new') {
          const newId = 's_' + Math.random().toString(36).substr(2, 9);
          const newRecord: Service = {
             id: newId,
             name: updatedService.name!,
             slug: updatedService.name!.toLowerCase().replace(/\s+/g, '-'),
             categoryId: updatedService.categoryId!,
             categoryName: updatedService.categoryName!,
             shortDescription: updatedService.shortDescription!,
             fullDescription: updatedService.fullDescription!,
             includes: ['Limpeza Padrão'],
             benefits: ['Brilho'],
             recommendedFor: ['Todos os veículos'],
             priceOptions: updatedService.priceOptions || [{ id: '1', label: 'Padrão', price: 100, active: true }],
             addOnsAllowed: false,
             allowedAddOnIds: [],
             durationMinutes: updatedService.durationMinutes || 0,
             durationDays: updatedService.durationDays || 0,
             deliveryLabel: updatedService.deliveryLabel!,
             schedulingMode: updatedService.schedulingMode as 'days' | 'hours',
             requiresManualApproval: updatedService.requiresManualApproval!,
             imageUrl: '',
             icon: '',
             active: updatedService.active || false,
             featuredOnHome: updatedService.featuredOnHome || false,
             availableForBooking: updatedService.availableForBooking || false,
             availableInScanner: updatedService.availableInScanner || false,
             displayOrder: services.length,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'services', newId), newRecord);
          showToast('Serviço criado com sucesso.', 'success');
       } else {
          await updateDoc(doc(db, 'services', (editingService as Service).id), updatedService);
          showToast('Serviço atualizado com sucesso.', 'success');
       }
       
       setEditingService(null);
     } catch (err) {
       console.error(err);
       showToast(getFirebaseFriendlyError(err, 'Erro ao salvar serviço.'), 'error');
     }
  };

  const handleToggleActive = async (id: string) => {
     if (!window.confirm(`Deseja alterar a visibilidade deste serviço?`)) return;
     const service = services.find(s => s.id === id);
     if (!service) return;
     
     try {
       const { db } = await import('../../lib/firebase');
       const { doc, updateDoc } = await import('firebase/firestore');
       await updateDoc(doc(db, 'services', id), {
         availableForBooking: !service.availableForBooking,
         active: !service.active
       });
       showToast('Status modificado com sucesso.', 'info');
     } catch (err) {
       console.error(err);
       showToast(getFirebaseFriendlyError(err, 'Erro ao alterar status.'), 'error');
     }
  };

  const handleRestoreCatalog = async () => {
    if (!window.confirm('Tem certeza? Isso irá cadastrar no Firebase todos os 35 serviços base da SR Details se não existirem.')) return;
    try {
      const { seedFirebaseIfEmpty } = await import('../../seedCatalog');
      await seedFirebaseIfEmpty();
      showToast('Catálogo base inicializado.', 'success');
    } catch (err) {
      console.error(err);
      showToast(getFirebaseFriendlyError(err, 'Erro ao restaurar catálogo.'), 'error');
    }
  };

  if (editingService) {
     const isNew = editingService === 'new';
     const s = isNew ? {} as Partial<Service> : editingService as Service;
     
     return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 space-y-6">
           <header className="flex items-center gap-4 mb-6">
              <button type="button" onClick={() => setEditingService(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                 <ArrowLeft size={18} />
              </button>
              <div>
                 <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">{isNew ? 'Novo Serviço' : 'Editar Serviço'}</h2>
                 <p className="text-xs text-[#A7A7A3]">Configure os detalhes.</p>
              </div>
           </header>

           <form onSubmit={handleSaveService} className="space-y-6">
              <div className="space-y-4">
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">1. Informações Principais</h3>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Nome</label>
                    <input name="name" defaultValue={s.name} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Categoria</label>
                    <input name="categoryName" defaultValue={s.categoryName} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Descrição Curta</label>
                    <textarea name="shortDescription" defaultValue={s.shortDescription} rows={2} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Descrição Completa</label>
                    <textarea name="fullDescription" defaultValue={s.fullDescription} rows={4} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">5. Duração e Entrega</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Minutos</label>
                       <input type="number" name="durationMinutes" defaultValue={s.durationMinutes} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Dias</label>
                       <input type="number" name="durationDays" defaultValue={s.durationDays} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Label Entrega (Ex: "1h 30m" ou "Entrega em 4 horas")</label>
                    <input name="deliveryLabel" defaultValue={s.deliveryLabel} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">Preços e Opções</h3>
                 {(s.priceOptions || [{id: '1', label: 'Padrão', price: 0, active: true}]).map((opt, idx) => (
                    <div key={opt.id || idx} className="grid grid-cols-2 gap-4 bg-[#111114] border border-white/5 p-4 rounded-2xl">
                       <input type="hidden" name={`priceId_${idx}`} value={opt.id || idx} />
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider mb-2 block">Categoria / Nome</label>
                          <input name={`priceLabel_${idx}`} defaultValue={opt.label} className="w-full bg-[#050505] border border-white/5 rounded-xl p-3 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider mb-2 block">Valor (R$)</label>
                          <input type="number" step="0.01" name={`priceValue_${idx}`} defaultValue={opt.price} className="w-full bg-[#050505] border border-white/5 rounded-xl p-3 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                    </div>
                 ))}
                 <p className="text-[10px] text-[#A7A7A3] mt-2">Dica: Edições estruturais (adicionar/remover categorias) através do código na v1.0. Aqui você pode alterar os valores e nomes das opções atuais.</p>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">6. Exibição no App</h3>
                 
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-[#111114] border border-white/5 rounded-2xl p-4">
                       <div>
                          <h4 className="text-sm font-bold text-[#F4F4F2]">Ativo</h4>
                          <p className="text-xs text-[#A7A7A3]">Serviço visível para clientes</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="active" defaultChecked={isNew ? true : s.active} className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#050505] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD000]"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between bg-[#111114] border border-white/5 rounded-2xl p-4">
                       <div>
                          <h4 className="text-sm font-bold text-[#F4F4F2]">Agendável</h4>
                          <p className="text-xs text-[#A7A7A3]">Disponível no fluxo de agendamento</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="availableForBooking" defaultChecked={isNew ? true : s.availableForBooking} className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#050505] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD000]"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between bg-[#111114] border border-white/5 rounded-2xl p-4">
                       <div>
                          <h4 className="text-sm font-bold text-[#F4F4F2]">Destaque na Home</h4>
                          <p className="text-xs text-[#A7A7A3]">Aparece na primeira seção de destaques rápidos</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="featuredOnHome" defaultChecked={s.featuredOnHome} className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#050505] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD000]"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between bg-[#111114] border border-white/5 rounded-2xl p-4">
                       <div>
                          <h4 className="text-sm font-bold text-[#F4F4F2]">Mostrar no Scanner</h4>
                          <p className="text-xs text-[#A7A7A3]">Pode ser recomendado pelo Scanner</p>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="availableInScanner" defaultChecked={isNew ? true : s.availableInScanner} className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#050505] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFD000]"></div>
                       </label>
                    </div>
                 </div>
              </div>

              {!isNew && (
                 <div className="bg-[#1A1810] border border-[#FFD000]/20 rounded-2xl p-4 text-[#FFD000] text-xs flex gap-3 mt-4">
                    <HelpCircle size={16} className="shrink-0" />
                    <span>A edição avançada de itens inclusos, benefícios e matriz de preços estará disponível na próxima atualização.</span>
                 </div>
              )}

              <div className="flex gap-2 mt-8">
                 <button type="button" onClick={async () => {
                    if (isNew) { setEditingService(null); return; }
                    if (window.confirm('Excluir este serviço?')) {
                       try {
                          const { db } = await import('../../lib/firebase');
                          const { doc, deleteDoc } = await import('firebase/firestore');
                          await deleteDoc(doc(db, 'services', (editingService as Service).id));
                          showToast('Serviço excluído', 'success');
                          setEditingService(null);
                       } catch (err) {
                          console.error(err);
                          showToast(getFirebaseFriendlyError(err, 'Erro ao excluir serviço.'), 'error');
                       }
                    }
                 }} className="bg-[#111114] text-red-500 border border-white/5 p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center w-14 active:scale-[0.98] transition-transform">
                    <Trash2 size={18} />
                 </button>
                 <button type="submit" className="flex-1 bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_5px_20px_rgba(255,208,0,0.2)]">
                    <Save size={18} /> {isNew ? 'Salvar' : 'Atualizar'}
                 </button>
              </div>
           </form>
        </motion.div>
     );
  }

  return (
    <div className="px-6 space-y-6">
      <header className="flex justify-between items-start">
         <div>
            <h2 className="text-xl font-black tracking-tight mb-2">Serviços ({services.length})</h2>
            <p className="text-[#A7A7A3] text-sm">Gerencie o portfólio da oficina.</p>
         </div>
         <div className="flex gap-2">
             <button onClick={handleRestoreCatalog} className="bg-[#111114] border border-white/5 p-3 rounded-xl hover:border-[#FFD000]/30 active:scale-95 transition-all text-[#6F7175] hover:text-white" title="Restaurar catálogo base SR Details">
                <RefreshCcw size={20} />
             </button>
             <button onClick={() => setEditingService('new')} className="bg-[#FFD000] p-3 rounded-xl shadow-[0_5px_15px_rgba(255,208,0,0.2)] active:scale-95 transition-transform">
                <Plus size={20} className="text-[#050505]" />
             </button>
         </div>
      </header>

      <div className="relative">
         <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7175]" />
         <input 
           type="text" 
           placeholder="Buscar serviço, categoria ou preço..."
           value={search}
           onChange={e => setSearch(e.target.value)}
           className="w-full bg-[#111114] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none transition-colors shadow-inner"
         />
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
         {FILTERS.map(filter => (
             <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${activeFilter === filter ? 'bg-[#FFD000] text-black border-[#FFD000]' : 'bg-[#111114] text-[#A7A7A3] border-white/5 hover:border-white/20'}`}
             >
                 {filter}
             </button>
         ))}
      </div>

      <div className="space-y-4">
         {filtered.map(service => {
            const lowestPrice = Math.min(...(service.priceOptions || []).map(p => p.price));
            return (
            <div key={service.id} className="bg-[#0B0B0D] border border-white/5 rounded-2xl p-5 shadow-lg relative">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#FFD000] font-black">{service.categoryName}</span>
                    <h3 className="text-base font-black text-[#F4F4F2] mt-1">{service.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => handleToggleActive(service.id)} className={`w-8 h-8 rounded-full bg-[#111114] border border-white/5 flex items-center justify-center hover:opacity-80 transition-opacity ${service.active ? 'text-green-500' : 'text-red-500'}`} title="Tornar inativo">
                        <span className={`w-2 h-2 rounded-full ${service.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                     </button>
                     <button onClick={() => setEditingService(service)} className="w-8 h-8 rounded-full bg-[#111114] border border-white/5 flex items-center justify-center text-[#6F7175] hover:text-[#FFD000] transition-colors" title="Editar">
                        <Edit2 size={14} />
                     </button>
                  </div>
               </div>
               
               <p className="text-xs text-[#A7A7A3] line-clamp-2 mb-4">{service.shortDescription}</p>
               
               <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-bold text-[#A7A7A3] uppercase tracking-wider">
                   {service.featuredOnHome && <span className="bg-[#FFD000]/10 text-[#FFD000] px-2 py-1 rounded">Destaque Home</span>}
                   {service.availableForBooking && <span className="bg-white/5 px-2 py-1 rounded">Agendável</span>}
                   {service.availableInScanner && <span className="bg-white/5 px-2 py-1 rounded">No Scanner</span>}
                   <span className="bg-white/5 px-2 py-1 rounded">{service.deliveryLabel}</span>
               </div>

               <div className="bg-[#111114] rounded-xl p-3 border border-white/5 shadow-inner flex flex-col gap-2">
                 <p className="text-[10px] text-[#6F7175] font-bold uppercase mb-1">Opções de Preço ({(service.priceOptions || []).length})</p>
                 <div className="space-y-2">
                    {(service.priceOptions || []).map((opt, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-[#F4F4F2]">{opt.label}</span>
                          <span className="text-[#FFE066] font-bold">{formatCurrency(opt.price)}</span>
                       </div>
                    ))}
                 </div>
               </div>
            </div>
            );
         })}
         
         {filtered.length === 0 && (
            <div className="text-center text-[#A7A7A3] py-10 font-bold text-sm">
                Nenhum serviço encontrado.
            </div>
         )}
      </div>
    </div>
  )
}

