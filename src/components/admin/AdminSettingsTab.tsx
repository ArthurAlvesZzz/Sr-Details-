import React, { useState } from 'react';
import { ScheduleSettings, BusinessSettings } from '../../types.ts';
import { CalendarRange, Paintbrush, Building2, Users, Database, ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './ToastProvider';

interface AdminSettingsTabProps {
  scheduleSettings: ScheduleSettings;
  setScheduleSettings: any;
  brandSettings: BusinessSettings;
  setBrandSettings: any;
}

export default function AdminSettingsTab({ scheduleSettings, setScheduleSettings, brandSettings, setBrandSettings }: AdminSettingsTabProps) {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<string | null>(null);

  const options = [
    { id: 'identity', icon: Paintbrush, title: 'Identidade Visual', desc: 'Logo, cores e nome comercial' },
    { id: 'capacity', icon: CalendarRange, title: 'Capacidade da Agenda', desc: 'Horários, bloqueios e buffers' },
    { id: 'company', icon: Building2, title: 'Dados da Empresa', desc: 'Endereço, redes e contatos' },
    { id: 'users', icon: Users, title: 'Usuários Admin', desc: 'Gerenciar permissões de acesso' },
    { id: 'database', icon: Database, title: 'Integração Nuvem (Firebase)', desc: 'Conectar banco de dados e auth' },
  ];

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const updated = {
       ...brandSettings,
       businessName: fd.get('businessName') as string,
       primaryColor: fd.get('primaryColor') as string,
       secondaryColor: fd.get('secondaryColor') as string,
       headline: fd.get('headline') as string,
       subheadline: fd.get('subheadline') as string,
       slogan: fd.get('slogan') as string,
    };
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'businessSettings', 'main'), updated);
      showToast('Identidade visual atualizada com sucesso.');
      setActiveView(null);
    } catch {
      showToast('Erro ao atualizar identidade', 'error');
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const updated = {
       ...brandSettings,
       address: fd.get('address') as string,
       city: fd.get('city') as string,
       state: fd.get('state') as string,
       whatsapp: fd.get('whatsapp') as string,
       instagram: fd.get('instagram') as string,
       googleMapsUrl: fd.get('googleMapsUrl') as string,
       workingHoursText: fd.get('workingHoursText') as string,
    };
    try {
      const { db } = await import('../../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'businessSettings', 'main'), updated);
      showToast('Dados da empresa atualizados com sucesso.', 'success');
      setActiveView(null);
    } catch {
      showToast('Erro ao atualizar dados', 'error');
    }
  };

  const renderView = () => {
     switch (activeView) {
        case 'identity':
           return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveView(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                       <ArrowLeft size={18} />
                    </button>
                    <div>
                       <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">Identidade Visual</h2>
                       <p className="text-xs text-[#A7A7A3]">Altere a aparência do app.</p>
                    </div>
                 </header>

                 <form onSubmit={handleSaveIdentity} className="space-y-5">
                    <div className="bg-[#111114] border border-white/5 rounded-2xl p-5 text-center">
                       <div className="w-20 h-20 bg-[#0B0B0D] border border-dashed border-white/20 rounded-full mx-auto flex items-center justify-center mb-3 text-[#6F7175]">
                          <UploadCloud size={24} />
                       </div>
                       <p className="text-xs text-[#A7A7A3] font-medium mb-1">Fazer upload de nova Logo</p>
                       <p className="text-[10px] text-[#6F7175]">Apenas simulação visual no modo local</p>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Nome da Empresa</label>
                       <input name="businessName" defaultValue={brandSettings.businessName} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>

                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Slogan</label>
                       <input name="slogan" defaultValue={brandSettings.slogan} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>

                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Título da Home</label>
                       <input name="headline" defaultValue={brandSettings.headline} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>

                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Subtítulo da Home</label>
                       <input name="subheadline" defaultValue={brandSettings.subheadline} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Cor Principal</label>
                          <div className="flex bg-[#111114] border border-white/5 rounded-2xl overflow-hidden pr-4 focus-within:border-[#FFD000]/30">
                             <input type="color" name="primaryColor" defaultValue={brandSettings.primaryColor || '#FFD000'} className="w-12 h-12 bg-transparent cursor-pointer border-none p-1" />
                             <input type="text" defaultValue={brandSettings.primaryColor || '#FFD000'} className="w-full bg-transparent text-sm text-[#F4F4F2] outline-none ml-2 pointer-events-none" />
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Secundária</label>
                          <div className="flex bg-[#111114] border border-white/5 rounded-2xl overflow-hidden pr-4 focus-within:border-[#FFD000]/30">
                             <input type="color" name="secondaryColor" defaultValue={brandSettings.secondaryColor || '#FFFFFF'} className="w-12 h-12 bg-transparent cursor-pointer border-none p-1" />
                             <input type="text" defaultValue={brandSettings.secondaryColor || '#FFFFFF'} className="w-full bg-transparent text-sm text-[#F4F4F2] outline-none ml-2 pointer-events-none" />
                          </div>
                       </div>
                    </div>

                    <button type="submit" className="w-full bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-8 shadow-[0_5px_20px_rgba(255,208,0,0.2)]">
                       <Save size={18} /> Salvar Alterações
                    </button>
                 </form>
              </motion.div>
           );
        case 'capacity':
           return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveView(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                       <ArrowLeft size={18} />
                    </button>
                    <div>
                       <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">Capacidade</h2>
                       <p className="text-xs text-[#A7A7A3]">Configurações da agenda.</p>
                    </div>
                 </header>

                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const fd = new FormData(form);
                    const openTime = fd.get('openTime') as string;
                    const closeTime = fd.get('closeTime') as string;
                    const slotInterval = Number(fd.get('slotInterval'));
                    const buffer = Number(fd.get('buffer'));
                    try {
                      const { db } = await import('../../lib/firebase');
                      const { doc, setDoc } = await import('firebase/firestore');
                      await setDoc(doc(db, 'scheduleSettings', 'main'), {
                        ...scheduleSettings,
                        businessHours: { start: openTime, end: closeTime },
                        slotIntervalMinutes: slotInterval,
                        bufferBetweenBookingsMinutes: buffer
                      });
                      showToast('Capacidade da agenda atualizada.', 'success');
                      setActiveView(null);
                    } catch {
                      showToast('Erro ao salvar capacidade', 'error');
                    }
                 }} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Abertura</label>
                          <input type="time" name="openTime" defaultValue={scheduleSettings.businessHours.start} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Fechamento</label>
                          <input type="time" name="closeTime" defaultValue={scheduleSettings.businessHours.end} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Intervalo de Slots (Minutos)</label>
                       <input type="number" name="slotInterval" defaultValue={30} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Buffer Entre Serviços (Minutos)</label>
                       <input type="number" name="buffer" defaultValue={15} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-8 shadow-[0_5px_20px_rgba(255,208,0,0.2)]">
                       <Save size={18} /> Salvar Capacidade
                    </button>
                 </form>
              </motion.div>
           );
        case 'company':
           return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveView(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                       <ArrowLeft size={18} />
                    </button>
                    <div>
                       <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">Dados da Empresa</h2>
                       <p className="text-xs text-[#A7A7A3]">Endereço e contatos.</p>
                    </div>
                 </header>

                 <form onSubmit={handleSaveCompany} className="space-y-5">
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Endereço Completo</label>
                       <input type="text" name="address" defaultValue={brandSettings.address} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Cidade</label>
                          <input type="text" name="city" defaultValue={brandSettings.city} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">UF</label>
                          <input type="text" name="state" defaultValue={brandSettings.state} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">WhatsApp</label>
                       <input type="text" name="whatsapp" defaultValue={brandSettings.whatsapp} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Instagram</label>
                       <input type="text" name="instagram" defaultValue={brandSettings.instagram} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Google Maps Link (Opcional)</label>
                       <input type="url" name="googleMapsUrl" defaultValue={brandSettings.googleMapsUrl} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-[#A7A7A3] uppercase tracking-wider pl-4 mb-2 block">Horário de Funcionamento (Texto livre)</label>
                       <input type="text" name="workingHoursText" defaultValue={brandSettings.workingHoursText} className="w-full bg-[#111114] border border-white/5 rounded-2xl p-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/30 outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-8 shadow-[0_5px_20px_rgba(255,208,0,0.2)]">
                       <Save size={18} /> Salvar Dados
                    </button>
                 </form>
              </motion.div>
           );
        case 'users':
           return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveView(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                       <ArrowLeft size={18} />
                    </button>
                    <div>
                       <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">Usuários Admin</h2>
                       <p className="text-xs text-[#A7A7A3]">Gerencie os acessos.</p>
                    </div>
                 </header>

                 <div className="space-y-4">
                    <div className="bg-[#1A1810] border border-[#FFD000]/20 rounded-2xl p-4 text-center">
                       <p className="text-xs text-[#FFD000] leading-relaxed">
                         Gerenciamento real de usuários será ativado ao conectar Firebase Auth. No momento, os usuários são demonstrativos.
                       </p>
                    </div>

                    <div className="bg-[#111114] border border-white/5 rounded-2xl p-4 flex justify-between items-center text-sm shadow-inner">
                       <div>
                          <p className="text-[#F4F4F2] font-black tracking-wide">admin@srdetails.com.br</p>
                          <p className="text-[#A7A7A3] text-xs">Proprietário</p>
                       </div>
                       <span className="bg-green-500/10 text-green-500 text-[10px] uppercase font-black px-2 py-1 rounded-md">Ativo</span>
                    </div>

                    <button 
                      onClick={() => showToast('Gerenciamento real de usuários será ativado com Firebase Auth.', 'info')}
                      className="w-full bg-[#0B0B0D] border border-dashed border-[#FFD000]/50 text-[#FFD000] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-inner hover:bg-[#FFD000]/5"
                    >
                       <Users size={18} /> Convidar Usuário
                    </button>
                 </div>
              </motion.div>
           );
        case 'database':
           return (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <header className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveView(null)} className="w-10 h-10 rounded-full bg-[#111114] flex items-center justify-center text-[#A7A7A3] border border-white/5 active:scale-95">
                       <ArrowLeft size={18} />
                    </button>
                    <div>
                       <h2 className="text-xl font-black tracking-tight text-[#F4F4F2]">Banco de Dados</h2>
                       <p className="text-xs text-[#A7A7A3]">Gerenciamento e População Inicial</p>
                    </div>
                 </header>

                 <div className="bg-[#111114] border border-[#FFD000]/20 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-[#1A1810] border border-[#FFD000]/30 rounded-full mx-auto flex items-center justify-center mb-4 text-[#FFD000] shadow-[0_0_20px_rgba(255,208,0,0.1)]">
                       <Database size={24} />
                    </div>
                    <h3 className="text-[#F4F4F2] font-black text-lg mb-2">Popular Firebase</h3>
                    <p className="text-[#A7A7A3] text-xs leading-relaxed mb-6">
                       Use este botão para preencher o Firebase com os 35 serviços padrão, configurações base e regras da empresa se estiverem vazios.
                    </p>

                    <button 
                      onClick={async () => {
                        showToast('Populando catálogo base no Firebase...', 'info');
                        const { seedFirebaseIfEmpty } = await import('../../seedCatalog');
                        try {
                          await seedFirebaseIfEmpty();
                          showToast('Catálogo base enviado para o Firebase.', 'success');
                        } catch (err) {
                          showToast('Erro ao popular dados', 'error');
                          console.error(err);
                        }
                      }}
                      className="w-full bg-[#FFD000] text-[#050505] p-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-[0_5px_20px_rgba(255,208,0,0.2)]"
                    >
                       Popular Firebase com catálogo base
                    </button>
                 </div>
              </motion.div>
           );
        default:
           return (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <header>
                   <h2 className="text-xl font-black tracking-tight mb-2">Ajustes do Sistema</h2>
                   <p className="text-[#A7A7A3] text-sm">Configure o negócio e o aplicativo.</p>
                </header>

                <div className="grid gap-3 pt-2">
                   {options.map((opt, i) => {
                      const Icon = opt.icon;
                      return (
                         <motion.button 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.05 }}
                           key={opt.id}
                           onClick={() => {
                              setActiveView(opt.id);
                           }}
                           className="flex items-center gap-4 bg-[#0B0B0D] border border-white/5 rounded-2xl p-4 text-left active:scale-[0.98] transition-all hover:border-[#FFD000]/20 group"
                         >
                            <div className="w-12 h-12 rounded-xl bg-[#111114] border border-white/5 flex items-center justify-center text-[#A7A7A3] group-hover:text-[#FFD000] transition-colors shadow-inner">
                               <Icon size={20} />
                            </div>
                            <div className="flex-1">
                               <h3 className="text-sm font-black text-[#F4F4F2] mb-0.5">{opt.title}</h3>
                               <p className="text-xs text-[#6F7175]">{opt.desc}</p>
                            </div>
                         </motion.button>
                      )
                   })}
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                   <p className="text-[10px] text-[#6F7175] font-black uppercase tracking-widest mb-1">SR Details App System</p>
                   <p className="text-[10px] text-[#6F7175]">v1.0.0 — Modo Nuvem Ativo</p>
                </div>
             </motion.div>
           );
     }
  };

  return (
    <div className="px-6 relative pb-10">
      <AnimatePresence mode="wait">
         {renderView()}
      </AnimatePresence>
    </div>
  )
}
