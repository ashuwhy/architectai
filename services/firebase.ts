import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Safe logging function that only logs in development
const safeLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(message, ...args);
  }
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
safeLog('✅ Firebase app initialized');

// Initialize Firebase Auth
export const auth = getAuth(app);
safeLog('✅ Firebase auth initialized');

// Initialize Firestore
export const db = getFirestore(app);
safeLog('✅ Firestore initialized');

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = async () => {
  try {
    safeLog('🔐 Initiating Google sign-in...');
    const result = await signInWithPopup(auth, googleProvider);
    safeLog('✅ Sign-in successful for user:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('❌ Error signing in with Google:', error);
    throw error;
  }
};


export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for user history
export interface DocumentHistory {
  id?: string;
  userId: string;
  prompt: string;
  plan: any[];
  documentContent: string;
  createdAt: Date;
  title?: string;
  apiKey?: string;
  exportedFiles?: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  metadata?: {
    totalSections: number;
    documentLength: number;
    generationTime?: number;
  };
}

export const saveDocumentHistory = async (history: Omit<DocumentHistory, 'id' | 'createdAt'>) => {
  try {
    safeLog('💾 Saving document history to Firestore...');
    
    const historyData = {
      ...history,
      createdAt: new Date(),
      metadata: {
        totalSections: history.plan?.length || 0,
        documentLength: history.documentContent?.length || 0,
        ...history.metadata
      }
    };
    
    const docRef = await addDoc(collection(db, 'documentHistory'), historyData);
    safeLog('✅ Document history saved successfully');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving document history:', error);
    throw error;
  }
};

export const getUserDocumentHistory = async (userId: string, limitCount: number = 10) => {
  try {
    safeLog('🔍 Fetching document history...');
    
    // First try with the composite index query
    try {
      const q = query(
        collection(db, 'documentHistory'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const history: DocumentHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        } as DocumentHistory);
      });
      
      safeLog('✅ Retrieved document history:', history.length, 'items');
      return history;
    } catch (indexError) {
      safeLog('⚠️ Using fallback query method...');
      
      // Fallback: Simple query without ordering (no index required)
      const simpleQuery = query(
        collection(db, 'documentHistory'),
        where('userId', '==', userId),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      const history: DocumentHistory[] = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        } as DocumentHistory);
      });
      
      // Sort manually in JavaScript (less efficient but works without index)
      history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      safeLog('✅ Retrieved document history:', history.length, 'items');
      return history;
    }
  } catch (error) {
    console.error('❌ Error getting document history:', error);
    throw error;
  }
};

export const deleteDocumentHistory = async (documentId: string) => {
  try {
    await deleteDoc(doc(db, 'documentHistory', documentId));
    safeLog('✅ Document history deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting document history:', error);
    throw error;
  }
};

// User activity tracking
export interface UserActivity {
  id?: string;
  userId: string;
  activityType: 'document_generated' | 'document_downloaded' | 'export_downloaded' | 'history_viewed' | 'document_deleted';
  timestamp: Date;
  metadata?: {
    documentId?: string;
    fileName?: string;
    fileType?: string;
    prompt?: string;
  };
}

export const saveUserActivity = async (activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'userActivity'), {
      ...activity,
      timestamp: new Date()
    });
    safeLog('✅ User activity saved:', activity.activityType);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving user activity:', error);
    throw error;
  }
};

export default app;
