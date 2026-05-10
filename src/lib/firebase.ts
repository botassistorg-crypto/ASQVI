import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import axios from 'axios';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as per instructions
async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const signInWithPasscode = async (passcode: string) => {
  try {
    const response = await axios.post('/api/admin/login', { passcode });
    const data = response.data;
    
    if (data.success) {
      // Store passcode in session for proxy writes
      sessionStorage.setItem('admin_passcode', passcode);
      return {
        email: data.email,
        uid: 'admin-manual',
        displayName: 'System Admin',
        photoURL: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
      };
    } else {
      throw new Error("Invalid passcode.");
    }
  } catch (error: any) {
    console.error("Passcode login failed:", error);
    throw new Error(error.response?.data?.error || "Invalid passcode.");
  }
};
