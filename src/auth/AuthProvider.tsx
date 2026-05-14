import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'adminUsers', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              id: user.uid,
              email: user.email || '',
              name: data.name || user.email || '',
              role: data.role as UserRole,
              createdAt: data.createdAt || new Date().toISOString(),
              photoUrl: data.photoUrl
            });
          } else if (user.email === 'brgamexd@gmail.com') {
            // Auto-bootstrap master admin
            const newAdminData = {
              email: user.email,
              name: 'Arthur Admin',
              role: 'owner',
              createdAt: new Date().toISOString(),
            };
            try {
              const { setDoc } = await import('firebase/firestore');
              await setDoc(doc(db, 'adminUsers', user.uid), newAdminData);
              setCurrentUser({
                id: user.uid,
                email: user.email,
                name: 'Arthur Admin',
                role: 'owner',
                createdAt: newAdminData.createdAt
              });
            } catch (err) {
              console.error('Failed to bootstrap admin:', err);
              window.alert("Login autenticado, mas o Firestore bloqueou a criação do documento adminUsers. Crie manualmente adminUsers/" + user.uid + " no Firebase Console.");
              setCurrentUser(null);
              await signOut(auth);
            }
          } else {
            setCurrentUser(null);
            await signOut(auth);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `adminUsers/${user.uid}`);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (!password) {
        throw new Error('Senha é obrigatória');
      }
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setIsLoading(false);
      const customError = new Error(error?.message || 'Credenciais inválidas');
      (customError as any).code = error?.code;
      throw customError;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const isAdmin = currentUser !== null && ['owner', 'manager', 'attendant', 'technician'].includes(currentUser?.role || '');

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
