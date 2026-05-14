import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, ArrowRight, Loader2, X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider.tsx';
import { View } from '../types.ts';

interface Props {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
}

export default function AdminLogin({ onNavigate }: Props) {
  const { login, isAdmin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      onNavigate('admin');
    }
  }, [isAdmin, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    try {
      await login(email, password);
      onNavigate('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    }
  };

  return (
    <div className="min-h-screen pb-24 relative flex flex-col items-center justify-center px-6">
      <button 
         onClick={() => onNavigate('home')}
         className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#111114] border border-white/10 flex items-center justify-center text-[#A7A7A3] hover:text-[#F4F4F2] transition-colors z-20"
      >
         <X size={18} />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#0B0B0D]/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFD000]/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[#111114] border border-white/10 flex items-center justify-center text-[#FFD000] mb-4 shadow-inner">
            <Shield size={28} />
          </div>
          <h2 className="text-xl font-black text-[#F4F4F2] uppercase tracking-[2px] text-center">Acesso Restrito</h2>
          <p className="text-[10px] text-[#A7A7A3] tracking-[1px] uppercase mt-1">Área Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[2px]">E-mail corporativo</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7175]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srdetails.com.br"
                className="w-full bg-[#050505] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all shadow-inner placeholder:text-[#6F7175]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-[#A7A7A3] uppercase mb-2 tracking-[2px]">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F7175]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050505] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[#F4F4F2] focus:border-[#FFD000]/50 outline-none text-sm transition-all shadow-inner placeholder:text-[#6F7175]"
              />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
              <span className="text-xs text-red-400 font-bold">{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-14 rounded-2xl bg-[#FFD000] text-[#050505] shadow-[0_5px_20px_rgba(255,208,0,0.2)] flex items-center justify-center gap-2 active:scale-95 transition-all outline-none disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span className="text-[11px] font-black uppercase tracking-[2px]">Entrar no Painel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      <p className="mt-8 text-[10px] text-[#6F7175] text-center max-w-[250px]">
        O acesso é rastreado e restrito a colaboradores autorizados da SR Details.
      </p>
    </div>
  );
}
