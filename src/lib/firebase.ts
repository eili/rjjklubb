import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer,
  collection,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  ClubConfig, 
  SiteContent, 
  Instructor, 
  SummerCampInfo, 
  TrainingClass, 
  MediaItem,
  Member,
  TrialBooking 
} from '../types';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connectivity on initial boot as required by Firestore integration
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'clubData', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline, using local data fallback.');
    }
    return false;
  }
}

// Ensure an authenticated session exists for writes
export async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (err) {
    console.warn('Could not authenticate anonymously with Firebase:', err);
    return null;
  }
}

export interface FullClubData {
  clubConfig: ClubConfig;
  siteContent: SiteContent;
  instructors: Instructor[];
  summerCamp: SummerCampInfo;
  classes: TrainingClass[];
  mediaLibrary: MediaItem[];
  updatedAt?: string;
  updatedBy?: string;
}

const CLUB_DATA_DOC_PATH = 'clubData/main';

// Subscribe to real-time changes in club data
export function subscribeToClubData(
  onData: (data: FullClubData) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, 'clubData', 'main');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FullClubData;
        onData(data);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, CLUB_DATA_DOC_PATH);
      if (onError) onError(error);
    }
  );
}

// Save complete club data to Firestore
export async function saveClubDataToFirestore(data: FullClubData): Promise<boolean> {
  try {
    const docRef = doc(db, 'clubData', 'main');
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLUB_DATA_DOC_PATH);
    return false;
  }
}

// Fetch current cloud data directly from Firestore on demand
export async function fetchCurrentCloudData(): Promise<{ 
  exists: boolean; 
  data?: FullClubData; 
  error?: string;
  fetchedAt: string;
}> {
  try {
    const snap = await getDocFromServer(doc(db, 'clubData', 'main'));
    if (snap.exists()) {
      return { 
        exists: true, 
        data: snap.data() as FullClubData, 
        fetchedAt: new Date().toLocaleTimeString('nb-NO') 
      };
    }
    return { 
      exists: false, 
      fetchedAt: new Date().toLocaleTimeString('nb-NO') 
    };
  } catch (err: any) {
    return { 
      exists: false, 
      error: err?.message || String(err), 
      fetchedAt: new Date().toLocaleTimeString('nb-NO') 
    };
  }
}

// Save trial booking inquiry from visitor
export async function submitTrialBookingToFirestore(booking: {
  name: string;
  email?: string;
  phone: string;
  ageGroup: string;
  experience?: string;
  preferredDay?: string;
  message?: string;
}): Promise<boolean> {
  const path = 'trialBookings';
  const cleanBooking = {
    name: booking.name,
    email: booking.email || '',
    phone: booking.phone,
    ageGroup: booking.ageGroup,
    experience: booking.experience || '',
    preferredDay: booking.preferredDay || '',
    message: booking.message || '',
    createdAt: new Date().toISOString(),
    status: 'pending' as const,
  };
  try {
    const colRef = collection(db, path);
    await addDoc(colRef, cleanBooking);

    // Also cache locally for immediate UI update
    try {
      const saved = localStorage.getItem('risor_jujutsu_trial_bookings');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem('risor_jujutsu_trial_bookings', JSON.stringify([{ id: 'tb-' + Date.now(), ...cleanBooking }, ...list]));
    } catch {
      // ignore local storage error
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

// Subscribe to closed member registry
export function subscribeToMembers(
  onData: (members: Member[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'members');
  return onSnapshot(
    colRef,
    (snap) => {
      const members: Member[] = [];
      snap.forEach((d) => {
        members.push({ id: d.id, ...d.data() } as Member);
      });
      onData(members);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
      if (onError) onError(error);
    }
  );
}

// Save or update an individual member
export async function saveMemberToFirestore(member: Member): Promise<boolean> {
  const path = `members/${member.id}`;
  try {
    const docRef = doc(db, 'members', member.id);
    await setDoc(docRef, {
      ...member,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Delete a member from Firestore
export async function deleteMemberFromFirestore(memberId: string): Promise<boolean> {
  const path = `members/${memberId}`;
  try {
    await deleteDoc(doc(db, 'members', memberId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

// Subscribe to trial bookings (inquiries) for admin inbox
export function subscribeToTrialBookings(
  onData: (bookings: TrialBooking[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'trialBookings');
  return onSnapshot(
    colRef,
    (snap) => {
      const bookings: TrialBooking[] = [];
      snap.forEach((d) => {
        bookings.push({ id: d.id, ...d.data() } as TrialBooking);
      });
      // Sort newest first
      bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(bookings);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trialBookings');
      if (onError) onError(error);
    }
  );
}

// Update trial booking status (e.g., 'confirmed' or 'completed')
export async function updateTrialBookingInFirestore(
  bookingId: string, 
  updates: Partial<TrialBooking>
): Promise<boolean> {
  const path = `trialBookings/${bookingId}`;
  try {
    const docRef = doc(db, 'trialBookings', bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

// Delete trial booking
export async function deleteTrialBookingFromFirestore(bookingId: string): Promise<boolean> {
  const path = `trialBookings/${bookingId}`;
  try {
    await deleteDoc(doc(db, 'trialBookings', bookingId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}


