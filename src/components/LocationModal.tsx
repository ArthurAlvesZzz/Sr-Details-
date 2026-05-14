import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation2, Copy, X, Check } from 'lucide-react';
import { useState } from 'react';
import { BusinessSettings } from '../types.ts';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BusinessSettings;
}

export default function LocationModal({ isOpen, onClose, brand }: LocationModalProps) {
  const [copied, setCopied] = useState(false);
  const address = brand.address + (brand.city ? `, ${brand.city}` : '') + (brand.state ? ` - ${brand.state}` : '');
  const encodedAddress = encodeURIComponent(address);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    if (brand.googleMapsUrl) {
       window.open(brand.googleMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
       window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050505]/90 backdrop-blur-sm z-[100] pointer-events-auto"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="fixed bottom-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[100] pointer-events-auto flex flex-col justify-end sm:justify-center p-4 max-h-[100dvh]"
          >
            <div className="bg-[#0B0B0D] border border-white/10 sm:rounded-[2rem] rounded-[2rem] p-6 shadow-2xl relative overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 flex flex-col max-h-[85vh] no-scrollbar">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD000]/10 blur-[40px] pointer-events-none rounded-full -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-[#F4F4F2] tracking-tight flex items-center gap-2">
                    <MapPin size={20} className="text-[#FFD000]" />
                    Como chegar
                  </h3>
                  <p className="text-[#A7A7A3] text-[11px] uppercase tracking-[1px] mt-1">Visite a nossa estética</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111114] border border-white/5 text-[#6F7175] hover:text-[#F4F4F2] hover:bg-white/5 transition-colors absolute right-0 top-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Address details */}
              <div className="mb-4 relative z-10 shrink-0">
                <p className="text-[#FFD000] text-[10px] uppercase font-black tracking-[3px] mb-1">{brand.businessName}</p>
                <p className="text-[#F4F4F2] text-sm font-medium">{address}</p>
              </div>

              {/* Map Preview Area */}
              <div className="relative w-full h-48 sm:h-56 bg-[#111114] rounded-[1.5rem] mb-6 overflow-hidden border border-[#FFD000]/20 flex items-center justify-center shrink-0 shadow-inner">
                {/* Real Google Maps Iframe */}
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodedAddress}&t=m&z=15&output=embed&iwloc=near`}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa da Localização"
                  className="absolute inset-0 z-10 opacity-90"
                ></iframe>
                {/* Fallback glow/shadows over the edges */}
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(11,11,13,0.8)] pointer-events-none z-20"></div>
              </div>

              <div className="mb-6 relative z-10 shrink-0">
                <p className="text-[#A7A7A3] text-xs">
                  Abra a rota no Google Maps para chegar até a estética automotiva.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 relative z-10 shrink-0">
                <button 
                  onClick={openGoogleMaps}
                  className="w-full bg-gradient-to-r from-[#FFE066] via-[#FFD000] to-[#B8860B] text-[#050505] font-black uppercase tracking-[2px] py-4 rounded-[1.25rem] flex items-center justify-center gap-2 text-[11px] shadow-[0_5px_20px_rgba(255,208,0,0.2)] active:scale-95 transition-all overflow-hidden group"
                >
                  <Navigation2 size={16} className="text-[#050505]" />
                  Abrir rota no Google Maps
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out skew-x-[-25deg]"></div>
                </button>
                
                <button 
                  onClick={handleCopy}
                  className="w-full bg-[#111114] border border-white/5 font-bold uppercase tracking-[1.5px] py-4 rounded-[1.25rem] flex items-center justify-center gap-2 text-[10px] active:scale-95 transition-all hover:text-[#F4F4F2] hover:border-white/10 text-[#6F7175]"
                >
                  {copied ? <Check size={14} className="text-[#FFD000]" /> : <Copy size={14} />}
                  <span>
                    {copied ? 'Endereço copiado' : 'Copiar endereço'}
                  </span>
                </button>
              </div>
              
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
