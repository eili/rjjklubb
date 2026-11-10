import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer,
  collection,
  addDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  ClubConfig, 
  SiteContent, 
  Instructor, 
  SummerCampInfo, 
  TrainingClass, 
  MediaItem 
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
    await ensureAuth();
    const docRef = doc(db, 'clubData', 'main');
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.uid || 'admin',
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CLUB_DATA_DOC_PATH);
    return false;
  }
}

// Save trial booking inquiry from visitor
export async function submitTrialBookingToFirestore(booking: {
  name: string;
  email: string;
  phone: string;
  ageGroup: string;
  experience?: string;
  message?: string;
}): Promise<boolean> {
  const path = 'trialBookings';
  try {
    const colRef = collection(db, path);
    await addDoc(colRef, {
      ...booking,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}
