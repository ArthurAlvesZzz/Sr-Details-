import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, ArrowRight, Loader2, X, TerminalSquare, Key, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider.tsx';
import { View } from '../types.ts';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';

interface Props {
  onNavigate: (view: View, params?: { serviceId?: string }) => void;
}

function DevDiagnostics() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' | 'operation-not-allowed-info' } | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);

  const fetchAdmins = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const snap = await getDocs(collection(db, 'adminUsers'));
      if (snap.empty) {
        setMessage({ text: 'Nenhum admin cadastrado em adminUsers.', type: 'info' });
        setAdmins([]);
      } else {
        const list = snap.docs.map(d => d.data());
        setAdmins(list);
        setMessage({ text: 'Admins cadastrados encontrados.', type: 'success' });
      }
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
         setMessage({ text: 'Permissão negada para listar. O usuário precisa estar autenticado como Admin/Owner. Verifique no painel do Firebase.', type: 'error' });
      } else {
         setMessage({ text: err.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevModeInfo = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, 'dev@srdetails.com.br', '123456');
        uid = cred.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
           setMessage({ text: 'O usuário dev@srdetails.com.br já existe no Firebase Auth. Tente fazer login com ele ou redefina a senha pelo Firebase Console.', type: 'error' });
           setLoading(false);
           return;
        } else if (authErr.code === 'auth/operation-not-allowed' || authErr.message?.includes('operation-not-allowed')) {
           setMessage({ 
             text: 'Não foi possível criar o admin de teste porque o provedor Email/Password está desativado no Firebase Authentication. Ative em Firebase Console > Authentication > Sign-in method > Email/Password.', 
             type: 'operation-not-allowed-info'
           });
           setLoading(false);
           return;
        }
        throw authErr;
      }

      await setDoc(doc(db, 'adminUsers', uid), {
        id: uid,
        email: 'dev@srdetails.com.br',
        name: 'Admin Desenvolvimento',
        role: 'owner',
        createdAt: new Date().toISOString()
      });

      setMessage({ text: 'Admin dev@srdetails.com.br / 123456 criado com sucesso! Você já pode fazer login.', type: 'success' });
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        setMessage({ text: 'Permissão negada pelo Firestore. Faça login com brgamexd@gmail.com ou crie o admin manualmente no Firebase Console.', type: 'error' });
      } else {
        setMessage({ text: err.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMasterAdmin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, 'brgamexd@gmail.com', '123456');
        uid = cred.user.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
           setMessage({ text: 'O usuário brgamexd@gmail.com já existe. Faça login com sua senha atual ou redefina no Console do Firebase.', type: 'error' });
           setLoading(false);
           return;
        } else if (authErr.code === 'auth/operation-not-allowed' || authErr.message?.includes('operation-not-allowed')) {
           setMessage({ 
             text: 'Não foi possível criar o admin porque o provedor Email/Password está desativado no Firebase Authentication. Ative em Firebase Console > Authentication > Sign-in method > Email/Password.', 
             type: 'operation-not-allowed-info'
           });
           setLoading(false);
           return;
        }
        throw authErr;
      }

      await setDoc(doc(db, 'adminUsers', uid), {
        id: uid,
        email: 'brgamexd@gmail.com',
        name: 'Arthur Admin',
        role: 'owner',
        createdAt: new Date().toISOString()
      });

      setMessage({ text: 'Admin Mestre brgamexd@gmail.com / 123456 criado com sucesso! Você já pode fazer login.', type: 'success' });
    } catch (err: any) {
      if (err.message?.includes('permission') || err.code === 'permission-denied') {
        setMessage({ text: 'Permissão negada pelo Firestore de criar o documento adminUsers. Porém a conta do Firebase Auth oi criada com a senha 123456. Tente fazer login.', type: 'error' });
      } else {
        setMessage({ text: err.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-6">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-[10px] uppercase tracking-widest text-[#6F7175] flex items-center justify-center gap-2 py-2 hover:text-[#A7A7A3] transition-colors"
      >
        <TerminalSquare size={14} /> Ferramenta de Diagnóstico Dev
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#111114] border border-dashed border-[#FFD000]/30 rounded-2xl p-4 mt-2 space-y-4">
              <div className="flex items-start gap-2 text-[#FFD000]">
                 <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                 <p className="text-[9px] uppercase tracking-wider leading-relaxed font-bold">
                   Ferramenta temporária de desenvolvimento. Remover ou proteger antes de produção.
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={fetchAdmins}
                   disabled={loading}
                   className="col-span-2 bg-[#050505] border border-white/10 p-2 text-[10px] uppercase tracking-wider text-[#A7A7A3] hover:text-[#F4F4F2] active:scale-95 rounded-xl transition-all disabled:opacity-50"
                 >
                   Verificar Admins
                 </button>
                 <button 
                   onClick={handleCreateDevModeInfo}
                   disabled={loading}
                   className="bg-[#050505] border border-white/10 p-2 text-[10px] uppercase tracking-wider text-[#A7A7A3] hover:text-[#F4F4F2] active:scale-95 rounded-xl transition-all disabled:opacity-50"
                 >
                   Criar Dev (dev@sr)
                 </button>
                 <button 
                   onClick={handleCreateMasterAdmin}
                   disabled={loading}
                   className="bg-[#050505] border border-[#FFD000]/20 p-2 text-[10px] uppercase tracking-wider text-[#FFD000] hover:bg-[#FFD000]/5 active:scale-95 rounded-xl transition-all disabled:opacity-50"
                 >
                   Criar Mestre (brgamexd)
                 </button>
              </div>

              {loading && <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-[#6F7175]" /></div>}

              {message && message.type === 'operation-not-allowed-info' ? (
                <div className="p-3 rounded-xl text-[10px] leading-relaxed border bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
                  <p className="mb-2 font-bold">{message.text}</p>
                  <p className="font-bold mt-2 text-[#F4F4F2]">Passo a passo manual:</p>
                  <ol className="list-decimal pl-4 space-y-1 mt-1 font-mono text-[9px] text-[#A7A7A3]">
                    <li>Firebase Console {'>'} Authentication {'>'} Sign-in method</li>
                    <li>Ativar Email/Password</li>
                    <li>Criar usuário: <span className="text-white">email: brgamexd@gmail.com, senha: 123456</span></li>
                    <li>Copiar o UID gerado</li>
                    <li>Ir em Firestore Database</li>
                    <li>Criar coleção <span className="text-white">adminUsers</span></li>
                    <li>Criar documento com o UID do usuário</li>
                    <li>Adicionar os campos: id: UID, email: brgamexd@gmail.com, name: Arthur Admin, role: owner, createdAt: data atual em ISO</li>
                  </ol>
                </div>
              ) : message ? (
                <div className={`p-3 rounded-xl text-[10px] leading-relaxed border ${
                  message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  {message.text}
                </div>
              ) : null}

              {admins.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                  <p className="text-[9px] uppercase tracking-wider text-[#6F7175] flex items-center gap-1"><Users size={12}/> Existentes:</p>
                  {admins.map((adm, i) => (
                    <div key={i} className="bg-[#050505] p-2 rounded-lg border border-white/5">
                      <p className="text-xs font-bold text-[#F4F4F2] truncate">{adm.name}</p>
                      <p className="text-[10px] text-[#A7A7A3] truncate">{adm.email}</p>
                      <span className="text-[8px] bg-white/10 px-1 py-0.5 rounded text-[#A7A7A3] uppercase">{adm.role}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <p className="text-[9px] leading-relaxed text-[#6F7175] italic">
                   O e-mail brgamexd@gmail.com é o e-mail mestre nas regras do Firestore, mas ele ainda precisa existir no Firebase Authentication. O Firebase não cria essa conta automaticamente.
                </p>
                <p className="text-[9px] leading-relaxed text-[#6F7175] italic">
                   Senhas existentes não podem ser visualizadas. Se não souber a senha, redefina no Firebase Console.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
         setError('O login por e-mail e senha não está habilitado no Firebase Authentication. Ative o provedor Email/Password no Firebase Console em Authentication > Sign-in method.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.message?.includes('invalid-credential') || err.message?.includes('user-not-found') || err.message?.includes('wrong-password')) {
         setError('E-mail ou senha inválidos. Confirme se este usuário existe no Firebase Authentication e se a senha está correta.');
      } else if (err.code === 'auth/too-many-requests' || err.message?.includes('too-many-requests')) {
         setError('Muitas tentativas de login. Aguarde alguns minutos ou redefina a senha pelo Firebase Console.');
      } else {
         setError(err.message || 'Falha no login');
      }
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

      <DevDiagnostics />

      <p className="mt-6 text-[10px] text-[#6F7175] text-center max-w-[250px]">
        O acesso é rastreado e restrito a colaboradores autorizados da SR Details.
      </p>
    </div>
  );
}
