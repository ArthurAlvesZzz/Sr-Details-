import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Settings, CalendarRange, Smartphone, Send, 
  CheckCircle, ChevronRight, ChevronLeft, ShieldCheck, Tag, Check, Calendar, Clock, Search, X
} from 'lucide-react';
import { ADDONS } from '../constants.ts';
import { View, BookingRequest, RequestStatus, Service, ScheduleSettings } from '../types.ts';
import { 
  getAvailableSlots, 
  isDateBlocked, 
  isWorkingDay, 
  findNextAvailableSlot, 
  getServiceDuration, 
  calculateEndTime,
  hasCapacityForSlot
} from '../lib/scheduleEngine.ts';
import { formatCurrency, getPriceDisplay } from '../utils/pricing.ts';
import { getFirebaseFriendlyError } from '../utils/firebaseErrors';
import { safeArray, safeText, safeNumber, normalizeText } from '../utils/safeData.ts';

import CalendarModal from './CalendarModal.tsx';

interface BookingProps {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
  onSubmit: (request: BookingRequest) => void;
  services: Service[];
  scheduleSettings: ScheduleSettings;
  bookings: BookingRequest[];
  draftServiceId?: string | null;
}

export default function Booking({ onNavigate, onSubmit, services, scheduleSettings, bookings, draftServiceId }: BookingProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [nextAvailable, setNextAvailable] = useState<{ date: string; time: string } | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('Todos');

  // default to first active service or undefined if empty
  const activeServices = useMemo(() => services.filter(s => s.active), [services]);
  const defaultServiceId = activeServices.length > 0 ? activeServices[0].id : '';

  const filteredModalServices = useMemo(() => {
    return activeServices.filter(s => {
      if (serviceCategoryFilter !== 'Todos' && safeText(s.categoryName) !== serviceCategoryFilter) return false;
      if (!serviceSearch) return true;
      const q = normalizeText(serviceSearch);
      const searchableText = [
        safeText(s.name),
        safeText(s.categoryName),
        safeText(s.shortDescription),
        ...safeArray(s.benefits),
        ...safeArray(s.includes),
        ...safeArray(s.priceOptions).map(p => p.label)
      ].map(normalizeText).join(' ');
      return searchableText.includes(q);
    });
  }, [activeServices, serviceSearch, serviceCategoryFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(activeServices.map(s => safeText(s.categoryName)).filter(Boolean));
    return ['Todos', ...Array.from(cats)];
  }, [activeServices]);

  const [formData, setFormData] = useState({
    serviceId: defaultServiceId,
    vehicleType: '', // Empty initially to force selection
    addons: [] as string[],
    desiredDate: '',
    desiredTime: '',
    name: '',
    whatsapp: '',
    carModel: '',
    carYear: '',
    carColor: '',
    carCondition: ''
  });

  const selectedServiceObj = useMemo(() => activeServices.find(s => s.id === formData.serviceId) || activeServices[0], [formData.serviceId, activeServices]);

  useEffect(() => {
    const hasDraftService = draftServiceId && activeServices.some(s => s.id === draftServiceId);
    const nextServiceId = hasDraftService 
      ? draftServiceId 
      : activeServices[0]?.id || '';

    if (!nextServiceId) return;

    setFormData(prev => {
      if (prev.serviceId === nextServiceId) {
        return prev;
      }
      return { 
        ...prev, 
        serviceId: nextServiceId,
        vehicleType: prev.serviceId && prev.serviceId !== nextServiceId ? '' : prev.vehicleType,
        addons: Array.isArray(prev.addons) ? prev.addons : []
      };
    });
  }, [activeServices, draftServiceId]);

  // Recalculate available times when date or service changes
  useEffect(() => {
    if (!formData.desiredDate || !selectedServiceObj) {
      setAvailableTimes(prev => prev.length === 0 ? prev : []);
      setDateError(prev => prev === null ? prev : null);
      return;
    }

    if (!isWorkingDay(formData.desiredDate, scheduleSettings)) {
      setAvailableTimes(prev => prev.length === 0 ? prev : []);
      setDateError(prev => prev === "Estamos fechados neste dia." ? prev : "Estamos fechados neste dia.");
      return;
    }

    if (isDateBlocked(formData.desiredDate, scheduleSettings)) {
      setAvailableTimes(prev => prev.length === 0 ? prev : []);
      setDateError(prev => prev === "Data indisponível (Bloqueada)." ? prev : "Data indisponível (Bloqueada).");
      return;
    }

    const slots = getAvailableSlots(formData.desiredDate, selectedServiceObj, bookings, scheduleSettings);
    
    if (slots.length === 0) {
      setDateError(prev => prev === "Agenda cheia para este dia." ? prev : "Agenda cheia para este dia.");
      const nextFound = findNextAvailableSlot(selectedServiceObj, bookings, scheduleSettings, formData.desiredDate);
      setNextAvailable(prev => {
        if (!prev && !nextFound) return prev;
        if (prev && nextFound && prev.date === nextFound.date && prev.time === nextFound.time) return prev;
        return nextFound;
      });
    } else {
      setDateError(prev => prev === null ? prev : null);
      setNextAvailable(prev => prev === null ? prev : null);
    }
    
    setAvailableTimes(prev => {
       if (prev.length === slots.length && prev.every((v, i) => v === slots[i])) return prev;
       return slots;
    });
    
    // Clear previously selected time if it's no longer available
    setFormData(prev => {
      if (prev.desiredTime && !slots.includes(prev.desiredTime)) {
        return { ...prev, desiredTime: '' };
      }
      return prev;
    });

  }, [formData.desiredDate, formData.serviceId, selectedServiceObj, scheduleSettings, bookings]);

  // Provide initial suggestion for date
  useEffect(() => {
     if (step === 3 && !formData.desiredDate && selectedServiceObj) {
        const todayStr = new Date().toISOString().split('T')[0];
        const initialAvail = findNextAvailableSlot(selectedServiceObj, bookings, scheduleSettings, todayStr);
        if (initialAvail) {
           setFormData(prev => {
              if (prev.desiredDate === initialAvail.date) return prev;
              return { ...prev, desiredDate: initialAvail.date };
           });
        }
     }
  }, [step, selectedServiceObj, bookings, scheduleSettings, formData.desiredDate]);


  // Get price for the selected vehicle type
  const basePriceObj = useMemo(() => {
    if (!selectedServiceObj || !selectedServiceObj.priceOptions || selectedServiceObj.priceOptions.length === 0) return { label: '', price: 0 };
    return selectedServiceObj.priceOptions.find(p => p.id === formData.vehicleType || p.label === formData.vehicleType) || selectedServiceObj.priceOptions[0];
  }, [selectedServiceObj, formData.vehicleType]);

  const addonsTotal = useMemo(() => {
    return safeArray(formData.addons).reduce((acc, addonId) => {
      const a = ADDONS.find(x => x.id === addonId);
      return acc + (a ? a.price : 0);
    }, 0);
  }, [formData.addons]);

  const totalPrice = basePriceObj.price + addonsTotal;

  const validateCurrentStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.serviceId) newErrors.serviceId = 'Escolha um serviço para continuar.';
      
      const priceOptions = safeArray(selectedServiceObj?.priceOptions);
      if (priceOptions.length === 0) {
        newErrors.vehicleType = 'Este serviço ainda não possui opções de preço cadastradas.';
      } else if (!formData.vehicleType) {
        newErrors.vehicleType = 'Selecione a categoria do veículo para calcular o valor.';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.carModel.trim()) newErrors.carModel = 'Informe o modelo do veículo.';
      if (!formData.carYear.trim()) newErrors.carYear = 'Informe o ano do veículo.';
      if (!formData.carColor.trim()) newErrors.carColor = 'Informe a cor do veículo.';
      if (!formData.carCondition.trim()) newErrors.carCondition = 'Descreva o estado atual do veículo.';
    }
    
    if (currentStep === 3) {
      if (!formData.desiredDate) newErrors.desiredDate = 'Selecione uma data disponível.';
      if (!formData.desiredTime) newErrors.desiredTime = 'Selecione um horário disponível.';
    }
    
    if (currentStep === 4) {
      if (!formData.name.trim()) newErrors.name = 'Informe seu nome completo.';
      
      const phoneDigits = formData.whatsapp.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.whatsapp = 'Informe um WhatsApp válido.';
      }
    }

    setErrors(newErrors);
    
    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      // Small delay to let the DOM update (render the error messages) before scrolling
      setTimeout(() => {
        const firstErrorElement = document.getElementById(`field-${errorKeys[0]}`);
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAddon = (addonId: string) => {
    setFormData(prev => {
      const currentAddons = safeArray(prev.addons);
      if (currentAddons.includes(addonId)) {
        return { ...prev, addons: currentAddons.filter(id => id !== addonId) };
      } else {
        return { ...prev, addons: [...currentAddons, addonId] };
      }
    });
  };

  const applySuggestedTime = () => {
    if (nextAvailable) {
       setFormData(prev => ({
          ...prev,
          desiredDate: nextAvailable.date,
          desiredTime: nextAvailable.time
       }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceObj) return;

    // Double check availability one last time before submitting to avoid double booking
    const { minutes, days } = getServiceDuration(selectedServiceObj);
    const capacityOk = hasCapacityForSlot(formData.desiredDate, formData.desiredTime, minutes, bookings, scheduleSettings, days);
    
    if (!capacityOk) {
       setErrors(prev => ({ ...prev, desiredTime: "Esse horário acabou de ficar indisponível. Escolha outro horário." }));
       setStep(3); // Send back to schedule step
       return;
    }

    const endTimeVal = calculateEndTime(formData.desiredTime, minutes);

    const addonsObjects = safeArray(formData.addons).map(id => {
       const a = ADDONS.find(x => x.id === id);
       return a ? { id: a.id, name: a.name, price: a.price } : { id, name: id, price: 0 };
    });

    const newProtocol = `SR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: BookingRequest = {
      id: '', // Will be assigned by Firestore
      protocol: newProtocol,
      customerName: formData.name,
      customerPhone: formData.whatsapp,
      vehicleModel: formData.carModel,
      vehicleType: formData.vehicleType,
      vehicleYear: formData.carYear,
      vehicleColor: formData.carColor,
      carCondition: formData.carCondition,
      serviceId: formData.serviceId,
      serviceName: safeText(selectedServiceObj.name) || 'Serviço sem nome',
      serviceDurationMinutes: safeNumber(minutes),
      serviceDurationDays: safeNumber(days),
      selectedPriceLabel: safeText(basePriceObj.label),
      servicePrice: safeNumber(basePriceObj.price),
      addOns: addonsObjects,
      date: formData.desiredDate,
      time: formData.desiredTime,
      startTime: formData.desiredTime,
      endTime: endTimeVal,
      notes: '',
      status: RequestStatus.REQUESTED,
      createdAt: new Date().toISOString(),
      totalPrice: safeNumber(totalPrice),
      serviceSnapshot: {
        serviceId: formData.serviceId,
        serviceName: safeText(selectedServiceObj.name) || 'Serviço sem nome',
        priceOptionLabel: safeText(basePriceObj.label),
        price: safeNumber(basePriceObj.price),
        deliveryLabel: safeText(selectedServiceObj.deliveryLabel),
        durationMinutes: safeNumber(minutes),
        durationDays: safeNumber(days),
      }
    };
    
    try {
      const { db } = await import('../lib/firebase');
      const { collection, addDoc, updateDoc } = await import('firebase/firestore');
      
      const docRef = await addDoc(collection(db, 'bookings'), newRequest);
      await updateDoc(docRef, { id: docRef.id });
      newRequest.id = docRef.id;

      onSubmit(newRequest);
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('status');
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrors({ serverError: getFirebaseFriendlyError(err, "Erro ao criar agendamento. Tente novamente.") });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFD000]/10 to-transparent opacity-50 blur-[50px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD000]/10 rounded-full blur-3xl"></div>
        
        <motion.div
           initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
           animate={{ scale: 1, opacity: 1, rotate: 0 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className="w-28 h-28 bg-gradient-to-tr from-[#111114] to-[#050505] rounded-[2.5rem] flex items-center justify-center text-[#FFE066] mb-10 border border-[#FFD000]/40 shadow-[0_0_40px_rgba(255,208,0,0.3)] relative z-10"
        >
          <CheckCircle size={48} className="drop-shadow-[0_0_15px_rgba(255,208,0,0.6)] relative z-10" />
        </motion.div>
        
        <motion.h2 
           initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
           className="text-[2.2rem] font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#F4F4F2] to-[#A7A7A3] mb-4 tracking-tighter leading-tight relative z-10"
        >
           Solicitação enviada.
        </motion.h2>
        
        <motion.p 
           initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
           className="text-[#6F7175] mb-8 leading-relaxed text-sm max-w-[280px] relative z-10"
        >
          A <strong className="text-[#FFE066]">SR Details</strong> recebeu seu pedido. Você pode acompanhar o status na aba correspondente.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center gap-2 text-[10px] font-black text-[#6F7175] uppercase tracking-[3px] relative z-10 bg-[#050505] px-4 py-2 rounded-full border border-white/5 shadow-inner"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD000] animate-pulse"></div>
          Redirecionando para status...
        </motion.div>
      </div>
    );
  }

  const steps = [
     { id: 1, label: 'Serviço' },
     { id: 2, label: 'Veículo' },
     { id: 3, label: 'Agenda' },
     { id: 4, label: 'Contato' },
     { id: 5, label: 'Resumo' }
  ];

  const otherServices = useMemo(() => {
    return activeServices
      .filter(s => s.id !== formData.serviceId)
      .sort((a, b) => (Number(b.featuredOnHome) - Number(a.featuredOnHome)) || ((safeNumber(a.displayOrder) || 99) - (safeNumber(b.displayOrder) || 99)))
      .slice(0, 6);
  }, [activeServices, formData.serviceId]);

  return (
    <div id="booking-view" className="pb-[140px] pt-8 px-6 min-h-screen relative">
      <header className="mb-8 relative z-10">
        <h1 className="text-3xl font-black text-[#F4F4F2] mb-3 tracking-tight">Agendamento.</h1>
        <p className="text-[#A7A7A3] text-sm leading-relaxed max-w-[300px]">Configure os detalhes do cuidado desejado em poucos passos.</p>
      </header>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 relative z-10">
         <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#111114] -z-10 -translate-y-1/2">
            <motion.div 
               className="h-full bg-gradient-to-r from-[#FFE066] to-[#B8860B]"
               initial={{ width: '0%' }}
               animate={{ width: `${((step - 1) / 4) * 100}%` }}
               transition={{ duration: 0.3 }}
            ></motion.div>
         </div>
         {steps.map(s => {
            const isActive = step >= s.id;
            const isCurrent = step === s.id;
            return (
               <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${isActive ? 'bg-[#FFD000] text-[#050505] shadow-[0_0_15px_rgba(255,208,0,0.4)]' : 'bg-[#111114] border border-white/10 text-[#6F7175]'}`}>
                     {s.id}
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-black transition-colors ${isCurrent ? 'text-[#FFE066]' : isActive ? 'text-[#F4F4F2]' : 'text-[#6F7175]'}`}>{s.label}</span>
               </div>
            )
         })}
      </div>

      <div className="relative z-10">
         <AnimatePresence mode="wait">
            {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {/* Serviço Principal */}
                  <div id="field-serviceId" className={`bg-[#0B0B0D]/90 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border shadow-2xl relative overflow-hidden transition-colors ${errors.serviceId ? 'border-red-500/40 bg-red-500/5' : 'border-[#FFD000]/20'}`}>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/5 blur-3xl rounded-full pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="text-[11px] sm:text-xs font-black text-[#6F7175] flex items-center gap-2 uppercase tracking-[3px]">
                          <ShieldCheck size={14} className="text-[#FFD000]" /> Serviço Principal
                        </h3>
                     </div>
                     <div className="relative z-10">
                        {selectedServiceObj ? (
                           <div className="bg-[#050505] border border-white/5 rounded-2xl p-4 shadow-inner flex flex-col gap-3 relative">
                              <div className="flex justify-between items-start gap-4">
                                 <div className="flex-1 min-w-0">
                                    <span className="inline-block text-[8px] uppercase tracking-widest text-[#FFD000] font-black bg-[#FFD000]/10 px-2 py-0.5 rounded-sm mb-1.5">
                                       {safeText(selectedServiceObj.categoryName) || 'Serviço'}
                                    </span>
                                    <h4 className="text-[15px] sm:text-base font-black text-[#F4F4F2] leading-tight truncate">
                                       {safeText(selectedServiceObj.name) || 'Serviço Selecionado'}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] uppercase font-bold tracking-wider">
                                       <span className="text-[#FFE066]">{getPriceDisplay(safeArray(selectedServiceObj.priceOptions))}</span>
                                       <span className="text-[#6F7175] hidden sm:inline-block">•</span>
                                       <span className="text-[#A7A7A3] flex items-center gap-1">
                                          <Clock size={10} className="text-[#FFD000]" />
                                          {safeText(selectedServiceObj.deliveryLabel) || 'Consultar'}
                                       </span>
                                    </div>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={() => setIsServiceModalOpen(true)}
                                   className="text-[9px] sm:text-[10px] font-bold text-[#FFD000] uppercase tracking-wider bg-[#FFD000]/10 px-3 py-1.5 rounded-full hover:bg-[#FFD000]/20 transition-colors shrink-0 border border-[#FFD000]/20"
                                 >
                                   Trocar
                                 </button>
                              </div>
                              {safeText(selectedServiceObj.shortDescription) && (
                                <p className="text-[#A7A7A3] text-[11px] line-clamp-1 leading-relaxed border-t border-white/5 pt-2 mt-1">
                                  {safeText(selectedServiceObj.shortDescription)}
                                </p>
                              )}
                           </div>
                        ) : (
                           <button 
                             type="button"
                             onClick={() => setIsServiceModalOpen(true)}
                             className="w-full bg-[#050505] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#FFD000]/30 transition-all text-[#A7A7A3]"
                           >
                             <Search size={24} className="text-white/20" />
                             <span className="text-sm font-bold">Clique para selecionar um serviço</span>
                           </button>
                        )}
                        {errors.serviceId && <p className="text-red-400 text-xs mt-3 flex items-center gap-1.5"><X size={12} /> {errors.serviceId}</p>}
                     </div>
                  </div>

                  {/* Outros serviços disponíveis */}
                  {otherServices.length > 0 && selectedServiceObj && (
                     <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                           <div>
                              <h4 className="text-xs font-bold text-[#F4F4F2]">Outros serviços disponíveis</h4>
                              <p className="text-[10px] text-[#6F7175]">Toque para comparar e trocar.</p>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => setIsServiceModalOpen(true)}
                             className="text-[10px] font-bold text-[#FFD000] hover:underline"
                           >
                              Ver todos
                           </button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 mask-edges">
                           {otherServices.map(service => (
                              <button
                                 key={service.id}
                                 type="button"
                                 onClick={() => {
                                    setFormData(p => ({
                                       ...p,
                                       serviceId: service.id,
                                       vehicleType: '', // Reset vehicle type
                                       addons: Array.isArray(p.addons) ? p.addons : []
                                    }));
                                    setErrors(p => ({ ...p, serviceId: '' }));
                                 }}
                                 className="w-[160px] sm:w-[180px] shrink-0 bg-[#0B0B0D]/50 border border-white/5 hover:border-[#FFD000]/30 hover:bg-[#0B0B0D] rounded-2xl p-3 text-left transition-all flex flex-col gap-2 relative overflow-hidden group"
                              >
                                 <span className="text-[8px] uppercase tracking-wider text-[#FFD000] font-black">{safeText(service.categoryName) || 'Serviço'}</span>
                                 <h5 className="text-[13px] font-black text-[#F4F4F2] leading-tight line-clamp-1">{safeText(service.name) || 'Sem nome'}</h5>
                                 <div className="flex flex-col gap-1 mt-1">
                                    <span className="text-[10px] text-[#FFE066] font-bold">{getPriceDisplay(safeArray(service.priceOptions))}</span>
                                    <span className="text-[9px] text-[#A7A7A3] flex items-center gap-1">
                                       <Clock size={8} className="text-[#FFD000]" />
                                       {safeText(service.deliveryLabel) || 'Consultar'}
                                    </span>
                                 </div>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Categoria do Veículo (Substitui os chips apertados por cards premium) */}
                  {selectedServiceObj && (
                     <div id="field-vehicleType" className={`bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl relative overflow-hidden transition-colors ${errors.vehicleType ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
                        <h3 className="text-xs font-black text-[#6F7175] mb-2 flex items-center gap-2 uppercase tracking-[3px] relative z-10">
                          <Car size={14} className="text-[#FFD000]" /> Categoria do Veículo
                        </h3>
                        <p className="text-[#A7A7A3] text-xs mb-5">O valor varia conforme a categoria e tamanho do veículo.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                           {safeArray(selectedServiceObj.priceOptions).length === 0 ? (
                              <p className="text-[#A7A7A3] text-sm py-4">Este serviço ainda não possui opções de preço cadastradas.</p>
                           ) : safeArray(selectedServiceObj.priceOptions).map(priceOption => {
                              const isSelected = formData.vehicleType === priceOption.id || formData.vehicleType === priceOption.label;
                              // Quebra labels longos para ficarem mais elegantes
                              const labelParts = (priceOption.label || '').split('/');
                              
                              return (
                                 <button 
                                    key={priceOption.id || priceOption.label}
                                    onClick={() => setFormData(p => ({ ...p, vehicleType: priceOption.id }))}
                                    className={`p-4 rounded-2xl border flex flex-col gap-1.5 text-left transition-all min-w-0 ${isSelected ? 'bg-[#FFD000]/10 border-[#FFD000]/40 shadow-[0_0_15px_rgba(255,208,0,0.15)]' : 'bg-[#050505] border-white/5 hover:border-white/20'}`}
                                 >
                                    <div className="flex justify-between items-start w-full gap-2 overflow-hidden">
                                       <div className="flex flex-col min-w-0">
                                          <span className={`text-sm font-black uppercase tracking-wide truncate ${isSelected ? 'text-[#FFE066]' : 'text-[#F4F4F2]'}`}>
                                             {labelParts[0]}
                                          </span>
                                          {labelParts.length > 1 && (
                                             <span className="text-[10px] text-[#A7A7A3] uppercase tracking-widest truncate">
                                                {labelParts.slice(1).join(' / ')}
                                             </span>
                                          )}
                                       </div>
                                       {isSelected && <div className="shrink-0 w-5 h-5 rounded-full bg-[#FFD000] flex items-center justify-center text-[#050505]"><Check size={12} strokeWidth={4} /></div>}
                                    </div>
                                    <div className="mt-2 text-lg font-black text-[#F4F4F2]">
                                       {formatCurrency(priceOption.price)}
                                    </div>
                                    {priceOption.installmentLabel && (
                                       <span className="text-[10px] text-[#FFD000]">ou {priceOption.installmentLabel}</span>
                                    )}
                                 </button>
                              )
                           })}
                        </div>
                        {errors.vehicleType && <p className="text-red-400 text-xs mt-3 relative z-10">{errors.vehicleType}</p>}
                     </div>
                  )}

                  {/* Adicionais movidos para Etapa 1 */}
                  <div className="bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative">
                     <h3 className="text-xs font-black text-[#6F7175] mb-2 flex items-center gap-2 uppercase tracking-[3px]">
                       <Tag size={14} className="text-[#FFD000]" /> Serviços Adicionais
                     </h3>
                     <p className="text-[#A7A7A3] text-xs mb-5">Personalize seu pacote adicionando proteções extras.</p>
                     
                     <div className="space-y-3">
                        {ADDONS.map(addon => {
                           const isSelected = safeArray(formData.addons).includes(addon.id);
                           return (
                              <div 
                                 key={addon.id} 
                                 onClick={() => toggleAddon(addon.id)}
                                 className={`p-4 rounded-[1.5rem] border cursor-pointer flex items-center justify-between transition-all gap-4 min-w-0 ${isSelected ? 'bg-[#FFD000]/5 border-[#FFD000]/40' : 'bg-[#050505] border-white/5 hover:border-white/20'}`}
                              >
                                 <div className="flex items-start gap-3 overflow-hidden">
                                    <div className={`w-5 h-5 mt-0.5 shrink-0 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-[#FFD000] border-[#FFD000]' : 'bg-[#111114] border-white/10'}`}>
                                       {isSelected && <Check size={12} className="text-[#050505]" />}
                                    </div>
                                    <span className={`text-[13px] font-bold truncate whitespace-normal leading-tight ${isSelected ? 'text-[#F4F4F2]' : 'text-[#A7A7A3]'}`}>{addon.name}</span>
                                 </div>
                                 <span className={`text-xs font-black shrink-0 ${isSelected ? 'text-[#FFE066]' : 'text-[#6F7175]'}`}>+ {formatCurrency(addon.price)}</span>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               </motion.div>
            )}

            {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative">
                     <h3 className="text-xs font-black text-[#6F7175] mb-5 flex items-center gap-2 uppercase tracking-[3px]">
                       <Car size={14} className="text-[#FFD000]" /> Detalhes do Veículo
                     </h3>
                     <p className="text-[#A7A7A3] text-xs mb-6">Mencione informações extras do veículo para receber o melhor atendimento.</p>
                     
                     <div className="space-y-4">
                        <div id="field-carModel">
                           <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Modelo do Carro *</label>
                           <input
                              name="carModel"
                              type="text"
                              value={formData.carModel}
                              onChange={handleChange}
                              placeholder="Ex: BMW 320i M Sport"
                              className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all shadow-inner placeholder:text-[#6F7175] ${errors.carModel ? 'border-red-500/50' : 'border-white/10'}`}
                           />
                           {errors.carModel && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.carModel}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div id="field-carYear">
                              <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Ano *</label>
                              <input
                                 name="carYear"
                                 type="text"
                                 value={formData.carYear}
                                 onChange={handleChange}
                                 placeholder="Ex: 2024"
                                 className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all shadow-inner placeholder:text-[#6F7175] ${errors.carYear ? 'border-red-500/50' : 'border-white/10'}`}
                              />
                              {errors.carYear && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.carYear}</p>}
                           </div>
                           <div id="field-carColor">
                              <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Cor *</label>
                              <input
                                 name="carColor"
                                 type="text"
                                 value={formData.carColor}
                                 onChange={handleChange}
                                 placeholder="Ex: Branco"
                                 className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all shadow-inner placeholder:text-[#6F7175] ${errors.carColor ? 'border-red-500/50' : 'border-white/10'}`}
                              />
                              {errors.carColor && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.carColor}</p>}
                           </div>
                        </div>

                        <div id="field-carCondition">
                           <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Estado Atual *</label>
                           <textarea
                              name="carCondition"
                              value={formData.carCondition}
                              onChange={(e) => setFormData(p => ({ ...p, carCondition: e.target.value }))}
                              placeholder="Ex: Pintura muito opaca, interior com marcas de uso..."
                              className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all min-h-[100px] resize-none shadow-inner placeholder:text-[#6F7175] ${errors.carCondition ? 'border-red-500/50' : 'border-white/10'}`}
                           />
                           {errors.carCondition && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.carCondition}</p>}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl relative overflow-hidden transition-colors">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/5 blur-3xl rounded-full pointer-events-none"></div>
                     <h3 className="text-xs font-black text-[#6F7175] mb-5 flex items-center gap-2 uppercase tracking-[3px] relative z-10">
                       <CalendarRange size={14} className="text-[#FFD000]" /> Data Sugerida
                     </h3>
                     <p className="text-[#A7A7A3] text-xs mb-6 relative z-10">Use nossa agenda inteligente para encontrar sua vaga.</p>

                     <div className="space-y-4 relative z-10">
                        <div id="field-desiredDate" className="relative">
                           <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Data *</label>
                           <button
                              type="button"
                              onClick={() => selectedServiceObj && setIsCalendarOpen(true)}
                              className={`w-full text-left bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-[13px] shadow-inner flex items-center justify-between transition-all ${errors.desiredDate ? 'border-red-500/50' : 'border-white/10'}`}
                           >
                              {formData.desiredDate ? formData.desiredDate.split('-').reverse().join('/') : <span className="text-[#6F7175]">Escolha uma data</span>}
                              <Calendar size={16} className="text-[#6F7175]" />
                           </button>
                           {errors.desiredDate && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.desiredDate}</p>}
                        </div>

                        {dateError && (
                          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-xs mt-2 relative z-10">
                             {dateError}
                             {nextAvailable && (
                                <div className="mt-3">
                                   <p className="mb-2 text-[#F4F4F2]">Próximo horário disponível:</p>
                                   <button 
                                      onClick={applySuggestedTime}
                                      className="bg-[#FFD000] text-[#050505] font-black px-4 py-3 rounded-xl border-none w-full active:scale-95 transition-all text-sm"
                                   >
                                      Usar {nextAvailable.date.split('-').reverse().join('/')} às {nextAvailable.time}
                                   </button>
                                </div>
                             )}
                          </div>
                        )}

                        {!dateError && formData.desiredDate && availableTimes.length > 0 && (
                          <div id="field-desiredTime" className="mt-4">
                             <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-3 tracking-[3px]">Horários *</label>
                             <div className="grid grid-cols-4 gap-2">
                                {availableTimes.map(time => {
                                   const isSelected = formData.desiredTime === time;
                                   return (
                                      <button
                                         key={time}
                                         onClick={() => setFormData(p => ({ ...p, desiredTime: time }))}
                                         className={`py-3 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-[#FFD000] text-[#050505] border-[#FFD000] shadow-[0_0_10px_rgba(255,208,0,0.3)]' : 'bg-[#050505] text-[#F4F4F2] border-white/10 hover:border-white/30'}`}
                                      >
                                         {time}
                                      </button>
                                   )
                                })}
                             </div>
                             {errors.desiredTime && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.desiredTime}</p>}
                             <p className="text-[10px] text-[#A7A7A3] mt-4 flex items-center justify-center gap-1 bg-white/5 py-2 rounded-lg">
                                <Clock size={12} className="text-[#FFD000]" />
                                Duração estimada: {safeText(selectedServiceObj.deliveryLabel) || 'Consultar duração'}
                             </p>
                          </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            )}

            {step === 4 && (
               <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border shadow-2xl relative">
                     <h3 className="text-xs font-black text-[#6F7175] mb-5 flex items-center gap-2 uppercase tracking-[3px]">
                       <Smartphone size={14} className="text-[#FFD000]" /> Dados de Contato
                     </h3>
                     <div className="space-y-4">
                        <div id="field-name">
                           <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">Nome completo *</label>
                           <input
                              required
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Seu nome"
                              className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm shadow-inner transition-colors ${errors.name ? 'border-red-500/50' : 'border-white/10'}`}
                           />
                           {errors.name && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.name}</p>}
                        </div>
                        <div id="field-whatsapp">
                           <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[3px]">WhatsApp *</label>
                           <input
                              required
                              name="whatsapp"
                              type="tel"
                              value={formData.whatsapp}
                              onChange={(e) => {
                                 let val = e.target.value.replace(/\D/g, '');
                                 if (val.length > 11) val = val.slice(0, 11);
                                 let formatted = val;
                                 if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                                 if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
                                 setFormData(p => ({ ...p, whatsapp: formatted }));
                              }}
                              placeholder="(00) 00000-0000"
                              className={`w-full bg-[#050505] border rounded-2xl px-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm shadow-inner transition-colors ${errors.whatsapp ? 'border-red-500/50' : 'border-white/10'}`}
                           />
                           {errors.whatsapp && <p className="text-red-400 text-[10px] mt-1.5 ml-2">{errors.whatsapp}</p>}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {step === 5 && (
               <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="bg-[#0B0B0D]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-2xl relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/5 blur-3xl rounded-full pointer-events-none"></div>
                     <h3 className="text-xs font-black text-[#6F7175] mb-6 flex items-center gap-2 uppercase tracking-[3px] relative z-10">
                       <ShieldCheck size={14} className="text-[#FFD000]" /> Resumo do Pedido
                     </h3>

                     <div className="space-y-6 relative z-10">
                        {/* Service Item */}
                        <div className="flex justify-between items-start">
                           <div>
                              <span className="text-[10px] text-[#A7A7A3] uppercase tracking-widest block mb-1">Serviço Principal</span>
                              <p className="text-[15px] font-black text-[#F4F4F2]">{safeText(selectedServiceObj.name) || 'Serviço selecionado'}</p>
                              <p className="text-xs text-[#6F7175] mt-1">{safeText(basePriceObj.label)}</p>
                           </div>
                           <span className="text-[13px] font-bold text-[#F4F4F2]">{formatCurrency(safeNumber(basePriceObj.price))}</span>
                        </div>

                        {/* Addons */}
                        {safeArray(formData.addons).length > 0 && (
                           <div className="pt-4 border-t border-white/5 space-y-3">
                              <span className="text-[10px] text-[#A7A7A3] uppercase tracking-widest block mb-2">Adicionais</span>
                              {safeArray(formData.addons).map(addonId => {
                                 const a = ADDONS.find(x => x.id === addonId);
                                 if(!a) return null;
                                 return (
                                    <div key={addonId} className="flex justify-between items-start">
                                       <p className="text-[13px] text-[#F4F4F2]">{a.name}</p>
                                       <span className="text-xs text-[#A7A7A3]">{formatCurrency(a.price)}</span>
                                    </div>
                                 )
                              })}
                           </div>
                        )}

                        <div className="pt-4 border-t border-white/5">
                           <div className="flex justify-between items-end p-4 rounded-2xl bg-[#050505] border border-white/5">
                              <span className="text-[11px] font-black uppercase tracking-[2px] text-[#A7A7A3]">Total Previsto</span>
                              <span className="text-[22px] leading-none font-black text-[#FFE066]">{formatCurrency(totalPrice)}</span>
                           </div>
                        </div>

                        {/* Customer Summary */}
                        <div className="pt-4 border-t border-white/5 space-y-2">
                           <div className="flex justify-between text-[11px]">
                              <span className="text-[#6F7175] uppercase tracking-widest font-black">Cliente</span>
                              <span className="text-[#F4F4F2] font-bold text-right">{formData.name}</span>
                           </div>
                           <div className="flex justify-between text-[11px]">
                              <span className="text-[#6F7175] uppercase tracking-widest font-black">Contato</span>
                              <span className="text-[#F4F4F2] font-bold text-right">{formData.whatsapp}</span>
                           </div>
                           <div className="flex justify-between text-[11px]">
                              <span className="text-[#6F7175] uppercase tracking-widest font-black">Veículo</span>
                              <span className="text-[#F4F4F2] font-bold text-right">{formData.carModel} • {formData.carYear} • {formData.carColor}</span>
                           </div>
                           <div className="flex justify-between text-[11px]">
                              <span className="text-[#6F7175] uppercase tracking-widest font-black">Agendamento</span>
                              <span className="text-[#F4F4F2] font-bold text-right">
                                 {formData.desiredDate.split('-').reverse().join('/')} às {formData.desiredTime}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Navigation Buttons footer */}
         <div className="mt-8 flex gap-3">
            {step > 1 && (
               <button 
                  onClick={handlePrev}
                  className="w-14 h-14 shrink-0 rounded-2xl bg-[#111114] border border-white/5 flex items-center justify-center text-[#F4F4F2] active:scale-95 transition-all"
               >
                  <ChevronLeft size={20} />
               </button>
            )}
            
            {step < 5 ? (
               <button 
                  onClick={handleNext}
                  className="flex-1 max-w-[calc(100%-60px)] h-14 rounded-2xl bg-[#0B0B0D] border border-white/10 flex items-center justify-between px-6 text-[#F4F4F2] active:scale-95 transition-all"
               >
                  <span className="text-xs font-black uppercase tracking-[2px]">Próximo passo</span>
                  <div className="w-6 h-6 rounded-full bg-[#111114] flex items-center justify-center text-[#FFD000]"><ChevronRight size={14}/></div>
               </button>
            ) : (
               <button 
                  onClick={handleSubmit}
                  className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] shadow-[0_10px_30px_rgba(255,208,0,0.25)] flex items-center justify-center gap-3 active:scale-95 transition-all overflow-hidden relative group"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out skew-x-[-25deg]"></div>
                  <span className="text-[11px] font-black uppercase tracking-[2px] relative z-10">Confirmar Solicitação</span>
                  <Send size={14} className="relative z-10" />
               </button>
            )}
         </div>
      </div>
      <CalendarModal
         isOpen={isCalendarOpen}
         onClose={() => setIsCalendarOpen(false)}
         selectedDate={formData.desiredDate}
         onSelectDate={(date) => setFormData(p => ({ ...p, desiredDate: date }))}
         service={selectedServiceObj}
         bookings={bookings}
         scheduleSettings={scheduleSettings}
      />

      <AnimatePresence>
        {isServiceModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#0B0B0D] sm:rounded-3xl rounded-t-3xl border-t border-x sm:border-b border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto max-h-[88dvh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/5 flex justify-between items-start shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#F4F4F2] mb-1">Escolha o serviço</h3>
                  <p className="text-[11px] sm:text-xs text-[#A7A7A3]">Compare preço, duração e categoria.</p>
                </div>
                <button 
                  onClick={() => setIsServiceModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#111114] border border-white/5 flex items-center justify-center text-[#A7A7A3] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search & Filters */}
              <div className="p-4 border-b border-white/5 flex flex-col gap-3 shrink-0 bg-[#050505]/50">
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7175]" />
                  <input 
                    type="text" 
                    placeholder="Buscar serviço..."
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                    className="w-full bg-[#111114] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none transition-colors placeholder:text-[#6F7175]"
                  />
                  {serviceSearch && (
                    <button 
                      onClick={() => setServiceSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F7175] hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 mask-edges">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setServiceCategoryFilter(cat)}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${serviceCategoryFilter === cat ? 'bg-[#FFD000]/10 border-[#FFD000]/30 text-[#FFD000]' : 'bg-[#111114] border-white/5 text-[#A7A7A3] hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 relative pb-28 sm:pb-6">
                {filteredModalServices.length === 0 ? (
                  <div className="text-center py-10 opacity-50">
                     <p className="text-[#A7A7A3] mt-2 text-sm">Nenhum serviço encontrado.</p>
                  </div>
                ) : (
                  filteredModalServices.map(service => {
                    const isSelected = formData.serviceId === service.id;
                    return (
                      <button
                        key={service.id}
                        onClick={() => {
                          setFormData(p => ({
                            ...p, 
                            serviceId: service.id,
                            vehicleType: p.serviceId === service.id ? p.vehicleType : '', // reset if changed
                            addons: Array.isArray(p.addons) ? p.addons : []
                          }));
                          setErrors(p => ({ ...p, serviceId: '' }));
                          setIsServiceModalOpen(false);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-2 ${isSelected ? 'bg-[#FFD000]/5 border-[#FFD000]/40' : 'bg-[#111114] border-white/5 hover:border-white/20'}`}
                      >
                        {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD000]/10 blur-2xl rounded-full pointer-events-none"></div>}
                        
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 min-w-0">
                              <span className="text-[9px] uppercase tracking-widest text-[#FFD000] font-black">{safeText(service.categoryName) || 'Serviço'}</span>
                              <h4 className="text-[15px] sm:text-base font-black text-[#F4F4F2] mt-0.5 truncate">{safeText(service.name) || 'Sem Nome'}</h4>
                           </div>
                           {isSelected && (
                             <div className="w-5 h-5 rounded-full bg-[#FFD000] flex items-center justify-center shrink-0 mt-1">
                               <Check size={12} className="text-black" />
                             </div>
                           )}
                        </div>

                        <p className="text-[11px] sm:text-xs text-[#A7A7A3] line-clamp-1">{safeText(service.shortDescription) || 'Sem descrição.'}</p>

                        <div className="flex flex-wrap items-center gap-3 pt-2 mt-1 border-t border-white/5 w-full">
                           <div className="flex items-center gap-1">
                              <span className="text-[12px] text-[#FFE066] font-black">{getPriceDisplay(safeArray(service.priceOptions))}</span>
                           </div>
                           <div className="w-px h-3 bg-white/10"></div>
                           <div className="flex items-center gap-1.5 text-[#A7A7A3] text-[10px] font-bold">
                              <Clock size={10} className="text-[#FFD000]" />
                              <span>{safeText(service.deliveryLabel) || 'Consultar'}</span>
                           </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
