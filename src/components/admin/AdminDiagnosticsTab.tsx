import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, Server, Clock, RefreshCcw, CheckCircle2, AlertCircle, RefreshCw, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../../providers/DataProvider';
import { useToast } from './ToastProvider';
import { formatCurrency, getPriceDisplay } from '../../utils/pricing';

export function validateCatalogHealth(services: any[]) {
  let validServices = 0;
  let invalidServices = 0;
  let servicesWithoutPriceOptions = [];
  let servicesWithoutActiveFlag = [];
  let servicesWithoutDeliveryLabel = [];
  let servicesWithoutDuration = [];
  let servicesWithoutCategory = [];
  let servicesWithoutName = [];

  for (const s of services) {
    let isValid = true;

    if (!s.name) {
      servicesWithoutName.push(s.id);
      isValid = false;
    }
    if (!s.categoryName) {
      servicesWithoutCategory.push(s.id);
      isValid = false;
    }
    if (typeof s.active !== 'boolean') {
      servicesWithoutActiveFlag.push(s.id);
      isValid = false;
    }
    if (!s.priceOptions || !Array.isArray(s.priceOptions) || s.priceOptions.length === 0) {
      servicesWithoutPriceOptions.push(s.id);
      isValid = false;
    } else {
      const hasValidPrice = s.priceOptions.some(p => p.active && typeof p.price === 'number' && !isNaN(p.price));
      if (!hasValidPrice) {
        servicesWithoutPriceOptions.push(s.id);
        isValid = false;
      }
    }
    if (!s.deliveryLabel) {
      servicesWithoutDeliveryLabel.push(s.id);
      isValid = false;
    }
    if (typeof s.durationMinutes !== 'number' && typeof s.durationDays !== 'number') {
      servicesWithoutDuration.push(s.id);
      isValid = false;
    }

    if (isValid) validServices++;
    else invalidServices++;
  }

  const isEmpty = services.length === 0;
  const hasZombieData = !isEmpty && invalidServices > 0;
  const isHealthy = validServices >= 35 && invalidServices === 0;

  return {
    totalServices: services.length,
    validServices,
    invalidServices,
    missingServices: [], // Handled by seed validation
    servicesWithoutPriceOptions,
    servicesWithoutActiveFlag,
    servicesWithoutDeliveryLabel,
    servicesWithoutDuration,
    servicesWithoutCategory,
    servicesWithoutName,
    hasZombieData,
    isEmpty,
    isHealthy
  };
}

export default function AdminDiagnosticsTab() {
  const { services, bookings, businessSettings, scheduleSettings, scannerRules, error: dataError } = useData();
  const { showToast } = useToast();
  
  const [firebaseStatus, setFirebaseStatus] = useState({
    configured: false,
    projectId: 'N/A',
    authConnected: false,
    firestoreConnected: false,
  });

  const [loading, setLoading] = useState(true);

  const checkFirebase = async () => {
    setLoading(true);
    try {
      const { app, db, auth } = await import('../../lib/firebase');
      
      const configured = !!app && !!db && !!auth;
      const projectId = app ? app.options.projectId || 'Desconhecido' : 'N/A';
      const authConnected = !!auth;
      let firestoreConnected = false;
      
      if (db) {
         try {
            const { doc, getDoc } = await import('firebase/firestore');
            await getDoc(doc(db, 'system', 'connection_test'));
            firestoreConnected = true;
         } catch (e: any) {
             if (e.message?.includes('Missing or insufficient permissions')) {
                 firestoreConnected = true;
             }
         }
      }

      setFirebaseStatus({ configured, projectId, authConnected, firestoreConnected });
    } catch (e) {
      setFirebaseStatus({ configured: false, projectId: 'Erro', authConnected: false, firestoreConnected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirebase();
  }, []);

  const handleSeed = async () => {
      if (!window.confirm("Isso irá restaurar os 35 serviços oficiais da SR Details com preços, durações, categorias e regras do catálogo base. Agendamentos e clientes não serão apagados. Continuar?")) return;
      try {
         const { seedFirebaseIfEmpty } = await import('../../seedCatalog');
         await seedFirebaseIfEmpty(true);
         showToast("Catálogo oficial restaurado com sucesso.", "success");
         setTimeout(() => window.location.reload(), 1500);
      } catch (e) {
         showToast("Não foi possível conectar ao Firestore.", "error");
      }
  };

  const handleFixCatalog = async () => {
     try {
       const { db } = await import('../../lib/firebase');
       if (!db) throw new Error("Sem DB");
       const { doc, setDoc } = await import('firebase/firestore');
       const { CATALOG } = await import('../../seedCatalog');
       
       let fixed = 0;
       
       for (const baseSvc of CATALOG) {
          const existingSvc = services.find(s => s.id === baseSvc.id);
          if (!existingSvc) {
             console.info('Criando serviço faltante', baseSvc.id);
             await setDoc(doc(db, 'services', baseSvc.id), baseSvc);
             fixed++;
          } else {
             const patch: any = {};
             if (!existingSvc.priceOptions || existingSvc.priceOptions.length === 0) {
                 patch.priceOptions = baseSvc.priceOptions;
             }
             if (typeof existingSvc.active !== 'boolean') {
                 patch.active = baseSvc.active;
             }
             if (!existingSvc.deliveryLabel) {
                 patch.deliveryLabel = baseSvc.deliveryLabel;
             }
             if (typeof existingSvc.durationMinutes !== 'number' && typeof existingSvc.durationDays !== 'number') {
                 patch.durationMinutes = baseSvc.durationMinutes;
                 patch.durationDays = baseSvc.durationDays;
             }
             if (!existingSvc.categoryName) {
                 patch.categoryId = baseSvc.categoryId;
                 patch.categoryName = baseSvc.categoryName;
             }
             if (typeof existingSvc.availableForBooking !== 'boolean') patch.availableForBooking = true;
             if (typeof existingSvc.availableInScanner !== 'boolean') patch.availableInScanner = true;
             if (typeof existingSvc.featuredOnHome !== 'boolean') patch.featuredOnHome = baseSvc.featuredOnHome;
             
             if (Object.keys(patch).length > 0) {
                 console.info('Corrigindo serviço incompleto', existingSvc.id, patch);
                 await setDoc(doc(db, 'services', existingSvc.id), { ...existingSvc, ...patch }, { merge: true });
                 fixed++;
             }
          }
       }
       
       showToast("Serviços incompletos corrigidos com sucesso.", "success");
     } catch (e) {
       console.error(e);
       showToast("Sem permissão para escrever no Firestore. Verifique login Admin e regras.", "error");
     }
  };

  const handleReload = () => {
      window.location.reload();
  };

  const categoriesSet = new Set(services.map(s => s.categoryName).filter(Boolean));
  const health = validateCatalogHealth(services);

  const getStatusIcon = (isOk: boolean) => {
      return isOk ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />;
  };

  return (
      <div className="px-6 space-y-8 pb-10">
         <header className="flex justify-between items-start mb-4">
             <div>
                 <h2 className="text-2xl font-black text-[#F4F4F2] tracking-tight flex items-center gap-2">
                    <ShieldAlert className="text-[#FFD000]" />
                    Diagnóstico
                 </h2>
                 <p className="text-[11px] text-[#A7A7A3] font-bold uppercase tracking-widest mt-1">Status do Sistema e Banco de Dados</p>
             </div>
             <button onClick={checkFirebase} className="w-10 h-10 bg-[#111114] rounded-full flex items-center justify-center border border-white/5 active:scale-95 text-[#A7A7A3]">
                 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
             </button>
         </header>

         {dataError && (
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2">
                 <AlertCircle size={18} />
                 {dataError}
             </div>
         )}

         {/* 1. Firebase */}
         <section className="bg-[#111114] border border-white/5 rounded-2xl p-5 space-y-4">
             <h3 className="text-[#F4F4F2] font-black uppercase text-sm tracking-wider flex items-center gap-2">
                 <Server size={16} className="text-[#A7A7A3]" />
                 Conexão Firebase
             </h3>
             <div className="grid grid-cols-2 gap-4 text-sm bg-[#050505] p-4 rounded-xl border border-white/5">
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-[#6F7175] uppercase font-bold">Status</span>
                     <span className="font-bold flex items-center gap-1.5">{getStatusIcon(firebaseStatus.configured)} {firebaseStatus.configured ? 'Configurado' : 'Não configurado'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-[#6F7175] uppercase font-bold">Project ID</span>
                     <span className="font-mono text-[#FFD000] truncate">{firebaseStatus.projectId}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-[#6F7175] uppercase font-bold">Auth</span>
                     <span className="font-bold flex items-center gap-1.5">{getStatusIcon(firebaseStatus.authConnected)} {firebaseStatus.authConnected ? 'Conectado' : 'Erro'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-[#6F7175] uppercase font-bold">Firestore</span>
                     <span className="font-bold flex items-center gap-1.5">{getStatusIcon(firebaseStatus.firestoreConnected)} {firebaseStatus.firestoreConnected ? 'Conectado' : 'Erro'}</span>
                 </div>
             </div>
         </section>

         {/* 2. Banco de dados */}
         <section className="bg-[#111114] border border-white/5 rounded-2xl p-5 space-y-4">
             <h3 className="text-[#F4F4F2] font-black uppercase text-sm tracking-wider flex items-center gap-2">
                 <Database size={16} className="text-[#A7A7A3]" />
                 Estado do Banco de Dados
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <span className="text-2xl font-black text-[#FFE066]">{health.totalServices}</span>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold">Serviços</span>
                 </div>
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <span className="text-2xl font-black text-[#F4F4F2]">{categoriesSet.size}</span>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold">Categorias</span>
                 </div>
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <span className="text-2xl font-black text-[#F4F4F2]">{bookings.length}</span>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold">Agendamentos</span>
                 </div>
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <span className="text-2xl font-black text-[#F4F4F2]">{scannerRules.length}</span>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold">Regras Scanner</span>
                 </div>
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <div className="flex-1 flex items-center">{getStatusIcon(!!businessSettings)}</div>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold mt-1">Config Empresa</span>
                 </div>
                 <div className="bg-[#050505] p-3 rounded-xl border border-white/5 flex flex-col">
                     <div className="flex-1 flex items-center">{getStatusIcon(!!scheduleSettings)}</div>
                     <span className="text-[10px] uppercase text-[#6F7175] font-bold mt-1">Config Agenda</span>
                 </div>
             </div>
         </section>

         {/* 3. Catálogo de Serviços */}
         <section className="bg-[#111114] border border-white/5 rounded-2xl p-5 space-y-4">
             <h3 className="text-[#F4F4F2] font-black uppercase text-sm tracking-wider">Diagnóstico do Catálogo</h3>
             {health.validServices >= 35 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-sm rounded-xl flex items-center gap-2">
                   <CheckCircle2 size={16} /> Catálogo SR Details validado com sucesso.
                </div>
             )}
             {health.totalServices < 35 && !health.isEmpty && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm rounded-xl flex items-center gap-2">
                   <AlertCircle size={16} /> Catálogo incompleto. Existem menos de 35 serviços cadastrados.
                </div>
             )}
             {health.isEmpty && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm rounded-xl flex items-center gap-2">
                   <AlertCircle size={16} /> Firestore sem catálogo cadastrado.
                </div>
             )}
             {health.hasZombieData && health.totalServices >= 35 && (
                 <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold text-sm rounded-xl flex items-center gap-2">
                   <AlertCircle size={16} /> Foram encontrados serviços incompletos que impedem a exibição correta no app.
                </div>
             )}

             <ul className="space-y-2 text-sm mt-4">
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Total de serviços</span>
                     <span className="font-black text-[#FFE066]">{health.totalServices}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços válidos</span>
                     <span className="font-black text-green-500">{health.validServices}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços inválidos</span>
                     <span className={`font-black ${health.invalidServices > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.invalidServices}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços faltantes</span>
                     <span className={`font-black ${35 - health.totalServices > 0 ? 'text-red-500' : 'text-green-500'}`}>{35 - health.totalServices > 0 ? 35 - health.totalServices : 0}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços sem active</span>
                     <span className={`font-black ${health.servicesWithoutActiveFlag.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.servicesWithoutActiveFlag.length}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços sem preço</span>
                     <span className={`font-black ${health.servicesWithoutPriceOptions.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.servicesWithoutPriceOptions.length}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços sem entrega</span>
                     <span className={`font-black ${health.servicesWithoutDeliveryLabel.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.servicesWithoutDeliveryLabel.length}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">Serviços sem duração</span>
                     <span className={`font-black ${health.servicesWithoutDuration.length > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.servicesWithoutDuration.length}</span>
                 </li>
                 <li className="flex justify-between items-center bg-[#050505] p-3 rounded-xl border border-white/5">
                     <span className="text-[#A7A7A3]">S/ Categoria ou Nome</span>
                     <span className={`font-black ${(health.servicesWithoutName.length + health.servicesWithoutCategory.length) > 0 ? 'text-red-500' : 'text-green-500'}`}>{health.servicesWithoutName.length + health.servicesWithoutCategory.length}</span>
                 </li>
             </ul>
         </section>

         {/* 4. Agenda */}
         {scheduleSettings && (
         <section className="bg-[#111114] border border-white/5 rounded-2xl p-5 space-y-4">
             <h3 className="text-[#F4F4F2] font-black uppercase text-sm tracking-wider flex items-center gap-2">
                 <Clock size={16} className="text-[#A7A7A3]" />
                 Status da Agenda
             </h3>
             <div className="text-sm bg-[#050505] p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#6F7175] uppercase font-bold">Horário Base</span>
                    <span className="font-bold text-[#F4F4F2]">
                        {scheduleSettings.businessHours ? scheduleSettings.businessHours.start : scheduleSettings.workingHours?.start} - 
                        {scheduleSettings.businessHours ? scheduleSettings.businessHours.end : scheduleSettings.workingHours?.end}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#6F7175] uppercase font-bold">Buffer / Slot</span>
                    <span className="font-bold text-[#F4F4F2]">{scheduleSettings.bufferBetweenBookingsMinutes}m / {scheduleSettings.slotIntervalMinutes}m</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#6F7175] uppercase font-bold">Capacidade Máx</span>
                    <span className="font-bold text-[#F4F4F2]">{scheduleSettings.teamsCapacity} Vagas</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#6F7175] uppercase font-bold">Dias Bloqueados</span>
                    <span className="font-bold text-[#F4F4F2]">{scheduleSettings.blockedDates?.length || 0}</span>
                </div>
             </div>
         </section>
         )}

         {/* 5. Ações */}
         <section className="space-y-3 pt-4">
             {health.isEmpty && (
                 <button onClick={handleSeed} className="w-full bg-[#FFD000] text-[#050505] p-4 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
                     Popular Firebase com catálogo base
                 </button>
             )}
             {(!health.isEmpty && health.hasZombieData) && (
                  <button onClick={handleFixCatalog} className="w-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 p-4 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-yellow-500/30">
                     <Wrench size={16} /> Corrigir serviços incompletos
                 </button>
             )}
             
             {!health.isEmpty && (
                 <button onClick={handleSeed} className="w-full bg-[#111114] border border-red-500/30 text-red-500 p-4 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-red-500/10">
                     Restaurar catálogo oficial SR Details
                 </button>
             )}
             <button onClick={() => {
                console.log('--- DIAGNÓSTICO DO CATÁLOGO ---');
                console.log('Total de serviços:', health.totalServices);
                console.log('Serviços válidos:', health.validServices);
                console.log('Serviços inválidos:', health.invalidServices);
                console.log('Serviços faltantes:', 35 - health.totalServices > 0 ? 35 - health.totalServices : 0);
                console.log('Sem preço:', health.servicesWithoutPriceOptions);
                console.log('Sem active:', health.servicesWithoutActiveFlag);
                console.log('Sem entrega:', health.servicesWithoutDeliveryLabel);
                console.log('Sem duração:', health.servicesWithoutDuration);
                console.log('-------------------------------');

                if (health.validServices >= 35) showToast('Catálogo SR Details validado com sucesso.', 'success');
                else if (health.totalServices < 35) showToast('Catálogo incompleto.', 'error');
                else showToast('Catálogo validado. Existem falhas.', 'error');
             }} className="w-full bg-[#111114] border border-white/5 text-[#F4F4F2] p-4 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform">
                 Revalidar catálogo
             </button>
             <button onClick={handleReload} className="w-full bg-[#111114] border border-white/5 text-[#A7A7A3] p-4 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                 <RefreshCcw size={16} /> Recarregar Dados do Firestore
             </button>
         </section>

      </div>
  );
}
