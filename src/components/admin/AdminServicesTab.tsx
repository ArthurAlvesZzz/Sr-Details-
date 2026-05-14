import React, { useState } from 'react';
import { Service } from '../../types.ts';
import { Search, Plus, Edit2, Shield, Settings2, ArrowLeft, Save, HelpCircle, X, Trash2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './ToastProvider';
import { formatCurrency, getPriceDisplay } from '../../utils/pricing.ts';
import { useData } from '../../providers/DataProvider.tsx';
import { getFirebaseFriendlyError } from '../../utils/firebaseErrors';
import { sanitizeForFirestore } from '../../utils/firestoreSanitize';
import { safeText, normalizeText, safeArray } from '../../utils/safeData.ts';

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
  const [isSaving, setIsSaving] = useState(false);
  const [editingPriceOptions, setEditingPriceOptions] = useState<any[]>([]);
  
  const handleEditClick = (s: Service | 'new') => {
    setEditingService(s);
    if (s === 'new') {
      setEditingPriceOptions([{id: '1', label: 'Padrão', price: 0, active: true}]);
    } else {
      setEditingPriceOptions(safeArray(s.priceOptions).length > 0 ? [...safeArray(s.priceOptions)] : [{id: '1', label: 'Padrão', price: 0, active: true}]);
    }
  };
  
  const filtered = services.filter(s => {
     if (search && !normalizeText(s.name).includes(normalizeText(search)) && !normalizeText(s.categoryName).includes(normalizeText(search))) return false;
     
     if (activeFilter === 'Ativos') return s.active;
     if (activeFilter === 'Inativos') return !s.active;
     if (activeFilter !== 'Todos') {
        return normalizeText(s.categoryName) === normalizeText(activeFilter);
     }
     
     return true;
  });

  const handleSaveService = async (e: React.FormEvent) => {
     e.preventDefault();
     const fd = new FormData(e.target as HTMLFormElement);
     
     const normalizeSlug = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

     const name = fd.get('name') as string || '';
     const categoryName = fd.get('categoryName') as string || '';
     
     if (!name.trim() || !categoryName.trim()) {
       showToast("Nome e Categoria são obrigatórios.", "error");
       return;
     }

     setIsSaving(true);
     try {
       const updatedService: Partial<Service> = {
          name,
          slug: normalizeSlug(name),
          categoryName,
          categoryId: normalizeSlug(categoryName),
          shortDescription: fd.get('shortDescription') as string || '',
          fullDescription: fd.get('fullDescription') as string || '',
          includes: (fd.get('includes') as string || '').split('\n').map(s => s.trim()).filter(Boolean),
          benefits: (fd.get('benefits') as string || '').split('\n').map(s => s.trim()).filter(Boolean),
          recommendedFor: (fd.get('recommendedFor') as string || '').split('\n').map(s => s.trim()).filter(Boolean),
          durationMinutes: parseInt(fd.get('durationMinutes') as string) || 0,
          durationDays: parseInt(fd.get('durationDays') as string) || 0,
          deliveryLabel: fd.get('deliveryLabel') as string || '',
          featuredOnHome: fd.get('featuredOnHome') === 'on',
          availableInScanner: fd.get('availableInScanner') === 'on',
          availableForBooking: fd.get('availableForBooking') === 'on',
          active: fd.get('active') === 'on',
       };

       updatedService.schedulingMode = ((updatedService.durationDays || 0) > 0 ? 'days' : 'hours') as any;
       updatedService.requiresManualApproval = (updatedService.durationDays || 0) > 0;

       const oldOptions = editingService !== 'new' && editingService ? editingService.priceOptions : [];
       const newOptions: import('../../types.ts').PriceOption[] = [];
       
       for(let i = 0; i < 20; i++) {
          if(fd.has(`priceId_${i}`)) {
             const installmentLabel = oldOptions?.[i]?.installmentLabel || '';
             const sublabel = oldOptions?.[i]?.sublabel || '';
             
             newOptions.push({
                id: fd.get(`priceId_${i}`) as string || `price-${i}`,
                label: fd.get(`priceLabel_${i}`) as string || '',
                price: parseFloat(fd.get(`priceValue_${i}`) as string) || 0,
                active: true,
                ...(installmentLabel ? { installmentLabel } : {}),
                ...(sublabel ? { sublabel } : {})
             });
          }
       }
       
       if (newOptions.length > 0) {
          updatedService.priceOptions = newOptions;
       } else {
          showToast("Pelo menos uma opção de preço é obrigatória.", "error");
          setIsSaving(false);
          return;
       }

       const { db } = await import('../../lib/firebase');
       const { doc, setDoc, updateDoc } = await import('firebase/firestore');

       if (editingService === 'new') {
          const newId = 's_' + Math.random().toString(36).substr(2, 9);
          const newRecord: Service = {
             id: newId,
             name: updatedService.name!,
             slug: updatedService.slug!,
             categoryId: updatedService.categoryId!,
             categoryName: updatedService.categoryName!,
             shortDescription: updatedService.shortDescription!,
             fullDescription: updatedService.fullDescription!,
             includes: updatedService.includes!,
             benefits: updatedService.benefits!,
             recommendedFor: updatedService.recommendedFor!,
             priceOptions: updatedService.priceOptions!,
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
          const sanitizedNewRecord = sanitizeForFirestore(newRecord);
          await setDoc(doc(db, 'services', newId), sanitizedNewRecord);
          showToast('Serviço criado com sucesso.', 'success');
       } else {
          const sanitizedUpdatedService = sanitizeForFirestore({
             ...updatedService,
             updatedAt: new Date().toISOString()
          });
          await updateDoc(doc(db, 'services', (editingService as Service).id), sanitizedUpdatedService);
          showToast('Serviço atualizado com sucesso.', 'success');
       }
       
       setEditingService(null);
     } catch (err: any) {
       console.error("[AdminServicesTab] Erro ao salvar serviço", err);
       const errStr = String(err?.code || err?.message || '');
       if (errStr.includes("permission-denied")) {
         showToast("Sem permissão para salvar serviços. Verifique se seu usuário tem role manager ou owner.", "error");
       } else if (errStr.includes("invalid-argument") || errStr.includes("unsupported field value")) {
         showToast("Erro nos dados do serviço. Existem campos inválidos para o Firestore.", "error");
       } else if (errStr.includes("not-found")) {
         showToast("Serviço não encontrado no banco de dados.", "error");
       } else {
         showToast(getFirebaseFriendlyError(err, 'Erro ao salvar serviço.'), 'error');
       }
     } finally {
       setIsSaving(false);
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
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">Itens e Detalhes</h3>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Inclusos (1 por linha)</label>
                    <textarea name="includes" defaultValue={(s.includes || []).join('\n')} rows={3} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" placeholder="Ex: Limpeza técnica&#10;Condicionamento de plásticos" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Benefícios (1 por linha)</label>
                    <textarea name="benefits" defaultValue={(s.benefits || []).join('\n')} rows={3} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" placeholder="Ex: Proteção UV&#10;Brilho profundo" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Recomendado Para (1 por linha)</label>
                    <textarea name="recommendedFor" defaultValue={(s.recommendedFor || []).join('\n')} rows={3} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" placeholder="Ex: Veículos sujos&#10;Pré-venda" />
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[#FFD000] text-sm font-black uppercase tracking-wider border-b border-white/10 pb-2">Preços e Opções</h3>
                 {editingPriceOptions.map((opt, idx) => (
                    <div key={opt.id || idx} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-end bg-[#111114] border border-white/5 p-4 rounded-2xl">
                       <input type="hidden" name={`priceId_${idx}`} value={opt.id || `p_${Date.now()}_${idx}`} />
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider mb-2 block">Categoria / Nome</label>
                          <input name={`priceLabel_${idx}`} defaultValue={opt.label} className="w-full bg-[#050505] border border-white/5 rounded-xl p-3 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider mb-2 block">Valor (R$)</label>
                          <input type="number" step="0.01" name={`priceValue_${idx}`} defaultValue={opt.price} className="w-full bg-[#050505] border border-white/5 rounded-xl p-3 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                       <button type="button" onClick={() => {
                          const newOpts = [...editingPriceOptions];
                          newOpts.splice(idx, 1);
                          setEditingPriceOptions(newOpts);
                       }} className="w-11 h-11 mb-[2px] rounded-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/10 transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 ))}
                 
                 <button type="button" onClick={() => setEditingPriceOptions([...editingPriceOptions, { id: `p_${Date.now()}`, label: '', price: 0, active: true }])} className="w-full py-4 border border-dashed border-white/10 text-[#FFD000] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FFD000]/5 transition-colors font-bold text-sm">
                    <Plus size={16} /> Adicionar Opção de Preço
                 </button>
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
                 <button type="submit" disabled={isSaving} className="flex-1 bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_5px_20px_rgba(255,208,0,0.2)] disabled:opacity-50 disabled:pointer-events-none">
                    <Save size={18} /> {isSaving ? 'Salvando...' : (isNew ? 'Salvar' : 'Atualizar')}
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
             <button onClick={() => handleEditClick('new')} className="bg-[#FFD000] p-3 rounded-xl shadow-[0_5px_15px_rgba(255,208,0,0.2)] active:scale-95 transition-transform">
                <Plus size={20} className="text-[#050505]" />
             </button>
         </div>
      </header>

      {services.length === 0 && (
         <div className="bg-[#1A1810] border border-[#FFD000]/20 rounded-2xl p-4 text-center">
            <p className="text-xs text-[#FFD000] leading-relaxed mb-3">
               Nenhum serviço persistido no Firebase ainda. O aplicativo público está utilizando um catálogo base temporário de segurança.
            </p>
            <button onClick={handleRestoreCatalog} className="bg-[#FFD000] text-black font-bold text-xs uppercase px-4 py-2 rounded-lg active:scale-95 transition-transform">
               Popular Firebase com catálogo base
            </button>
         </div>
      )}

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
            const priceOptionsList = service.priceOptions || [];
            if (!service.name || !service.categoryName || priceOptionsList.length === 0) {
               console.warn("[SR Details] Serviço com dados incompletos", service);
            }
            const lowestPrice = priceOptionsList.length > 0 
               ? Math.min(...priceOptionsList.map(p => Number(p.price || 0)))
               : 0;
            return (
            <div key={service.id} className="bg-[#0B0B0D] border border-white/5 rounded-2xl p-5 shadow-lg relative">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#FFD000] font-black">{safeText(service.categoryName)}</span>
                    <h3 className="text-base font-black text-[#F4F4F2] mt-1">{safeText(service.name)}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => handleToggleActive(service.id)} className={`w-8 h-8 rounded-full bg-[#111114] border border-white/5 flex items-center justify-center hover:opacity-80 transition-opacity ${service.active ? 'text-green-500' : 'text-red-500'}`} title="Tornar inativo">
                        <span className={`w-2 h-2 rounded-full ${service.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                     </button>
                     <button onClick={() => handleEditClick(service)} className="w-8 h-8 rounded-full bg-[#111114] border border-white/5 flex items-center justify-center text-[#6F7175] hover:text-[#FFD000] transition-colors" title="Editar">
                        <Edit2 size={14} />
                     </button>
                  </div>
               </div>
               
               <p className="text-xs text-[#A7A7A3] line-clamp-2 mb-4">{safeText(service.shortDescription)}</p>
               
               <div className="flex flex-wrap gap-2 mb-4 text-[10px] font-bold text-[#A7A7A3] uppercase tracking-wider">
                   {service.featuredOnHome && <span className="bg-[#FFD000]/10 text-[#FFD000] px-2 py-1 rounded">Destaque Home</span>}
                   {service.availableForBooking && <span className="bg-white/5 px-2 py-1 rounded">Agendável</span>}
                   {service.availableInScanner && <span className="bg-white/5 px-2 py-1 rounded">No Scanner</span>}
                   <span className="bg-white/5 px-2 py-1 rounded">{safeText(service.deliveryLabel)}</span>
               </div>

               <div className="bg-[#111114] rounded-xl p-3 border border-white/5 shadow-inner flex flex-col gap-2">
                 <p className="text-[10px] text-[#6F7175] font-bold uppercase mb-1">Opções de Preço ({safeArray(service.priceOptions).length})</p>
                 <div className="space-y-2">
                    {safeArray(service.priceOptions).map((opt, i) => (
                       <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-[#F4F4F2]">{safeText(opt.label)}</span>
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

