import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';

const SUPER_ADMIN_EMAIL = 'faix@mndftoolpro.com';
const SUPER_ADMIN_PASSWORD = 'Faix@123';

const superAdminPermissions = {
  viewInventory: true,
  addTools: true,
  editTools: true,
  deleteTools: true,
  lendTools: true,
  returnTools: true,
  maintenanceAccess: true,
};

export async function initializeDatabase() {
  try {
    console.log('Checking if Super Admin exists...');
    
    // Try to sign in first (if user already exists in Auth)
    let uid: string;
    try {
      const result = await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
      uid = result.user.uid;
      console.log('Super Admin already exists in Auth, UID:', uid);
    } catch (signInError: any) {
      // User doesn't exist, create them
      if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/user-not-found') {
        console.log('Creating Super Admin in Auth...');
        const result = await createUserWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
        uid = result.user.uid;
        console.log('Super Admin created, UID:', uid);
      } else {
        throw signInError;
      }
    }

    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log('Super Admin document already exists in Firestore');
      return { success: true, message: 'Super Admin already initialized', uid };
    }

    // Create the user document
    console.log('Creating Super Admin document in Firestore...');
    await setDoc(userDocRef, {
      email: SUPER_ADMIN_EMAIL,
      name: 'Super Admin',
      role: 'super_admin',
      permissions: superAdminPermissions,
      createdAt: new Date(),
    });

    console.log('Database initialized successfully!');
    return { success: true, message: 'Super Admin created successfully', uid };
  } catch (error: any) {
    console.error('Initialization failed:', error);
    return { success: false, message: error.message, uid: null };
  }
}

