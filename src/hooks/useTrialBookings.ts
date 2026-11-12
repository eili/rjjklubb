import { useState, useEffect, useCallback } from 'react';
import { TrialBooking } from '../types';
import { 
  subscribeToTrialBookings, 
  updateTrialBookingInFirestore, 
  deleteTrialBookingFromFirestore 
} from '../lib/firebase';

const LOCAL_STORAGE_KEY = 'risor_jujutsu_trial_bookings';

const initialTrialBookings: TrialBooking[] = [
  {
    id: 'tb-1',
    name: 'Fredrik Solheim',
    phone: '950 12 345',
    email: 'fredrik.solheim@example.no',
    ageGroup: 'Voksne Nybegynnere (14+ år)',
    preferredDay: 'Mandag kl 18:45',
    experience: 'Litt judo som ungdom for mange år siden',
    message: 'Gleder meg til å prøve tradisjonell Ju Jutsu i Risørhallen!',
    createdAt: '2026-08-28T18:15:00.000Z',
    status: 'pending',
  },
  {
    id: 'tb-2',
    name: 'Ida & Leo Johansen (Mor og sønn)',
    phone: '415 67 890',
    email: 'ida.johansen@example.no',
    ageGroup: 'Barn & Ungdom (8-13 år)',
    preferredDay: 'Torsdag kl 17:30',
    experience: 'Ingen tidligere erfaring',
    message: 'Sønnen min Leo (10 år) har lyst til å starte. Kan jeg være med og se på?',
    createdAt: '2026-08-25T14:30:00.000Z',
    status: 'confirmed',
  },
];

export function useTrialBookings() {
  const [trialBookings, setTrialBookings] = useState<TrialBooking[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialTrialBookings;
    } catch {
      return initialTrialBookings;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync real-time with Firestore
  useEffect(() => {
    const unsubscribe = subscribeToTrialBookings(
      (bookings) => {
        setIsLoading(false);
        if (bookings && bookings.length > 0) {
          setTrialBookings(bookings);
        }
      },
      (err) => {
        setIsLoading(false);
        console.warn('Could not load trial bookings from Firestore:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trialBookings));
    } catch (e) {
      console.warn('Could not save trial bookings to localStorage', e);
    }
  }, [trialBookings]);

  const updateStatus = useCallback(async (id: string, status: 'pending' | 'confirmed' | 'completed') => {
    setTrialBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    await updateTrialBookingInFirestore(id, { status });
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    setTrialBookings((prev) => prev.filter((b) => b.id !== id));
    await deleteTrialBookingFromFirestore(id);
  }, []);

  const pendingCount = trialBookings.filter((b) => b.status === 'pending').length;

  return {
    trialBookings,
    isLoading,
    updateStatus,
    deleteBooking,
    pendingCount,
  };
}
