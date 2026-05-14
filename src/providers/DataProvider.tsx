import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';
import { Service, BookingRequest, BusinessSettings, ScheduleSettings, ScannerRule } from '../types';

export interface DataContextType {
  services: Service[];
  bookings: BookingRequest[];
  businessSettings: BusinessSettings | null;
  scheduleSettings: ScheduleSettings | null;
  scannerRules: ScannerRule[];
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  services: [],
  bookings: [],
  businessSettings: null,
  scheduleSettings: null,
  scannerRules: [],
  loading: true,
  error: null
});

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null);
  const [scannerRules, setScannerRules] = useState<ScannerRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // Verify if db is configured properly, sometimes it's null if firebase is missing config
    if (!db) {
       setError("Firebase não configurado.");
       setLoading(false);
       return;
    }

    try {
      const qServices = query(collection(db, 'services'));
      unsubs.push(onSnapshot(qServices, (snap) => {
        setServices(snap.docs.map(d => ({ ...d.data(), id: d.id } as Service)));
      }, (err) => {
         setError("Não foi possível carregar os dados do Firebase.");
         handleFirestoreError(err, OperationType.LIST, 'services');
      }));

      const qBookings = query(collection(db, 'bookings'));
      unsubs.push(onSnapshot(qBookings, (snap) => {
        setBookings(snap.docs.map(d => ({ ...d.data(), id: d.id } as BookingRequest)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')));

      const docBusiness = doc(db, 'businessSettings', 'main');
      unsubs.push(onSnapshot(docBusiness, (snap) => {
        if (snap.exists()) setBusinessSettings(snap.data() as BusinessSettings);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'businessSettings/main')));

      const docSchedule = doc(db, 'scheduleSettings', 'main');
      unsubs.push(onSnapshot(docSchedule, (snap) => {
        if (snap.exists()) setScheduleSettings(snap.data() as ScheduleSettings);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'scheduleSettings/main')));

      const qScanner = query(collection(db, 'scannerRules'));
      unsubs.push(onSnapshot(qScanner, (snap) => {
        setScannerRules(snap.docs.map(d => ({ ...d.data(), id: d.id } as ScannerRule)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'scannerRules')));

    } catch (err) {
      console.error('Error starting DataProvider subscriptions', err);
      setError("Não foi possível carregar os dados do Firebase.");
    }

    // Give a buffer to avoid fast flickers
    setTimeout(() => setLoading(false), 800);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  return (
    <DataContext.Provider value={{ services, bookings, businessSettings, scheduleSettings, scannerRules, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
