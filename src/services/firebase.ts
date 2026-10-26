import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: The app uses the designated database instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Autenticação Firebase com suporte a Google Sign-In
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Teste inicial de conectividade com o Firestore
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'estagios', '__connection_ping__'));
    return true;
  } catch (err: any) {
    if (err?.message?.includes('the client is offline')) {
      console.warn('[Firebase] O cliente parece estar offline.');
      return false;
    }
    // Permissões ou documento não existente ainda indicam que o servidor respondeu
    return true;
  }
}
